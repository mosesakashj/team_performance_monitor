import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as teamsController from '../controllers/teams.controller.js';

const router = Router();
router.get('/', asyncHandler(teamsController.listTeams));
router.get('/:id', asyncHandler(teamsController.getTeam));

export default router;
