import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { teamIdSchema } from '../validators/teams.validator.js';
import * as teamsController from '../controllers/teams.controller.js';

const router = Router();
router.get('/', asyncHandler(teamsController.listTeams));
router.get('/:id', validate(teamIdSchema, 'params'), asyncHandler(teamsController.getTeam));

export default router;
