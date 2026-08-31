import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';

export class DashboardController {
  /**
   * Get role-tailored dashboard statistics and overview
   */
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (user.role === 'STUDENT') {
        // Student Dashboard Statistics
        const [[appStats]] = await pool.query<any[]>(
          `SELECT
             COUNT(*) AS total_applications,
             SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_applications,
             SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_applications
           FROM applications
           WHERE student_id = ?`,
          [user.userId]
        );

        const [[bookmarkStats]] = await pool.query<any[]>(
          'SELECT COUNT(*) AS total_bookmarks FROM bookmarks WHERE student_id = ?',
          [user.userId]
        );

        const [[upcomingStats]] = await pool.query<any[]>(
          'SELECT COUNT(*) AS upcoming_events FROM events WHERE status = "UPCOMING"'
        );

        const [recentApplications] = await pool.query<any[]>(
          `SELECT a.id, a.event_id, a.status, a.applied_at, e.title AS event_title, e.category, e.event_date, e.location
           FROM applications a
           JOIN events e ON a.event_id = e.id
           WHERE a.student_id = ?
           ORDER BY a.applied_at DESC
           LIMIT 5`,
          [user.userId]
        );

        res.status(200).json({
          success: true,
          role: 'STUDENT',
          stats: {
            totalApplications: Number(appStats.total_applications || 0),
            approvedApplications: Number(appStats.approved_applications || 0),
            pendingApplications: Number(appStats.pending_applications || 0),
            savedEvents: Number(bookmarkStats.total_bookmarks || 0),
            upcomingEvents: Number(upcomingStats.upcoming_events || 0),
          },
          recentApplications,
        });
        return;
      }

      if (user.role === 'TEACHER') {
        // Teacher Dashboard Statistics
        const [[eventStats]] = await pool.query<any[]>(
          `SELECT
             COUNT(*) AS total_events,
             SUM(CASE WHEN status = 'UPCOMING' THEN 1 ELSE 0 END) AS upcoming_events
           FROM events
           WHERE created_by = ?`,
          [user.userId]
        );

        const [[appStats]] = await pool.query<any[]>(
          `SELECT
             COUNT(a.id) AS total_applications,
             SUM(CASE WHEN a.status = 'Approved' THEN 1 ELSE 0 END) AS approved_applications,
             SUM(CASE WHEN a.status = 'Pending' THEN 1 ELSE 0 END) AS pending_applications
           FROM applications a
           JOIN events e ON a.event_id = e.id
           WHERE e.created_by = ?`,
          [user.userId]
        );

        const [recentApplications] = await pool.query<any[]>(
          `SELECT
             a.id, a.event_id, a.status, a.applied_at,
             e.title AS event_title,
             u.name AS student_name,
             sp.roll_number,
             sp.department
           FROM applications a
           JOIN events e ON a.event_id = e.id
           JOIN users u ON a.student_id = u.id
           LEFT JOIN student_profiles sp ON u.id = sp.user_id
           WHERE e.created_by = ?
           ORDER BY a.applied_at DESC
           LIMIT 6`,
          [user.userId]
        );

        const [recentEvents] = await pool.query<any[]>(
          `SELECT
             e.id, e.title, e.category, e.event_date, e.status, e.capacity,
             (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) AS applications_count
           FROM events e
           WHERE e.created_by = ?
           ORDER BY e.created_at DESC
           LIMIT 5`,
          [user.userId]
        );

        res.status(200).json({
          success: true,
          role: 'TEACHER',
          stats: {
            myEvents: Number(eventStats.total_events || 0),
            upcomingEvents: Number(eventStats.upcoming_events || 0),
            totalApplications: Number(appStats.total_applications || 0),
            approvedApplications: Number(appStats.approved_applications || 0),
            pendingApplications: Number(appStats.pending_applications || 0),
          },
          recentApplications,
          recentEvents,
        });
        return;
      }

      if (user.role === 'EDUCELL') {
        // Edu Cell / SAC Dashboard Statistics
        const [[eventStats]] = await pool.query<any[]>(
          `SELECT
             COUNT(*) AS total_events,
             SUM(CASE WHEN u.role = 'TEACHER' THEN 1 ELSE 0 END) AS teacher_events,
             SUM(CASE WHEN u.role = 'EDUCELL' THEN 1 ELSE 0 END) AS educell_events,
             SUM(CASE WHEN e.status = 'UPCOMING' THEN 1 ELSE 0 END) AS upcoming_events
           FROM events e
           JOIN users u ON e.created_by = u.id`
        );

        const [[appStats]] = await pool.query<any[]>(
          `SELECT
             COUNT(*) AS total_applications,
             SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_applications,
             SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_applications
           FROM applications`
        );

        const [recentApplications] = await pool.query<any[]>(
          `SELECT
             a.id, a.event_id, a.status, a.applied_at,
             e.title AS event_title,
             u.name AS student_name,
             sp.roll_number,
             sp.department
           FROM applications a
           JOIN events e ON a.event_id = e.id
           JOIN users u ON a.student_id = u.id
           LEFT JOIN student_profiles sp ON u.id = sp.user_id
           ORDER BY a.applied_at DESC
           LIMIT 8`,
        );

        const [recentAudits] = await pool.query<any[]>(
          `SELECT
             al.id, al.action, al.entity_type, al.created_at,
             u.name AS user_name, u.role AS user_role
           FROM audit_logs al
           LEFT JOIN users u ON al.user_id = u.id
           ORDER BY al.created_at DESC
           LIMIT 8`
        );

        res.status(200).json({
          success: true,
          role: 'EDUCELL',
          stats: {
            totalEvents: Number(eventStats.total_events || 0),
            teacherEvents: Number(eventStats.teacher_events || 0),
            educellEvents: Number(eventStats.educell_events || 0),
            upcomingEvents: Number(eventStats.upcoming_events || 0),
            totalApplications: Number(appStats.total_applications || 0),
            approvedApplications: Number(appStats.approved_applications || 0),
            pendingApplications: Number(appStats.pending_applications || 0),
          },
          recentApplications,
          recentAudits,
        });
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid role.' });
    } catch (error) {
      next(error);
    }
  }
}
