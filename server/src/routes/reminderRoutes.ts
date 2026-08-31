import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), ReminderController.getMyReminders);
router.delete('/:id', authenticateJWT, requireRole(['STUDENT']), ReminderController.deleteReminder);

export default router;
