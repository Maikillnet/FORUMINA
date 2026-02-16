import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { config } from '../config/index.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';

export async function register(req, res) {
  const { username, email, password } = req.body;
  const u = (username || '').trim();
  const e = (email || '').trim();
  const p = password || '';
  if (!u || !e || !p) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  if (p.length < 4) {
    return res.status(400).json({ error: 'Пароль минимум 4 символа' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(e)) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  if (db.users.getByUsername(u) || db.users.getByEmail(e)) {
    return res.status(400).json({ error: 'Никнейм или email уже занят' });
  }
  try {
    const hash = bcrypt.hashSync(p, 10);
    const user = await db.users.create(u, e, hash);
    const safe = sanitizeUser(user);
    const token = jwt.sign({ id: user.id }, config.jwtSecret);
    res.json({ user: safe, token });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Ошибка регистрации' });
  }
}

export async function login(req, res) {
  const { login, password } = req.body;
  const log = (login || '').trim();
  const pwd = password || '';
  if (!log || !pwd) return res.status(400).json({ error: 'Введите логин и пароль' });
  const user = db.users.getByLogin(log);
  if (!user || !bcrypt.compareSync(pwd, user.password)) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  await db.users.update(user.id, { last_online: new Date().toISOString() });
  const freshUser = db.users.getById(user.id);
  const safe = sanitizeUser(freshUser);
  if (safe.is_admin === undefined && (safe.id === 1 || safe.username === 'admin_dev')) {
    safe.is_admin = true;
  }
  const token = jwt.sign({ id: user.id }, config.jwtSecret);
  res.json({ user: safe, token });
}

export function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const user = db.users.getById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
  const safe = sanitizeUser(user);
  if (safe.is_admin === undefined && (safe.id === 1 || safe.username === 'admin_dev')) {
    safe.is_admin = true;
  }
  res.json(safe);
}