import api from './api.js';
import { CampusEvent, EventHistory } from '../types/index.js';

export interface EventFilters {
  search?: string;
  category?: string;
  department?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  myEventsOnly?: boolean;
}

export const eventService = {
  async getEvents(filters: EventFilters = {}): Promise<{ success: boolean; count: number; events: CampusEvent[] }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.department && filters.department !== 'ALL') params.append('department', filters.department);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.myEventsOnly) params.append('myEventsOnly', 'true');

    const res = await api.get(`/events?${params.toString()}`);
    return res.data;
  },

  async getRecommendations(): Promise<{ success: boolean; recommendations: CampusEvent[] }> {
    const res = await api.get('/events/recommendations');
    return res.data;
  },

  async getEventById(id: number | string): Promise<{ success: boolean; event: CampusEvent }> {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  async createEvent(eventData: Partial<CampusEvent>): Promise<{ success: boolean; message: string; eventId: number }> {
    const res = await api.post('/events', eventData);
    return res.data;
  },

  async updateEvent(id: number | string, eventData: Partial<CampusEvent>): Promise<{ success: boolean; message: string }> {
    const res = await api.put(`/events/${id}`, eventData);
    return res.data;
  },

  async deleteEvent(id: number | string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  async getEventHistory(id: number | string): Promise<{ success: boolean; count: number; history: EventHistory[] }> {
    const res = await api.get(`/events/${id}/history`);
    return res.data;
  },
};
