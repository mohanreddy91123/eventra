import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { AuthJWTPayload, User, StudentProfile } from '../types/index.js';
import { AuditService } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'eventra_super_secure_jwt_secret_key_2026_campus_platform';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {
  /**
   * Student Registration
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const {
        name,
        email,
        password,
        roll_number,
        department,
        section,
        phone_number,
        skills,
        interests,
      } = req.body;

      await connection.beginTransaction();

      // Check if email already exists
      const [existingUsers] = await connection.query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );
      if (existingUsers.length > 0) {
        await connection.rollback();
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please login.',
        });
        return;
      }

      // Check if roll number already exists
      const [existingRoll] = await connection.query<any[]>(
        'SELECT id FROM student_profiles WHERE roll_number = ?',
        [roll_number.trim().toUpperCase()]
      );
      if (existingRoll.length > 0) {
        await connection.rollback();
        res.status(409).json({
          success: false,
          message: 'A student with this Roll Number is already registered.',
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert User
      const [userResult] = await connection.query<any>(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'STUDENT')`,
        [name.trim(), email.toLowerCase().trim(), passwordHash]
      );
      const userId = userResult.insertId;

      // Insert Student Profile
      const skillsJson = JSON.stringify(skills || []);
      const interestsJson = JSON.stringify(interests || []);

      await connection.query(
        `INSERT INTO student_profiles (user_id, roll_number, department, section, phone_number, skills, interests)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          roll_number.trim().toUpperCase(),
          department.trim(),
          section.trim().toUpperCase(),
          phone_number.trim(),
          skillsJson,
          interestsJson,
        ]
      );

      await connection.commit();

      // Generate JWT Token
      const tokenPayload: AuthJWTPayload = {
        userId,
        email: email.toLowerCase().trim(),
        role: 'STUDENT',
        name: name.trim(),
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

      // Audit Log
      await AuditService.logAudit(
        userId,
        'STUDENT_REGISTERED',
        'users',
        userId,
        { email, roll_number, department },
        req.ip
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Eventra.',
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role: 'STUDENT',
        },
        profile: {
          roll_number: roll_number.trim().toUpperCase(),
          department: department.trim(),
          section: section.trim().toUpperCase(),
          phone_number: phone_number.trim(),
          skills: skills || [],
          interests: interests || [],
        },
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  /**
   * Universal Login for STUDENT, TEACHER, EDUCELL
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const [users] = await pool.query<any[]>(
        'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
        return;
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.',
        });
        return;
      }

      // Fetch student profile if student
      let profile: any = null;
      if (user.role === 'STUDENT') {
        const [profiles] = await pool.query<any[]>(
          'SELECT roll_number, department, section, phone_number, skills, interests FROM student_profiles WHERE user_id = ?',
          [user.id]
        );
        if (profiles.length > 0) {
          profile = profiles[0];
          // Parse JSON if needed
          if (typeof profile.skills === 'string') {
            try { profile.skills = JSON.parse(profile.skills); } catch { profile.skills = []; }
          }
          if (typeof profile.interests === 'string') {
            try { profile.interests = JSON.parse(profile.interests); } catch { profile.interests = []; }
          }
        }
      }

      const tokenPayload: AuthJWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

      // Audit Log
      await AuditService.logAudit(
        user.id,
        'USER_LOGIN',
        'users',
        user.id,
        { role: user.role },
        req.ip
      );

      res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated User & Profile
   */
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const [users] = await pool.query<any[]>(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (users.length === 0) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const user = users[0];
      let profile: any = null;

      if (user.role === 'STUDENT') {
        const [profiles] = await pool.query<any[]>(
          'SELECT roll_number, department, section, phone_number, skills, interests FROM student_profiles WHERE user_id = ?',
          [user.id]
        );
        if (profiles.length > 0) {
          profile = profiles[0];
          if (typeof profile.skills === 'string') {
            try { profile.skills = JSON.parse(profile.skills); } catch { profile.skills = []; }
          }
          if (typeof profile.interests === 'string') {
            try { profile.interests = JSON.parse(profile.interests); } catch { profile.interests = []; }
          }
        }
      }

      res.status(200).json({
        success: true,
        user,
        profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
