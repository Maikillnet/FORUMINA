import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import db from '../db.js';

const HEARTBEAT_THROTTLE_MS = 60 * 1000; // Update last_online at most once per minute

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    const userId = parseInt(req.user.id, 10);
    if (!userId) return next();
    const user = db.users.getById(userId);
    if (user) {
      req.user.is_admin = user.is_admin === true;
      const lastOnline = user.last_online ? new Date(user.last_online).getTime() : 0;
      if (Number.isNaN(lastOnline) || Date.now() - lastOnline > HEARTBEAT_THROTTLE_MS) {
        db.users.update(userId, { last_online: new Date().toISOString() });
      }
    }
    next();
  } catch {
    next();
  }
}
