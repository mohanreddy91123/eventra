import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';

export class NotificationController {
  /**
   * Get all notifications for current user
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      const [notifications] = await pool.query<any[]>(
        `SELECT id, user_id, title, message, type, is_read, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [user.userId]
      );

      const unreadCount = notifications.filter((n) => !n.is_read).length;

      res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a notification or all notifications as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { id } = req.params;

      if (id === 'all') {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [
          user.userId,
        ]);
        res.status(200).json({
          success: true,
          message: 'All notifications marked as read.',
        });
      } else {
        const notifId = parseInt(id, 10);
        if (isNaN(notifId)) {
          res.status(400).json({ success: false, message: 'Invalid notification ID.' });
          return;
        }

        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
          [notifId, user.userId]
        );

        res.status(200).json({
          success: true,
          message: 'Notification marked as read.',
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
