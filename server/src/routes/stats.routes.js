import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { stats } from '../controllers/stats.controller.js';

const router = Router();
router.get('/', asyncHandler(stats));

export default router;
