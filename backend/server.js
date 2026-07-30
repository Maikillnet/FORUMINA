import { config } from './config/index.js';
import { initDb } from './db.js';
import { app } from './app.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

