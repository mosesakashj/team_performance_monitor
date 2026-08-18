import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { searchSchema } from '../validators/search.validator.js';
import * as searchController from '../controllers/search.controller.js';

const router = Router();
router.get('/', validate(searchSchema), asyncHandler(searchController.search));

export default router;
