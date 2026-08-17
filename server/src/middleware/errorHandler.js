import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `No route for ${req.method} ${req.path}`, code: 'NOT_FOUND' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
  }

  console.error('[unhandled error]', err);
  res.status(500).json({
    error: { message: 'Something went wrong on our end', code: 'INTERNAL_ERROR' },
  });
}
