import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';
import { ApplicationController } from '../controllers/applicationController.js';
import { BookmarkController } from '../controllers/bookmarkController.js';
import { ReminderController } from '../controllers/reminderController.js';
import {
  authenticateJWT,
  optionalAuthenticateJWT,
  requireRole,
  authorizeEventMutation,
} from '../middleware/auth.js';
import {
  validateBody,
  eventSchema,
  eventUpdateSchema,
  reminderSchema,
} from '../middleware/validate.js';

const router = Router();

// Public / Semi-public listing
router.get('/', optionalAuthenticateJWT, EventController.getEvents);
router.get('/recommendations', authenticateJWT, requireRole(['STUDENT']), EventController.getRecommendations);
router.get('/:id', optionalAuthenticateJWT, EventController.getEventById);

// Organizer Event Management (TEACHER & EDUCELL)
router.post(
  '/',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  validateBody(eventSchema),
  EventController.createEvent
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeEventMutation,
  validateBody(eventUpdateSchema),
  EventController.updateEvent
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeEventMutation,
  EventController.deleteEvent
);

// Event History & Audit
router.get(
  '/:id/history',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  EventController.getEventHistory
);

// Student Actions on Events
router.post(
  '/:id/apply',
  authenticateJWT,
  requireRole(['STUDENT']),
  ApplicationController.applyToEvent
);

router.post(
  '/:id/bookmark',
  authenticateJWT,
  requireRole(['STUDENT']),
  BookmarkController.toggleBookmark
);

router.post(
  '/:id/reminder',
  authenticateJWT,
  requireRole(['STUDENT']),
  validateBody(reminderSchema),
  ReminderController.createReminder
);

// Organizer viewing applications for this event
router.get(
  '/:id/applications',
  authenticateJWT,
  requireRole(['TEACHER', 'EDUCELL']),
  ApplicationController.getOrganizerApplications
);

export default router;
