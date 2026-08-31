import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthJWTPayload, UserRole } from '../types/index.js';
import pool from '../config/database.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthJWTPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user?: AuthJWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'eventra_super_secure_jwt_secret_key_2026_campus_platform';

/**
 * Authenticates user from Bearer JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required. Please login.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please login again.',
    });
    return;
  }
};

/**
 * Optional authentication: attaches user if valid token present, otherwise proceeds
 */
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthJWTPayload;
      req.user = decoded;
    } catch {
      // Ignore token failure for public routes
    }
  }
  next();
};

/**
 * Enforces role-based permissions
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};

/**
 * Verifies that the user has permission to modify or delete the specified event
 * - STUDENT: 403 Forbidden
 * - TEACHER: Only allowed for events they created
 * - EDUCELL: Allowed for all events
 */
export const authorizeEventMutation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    res.status(400).json({ success: false, message: 'Invalid event ID.' });
    return;
  }

  // Students can never modify events
  if (req.user.role === 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Students are not permitted to modify or delete events.',
    });
    return;
  }

  // EDUCELL can modify any event
  if (req.user.role === 'EDUCELL') {
    next();
    return;
  }

  // TEACHER can only modify events created by themselves
  if (req.user.role === 'TEACHER') {
    try {
      const [rows] = await pool.query<any[]>('SELECT created_by, title FROM events WHERE id = ?', [
        eventId,
      ]);

      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      const event = rows[0];
      if (event.created_by !== req.user.userId) {
        res.status(403).json({
          success: false,
          message: 'Access Denied: Teachers can only edit or manage events that they have created.',
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
    return;
  }

  res.status(403).json({ success: false, message: 'Unauthorized role.' });
};
