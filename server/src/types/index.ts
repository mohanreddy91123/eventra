export type UserRole = 'STUDENT' | 'TEACHER' | 'EDUCELL';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  roll_number: string;
  department: string;
  section: string;
  phone_number: string;
  skills: string[] | string | null;
  interests: string[] | string | null;
  created_at: Date;
  updated_at: Date;
}

export type EventCategory =
  | 'Technical'
  | 'Workshop'
  | 'Hackathon'
  | 'Career'
  | 'Placement'
  | 'Cultural'
  | 'Sports'
  | 'Seminar'
  | 'Other';

export type EventStatus = 'PUBLISHED' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface CampusEvent {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer_name: string;
  organizer_phone: string;
  registration_start: string;
  registration_deadline: string;
  capacity: number;
  eligibility: string;
  target_department: string;
  required_skills: string[] | string | null;
  relevant_interests: string[] | string | null;
  poster_url: string | null;
  external_registration_url: string | null;
  instructions: string | null;
  prize_info: string | null;
  certificate_info: string | null;
  created_by: number;
  updated_by: number | null;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;

  // Joined fields
  creator_name?: string;
  creator_email?: string;
  creator_role?: UserRole;
  updater_name?: string;
  updater_email?: string;
  updater_role?: UserRole;
  applications_count?: number;
  approved_count?: number;
  is_bookmarked?: boolean;
  has_applied?: boolean;
  application_status?: ApplicationStatus;
  match_score?: number;
  match_reasons?: string[];
}

export type PermissionRequestStatus = 'PENDING_TEACHER_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface EventPermissionRequest {
  id: number;
  requested_by: number;
  event_id: number | null;
  event_title: string;
  event_description: string;
  category: EventCategory;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  organizer_name: string;
  organizer_phone: string;
  registration_start: string;
  registration_deadline: string;
  capacity: number;
  eligibility: string;
  target_department: string;
  required_skills: string[] | string | null;
  relevant_interests: string[] | string | null;
  poster_url: string | null;
  external_registration_url: string | null;
  instructions: string | null;
  prize_info: string | null;
  certificate_info: string | null;
  status: PermissionRequestStatus;
  reviewed_by: number | null;
  reviewed_at: Date | string | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;

  // Joined fields
  requested_by_name?: string;
  requested_by_email?: string;
  requested_by_role?: UserRole;
  reviewed_by_name?: string;
  reviewed_by_email?: string;
}

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Application {
  id: number;
  event_id: number;
  student_id: number;
  status: ApplicationStatus;
  notes?: string | null;
  applied_at: Date;
  updated_at: Date;

  // Joined student info
  student_name?: string;
  student_email?: string;
  roll_number?: string;
  department?: string;
  section?: string;
  phone_number?: string;
  skills?: string[];
  interests?: string[];

  // Joined event info
  event_title?: string;
  event_category?: EventCategory;
  event_date?: string;
  event_location?: string;
  organizer_name?: string;
}

export interface Bookmark {
  id: number;
  event_id: number;
  student_id: number;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: Date;
}

export type ReminderType = '1_DAY_BEFORE' | '1_HOUR_BEFORE';
export type ReminderStatus = 'PENDING' | 'SENT' | 'CANCELLED';

export interface Reminder {
  id: number;
  event_id: number;
  student_id: number;
  reminder_type: ReminderType;
  reminder_time: string;
  status: ReminderStatus;
  created_at: Date;
  event_title?: string;
  event_date?: string;
  start_time?: string;
  location?: string;
}

export interface EventHistory {
  id: number;
  event_id: number;
  changed_by: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_at: Date;
  changed_by_name?: string;
  changed_by_email?: string;
  changed_by_role?: UserRole;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: any;
  ip_address: string | null;
  created_at: Date;
  user_name?: string;
  user_email?: string;
  user_role?: UserRole;
}

export interface AuthJWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  name: string;
}
