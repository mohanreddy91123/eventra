import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { CampusEvent, StudentProfile, RowDataPacket, ResultSetHeader } from '../types/index.js';
import { AuditService } from '../services/auditService.js';
import { NotificationService } from '../services/notificationService.js';
import { recommendationEngine } from '../services/recommendationService.js';

export class EventController {
  /**
   * List all campus events with filters, search, and personalized student match scoring
   */
  static async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, department, status, startDate, endDate, myEventsOnly } = req.query;
      const user = req.user;

      let query = `
        SELECT
          e.*,
          uc.name AS creator_name,
          uc.email AS creator_email,
          uc.role AS creator_role,
          uu.name AS updater_name,
          uu.email AS updater_email,
          uu.role AS updater_role,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) AS applications_count,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'Approved') AS approved_count
        FROM events e
        JOIN users uc ON e.created_by = uc.id
        LEFT JOIN users uu ON e.updated_by = uu.id
        WHERE 1=1
      `;
      const queryParams: any[] = [];

      // Filter by organizer's own events if requested
      if (myEventsOnly === 'true' && user) {
        if (user.role === 'TEACHER') {
          query += ' AND e.created_by = ?';
          queryParams.push(user.userId);
        }
      }

      // Search keyword filter (title, description, organizer, location)
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchPattern = `%${search.trim()}%`;
        query += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ? OR e.organizer_name LIKE ? OR e.target_department LIKE ?)`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      // Category filter
      if (category && typeof category === 'string' && category !== 'ALL') {
        query += ' AND e.category = ?';
        queryParams.push(category);
      }

      // Department filter
      if (department && typeof department === 'string' && department !== 'ALL') {
        query += ' AND (e.target_department LIKE ? OR e.target_department LIKE "%All%" OR e.target_department LIKE "%Any%")';
        queryParams.push(`%${department}%`);
      }

      // Status filter
      if (status && typeof status === 'string' && status !== 'ALL') {
        if (status === 'UPCOMING' || status === 'PUBLISHED') {
          query += " AND e.status IN ('PUBLISHED', 'UPCOMING')";
        } else {
          query += ' AND e.status = ?';
          queryParams.push(status);
        }
      }

      // Date range filters
      if (startDate && typeof startDate === 'string') {
        query += ' AND e.event_date >= ?';
        queryParams.push(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        query += ' AND e.event_date <= ?';
        queryParams.push(endDate);
      }

      // Default sorting: published/active upcoming events first
      query += ' ORDER BY e.event_date ASC, e.start_time ASC';

      const [rows] = await pool.query<any[]>(query, queryParams);

      // If user is a student, fetch profile and user engagement data to calculate recommendation scores
      let studentProfile: StudentProfile | null = null;
      let appliedEventIds = new Set<number>();
      let studentApplicationsMap = new Map<number, any>();
      let bookmarkedEventIds = new Set<number>();
      let studentHistory = { appliedCategories: [] as string[], bookmarkedCategories: [] as string[] };

      if (user && user.role === 'STUDENT') {
        const [profiles] = await pool.query<any[]>(
          'SELECT * FROM student_profiles WHERE user_id = ?',
          [user.userId]
        );
        if (profiles.length > 0) {
          studentProfile = profiles[0];
        }

        const [apps] = await pool.query<any[]>(
          'SELECT a.event_id, a.status, e.category FROM applications a JOIN events e ON a.event_id = e.id WHERE a.student_id = ?',
          [user.userId]
        );
        for (const app of apps) {
          appliedEventIds.add(app.event_id);
          studentApplicationsMap.set(app.event_id, app.status);
          if (app.category) studentHistory.appliedCategories.push(app.category);
        }

        const [bookmarks] = await pool.query<any[]>(
          'SELECT b.event_id, e.category FROM bookmarks b JOIN events e ON b.event_id = e.id WHERE b.student_id = ?',
          [user.userId]
        );
        for (const bm of bookmarks) {
          bookmarkedEventIds.add(bm.event_id);
          if (bm.category) studentHistory.bookmarkedCategories.push(bm.category);
        }
      }

      // Process rows to parse JSON arrays and add recommendation match info
      const processedEvents = rows.map((ev) => {
        const eventItem: CampusEvent = {
          ...ev,
          required_skills: typeof ev.required_skills === 'string' ? JSON.parse(ev.required_skills || '[]') : ev.required_skills || [],
          relevant_interests: typeof ev.relevant_interests === 'string' ? JSON.parse(ev.relevant_interests || '[]') : ev.relevant_interests || [],
          applications_count: Number(ev.applications_count || 0),
          approved_count: Number(ev.approved_count || 0),
          is_bookmarked: user && user.role === 'STUDENT' ? bookmarkedEventIds.has(ev.id) : false,
          has_applied: user && user.role === 'STUDENT' ? appliedEventIds.has(ev.id) : false,
          application_status: user && user.role === 'STUDENT' ? studentApplicationsMap.get(ev.id) : undefined,
        };

        if (user && user.role === 'STUDENT') {
          const rec = recommendationEngine.calculateAffinity(studentProfile, eventItem, studentHistory);
          eventItem.match_score = rec.score;
          eventItem.match_reasons = rec.reasons;
        }

        return eventItem;
      });

      res.status(200).json({
        success: true,
        count: processedEvents.length,
        events: processedEvents,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get personalized recommendations for student
   */
  static async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user || user.role !== 'STUDENT') {
        res.status(403).json({ success: false, message: 'Recommendations are available for students.' });
        return;
      }

      const [profiles] = await pool.query<any[]>(
        'SELECT * FROM student_profiles WHERE user_id = ?',
        [user.userId]
      );
      const studentProfile = profiles.length > 0 ? profiles[0] : null;

      const [apps] = await pool.query<any[]>(
        'SELECT a.event_id, a.status, e.category FROM applications a JOIN events e ON a.event_id = e.id WHERE a.student_id = ?',
        [user.userId]
      );
      const appliedEventIds = new Set<number>();
      const studentHistory = { appliedCategories: [] as string[], bookmarkedCategories: [] as string[] };
      for (const app of apps) {
        appliedEventIds.add(app.event_id);
        if (app.category) studentHistory.appliedCategories.push(app.category);
      }

      const [bookmarks] = await pool.query<any[]>(
        'SELECT b.event_id, e.category FROM bookmarks b JOIN events e ON b.event_id = e.id WHERE b.student_id = ?',
        [user.userId]
      );
      const bookmarkedEventIds = new Set<number>();
      for (const bm of bookmarks) {
        bookmarkedEventIds.add(bm.event_id);
        if (bm.category) studentHistory.bookmarkedCategories.push(bm.category);
      }

      // Fetch active published/upcoming events
      const [events] = await pool.query<any[]>(`
        SELECT
          e.*,
          uc.name AS creator_name,
          uc.role AS creator_role,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) AS applications_count
        FROM events e
        JOIN users uc ON e.created_by = uc.id
        WHERE e.status IN ('PUBLISHED', 'UPCOMING')
        ORDER BY e.event_date ASC
      `);

      const scoredEvents = events.map((ev) => {
        const eventItem: CampusEvent = {
          ...ev,
          required_skills: typeof ev.required_skills === 'string' ? JSON.parse(ev.required_skills || '[]') : ev.required_skills || [],
          relevant_interests: typeof ev.relevant_interests === 'string' ? JSON.parse(ev.relevant_interests || '[]') : ev.relevant_interests || [],
          applications_count: Number(ev.applications_count || 0),
          is_bookmarked: bookmarkedEventIds.has(ev.id),
          has_applied: appliedEventIds.has(ev.id),
        };

        const rec = recommendationEngine.calculateAffinity(studentProfile, eventItem, studentHistory);
        eventItem.match_score = rec.score;
        eventItem.match_reasons = rec.reasons;

        return eventItem;
      });

      // Sort by match_score descending
      scoredEvents.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      res.status(200).json({
        success: true,
        recommendations: scoredEvents.slice(0, 10),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single event details by ID
   */
  static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      const [rows] = await pool.query<any[]>(
        `SELECT
          e.*,
          uc.name AS creator_name,
          uc.email AS creator_email,
          uc.role AS creator_role,
          uu.name AS updater_name,
          uu.email AS updater_email,
          uu.role AS updater_role,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id) AS applications_count,
          (SELECT COUNT(*) FROM applications a WHERE a.event_id = e.id AND a.status = 'Approved') AS approved_count
         FROM events e
         JOIN users uc ON e.created_by = uc.id
         LEFT JOIN users uu ON e.updated_by = uu.id
         WHERE e.id = ?`,
        [eventId]
      );

      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const ev = rows[0];
      const eventItem: CampusEvent = {
        ...ev,
        required_skills: typeof ev.required_skills === 'string' ? JSON.parse(ev.required_skills || '[]') : ev.required_skills || [],
        relevant_interests: typeof ev.relevant_interests === 'string' ? JSON.parse(ev.relevant_interests || '[]') : ev.relevant_interests || [],
        applications_count: Number(ev.applications_count || 0),
        approved_count: Number(ev.approved_count || 0),
      };

      const user = req.user;
      if (user && user.role === 'STUDENT') {
        const [bookmarks] = await pool.query<any[]>(
          'SELECT id FROM bookmarks WHERE event_id = ? AND student_id = ?',
          [eventId, user.userId]
        );
        eventItem.is_bookmarked = bookmarks.length > 0;

        const [apps] = await pool.query<any[]>(
          'SELECT id, status FROM applications WHERE event_id = ? AND student_id = ?',
          [eventId, user.userId]
        );
        if (apps.length > 0) {
          eventItem.has_applied = true;
          eventItem.application_status = apps[0].status;
        } else {
          eventItem.has_applied = false;
        }

        const [profiles] = await pool.query<any[]>(
          'SELECT * FROM student_profiles WHERE user_id = ?',
          [user.userId]
        );
        const studentProfile = profiles.length > 0 ? profiles[0] : null;
        const rec = recommendationEngine.calculateAffinity(studentProfile, eventItem);
        eventItem.match_score = rec.score;
        eventItem.match_reasons = rec.reasons;
      }

      res.status(200).json({
        success: true,
        event: eventItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new campus event:
   * - TEACHER: Can directly create and publish immediately.
   * - EDU CELL / SAC: Must have prior approved teacher permission. If attempted without approved request, returns 403 Forbidden.
   * - STUDENT: 403 Forbidden.
   */
  static async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const user = req.user!;

      if (user.role === 'STUDENT') {
        res.status(403).json({
          success: false,
          message: 'Access Denied: Students are not permitted to create events.',
        });
        return;
      }

      const {
        title,
        description,
        category,
        event_date,
        start_time,
        end_time,
        location,
        organizer_name,
        organizer_phone,
        registration_start,
        registration_deadline,
        capacity,
        eligibility,
        target_department,
        required_skills,
        relevant_interests,
        poster_url,
        external_registration_url,
        instructions,
        prize_info,
        certificate_info,
        status,
        permission_request_id,
      } = req.body;

      // EDU CELL / SAC Security Verification
      if (user.role === 'EDUCELL') {
        if (!permission_request_id) {
          res.status(403).json({
            success: false,
            message: 'Teacher permission is required before Edu Cell/SAC can create this event.',
          });
          return;
        }

        const [permRows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM event_permission_requests WHERE id = ?',
          [permission_request_id]
        );

        if (permRows.length === 0 || permRows[0].status !== 'APPROVED') {
          res.status(403).json({
            success: false,
            message: 'Teacher permission is required before Edu Cell/SAC can create this event.',
          });
          return;
        }
      }

      await connection.beginTransaction();

      const reqSkillsJson = JSON.stringify(Array.isArray(required_skills) ? required_skills : (required_skills ? [required_skills] : []));
      const relInterestsJson = JSON.stringify(Array.isArray(relevant_interests) ? relevant_interests : (relevant_interests ? [relevant_interests] : []));

      const [insertResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO events (
          title, description, category, event_date, start_time, end_time, location,
          organizer_name, organizer_phone, registration_start, registration_deadline,
          capacity, eligibility, target_department, required_skills, relevant_interests,
          poster_url, external_registration_url, instructions, prize_info, certificate_info,
          created_by, updated_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
        [
          title.trim(),
          description.trim(),
          category,
          event_date,
          start_time,
          end_time,
          location.trim(),
          organizer_name.trim(),
          organizer_phone.trim(),
          registration_start,
          registration_deadline,
          capacity,
          eligibility.trim(),
          target_department.trim(),
          reqSkillsJson,
          relInterestsJson,
          poster_url || null,
          external_registration_url || null,
          instructions || null,
          prize_info || null,
          certificate_info || null,
          user.userId,
          user.userId,
        ]
      );

      const newEventId = insertResult.insertId;

      if (user.role === 'EDUCELL' && permission_request_id) {
        await connection.query(
          'UPDATE event_permission_requests SET event_id = ? WHERE id = ?',
          [newEventId, permission_request_id]
        );
      }

      // Record Creation in Event History
      const auditAction = user.role === 'TEACHER' ? 'Teacher created event' : 'SAC created event after teacher approval';
      await connection.query(
        `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value)
         VALUES (?, ?, 'CREATED', 'Event Creation', NULL, ?)`,
        [newEventId, user.userId, auditAction]
      );

      await connection.commit();

      // System Audit Log
      await AuditService.logAction(
        user.userId,
        auditAction,
        'EVENT',
        newEventId,
        { title, category, event_date, capacity, role: user.role },
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'Event published successfully!',
        eventId: newEventId,
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  /**
   * Update an existing event with granular audit diff tracking
   */
  static async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);

      // Fetch existing event
      const [existingRows] = await connection.query<any[]>(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );

      if (existingRows.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const oldEvent = existingRows[0];

      // Parse JSON for diff
      if (typeof oldEvent.required_skills === 'string') {
        try { oldEvent.required_skills = JSON.parse(oldEvent.required_skills); } catch {}
      }
      if (typeof oldEvent.relevant_interests === 'string') {
        try { oldEvent.relevant_interests = JSON.parse(oldEvent.relevant_interests); } catch {}
      }

      await connection.beginTransaction();

      const updates = req.body;
      const setClauses: string[] = [];
      const setParams: any[] = [];

      const fieldsToUpdate = [
        'title', 'description', 'category', 'event_date', 'start_time', 'end_time',
        'location', 'organizer_name', 'organizer_phone', 'registration_start',
        'registration_deadline', 'capacity', 'eligibility', 'target_department',
        'required_skills', 'relevant_interests', 'poster_url', 'external_registration_url',
        'instructions', 'prize_info', 'certificate_info', 'status'
      ];

      for (const field of fieldsToUpdate) {
        if (field in updates) {
          setClauses.push(`${field} = ?`);
          let val = updates[field];
          if (field === 'required_skills' || field === 'relevant_interests') {
            val = JSON.stringify(Array.isArray(val) ? val : (val ? [val] : []));
          }
          setParams.push(val);
        }
      }

      setClauses.push('updated_by = ?');
      setParams.push(user.userId);

      setClauses.push('updated_at = NOW()');

      setParams.push(eventId);

      await connection.query(
        `UPDATE events SET ${setClauses.join(', ')} WHERE id = ?`,
        setParams
      );

      await connection.commit();

      // Record Audit Diff in Event History
      await AuditService.recordEventDiff(eventId, user.userId, oldEvent, updates);

      // System Audit Log
      const auditAction = user.role === 'TEACHER' ? 'Teacher updated event' : 'SAC updated event';
      await AuditService.logAction(
        user.userId,
        auditAction,
        'EVENT',
        eventId,
        { updatedFields: Object.keys(updates) },
        req.ip
      );

      // Notify registered students if key fields changed
      if (updates.event_date || updates.location || updates.start_time || updates.status === 'CANCELLED') {
        const changeMsg = updates.status === 'CANCELLED'
          ? `The event "${oldEvent.title}" has been cancelled.`
          : `Important update for "${oldEvent.title}": Date, time, or venue has been updated. Check event details.`;
        await NotificationService.notifyEventParticipants(eventId, 'Event Schedule Updated', changeMsg, 'EVENT_UPDATE');
      }

      res.status(200).json({
        success: true,
        message: 'Event updated successfully and audit history recorded.',
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  /**
   * Cancel or Delete event
   */
  static async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const eventId = parseInt(req.params.id, 10);

      const [existingRows] = await pool.query<any[]>(
        'SELECT title, status FROM events WHERE id = ?',
        [eventId]
      );

      if (existingRows.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const event = existingRows[0];

      // Mark as CANCELLED
      await pool.query(
        'UPDATE events SET status = "CANCELLED", updated_by = ?, updated_at = NOW() WHERE id = ?',
        [user.userId, eventId]
      );

      // Log in event history
      await AuditService.logHistory(
        eventId,
        user.userId,
        'CANCELLED',
        'status',
        event.status,
        'CANCELLED'
      );

      // System Audit Log
      await AuditService.logAction(
        user.userId,
        'EVENT_CANCELLED',
        'EVENT',
        eventId,
        { title: event.title },
        req.ip
      );

      // Notify participants
      await NotificationService.notifyEventParticipants(
        eventId,
        'Event Cancelled',
        `The event "${event.title}" has been cancelled by organizers.`,
        'EVENT_CANCELLED'
      );

      res.status(200).json({
        success: true,
        message: 'Event marked as cancelled successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Event Change & Audit History
   */
  static async getEventHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.id, 10);
      if (isNaN(eventId)) {
        res.status(400).json({ success: false, message: 'Invalid event ID.' });
        return;
      }

      const [history] = await pool.query<any[]>(
        `SELECT
          eh.*,
          u.name AS changed_by_name,
          u.email AS changed_by_email,
          u.role AS changed_by_role
         FROM event_history eh
         JOIN users u ON eh.changed_by = u.id
         WHERE eh.event_id = ?
         ORDER BY eh.changed_at DESC`,
        [eventId]
      );

      res.status(200).json({
        success: true,
        count: history.length,
        history,
      });
    } catch (error) {
      next(error);
    }
  }
}
