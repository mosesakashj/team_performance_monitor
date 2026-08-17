import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as recommendationsController from '../controllers/recommendations.controller.js';

const router = Router();
router.get('/skills/:id', asyncHandler(recommendationsController.getSkillRecommendations));
router.get('/projects/:id', asyncHandler(recommendationsController.getProjectRecommendations));
router.post('/team-compatibility', asyncHandler(recommendationsController.getTeamCompatibility));
router.get('/knowledge-transfer', asyncHandler(recommendationsController.getKnowledgeTransferAlerts));

export default router;
