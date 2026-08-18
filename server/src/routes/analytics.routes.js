import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { skillGapsSchema, bottlenecksSchema, teamCompositionSchema, personTimelineSchema } from '../validators/analytics.validator.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = Router();
router.get('/skill-gaps/:id', validate(skillGapsSchema, 'params'), asyncHandler(analyticsController.getProjectSkillGaps));
router.get('/bottlenecks', validate(bottlenecksSchema), asyncHandler(analyticsController.getBottleneckPeople));
router.get('/knowledge-silos', asyncHandler(analyticsController.getKnowledgeSilos));
router.get('/team-composition/:id', validate(teamCompositionSchema, 'params'), asyncHandler(analyticsController.getTeamComposition));
router.get('/person-timeline/:id', validate(personTimelineSchema, 'params'), asyncHandler(analyticsController.getPersonTimeline));
router.get('/skill-demand-supply', cacheMiddleware(60_000), asyncHandler(analyticsController.getSkillDemandSupply));
router.get('/project-timeline', cacheMiddleware(60_000), asyncHandler(analyticsController.getProjectTimeline));

export default router;
