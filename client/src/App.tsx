import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { DashboardLayout } from './components/layout/DashboardLayout.js';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { EventDiscoveryPage } from './pages/student/EventDiscoveryPage.js';
import { EventDetailsPage } from './pages/student/EventDetailsPage.js';
import { SavedEventsPage } from './pages/student/SavedEventsPage.js';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage.js';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage.js';
import { StudentRemindersPage } from './pages/student/StudentRemindersPage.js';
import { StudentProfilePage } from './pages/student/StudentProfilePage.js';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.js';
import { TeacherEventsPage } from './pages/teacher/TeacherEventsPage.js';
import { CreateEventPage } from './pages/teacher/CreateEventPage.js';
import { EditEventPage } from './pages/teacher/EditEventPage.js';
import { EventApplicationsPage } from './pages/teacher/EventApplicationsPage.js';
import { TeacherPermissionRequestsPage } from './pages/teacher/TeacherPermissionRequestsPage.js';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage.js';

// Edu Cell / SAC Pages
import { EduCellDashboard } from './pages/educell/EduCellDashboard.js';
import { EduCellRequestsPage } from './pages/educell/EduCellRequestsPage.js';
import { EduCellAllEventsPage } from './pages/educell/EduCellAllEventsPage.js';
import { EduCellApplicationsPage } from './pages/educell/EduCellApplicationsPage.js';
import { EduCellAuditPage } from './pages/educell/EduCellAuditPage.js';
import { EduCellProfilePage } from './pages/educell/EduCellProfilePage.js';

import { Toaster } from 'sonner';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" richColors closeButton />
        <BrowserRouter>
          <Routes>
            {/* 1. Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. STUDENT Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/events" element={<EventDiscoveryPage />} />
                <Route path="/student/events/:id" element={<EventDetailsPage />} />
                <Route path="/student/bookmarks" element={<SavedEventsPage />} />
                <Route path="/student/applications" element={<MyApplicationsPage />} />
                <Route path="/student/notifications" element={<StudentNotificationsPage />} />
                <Route path="/student/reminders" element={<StudentRemindersPage />} />
                <Route path="/student/profile" element={<StudentProfilePage />} />
              </Route>
            </Route>

            {/* 3. TEACHER Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/events" element={<TeacherEventsPage />} />
                <Route path="/teacher/events/create" element={<CreateEventPage />} />
                <Route path="/teacher/events/:id/edit" element={<EditEventPage />} />
                <Route path="/teacher/events/:id/applications" element={<EventApplicationsPage />} />
                <Route path="/teacher/permission-requests" element={<TeacherPermissionRequestsPage />} />
                <Route path="/teacher/profile" element={<TeacherProfilePage />} />
              </Route>
            </Route>

            {/* 4. EDU CELL / SAC Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['EDUCELL']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/educell/dashboard" element={<EduCellDashboard />} />
                <Route path="/educell/requests" element={<EduCellRequestsPage />} />
                <Route path="/educell/events" element={<EduCellAllEventsPage />} />
                <Route path="/educell/events/create" element={<CreateEventPage />} />
                <Route path="/educell/events/:id/edit" element={<EditEventPage />} />
                <Route path="/educell/events/:id/applications" element={<EventApplicationsPage />} />
                <Route path="/educell/applications" element={<EduCellApplicationsPage />} />
                <Route path="/educell/audit" element={<EduCellAuditPage />} />
                <Route path="/educell/profile" element={<EduCellProfilePage />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
