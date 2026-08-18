import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { listSkillsSchema, skillIdSchema } from '../validators/skills.validator.js';
import * as skillsController from '../controllers/skills.controller.js';

const router = Router();
router.get('/', validate(listSkillsSchema), asyncHandler(skillsController.listSkills));
router.get('/:id/adjacent', validate(skillIdSchema, 'params'), asyncHandler(skillsController.getSkillAdjacent));

export default router;
