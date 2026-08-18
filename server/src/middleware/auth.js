import { AppError } from '../utils/AppError.js';
import { verifyToken, findUserById } from '../queries/auth.queries.js';

/**
 * Authentication middleware: verifies JWT token and attaches user to req.
 * Expects Authorization: Bearer <token> header.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError(401, 'Authentication required', 'AUTH_REQUIRED'));
    }

    const token = authHeader.slice(7);
    try {
      const decoded = verifyToken(token);
      const user = await findUserById(decoded.id);
      if (!user) {
        return next(new AppError(401, 'User not found', 'AUTH_INVALID'));
      }
      req.user = user;
      next();
    } catch {
      return next(new AppError(401, 'Invalid or expired token', 'AUTH_INVALID'));
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication: attaches user if token is present, but doesn't require it.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

/**
 * Role-based authorization middleware.
 * Must be used after authenticate middleware.
 * @param  {...string} allowedRoles - Roles that can access the route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError(401, 'Authentication required', 'AUTH_REQUIRED'));
      }
      if (!allowedRoles.includes(req.user.role)) {
        return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
