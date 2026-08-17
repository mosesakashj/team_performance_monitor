import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as skillsController from '../controllers/skills.controller.js';

const router = Router();
router.get('/', asyncHandler(skillsController.listSkills));
router.get('/:id/adjacent', asyncHandler(skillsController.getSkillAdjacent));

export default router;
