import api from './api.js';
import { Reminder, ReminderType } from '../types/index.js';

export const reminderService = {
  async createReminder(
    eventId: number | string,
    reminder_type: ReminderType
  ): Promise<{ success: boolean; message: string; reminderId: number }> {
    const res = await api.post(`/events/${eventId}/reminder`, { reminder_type });
    return res.data;
  },

  async getMyReminders(): Promise<{ success: boolean; count: number; reminders: Reminder[] }> {
    const res = await api.get('/reminders/my');
    return res.data;
  },

  async deleteReminder(id: number | string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/reminders/${id}`);
    return res.data;
  },
};
