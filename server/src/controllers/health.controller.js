import { verifyConnectivity } from '../db/driver.js';

export async function health(req, res) {
  const status = await verifyConnectivity();
  res.status(status.up ? 200 : 503).json(status);
}
