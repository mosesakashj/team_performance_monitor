import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { certificationIdSchema, expiringCertificationsSchema } from '../validators/organization.validator.js';
import * as certificationController from '../controllers/certifications.controller.js';

const router = Router();
router.get('/', cacheMiddleware(60_000), asyncHandler(certificationController.listCertifications));
router.get('/expiring', validate(expiringCertificationsSchema), asyncHandler(certificationController.getExpiringCertifications));
router.get('/:id', validate(certificationIdSchema, 'params'), asyncHandler(certificationController.getCertification));

export default router;
