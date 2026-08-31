import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';
import { AuditService } from '../services/auditService.js';
import { NotificationService } from '../services/notificationService.js';
import { EventPermissionRequest, RowDataPacket, ResultSetHeader } from '../types/index.js';

export class PermissionRequestController {
  /**
   * POST /api/permission-requests
   * (EDU CELL / SAC Only) Submit a permission request to teachers
   */
  static async createRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'EDUCELL') {
        res.status(403).json({
          success: false,
          message: 'Only Edu Cell / SAC coordinators can submit event permission requests.',
        });
        return;
      }

      const {
        event_title,
        event_description,
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
      } = req.body;

      const skillsJson = required_skills
        ? typeof required_skills === 'string'
          ? required_skills
          : JSON.stringify(required_skills)
        : null;

      const interestsJson = relevant_interests
        ? typeof relevant_interests === 'string'
          ? relevant_interests
          : JSON.stringify(relevant_interests)
        : null;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO event_permission_requests (
          requested_by, event_title, event_description, category, event_date,
          start_time, end_time, location, organizer_name, organizer_phone,
          registration_start, registration_deadline, capacity, eligibility,
          target_department, required_skills, relevant_interests, poster_url,
          external_registration_url, instructions, prize_info, certificate_info,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_TEACHER_APPROVAL')`,
        [
          req.user.userId,
          event_title,
          event_description,
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
          skillsJson,
          interestsJson,
          poster_url || null,
          external_registration_url || null,
          instructions || null,
          prize_info || null,
          certificate_info || null,
        ]
      );

      const requestId = result.insertId;

      // Audit Log
      await AuditService.logAction(
        req.user.userId,
        'SAC requested teacher permission',
        'EVENT_PERMISSION_REQUEST',
        requestId,
        { title: event_title, category, date: event_date },
        req.ip
      );

      // Notify all faculty/teachers
      const [teachers] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE role = 'TEACHER'"
      );
      for (const t of teachers) {
        await NotificationService.sendNotification(
          t.id,
          'New SAC Event Permission Request',
          `Edu Cell coordinator submitted a request to host "${event_title}" on ${event_date}. Please review and approve.`,
          'SAC_REQUEST_SUBMITTED'
        );
      }

      res.status(201).json({
        success: true,
        message: 'Event permission request submitted. Awaiting faculty approval.',
        requestId,
      });
    } catch (error: any) {
      console.error('Create Permission Request Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit permission request.',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permission-requests
   * (TEACHER & EDU CELL) List permission requests
   */
  static async getRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role === 'STUDENT') {
        res.status(403).json({
          success: false,
          message: 'Access Denied: Students cannot view SAC permission requests.',
        });
        return;
      }

      const { status } = req.query;
      let query = `
        SELECT 
          r.*,
          u_req.name AS requested_by_name,
          u_req.email AS requested_by_email,
          u_req.role AS requested_by_role,
          u_rev.name AS reviewed_by_name,
          u_rev.email AS reviewed_by_email
        FROM event_permission_requests r
        JOIN users u_req ON r.requested_by = u_req.id
        LEFT JOIN users u_rev ON r.reviewed_by = u_rev.id
      `;

      const params: any[] = [];
      if (status && status !== 'ALL') {
        query += ' WHERE r.status = ?';
        params.push(status);
      }

      query += ` ORDER BY 
        CASE r.status 
          WHEN 'PENDING_TEACHER_APPROVAL' THEN 1 
          WHEN 'APPROVED' THEN 2 
          WHEN 'REJECTED' THEN 3 
          ELSE 4 
        END, r.created_at DESC`;

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      const requests = rows.map((row) => ({
        ...row,
        required_skills: typeof row.required_skills === 'string' ? JSON.parse(row.required_skills) : (row.required_skills || []),
        relevant_interests: typeof row.relevant_interests === 'string' ? JSON.parse(row.relevant_interests) : (row.relevant_interests || []),
      }));

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error: any) {
      console.error('Get Permission Requests Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permission requests.',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/permission-requests/:id
   */
  static async getRequestById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          r.*,
          u_req.name AS requested_by_name,
          u_req.email AS requested_by_email,
          u_req.role AS requested_by_role,
          u_rev.name AS reviewed_by_name,
          u_rev.email AS reviewed_by_email
        FROM event_permission_requests r
        JOIN users u_req ON r.requested_by = u_req.id
        LEFT JOIN users u_rev ON r.reviewed_by = u_rev.id
        WHERE r.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Permission request not found.',
        });
        return;
      }

      const request = {
        ...rows[0],
        required_skills: typeof rows[0].required_skills === 'string' ? JSON.parse(rows[0].required_skills) : (rows[0].required_skills || []),
        relevant_interests: typeof rows[0].relevant_interests === 'string' ? JSON.parse(rows[0].relevant_interests) : (rows[0].relevant_interests || []),
      };

      res.status(200).json({
        success: true,
        request,
      });
    } catch (error: any) {
      console.error('Get Request By ID Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permission request.',
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/permission-requests/:id/review
   * (TEACHER Only) Approve or Reject a SAC permission request
   */
  static async reviewRequest(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'TEACHER') {
        res.status(403).json({
          success: false,
          message: 'Only authorized Teachers can review SAC permission requests.',
        });
        return;
      }

      const { id } = req.params;
      const { status, rejection_reason } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be APPROVED or REJECTED.',
        });
        return;
      }

      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM event_permission_requests WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Permission request not found.',
        });
        return;
      }

      const request = existing[0];

      await pool.query(
        `UPDATE event_permission_requests 
        SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
        WHERE id = ?`,
        [status, req.user.userId, rejection_reason || null, id]
      );

      if (status === 'APPROVED') {
        // Audit log
        await AuditService.logAction(
          req.user.userId,
          'Teacher approved SAC event request',
          'EVENT_PERMISSION_REQUEST',
          Number(id),
          { title: request.event_title, approver: req.user.name },
          req.ip
        );

        // Notify SAC requester
        await NotificationService.sendNotification(
          request.requested_by,
          'Event Permission Approved 🎉',
          `Prof. ${req.user.name} approved your event request "${request.event_title}". You can now publish it to the campus platform.`,
          'SAC_REQUEST_APPROVED'
        );
      } else {
        // Rejection audit
        await AuditService.logAction(
          req.user.userId,
          'Teacher rejected SAC event request',
          'EVENT_PERMISSION_REQUEST',
          Number(id),
          { title: request.event_title, rejector: req.user.name, reason: rejection_reason },
          req.ip
        );

        // Notify SAC requester
        await NotificationService.sendNotification(
          request.requested_by,
          'Event Permission Request Rejected',
          `Prof. ${req.user.name} rejected your event request "${request.event_title}". Reason: ${rejection_reason || 'Not specified'}.`,
          'SAC_REQUEST_REJECTED'
        );
      }

      res.status(200).json({
        success: true,
        message: `Permission request has been marked as ${status}.`,
      });
    } catch (error: any) {
      console.error('Review Request Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review permission request.',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/permission-requests/:id/publish
   * (EDU CELL / SAC Only) Publish an approved event
   */
  static async publishApprovedEvent(req: AuthRequest, res: Response): Promise<void> {
    const connection = await pool.getConnection();
    try {
      if (!req.user || req.user.role !== 'EDUCELL') {
        res.status(403).json({
          success: false,
          message: 'Only Edu Cell / SAC can publish approved events.',
        });
        return;
      }

      const { id } = req.params;

      const [existing] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM event_permission_requests WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Permission request not found.',
        });
        return;
      }

      const request = existing[0];

      if (request.status !== 'APPROVED') {
        res.status(403).json({
          success: false,
          message: 'Teacher permission is required before Edu Cell/SAC can create this event.',
        });
        return;
      }

      if (request.event_id) {
        res.status(400).json({
          success: false,
          message: 'This event has already been published.',
        });
        return;
      }

      await connection.beginTransaction();

      const reqSkillsJson = request.required_skills
        ? typeof request.required_skills === 'string'
          ? request.required_skills
          : JSON.stringify(request.required_skills)
        : null;

      const relInterestsJson = request.relevant_interests
        ? typeof request.relevant_interests === 'string'
          ? request.relevant_interests
          : JSON.stringify(request.relevant_interests)
        : null;

      const [insertResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO events (
          title, description, category, event_date, start_time, end_time,
          location, organizer_name, organizer_phone, registration_start,
          registration_deadline, capacity, eligibility, target_department,
          required_skills, relevant_interests, poster_url, external_registration_url,
          instructions, prize_info, certificate_info, created_by, updated_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')`,
        [
          request.event_title,
          request.event_description,
          request.category,
          request.event_date,
          request.start_time,
          request.end_time,
          request.location,
          request.organizer_name,
          request.organizer_phone,
          request.registration_start,
          request.registration_deadline,
          request.capacity,
          request.eligibility,
          request.target_department,
          reqSkillsJson,
          relInterestsJson,
          request.poster_url,
          request.external_registration_url,
          request.instructions,
          request.prize_info,
          request.certificate_info,
          req.user.userId,
          req.user.userId,
        ]
      );

      const newEventId = insertResult.insertId;

      await connection.query(
        'UPDATE event_permission_requests SET event_id = ? WHERE id = ?',
        [newEventId, id]
      );

      await connection.commit();

      // Audit log
      await AuditService.logAction(
        req.user.userId,
        'SAC created event after teacher approval',
        'EVENT',
        newEventId,
        { title: request.event_title, requestId: id, approvedBy: request.reviewed_by },
        req.ip
      );

      // Record event history
      await AuditService.recordEventCreation(
        newEventId,
        req.user.userId,
        `SAC created event "${request.event_title}" after faculty approval`
      );

      res.status(201).json({
        success: true,
        message: 'Event published successfully after teacher approval!',
        eventId: newEventId,
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('Publish Approved Event Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish event.',
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
}
