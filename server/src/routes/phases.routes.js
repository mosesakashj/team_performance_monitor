import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { projectIdParamSchema, phaseIdSchema } from '../validators/organization.validator.js';
import * as phaseController from '../controllers/phases.controller.js';

const router = Router();
router.get('/project/:projectId', validate(projectIdParamSchema, 'params'), asyncHandler(phaseController.getProjectPhases));
router.get('/:id', validate(phaseIdSchema, 'params'), asyncHandler(phaseController.getPhase));

export default router;
