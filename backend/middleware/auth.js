import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next();
  }
}
