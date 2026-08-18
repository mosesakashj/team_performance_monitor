import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.path}`, code: 'NOT_FOUND' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
  }

  logger.error('Unhandled error', {
    requestId: req.id,
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    error: { message: 'Something went wrong on our end', code: 'INTERNAL_ERROR' },
  });
}
