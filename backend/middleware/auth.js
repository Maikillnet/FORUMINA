import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import db from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const HEARTBEAT_THROTTLE_MS = 60 * 1000; // Update last_online at most once per minute

async function authMiddlewareImpl(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const userId = parseInt(payload.id, 10);
    const user = userId ? db.users.getById(userId) : null;
    if (!user) {
      // Well-formed token, but the account behind it is gone — tell the
      // client so it can drop the dead token instead of resending it forever.
      res.set('X-Token-Invalid', '1');
      return next();
    }
    req.user = payload;
    req.user.is_admin = user.is_admin === true;
    const lastOnline = user.last_online ? new Date(user.last_online).getTime() : 0;
    if (Number.isNaN(lastOnline) || Date.now() - lastOnline > HEARTBEAT_THROTTLE_MS) {
      await db.users.update(userId, { last_online: new Date().toISOString() });
    }
    next();
  } catch {
    // Bad signature or expired token. Requests stay usable anonymously
    // (many routes don't require auth), but flag the token as dead so the
    // client stops resending it and forces a clean re-login.
    res.set('X-Token-Invalid', '1');
    next();
  }
}

export const authMiddleware = asyncHandler(authMiddlewareImpl);
