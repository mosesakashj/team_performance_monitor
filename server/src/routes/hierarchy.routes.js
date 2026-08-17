import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as hierarchyController from '../controllers/hierarchy.controller.js';

const router = Router();
router.get('/', asyncHandler(hierarchyController.listHierarchy));
router.get('/endorsements', asyncHandler(hierarchyController.listEndorsements));

export default router;
