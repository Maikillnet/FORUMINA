export const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'forum-live-secret-key-2024',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
