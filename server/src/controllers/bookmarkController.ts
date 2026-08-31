import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { AuditService } from '../services/auditService.js';

export class BookmarkController {
  /**
   * Toggle Bookmark (Save / Unsave Event)
   */
  static async toggleBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);

      if (user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Only students can bookmark events.' });
        return;
      }

      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      // Check if bookmark exists
      const [existing] = await pool.query<any[]>(
        'SELECT id FROM bookmarks WHERE event_id = ? AND student_id = ?',
        [eventId, user.userId]
      );

      if (existing.length > 0) {
        // Remove bookmark
        await pool.query('DELETE FROM bookmarks WHERE event_id = ? AND student_id = ?', [
          eventId,
          user.userId,
        ]);

        res.status(200).json({
          success: true,
          isBookmarked: false,
          message: 'Event removed from your saved bookmarks.',
        });
      } else {
        // Add bookmark
        await pool.query('INSERT INTO bookmarks (event_id, student_id) VALUES (?, ?)', [
          eventId,
          user.userId,
        ]);

        await AuditService.logAudit(
          user.userId,
          'EVENT_BOOKMARKED',
          'bookmarks',
          eventId,
          { eventId },
          req.ip
        );

        res.status(201).json({
          success: true,
          isBookmarked: true,
          message: 'Event saved to your bookmarks!',
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all saved bookmarks for logged-in student
   */
  static async getMyBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Only students can view saved bookmarks.' });
        return;
      }

      const [bookmarks] = await pool.query<any[]>(
        `SELECT
          b.id AS bookmark_id,
          b.created_at AS bookmarked_at,
          e.*,
          uc.name AS creator_name,
          uc.role AS creator_role,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) AS applications_count,
          (SELECT a.status FROM applications a WHERE a.event_id = e.id AND a.student_id = ?) AS my_application_status
         FROM bookmarks b
         JOIN events e ON b.event_id = e.id
         JOIN users uc ON e.created_by = uc.id
         WHERE b.student_id = ?
         ORDER BY b.created_at DESC`,
        [user.userId, user.userId]
      );

      const parsed = bookmarks.map((ev) => ({
        ...ev,
        required_skills: typeof ev.required_skills === 'string' ? JSON.parse(ev.required_skills || '[]') : ev.required_skills || [],
        relevant_interests: typeof ev.relevant_interests === 'string' ? JSON.parse(ev.relevant_interests || '[]') : ev.relevant_interests || [],
        is_bookmarked: true,
        has_applied: !!ev.my_application_status,
      }));

      res.status(200).json({
        success: true,
        count: parsed.length,
        bookmarks: parsed,
      });
    } catch (error) {
      next(error);
    }
  }
}
