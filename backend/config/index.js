import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (typeof process.loadEnvFile === 'function' && existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

function resolveJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  console.warn(
    '[config] JWT_SECRET is not set — using a random secret generated for this process.\n' +
    '         All existing sessions will be invalidated on every restart.\n' +
    '         Copy backend/.env.example to backend/.env and set JWT_SECRET for stable sessions.'
  );
  return randomBytes(32).toString('hex');
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
