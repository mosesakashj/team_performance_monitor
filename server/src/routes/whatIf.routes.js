import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as whatIfController from '../controllers/whatIf.controller.js';

const router = Router();

router.use(authenticate);

router.get('/person-removal/:personId', asyncHandler(whatIfController.simulatePersonRemoval));
router.get('/skill-addition/:personId/:skillId', asyncHandler(whatIfController.simulateSkillAddition));

export default router;
