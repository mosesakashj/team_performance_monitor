import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { cacheMiddleware } from '../middleware/cache.js';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();
router.get('/', cacheMiddleware(60_000), asyncHandler(statsController.stats));

export default router;
