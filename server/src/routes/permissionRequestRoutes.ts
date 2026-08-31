import { Router } from 'express';
import { PermissionRequestController } from '../controllers/permissionRequestController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateBody, permissionRequestSchema, reviewPermissionRequestSchema } from '../middleware/validate.js';

const router = Router();

// Submit new event permission request (Edu Cell / SAC only)
router.post(
  '/',
  authenticateJWT,
  requireRole(['EDUCELL']),
  validateBody(permissionRequestSchema),
  PermissionRequestController.createRequest
);

// Get list of requests (Teacher & Edu Cell)
router.get(
  '/',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  PermissionRequestController.getRequests
);

// Get request details
router.get(
  '/:id',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  PermissionRequestController.getRequestById
);

// Review request: Approve or Reject (Teacher only)
router.patch(
  '/:id/review',
  authenticateJWT,
  requireRole(['TEACHER']),
  validateBody(reviewPermissionRequestSchema),
  PermissionRequestController.reviewRequest
);

// Publish approved event (Edu Cell only)
router.post(
  '/:id/publish',
  authenticateJWT,
  requireRole(['EDUCELL']),
  PermissionRequestController.publishApprovedEvent
);

export default router;
