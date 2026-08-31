import pool from '../config/database.js';

export class NotificationService {
  /**
   * Dispatches a notification to a specific user
   */
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES (?, ?, ?, ?, FALSE)`,
        [userId, title, message, type]
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  /**
   * Alias for createNotification
   */
  static async sendNotification(
    userId: number,
    title: string,
    message: string,
    type: string
  ): Promise<void> {
    return this.createNotification(userId, title, message, type);
  }

  /**
   * Broadcasts a notification to all students who applied or bookmarked an event
   */
  static async notifyEventParticipants(
    eventId: number,
    title: string,
    message: string,
    type: string
  ): Promise<void> {
    try {
      // Get all unique student IDs from applications and bookmarks
      const [rows] = await pool.query<any[]>(
        `SELECT DISTINCT student_id FROM (
           SELECT student_id FROM applications WHERE event_id = ?
           UNION
           SELECT student_id FROM bookmarks WHERE event_id = ?
         ) AS combined_students`,
        [eventId, eventId]
      );

      for (const row of rows) {
        await this.createNotification(row.student_id, title, message, type);
      }
    } catch (error) {
      console.error('Failed to notify event participants:', error);
    }
  }
}
