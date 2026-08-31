import api from './api.js';
import { EventPermissionRequest } from '../types/index.js';

export const permissionRequestService = {
  // Create SAC permission request
  createRequest: async (data: any): Promise<{ success: boolean; message: string; requestId: number }> => {
    const res = await api.post('/permission-requests', data);
    return res.data;
  },

  // Get list of requests
  getRequests: async (status?: string): Promise<{ success: boolean; count: number; requests: EventPermissionRequest[] }> => {
    const res = await api.get('/permission-requests', { params: { status } });
    return res.data;
  },

  // Get single request
  getRequestById: async (id: number | string): Promise<{ success: boolean; request: EventPermissionRequest }> => {
    const res = await api.get(`/permission-requests/${id}`);
    return res.data;
  },

  // Review request (Approve / Reject by Teacher)
  reviewRequest: async (
    id: number | string,
    status: 'APPROVED' | 'REJECTED',
    rejection_reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.patch(`/permission-requests/${id}/review`, {
      status,
      rejection_reason,
    });
    return res.data;
  },

  // Publish approved event (By Edu Cell / SAC)
  publishApprovedEvent: async (id: number | string): Promise<{ success: boolean; message: string; eventId: number }> => {
    const res = await api.post(`/permission-requests/${id}/publish`);
    return res.data;
  },
};
