import db from '../db.js';

// Was copy-pasted as a local helper in 6 different controllers; centralized
// here as real route middleware so admin-gating lives in exactly one place.
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  const admin = db.users.getById(req.user.id);
  if (!admin?.is_admin) return res.status(403).json({ error: 'Требуются права администратора' });
  next();
}
