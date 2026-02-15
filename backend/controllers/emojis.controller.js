import db from '../db.js';

function requireAdmin(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может управлять смайлами' });
  return null;
}

export function getAll(req, res) {
  const list = db.emojis.getAll();
  res.json(list);
}

export function create(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const { type, value, name, code } = req.body;
  if (!type || !['unicode', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Укажите type: unicode или image' });
  }
  const data = { type, value: value || '', name: (name || '').trim(), code: (code || '').trim() };
  if (type === 'image' && !data.value) {
    return res.status(400).json({ error: 'Для image укажите value (base64)' });
  }
  if (type === 'unicode' && !data.value) {
    return res.status(400).json({ error: 'Для unicode укажите value (символ эмодзи)' });
  }
  const emoji = db.emojis.create(data);
  if (!emoji) return res.status(400).json({ error: 'Не удалось создать смайл' });
  res.status(201).json(emoji);
}

export function remove(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const ok = db.emojis.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Смайл не найден' });
  res.json({ success: true });
}
