import { Router } from 'express';
import { BookmarkController } from '../controllers/bookmarkController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), BookmarkController.getMyBookmarks);

export default router;
