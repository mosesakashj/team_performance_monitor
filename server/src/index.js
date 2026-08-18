import { createApp } from './app.js';
import { env } from './config/env.js';
import { verifyConnectivity, closeDriver } from './db/driver.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('Server started', { port: env.port, env: env.nodeEnv });
});

verifyConnectivity().then((status) => {
  if (status.up) {
    logger.info('Database connection healthy', { latencyMs: status.latencyMs });
  } else {
    logger.warn('Database not reachable', { message: status.message });
  }
});

async function shutdown(signal) {
  logger.info('Shutting down', { signal });
  server.close(async () => {
    await closeDriver();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
