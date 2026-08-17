import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as projectsController from '../controllers/projects.controller.js';

const router = Router();
router.get('/', asyncHandler(projectsController.listProjects));
router.get('/:id', asyncHandler(projectsController.getProject));
router.get('/:id/candidates', asyncHandler(projectsController.getCandidates));

export default router;
