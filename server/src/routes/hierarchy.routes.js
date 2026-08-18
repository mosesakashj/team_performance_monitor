import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { endorsementsSchema } from '../validators/hierarchy.validator.js';
import * as hierarchyController from '../controllers/hierarchy.controller.js';

const router = Router();
router.get('/', asyncHandler(hierarchyController.listHierarchy));
router.get('/endorsements', validate(endorsementsSchema), asyncHandler(hierarchyController.listEndorsements));

export default router;
