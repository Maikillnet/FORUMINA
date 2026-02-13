import db from '../db.js';

function requireAdmin(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может управлять категориями' });
  return null;
}

export function list(req, res) {
  const cats = db.categories.all();
  res.json(cats.map((c) => ({ ...c, description: c.description ?? '', icon: c.icon ?? 'Folder', color: c.color ?? '#10b981' })));
}

export function create(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const { name, description, icon, color } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Укажите название категории' });
  const cat = db.categories.create({ name: name.trim(), description: description?.trim() ?? '', icon: icon?.trim() ?? 'Folder', color: color?.trim() ?? '#10b981' });
  if (!cat) return res.status(400).json({ error: 'Категория с таким названием уже существует' });
  res.status(201).json(cat);
}

export function update(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const id = req.params.id;
  const cat = db.categories.getById(id);
  if (!cat) return res.status(404).json({ error: 'Категория не найдена' });
  const { name, description, icon, color } = req.body;
  const data = {};
  if (name != null) data.name = name;
  if (description != null) data.description = description;
  if (icon != null) data.icon = icon;
  if (color != null) data.color = color;
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
  const updated = db.categories.update(id, data);
  res.json(updated);
}

export function remove(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const id = req.params.id;
  if (id === 'all') return res.status(400).json({ error: 'Нельзя удалить категорию «Все темы»' });
  if (id === 'messages') return res.status(400).json({ error: 'Нельзя удалить системный пункт «Сообщения»' });
  const result = db.categories.delete(id);
  if (result === null) return res.status(400).json({ error: 'Невозможно удалить: есть темы в этой категории' });
  if (!result) return res.status(404).json({ error: 'Категория не найдена' });
  res.json({ success: true });
}
