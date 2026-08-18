import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', validate(loginSchema, 'body'), asyncHandler(authController.login));
router.post('/register', validate(registerSchema, 'body'), asyncHandler(authController.register));
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.patch('/me', authenticate, asyncHandler(authController.updateMe));

export default router;
