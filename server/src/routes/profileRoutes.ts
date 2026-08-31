import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { validateBody, studentPreferencesSchema } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticateJWT, ProfileController.getProfile);
router.put(
  '/preferences',
  authenticateJWT,
  requireRole(['STUDENT']),
  validateBody(studentPreferencesSchema),
  ProfileController.updatePreferences
);

export default router;
