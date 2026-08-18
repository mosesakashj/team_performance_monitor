import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createPersonSchema,
  updatePersonSchema,
  createProjectSchema,
  updateProjectSchema,
  createSkillSchema,
  updateSkillSchema,
  createTeamSchema,
  updateTeamSchema,
  endorsementSchema,
  assignSkillSchema,
  assignToProjectSchema,
  assignToTeamSchema,
} from '../validators/write.validator.js';
import * as peopleWriteController from '../controllers/peopleWrite.controller.js';
import * as projectsWriteController from '../controllers/projectsWrite.controller.js';
import * as skillsWriteController from '../controllers/skillsWrite.controller.js';
import * as teamsWriteController from '../controllers/teamsWrite.controller.js';
import * as skillsAssignmentController from '../controllers/skillsAssignment.controller.js';

const router = Router();

router.use(authenticate);

router.post('/people', authorize('admin', 'manager'), validate(createPersonSchema), asyncHandler(peopleWriteController.createPerson));
router.patch('/people/:id', authorize('admin', 'manager'), validate(updatePersonSchema), asyncHandler(peopleWriteController.updatePerson));
router.delete('/people/:id', authorize('admin'), asyncHandler(peopleWriteController.deletePerson));

router.post('/projects', authorize('admin', 'manager'), validate(createProjectSchema), asyncHandler(projectsWriteController.createProject));
router.patch('/projects/:id', authorize('admin', 'manager'), validate(updateProjectSchema), asyncHandler(projectsWriteController.updateProject));
router.post('/people/:id/projects/:projectId', authorize('admin', 'manager'), validate(assignToProjectSchema), asyncHandler(projectsWriteController.assignToProject));
router.delete('/people/:id/projects/:projectId', authorize('admin', 'manager'), asyncHandler(projectsWriteController.removeFromProject));

router.post('/skills', authorize('admin'), validate(createSkillSchema), asyncHandler(skillsWriteController.createSkill));
router.patch('/skills/:id', authorize('admin'), validate(updateSkillSchema), asyncHandler(skillsWriteController.updateSkill));

router.post('/teams', authorize('admin', 'manager'), validate(createTeamSchema), asyncHandler(teamsWriteController.createTeam));
router.patch('/teams/:id', authorize('admin', 'manager'), validate(updateTeamSchema), asyncHandler(teamsWriteController.updateTeam));
router.post('/people/:id/teams/:teamId', authorize('admin', 'manager'), validate(assignToTeamSchema), asyncHandler(teamsWriteController.assignToTeam));
router.delete('/people/:id/teams/:teamId', authorize('admin', 'manager'), asyncHandler(teamsWriteController.removeFromTeam));

router.post('/people/:id/endorsements', authorize('admin', 'manager', 'member'), validate(endorsementSchema), asyncHandler(skillsAssignmentController.createEndorsement));
router.post('/people/:id/skills', authorize('admin', 'manager'), validate(assignSkillSchema), asyncHandler(skillsAssignmentController.assignSkill));
router.delete('/people/:id/skills/:skillId', authorize('admin', 'manager'), asyncHandler(skillsAssignmentController.removeSkill));

export default router;
