import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Indian phone number regex (10 digits starting with 6, 7, 8, 9; optional +91 prefix)
const indianPhoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

export const registerSchema = z.object({
  name: z.string({ required_error: 'Full Name is required.' }).min(2, 'Name must be at least 2 characters.'),
  email: z.string({ required_error: 'Email is required.' }).email('Invalid email address format.'),
  password: z.string({ required_error: 'Password is required.' }).min(8, 'Password must be at least 8 characters long.'),
  roll_number: z.string({ required_error: 'Roll number is required.' }).min(2, 'Roll number is required.'),
  department: z.string({ required_error: 'Department is required.' }).min(2, 'Department is required.'),
  section: z.string({ required_error: 'Section is required.' }).min(1, 'Section is required.'),
  phone_number: z
    .string({ required_error: 'Phone number is required.' })
    .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian phone number (starting with 6-9).'),
  skills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' }).email('Invalid email address.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
});

export const eventSchema = z.object({
  title: z.string({ required_error: 'Event name is required.' }).min(3, 'Event name must be at least 3 characters.'),
  description: z.string({ required_error: 'Event description is required.' }).min(10, 'Description must be at least 10 characters.'),
  category: z.enum([
    'Technical',
    'Workshop',
    'Hackathon',
    'Career',
    'Placement',
    'Cultural',
    'Sports',
    'Seminar',
    'Other',
  ], {
    errorMap: () => ({ message: 'Please select a valid event category.' }),
  }),
  event_date: z.string({ required_error: 'Event date is required.' }).min(1, 'Event date is required.'),
  start_time: z.string({ required_error: 'Start time is required.' }).min(1, 'Start time is required.'),
  end_time: z.string({ required_error: 'End time is required.' }).min(1, 'End time is required.'),
  location: z.string({ required_error: 'Venue/Location is required.' }).min(2, 'Venue/Location is required.'),
  organizer_name: z.string({ required_error: 'Organizer name is required.' }).min(2, 'Organizer name is required.'),
  organizer_phone: z
    .string({ required_error: 'Organizer contact number is required.' })
    .regex(indianPhoneRegex, 'Organizer contact number must be a valid 10-digit Indian phone number.'),
  registration_start: z.string({ required_error: 'Registration start date is required.' }).min(1, 'Registration start date is required.'),
  registration_deadline: z.string({ required_error: 'Registration deadline is required.' }).min(1, 'Registration deadline is required.'),
  capacity: z.coerce.number({ required_error: 'Maximum participants is required.' }).int().positive('Maximum participants must be greater than 0.'),
  eligibility: z.string({ required_error: 'Eligibility is required.' }).min(2, 'Eligibility is required.'),
  target_department: z.string({ required_error: 'Department / Target audience is required.' }).min(2, 'Department / Target audience is required.'),
  required_skills: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  relevant_interests: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  poster_url: z.string().optional().nullable(),
  external_registration_url: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  prize_info: z.string().optional().nullable(),
  certificate_info: z.string().optional().nullable(),
  status: z.enum(['PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional().default('PUBLISHED'),
  permission_request_id: z.coerce.number().optional().nullable(),
});

export const eventUpdateSchema = eventSchema.partial();

export const permissionRequestSchema = z.object({
  event_title: z.string({ required_error: 'Event name is required.' }).min(3, 'Event name must be at least 3 characters.'),
  event_description: z.string({ required_error: 'Event description is required.' }).min(10, 'Description must be at least 10 characters.'),
  category: z.enum([
    'Technical',
    'Workshop',
    'Hackathon',
    'Career',
    'Placement',
    'Cultural',
    'Sports',
    'Seminar',
    'Other',
  ], {
    errorMap: () => ({ message: 'Please select a valid event category.' }),
  }),
  event_date: z.string({ required_error: 'Event date is required.' }).min(1, 'Event date is required.'),
  start_time: z.string({ required_error: 'Start time is required.' }).min(1, 'Start time is required.'),
  end_time: z.string({ required_error: 'End time is required.' }).min(1, 'End time is required.'),
  location: z.string({ required_error: 'Venue/Location is required.' }).min(2, 'Venue/Location is required.'),
  organizer_name: z.string({ required_error: 'Organizer name is required.' }).min(2, 'Organizer name is required.'),
  organizer_phone: z
    .string({ required_error: 'Organizer contact number is required.' })
    .regex(indianPhoneRegex, 'Organizer contact number must be a valid 10-digit Indian phone number.'),
  registration_start: z.string({ required_error: 'Registration start date is required.' }).min(1, 'Registration start date is required.'),
  registration_deadline: z.string({ required_error: 'Registration deadline is required.' }).min(1, 'Registration deadline is required.'),
  capacity: z.coerce.number({ required_error: 'Maximum participants is required.' }).int().positive('Maximum participants must be greater than 0.'),
  eligibility: z.string({ required_error: 'Eligibility is required.' }).min(2, 'Eligibility is required.'),
  target_department: z.string({ required_error: 'Department / Target audience is required.' }).min(2, 'Department / Target audience is required.'),
  required_skills: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  relevant_interests: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  poster_url: z.string().optional().nullable(),
  external_registration_url: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  prize_info: z.string().optional().nullable(),
  certificate_info: z.string().optional().nullable(),
});

export const reviewPermissionRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED.' }),
  }),
  rejection_reason: z.string().optional().nullable(),
});

export const studentPreferencesSchema = z
  .object({
    skills: z.array(z.string()).optional().default([]),
    interests: z.array(z.string()).optional().default([]),
    // Explicitly define forbidden fields to catch unauthorized tampering
    name: z.undefined({ invalid_type_error: 'Official profile field (Name) is locked and cannot be modified.' }),
    roll_number: z.undefined({ invalid_type_error: 'Official profile field (Roll Number) is locked and cannot be modified.' }),
    department: z.undefined({ invalid_type_error: 'Official profile field (Department) is locked and cannot be modified.' }),
    section: z.undefined({ invalid_type_error: 'Official profile field (Section) is locked and cannot be modified.' }),
    phone_number: z.undefined({ invalid_type_error: 'Official profile field (Phone Number) is locked and cannot be modified.' }),
    email: z.undefined({ invalid_type_error: 'Official profile field (Email) is locked and cannot be modified.' }),
    role: z.undefined({ invalid_type_error: 'Role is immutable.' }),
  })
  .strict();

export const applicationStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled'], {
    errorMap: () => ({ message: 'Status must be Pending, Approved, Rejected, or Cancelled.' }),
  }),
  notes: z.string().optional().nullable(),
});

export const reminderSchema = z.object({
  reminder_type: z.enum(['1_DAY_BEFORE', '1_HOUR_BEFORE'], {
    errorMap: () => ({ message: 'Reminder type must be 1_DAY_BEFORE or 1_HOUR_BEFORE.' }),
  }),
});

/**
 * Generic validator middleware using Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation failed.',
          errors: errorMessages,
        });
        return;
      }
      next(error);
    }
  };
};
