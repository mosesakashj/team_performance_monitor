import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/utilization-heatmap', asyncHandler(dashboardController.getUtilizationHeatmap));
router.get('/skill-distribution', asyncHandler(dashboardController.getSkillDistribution));
router.get('/project-health', asyncHandler(dashboardController.getProjectHealth));
router.get('/bottlenecks', asyncHandler(dashboardController.getTopBottlenecks));
router.get('/skill-gaps', asyncHandler(dashboardController.getGlobalSkillGaps));
router.get('/activity-feed', asyncHandler(dashboardController.getActivityFeed));
router.get('/enriched-stats', asyncHandler(dashboardController.getEnrichedStats));

export default router;
