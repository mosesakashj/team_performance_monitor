import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as peopleController from '../controllers/people.controller.js';

const router = Router();
router.get('/', asyncHandler(peopleController.listPeople));
router.get('/:id', asyncHandler(peopleController.getPerson));
router.get('/:id/network', asyncHandler(peopleController.getPersonNetwork));
router.get('/:id/path/:otherId', asyncHandler(peopleController.getPersonPath));

export default router;
