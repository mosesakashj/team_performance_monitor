import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { cacheMiddleware } from '../middleware/cache.js';
import * as reportsController from '../controllers/reports.controller.js';

const router = Router();

router.get('/utilization', cacheMiddleware(60_000), asyncHandler(reportsController.getUtilizationReport));
router.get('/skill-inventory', cacheMiddleware(60_000), asyncHandler(reportsController.getSkillInventoryReport));
router.get('/project-health', cacheMiddleware(60_000), asyncHandler(reportsController.getProjectHealthReport));
router.get('/endorsements', cacheMiddleware(60_000), asyncHandler(reportsController.getEndorsementReport));

export default router;