import api from './api.js';

export interface StudentDashboardData {
  stats: {
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    savedEvents: number;
    upcomingEvents: number;
  };
  recentApplications: any[];
}

export interface TeacherDashboardData {
  stats: {
    myEvents: number;
    upcomingEvents: number;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
  };
  recentApplications: any[];
  recentEvents: any[];
}

export interface EduCellDashboardData {
  stats: {
    totalEvents: number;
    teacherEvents: number;
    educellEvents: number;
    upcomingEvents: number;
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
  };
  recentApplications: any[];
  recentAudits: any[];
}

export const dashboardService = {
  async getStats(): Promise<any> {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
