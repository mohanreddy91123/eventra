-- Eventra Database Schema
-- Campus Event Discovery and Management Platform
-- Tables are created in the active connection database

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'TEACHER', 'EDUCELL') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  section VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  skills JSON NULL,
  interests JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_roll (roll_number),
  INDEX idx_student_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Technical', 'Workshop', 'Hackathon', 'Career', 'Placement', 'Cultural', 'Sports', 'Seminar', 'Other') NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  organizer_name VARCHAR(150) NOT NULL,
  organizer_phone VARCHAR(20) NOT NULL,
  registration_start DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  capacity INT NOT NULL,
  eligibility VARCHAR(255) NOT NULL,
  target_department VARCHAR(255) NOT NULL,
  required_skills JSON NULL,
  relevant_interests JSON NULL,
  poster_url VARCHAR(500) NULL,
  external_registration_url VARCHAR(500) NULL,
  instructions TEXT NULL,
  prize_info VARCHAR(255) NULL,
  certificate_info VARCHAR(255) NULL,
  created_by INT NOT NULL,
  updated_by INT NULL,
  status ENUM('PUBLISHED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'PUBLISHED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_events_category (category),
  INDEX idx_events_date (event_date),
  INDEX idx_events_status (status),
  INDEX idx_events_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Event Permission Requests Table (Edu Cell / SAC must obtain Teacher permission)
CREATE TABLE IF NOT EXISTS event_permission_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requested_by INT NOT NULL,
  event_id INT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT NOT NULL,
  category ENUM('Technical', 'Workshop', 'Hackathon', 'Career', 'Placement', 'Cultural', 'Sports', 'Seminar', 'Other') NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  organizer_name VARCHAR(150) NOT NULL,
  organizer_phone VARCHAR(20) NOT NULL,
  registration_start DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  capacity INT NOT NULL,
  eligibility VARCHAR(255) NOT NULL,
  target_department VARCHAR(255) NOT NULL,
  required_skills JSON NULL,
  relevant_interests JSON NULL,
  poster_url VARCHAR(500) NULL,
  external_registration_url VARCHAR(500) NULL,
  instructions TEXT NULL,
  prize_info VARCHAR(255) NULL,
  certificate_info VARCHAR(255) NULL,
  status ENUM('PENDING_TEACHER_APPROVAL', 'APPROVED', 'REJECTED') DEFAULT 'PENDING_TEACHER_APPROVAL',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_perm_status (status),
  INDEX idx_perm_requested_by (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
  notes TEXT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_event_student (event_id, student_id),
  INDEX idx_apps_student (student_id),
  INDEX idx_apps_event (event_id),
  INDEX idx_apps_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_bookmark_event_student (event_id, student_id),
  INDEX idx_bookmarks_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  student_id INT NOT NULL,
  reminder_type ENUM('1_DAY_BEFORE', '1_HOUR_BEFORE') NOT NULL,
  reminder_time DATETIME NOT NULL,
  status ENUM('PENDING', 'SENT', 'CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reminders_student (student_id),
  INDEX idx_reminders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Event History Table (Audit of event modifications)
CREATE TABLE IF NOT EXISTS event_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  changed_by INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NULL,
  old_value TEXT NULL,
  new_value TEXT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_history_event (event_id),
  INDEX idx_history_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Audit Logs Table (System-wide action audit)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
