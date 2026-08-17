import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();
router.get('/skill-gaps/:id', asyncHandler(analyticsController.getProjectSkillGaps));
router.get('/bottlenecks', asyncHandler(analyticsController.getBottleneckPeople));
router.get('/knowledge-silos', asyncHandler(analyticsController.getKnowledgeSilos));
router.get('/team-composition/:id', asyncHandler(analyticsController.getTeamComposition));
router.get('/person-timeline/:id', asyncHandler(analyticsController.getPersonTimeline));
router.get('/skill-demand-supply', asyncHandler(analyticsController.getSkillDemandSupply));
router.get('/project-timeline', asyncHandler(analyticsController.getProjectTimeline));

export default router;
