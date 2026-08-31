import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { NotificationService } from '../services/notificationService.js';
import { AuditService } from '../services/auditService.js';

export class ReminderController {
  /**
   * Set Smart Reminder for an Event (STUDENT only)
   */
  static async createReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);
      const { reminder_type } = req.body;

      if (user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Only students can set event reminders.' });
        return;
      }

      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      const [events] = await pool.query<any[]>(
        'SELECT id, title, event_date, start_time FROM events WHERE id = ?',
        [eventId]
      );

      if (events.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const event = events[0];

      // Calculate reminder datetime
      const eventDateTimeStr = `${event.event_date}T${event.start_time}`;
      const eventDate = new Date(eventDateTimeStr);

      let reminderDate = new Date(eventDate);
      if (reminder_type === '1_DAY_BEFORE') {
        reminderDate.setDate(reminderDate.getDate() - 1);
      } else if (reminder_type === '1_HOUR_BEFORE') {
        reminderDate.setHours(reminderDate.getHours() - 1);
      }

      // Check if duplicate reminder already exists
      const [existing] = await pool.query<any[]>(
        'SELECT id FROM reminders WHERE event_id = ? AND student_id = ? AND reminder_type = ?',
        [eventId, user.userId, reminder_type]
      );

      if (existing.length > 0) {
        res.status(409).json({
          success: false,
          message: `You have already set a ${reminder_type.replace('_', ' ').toLowerCase()} reminder for this event.`,
        });
        return;
      }

      // Format reminder_time as YYYY-MM-DD HH:MM:SS
      const formattedReminderTime = reminderDate.toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await pool.query<any>(
        `INSERT INTO reminders (event_id, student_id, reminder_type, reminder_time, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [eventId, user.userId, reminder_type, formattedReminderTime]
      );

      const reminderLabel = reminder_type === '1_DAY_BEFORE' ? '1 day before' : '1 hour before';

      // Confirmation notification
      await NotificationService.createNotification(
        user.userId,
        'Smart Reminder Scheduled',
        `You will be reminded ${reminderLabel} "${event.title}" starts.`,
        'REMINDER_SET'
      );

      // Audit Log
      await AuditService.logAudit(
        user.userId,
        'REMINDER_CREATED',
        'reminders',
        result.insertId,
        { eventId, reminder_type },
        req.ip
      );

      res.status(201).json({
        success: true,
        message: `Reminder set for ${reminderLabel} the event!`,
        reminderId: result.insertId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reminders for logged-in student
   */
  static async getMyReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Only students have reminders.' });
        return;
      }

      const [reminders] = await pool.query<any[]>(
        `SELECT
          r.id,
          r.event_id,
          r.student_id,
          r.reminder_type,
          r.reminder_time,
          r.status,
          r.created_at,
          e.title AS event_title,
          e.event_date,
          e.start_time,
          e.location
         FROM reminders r
         JOIN events e ON r.event_id = e.id
         WHERE r.student_id = ?
         ORDER BY r.reminder_time ASC`,
        [user.userId]
      );

      res.status(200).json({
        success: true,
        count: reminders.length,
        reminders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete / Cancel a reminder
   */
  static async deleteReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const reminderId = parseInt(req.params.id, 10);

      if (isNaN(reminderId)) {
        res.status(400).json({ success: false, message: 'Invalid reminder ID.' });
        return;
      }

      await pool.query('DELETE FROM reminders WHERE id = ? AND student_id = ?', [
        reminderId,
        user.userId,
      ]);

      res.status(200).json({
        success: true,
        message: 'Reminder removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
