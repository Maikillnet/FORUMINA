import db from '../db.js';

function requireAdmin(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Только администратор может управлять трофеями' });
  return null;
}

export function listUsers(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const list = db.users.listAll?.() ?? [];
  res.json(list);
}

export function listTrophies(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const list = db.trophies.list();
  res.json(list);
}

export function createTrophy(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const { name, description, image } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Укажите название трофея' });
  const image_url = image || null;
  const trophy = db.trophies.create(name, description, image_url);
  res.status(201).json(trophy);
}

export function deleteTrophy(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const ok = db.trophies.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Трофей не найден' });
  res.json({ success: true });
}

export function assignTrophy(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const { trophyId } = req.body;
  if (!trophyId) return res.status(400).json({ error: 'Укажите ID трофея' });
  const trophy = db.user_trophies.assign(req.params.userId, trophyId, req.user.id);
  if (!trophy) return res.status(400).json({ error: 'Не удалось выдать трофей' });
  res.json(trophy);
}

export function revokeTrophy(req, res) {
  const err = requireAdmin(req, res);
  if (err) return;
  const ok = db.user_trophies.revoke(req.params.userId, req.params.trophyId, req.user.id);
  if (!ok) return res.status(404).json({ error: 'Трофей не найден у пользователя' });
  res.json({ success: true });
}

export function getUserTrophies(req, res) {
  const list = db.user_trophies.getByUserId(req.params.id);
  res.json(list);
}
