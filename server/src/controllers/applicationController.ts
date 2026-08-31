import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { AuditService } from '../services/auditService.js';
import { NotificationService } from '../services/notificationService.js';

export class ApplicationController {
  /**
   * Apply / Register for an event (STUDENT only)
   * Direct instant registration — NO approval required from SAC or Teacher.
   * Auto-uses registered profile information; enforces capacity, deadlines, and duplicate prevention.
   */
  static async applyToEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);

      if (user.role !== 'STUDENT') {
        res.status(403).json({
          success: false,
          message: 'Only registered students can apply for events.',
        });
        return;
      }

      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      // 1. Fetch Event details
      const [events] = await pool.query<any[]>(
        `SELECT id, title, status, capacity, registration_start, registration_deadline,
                (SELECT COUNT(*) FROM applications WHERE event_id = ? AND status != 'Cancelled') AS current_applications
         FROM events WHERE id = ?`,
        [eventId, eventId]
      );

      if (events.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const event = events[0];

      // 2. Validate Event Status
      if (event.status === 'CANCELLED') {
        res.status(400).json({
          success: false,
          message: 'Cannot register: This event has been cancelled.',
        });
        return;
      }

      // 3. Validate Registration Dates
      const now = new Date();
      const regStart = new Date(event.registration_start);
      const regEnd = new Date(event.registration_deadline);

      if (now < regStart) {
        res.status(400).json({
          success: false,
          message: `Registration has not opened yet. Opens on ${regStart.toLocaleDateString()}.`,
        });
        return;
      }

      if (now > regEnd) {
        res.status(400).json({
          success: false,
          message: 'Registration deadline has passed for this event.',
        });
        return;
      }

      // 4. Validate Capacity
      if (event.current_applications >= event.capacity) {
        res.status(400).json({
          success: false,
          message: `Event is at full capacity (${event.capacity}/${event.capacity} seats registered).`,
        });
        return;
      }

      // 5. Check Duplicate Registration
      const [existing] = await pool.query<any[]>(
        'SELECT id, status FROM applications WHERE event_id = ? AND student_id = ?',
        [eventId, user.userId]
      );

      if (existing.length > 0) {
        res.status(409).json({
          success: false,
          message: `You are already registered for this event. Current status: ${existing[0].status}`,
        });
        return;
      }

      // 6. Direct Instant Registration (Status is Approved immediately — no approval needed)
      const [result] = await pool.query<any>(
        `INSERT INTO applications (event_id, student_id, status, applied_at, updated_at)
         VALUES (?, ?, 'Approved', NOW(), NOW())`,
        [eventId, user.userId]
      );

      const applicationId = result.insertId;

      // 7. Dispatch Confirmation Notification to Student
      await NotificationService.createNotification(
        user.userId,
        'Registration Confirmed 🎉',
        `Your registration for "${event.title}" is confirmed. No approval required!`,
        'APPLICATION_STATUS'
      );

      // 8. Audit Log
      await AuditService.logAudit(
        user.userId,
        'STUDENT_REGISTERED_EVENT',
        'applications',
        applicationId,
        { eventId, eventTitle: event.title, status: 'Approved' },
        req.ip
      );

      res.status(201).json({
        success: true,
        message: `Successfully registered for "${event.title}"! Your seat is confirmed.`,
        applicationId,
        status: 'Approved',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get applications/registrations of current logged-in student
   */
  static async getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Only students can view their registrations.' });
        return;
      }

      const [applications] = await pool.query<any[]>(
        `SELECT
          a.id,
          a.event_id,
          a.student_id,
          a.status,
          a.notes,
          a.applied_at,
          a.updated_at,
          e.title AS event_title,
          e.category AS event_category,
          e.event_date,
          e.start_time,
          e.end_time,
          e.location AS event_location,
          e.organizer_name,
          e.poster_url
         FROM applications a
         JOIN events e ON a.event_id = e.id
         WHERE a.student_id = ?
         ORDER BY a.applied_at DESC`,
        [user.userId]
      );

      res.status(200).json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get registrations roster for a specific event
   */
  static async getOrganizerApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);

      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      // Check event ownership for Teachers
      if (user.role === 'TEACHER') {
        const [events] = await pool.query<any[]>(
          'SELECT created_by FROM events WHERE id = ?',
          [eventId]
        );
        if (events.length === 0) {
          res.status(404).json({ success: false, message: 'Event not found.' });
          return;
        }
        if (events[0].created_by !== user.userId) {
          res.status(403).json({
            success: false,
            message: 'Access Denied: You can only view registrations for your own events.',
          });
          return;
        }
      }

      const [applications] = await pool.query<any[]>(
        `SELECT
          a.id,
          a.event_id,
          a.student_id,
          a.status,
          a.notes,
          a.applied_at,
          a.updated_at,
          u.name AS student_name,
          u.email AS student_email,
          sp.roll_number,
          sp.department,
          sp.section,
          sp.phone_number,
          sp.skills,
          sp.interests
         FROM applications a
         JOIN users u ON a.student_id = u.id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE a.event_id = ?
         ORDER BY a.applied_at ASC`,
        [eventId]
      );

      const parsed = applications.map((app) => ({
        ...app,
        skills: typeof app.skills === 'string' ? JSON.parse(app.skills || '[]') : app.skills || [],
        interests: typeof app.interests === 'string' ? JSON.parse(app.interests || '[]') : app.interests || [],
      }));

      res.status(200).json({
        success: true,
        count: parsed.length,
        applications: parsed,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all registered students across campus (EDUCELL view only — NO approval needed)
   */
  static async getAllApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      if (user.role !== 'EDUCELL') {
        res.status(403).json({ success: false, message: 'Forbidden. Edu Cell access only.' });
        return;
      }

      const [applications] = await pool.query<any[]>(`
        SELECT
          a.id,
          a.event_id,
          a.student_id,
          a.status,
          a.notes,
          a.applied_at,
          a.updated_at,
          e.title AS event_title,
          e.category AS event_category,
          e.event_date,
          e.organizer_name,
          u.name AS student_name,
          u.email AS student_email,
          sp.roll_number,
          sp.department,
          sp.section,
          sp.phone_number
        FROM applications a
        JOIN events e ON a.event_id = e.id
        JOIN users u ON a.student_id = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        ORDER BY a.applied_at DESC
      `);

      res.status(200).json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update application notes or cancel registration if requested
   */
  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const applicationId = parseInt(req.params.id, 10);
      const { status, notes } = req.body;

      if (isNaN(applicationId)) {
        res.status(400).json({ success: false, message: 'Invalid application ID.' });
        return;
      }

      // SAC does not approve student registrations
      if (user.role === 'EDUCELL') {
        res.status(403).json({
          success: false,
          message: 'Student registrations are directly confirmed. Edu Cell / SAC does not need to approve student registrations.',
        });
        return;
      }

      // Fetch application and associated event
      const [rows] = await pool.query<any[]>(
        `SELECT a.*, e.title AS event_title, e.created_by AS event_creator
         FROM applications a
         JOIN events e ON a.event_id = e.id
         WHERE a.id = ?`,
        [applicationId]
      );

      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'Registration record not found.' });
        return;
      }

      const app = rows[0];

      // Verify Teacher ownership
      if (user.role === 'TEACHER' && app.event_creator !== user.userId) {
        res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot modify registrations for events you did not create.',
        });
        return;
      }

      // Update Application
      await pool.query(
        `UPDATE applications
         SET status = ?, notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [status, notes || null, applicationId]
      );

      // Create Notification for Student
      const notifTitle = `Registration Status: ${status}`;
      const notifMsg = status === 'Approved'
        ? `Your registration for "${app.event_title}" is confirmed.`
        : status === 'Cancelled'
        ? `Your registration for "${app.event_title}" has been cancelled.`
        : `Your registration status for "${app.event_title}" is: ${status}.`;

      await NotificationService.createNotification(
        app.student_id,
        notifTitle,
        notifMsg,
        'APPLICATION_STATUS'
      );

      res.status(200).json({
        success: true,
        message: `Registration status updated successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }
}
