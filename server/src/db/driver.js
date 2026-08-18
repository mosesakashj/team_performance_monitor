import neo4j from 'neo4j-driver';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { recordsToPlain } from '../utils/neo4jHelpers.js';
import { logger } from '../utils/logger.js';

let driver = null;
let lastKnownStatus = { up: false, checkedAt: null, message: 'not checked yet' };

export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      env.cognodbUri,
      neo4j.auth.basic(env.cognodbUser, env.cognodbPassword),
      {
        maxConnectionPoolSize: 10,
        connectionAcquisitionTimeout: 10_000,
        // Default is 30s -- without this, a query issued while CognoDB is
        // unreachable hangs for up to 30s before the driver gives up and lets
        // our 503 error handling kick in. Fail fast instead.
        maxTransactionRetryTime: 2_000,
      }
    );
  }
  return driver;
}

/**
 * Checks connectivity without throwing. Called at boot and from /api/health.
 * The server must stay up even when CognoDB is unreachable so health/error
 * states are observable instead of the process crash-looping on Render.
 */
export async function verifyConnectivity() {
  if (!env.isConfigured) {
    lastKnownStatus = {
      up: false,
      checkedAt: new Date().toISOString(),
      message: 'Server is missing CognoDB environment variables',
    };
    return lastKnownStatus;
  }

  try {
    const start = Date.now();
    await getDriver().verifyConnectivity();
    lastKnownStatus = {
      up: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - start,
      message: 'CognoDB connection healthy',
    };
  } catch (err) {
    lastKnownStatus = {
      up: false,
      checkedAt: new Date().toISOString(),
      message: err.message,
    };
  }
  return lastKnownStatus;
}

export function getLastKnownStatus() {
  return lastKnownStatus;
}

/**
 * Runs a parameterized Cypher query and returns plain-JSON records.
 * Normalizes any connectivity/driver error into a 503 AppError so route
 * handlers don't need their own try/catch for "database is down".
 */
export async function runQuery(cypher, params = {}) {
  try {
    const { records } = await getDriver().executeQuery(cypher, params, {
      database: 'neo4j',
    });
    return recordsToPlain(records);
  } catch (err) {
    logger.error('Database query failed', {
      code: err.code,
      message: err.message,
    });
    if (
      err.code === 'ServiceUnavailable' ||
      err.name === 'ServiceUnavailable' ||
      /ECONNREFUSED|ENOTFOUND|getaddrinfo|SessionExpired|Unauthorized|authentication/i.test(
        err.message ?? ''
      )
    ) {
      throw new AppError(
        503,
        'Database unavailable, please try again shortly',
        'DB_UNAVAILABLE'
      );
    }
    throw err;
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
