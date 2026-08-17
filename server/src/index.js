import { createApp } from './app.js';
import { env } from './config/env.js';
import { verifyConnectivity, closeDriver } from './db/driver.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`);
});

// Check connectivity at boot but never crash the process on failure -- /api/health
// must be able to report the outage instead of Render crash-looping the service.
verifyConnectivity().then((status) => {
  if (status.up) {
    console.log(`[db] CognoDB connection healthy (${status.latencyMs}ms)`);
  } else {
    console.warn(`[db] CognoDB is not reachable yet: ${status.message}`);
  }
});

async function shutdown(signal) {
  console.log(`[server] received ${signal}, shutting down`);
  server.close(async () => {
    await closeDriver();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
