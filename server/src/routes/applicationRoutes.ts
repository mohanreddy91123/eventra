import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateBody, applicationStatusSchema } from '../middleware/validate.js';

const router = Router();

// Student applications list
router.get('/my', authenticateJWT, requireRole(['STUDENT']), ApplicationController.getMyApplications);

// Campus-wide applications list (Edu Cell only)
router.get('/all', authenticateJWT, requireRole(['EDUCELL']), ApplicationController.getAllApplications);

// Update status (Approve / Reject)
router.patch(
  '/:id',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  validateBody(applicationStatusSchema),
  ApplicationController.updateApplicationStatus
);

export default router;
