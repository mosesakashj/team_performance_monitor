import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { listPeopleSchema, personIdSchema, pathSchema } from '../validators/people.validator.js';
import * as peopleController from '../controllers/people.controller.js';

const router = Router();
router.get('/', validate(listPeopleSchema), asyncHandler(peopleController.listPeople));
router.get('/:id', validate(personIdSchema, 'params'), asyncHandler(peopleController.getPerson));
router.get('/:id/network', validate(personIdSchema, 'params'), asyncHandler(peopleController.getPersonNetwork));
router.get('/:id/path/:otherId', validate(pathSchema, 'params'), asyncHandler(peopleController.getPersonPath));

export default router;
