import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { departmentIdSchema } from '../validators/organization.validator.js';
import * as departmentController from '../controllers/departments.controller.js';

const router = Router();
router.get('/', cacheMiddleware(60_000), asyncHandler(departmentController.listDepartments));
router.get('/:id', validate(departmentIdSchema, 'params'), asyncHandler(departmentController.getDepartment));

export default router;
