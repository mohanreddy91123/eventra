import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { AuditService } from '../services/auditService.js';

export class ProfileController {
  /**
   * Get Current User Profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const [users] = await pool.query<any[]>(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const user = users[0];
      let studentProfile = null;

      if (user.role === 'STUDENT') {
        const [profiles] = await pool.query<any[]>(
          'SELECT roll_number, department, section, phone_number, skills, interests, created_at, updated_at FROM student_profiles WHERE user_id = ?',
          [userId]
        );
        if (profiles.length > 0) {
          studentProfile = profiles[0];
          if (typeof studentProfile.skills === 'string') {
            try { studentProfile.skills = JSON.parse(studentProfile.skills); } catch { studentProfile.skills = []; }
          }
          if (typeof studentProfile.interests === 'string') {
            try { studentProfile.interests = JSON.parse(studentProfile.interests); } catch { studentProfile.interests = []; }
          }
        }
      }

      res.status(200).json({
        success: true,
        user,
        studentProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Student Preferences (Skills & Interests ONLY)
   * Official fields (Name, Roll Number, Department, Section, Phone, Email) are STRICTLY IMMUTABLE.
   */
  static async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (userRole !== 'STUDENT') {
        res.status(403).json({
          success: false,
          message: 'Preferences can only be updated for student accounts.',
        });
        return;
      }

      // Check if unauthorized official fields were supplied
      const forbiddenKeys = ['name', 'roll_number', 'department', 'section', 'phone_number', 'email', 'role'];
      const attemptedForbidden = forbiddenKeys.filter((k) => k in req.body);

      if (attemptedForbidden.length > 0) {
        res.status(403).json({
          success: false,
          message: `Official student profile fields cannot be modified: [${attemptedForbidden.join(', ')}]. Only skills and interests preferences may be updated.`,
        });
        return;
      }

      const { skills, interests } = req.body;

      const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
      const interestsJson = JSON.stringify(Array.isArray(interests) ? interests : []);

      await pool.query(
        `UPDATE student_profiles
         SET skills = ?, interests = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [skillsJson, interestsJson, userId]
      );

      // Audit Log
      await AuditService.logAudit(
        userId,
        'STUDENT_PREFERENCES_UPDATED',
        'student_profiles',
        userId,
        { skills, interests },
        req.ip
      );

      res.status(200).json({
        success: true,
        message: 'Personal preferences updated successfully! Event recommendations refreshed.',
        preferences: {
          skills: Array.isArray(skills) ? skills : [],
          interests: Array.isArray(interests) ? interests : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
