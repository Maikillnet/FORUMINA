import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authMiddleware } from './middleware/auth.js';
import routes from './routes/index.js';

export const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true, exposedHeaders: ['X-Token-Invalid'] }));
app.use(express.json({ limit: '40mb' }));
app.use(authMiddleware);
app.use(routes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err?.message || 'Ошибка сервера' });
});
