import db from '../db.js';
import { formatTime } from '../utils/formatTime.js';

export function list(req, res) {
  const messages = db.messages.list();
  res.json(messages.map((m) => ({ ...m, time: formatTime(m.created_at) })));
}

export function create(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Войдите для отправки сообщений' });
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Введите сообщение' });
  const user = db.users.getById(req.user.id);
  const msg = db.messages.create(req.user.id, user?.username || 'user', content.trim());
  res.status(201).json({ ...msg, time: formatTime(msg.created_at) });
}
