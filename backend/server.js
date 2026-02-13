import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authMiddleware } from './middleware/auth.js';
import { initDb } from './db.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '40mb' }));
app.use(authMiddleware);
app.use(routes);

async function start() {
  await initDb();
  app.listen(config.port, () => {
    console.log(`Forum API: http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
