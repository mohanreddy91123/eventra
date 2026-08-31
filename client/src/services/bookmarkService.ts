import api from './api.js';
import { CampusEvent } from '../types/index.js';

export const bookmarkService = {
  async toggleBookmark(eventId: number | string): Promise<{ success: boolean; isBookmarked: boolean; message: string }> {
    const res = await api.post(`/events/${eventId}/bookmark`);
    return res.data;
  },

  async getMyBookmarks(): Promise<{ success: boolean; count: number; bookmarks: CampusEvent[] }> {
    const res = await api.get('/bookmarks/my');
    return res.data;
  },
};
