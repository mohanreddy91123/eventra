import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, NotificationController.getNotifications);
router.patch('/:id/read', authenticateJWT, NotificationController.markAsRead);

export default router;
