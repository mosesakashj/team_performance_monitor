import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { listProjectsSchema, projectIdSchema } from '../validators/projects.validator.js';
import * as projectsController from '../controllers/projects.controller.js';

const router = Router();
router.get('/', validate(listProjectsSchema), asyncHandler(projectsController.listProjects));
router.get('/:id', validate(projectIdSchema, 'params'), asyncHandler(projectsController.getProject));
router.get('/:id/candidates', validate(projectIdSchema, 'params'), asyncHandler(projectsController.getCandidates));

export default router;
