import pool from '../config/database.js';

export class AuditService {
  /**
   * Records a system-level audit log entry
   */
  static async logAudit(
    userId: number | null,
    action: string,
    entityType: string,
    entityId: number | null = null,
    details: any = null,
    ipAddress: string | null = null
  ): Promise<void> {
    try {
      const detailsJson = details ? JSON.stringify(details) : null;
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, detailsJson, ipAddress]
      );
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Non-blocking error
    }
  }

  /**
   * Alias for logAudit
   */
  static async logAction(
    userId: number | null,
    action: string,
    entityType: string,
    entityId: number | null = null,
    details: any = null,
    ipAddress: string | null = null
  ): Promise<void> {
    return this.logAudit(userId, action, entityType, entityId, details, ipAddress);
  }

  /**
   * Records an event history entry for creation, deletion, or individual field updates
   */
  static async logHistory(
    eventId: number,
    changedBy: number,
    action: string,
    fieldName: string | null = null,
    oldValue: string | null = null,
    newValue: string | null = null
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO event_history (event_id, changed_by, action, field_name, old_value, new_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [eventId, changedBy, action, fieldName, oldValue, newValue]
      );
    } catch (error) {
      console.error('Failed to write event history:', error);
    }
  }

  /**
   * Helper to record initial event creation
   */
  static async recordEventCreation(
    eventId: number,
    changedBy: number,
    description: string
  ): Promise<void> {
    return this.logHistory(eventId, changedBy, 'CREATED', 'Event Creation', null, description);
  }

  /**
   * Compares the old event against incoming changes and records granular diff entries
   */
  static async recordEventDiff(
    eventId: number,
    changedBy: number,
    oldEvent: Record<string, any>,
    updates: Record<string, any>
  ): Promise<void> {
    const trackedFields: { key: string; label: string }[] = [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'event_date', label: 'Event Date' },
      { key: 'start_time', label: 'Start Time' },
      { key: 'end_time', label: 'End Time' },
      { key: 'location', label: 'Venue / Location' },
      { key: 'organizer_name', label: 'Organizer Name' },
      { key: 'organizer_phone', label: 'Organizer Phone' },
      { key: 'registration_start', label: 'Registration Start' },
      { key: 'registration_deadline', label: 'Registration Deadline' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'eligibility', label: 'Eligibility' },
      { key: 'target_department', label: 'Target Department' },
      { key: 'required_skills', label: 'Required Skills' },
      { key: 'relevant_interests', label: 'Relevant Interests' },
      { key: 'poster_url', label: 'Poster URL' },
      { key: 'external_registration_url', label: 'External Registration URL' },
      { key: 'instructions', label: 'Instructions' },
      { key: 'prize_info', label: 'Prize Information' },
      { key: 'certificate_info', label: 'Certificate Information' },
      { key: 'status', label: 'Event Status' },
    ];

    for (const { key, label } of trackedFields) {
      if (key in updates) {
        let oldVal = oldEvent[key];
        let newVal = updates[key];

        // Stringify arrays/objects if needed
        if (typeof oldVal === 'object' && oldVal !== null) {
          oldVal = JSON.stringify(oldVal);
        }
        if (typeof newVal === 'object' && newVal !== null) {
          newVal = JSON.stringify(newVal);
        }

        // Standardize undefined/null/empty
        const oldStr = oldVal !== undefined && oldVal !== null ? String(oldVal).trim() : '';
        const newStr = newVal !== undefined && newVal !== null ? String(newVal).trim() : '';

        if (oldStr !== newStr) {
          await this.logHistory(
            eventId,
            changedBy,
            'UPDATED',
            label,
            oldStr || '(None)',
            newStr || '(None)'
          );
        }
      }
    }
  }
}
