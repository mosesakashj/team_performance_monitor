import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { skillRecsSchema, projectRecsSchema, teamCompatibilitySchema } from '../validators/recommendations.validator.js';
import * as recommendationsController from '../controllers/recommendations.controller.js';

const router = Router();
router.get('/skills/:id', validate(skillRecsSchema, 'params'), asyncHandler(recommendationsController.getSkillRecommendations));
router.get('/projects/:id', validate(projectRecsSchema, 'params'), asyncHandler(recommendationsController.getProjectRecommendations));
router.post('/team-compatibility', validate(teamCompatibilitySchema, 'body'), asyncHandler(recommendationsController.getTeamCompatibility));
router.get('/knowledge-transfer', asyncHandler(recommendationsController.getKnowledgeTransferAlerts));

export default router;
