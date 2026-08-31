import api from './api.js';
import { Application } from '../types/index.js';

export const applicationService = {
  async applyToEvent(eventId: number | string): Promise<{ success: boolean; message: string; applicationId: number }> {
    const res = await api.post(`/events/${eventId}/apply`);
    return res.data;
  },

  async getMyApplications(): Promise<{ success: boolean; count: number; applications: Application[] }> {
    const res = await api.get('/applications/my');
    return res.data;
  },

  async getOrganizerApplications(eventId: number | string): Promise<{ success: boolean; count: number; applications: Application[] }> {
    const res = await api.get(`/events/${eventId}/applications`);
    return res.data;
  },

  async getAllApplications(): Promise<{ success: boolean; count: number; applications: Application[] }> {
    const res = await api.get('/applications/all');
    return res.data;
  },

  async updateStatus(
    applicationId: number | string,
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled',
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await api.patch(`/applications/${applicationId}`, { status, notes });
    return res.data;
  },
};
