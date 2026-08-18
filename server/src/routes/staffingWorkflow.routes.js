import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import * as staffingWorkflowController from '../controllers/staffingWorkflow.controller.js';

const router = Router();

router.use(authenticate);

router.post('/proposals', authorize('admin', 'manager'), asyncHandler(staffingWorkflowController.createProposal));
router.get('/proposals/project/:projectId', asyncHandler(staffingWorkflowController.getProjectProposals));
router.post('/proposals/:id/approve', authorize('admin', 'manager'), asyncHandler(staffingWorkflowController.approveProposal));
router.post('/proposals/:id/reject', authorize('admin', 'manager'), asyncHandler(staffingWorkflowController.rejectProposal));
router.get('/summary', asyncHandler(staffingWorkflowController.getStaffingSummary));

export default router;
