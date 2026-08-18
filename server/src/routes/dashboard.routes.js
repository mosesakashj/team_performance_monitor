import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { dashboardBottlenecksSchema } from '../validators/dashboard.validator.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/utilization-heatmap', cacheMiddleware(60_000), asyncHandler(dashboardController.getUtilizationHeatmap));
router.get('/skill-distribution', cacheMiddleware(60_000), asyncHandler(dashboardController.getSkillDistribution));
router.get('/project-health', cacheMiddleware(60_000), asyncHandler(dashboardController.getProjectHealth));
router.get('/bottlenecks', validate(dashboardBottlenecksSchema), asyncHandler(dashboardController.getTopBottlenecks));
router.get('/skill-gaps', asyncHandler(dashboardController.getGlobalSkillGaps));
router.get('/activity-feed', asyncHandler(dashboardController.getActivityFeed));
router.get('/enriched-stats', cacheMiddleware(60_000), asyncHandler(dashboardController.getEnrichedStats));
router.get('/batch', cacheMiddleware(60_000), asyncHandler(dashboardController.getDashboardBatch));

export default router;
