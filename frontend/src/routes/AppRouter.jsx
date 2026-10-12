import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages (placeholder components for now)
import Login from '../pages/auth/Login';
import FreelancerRegister from '../pages/auth/FreelancerRegister';
import EmailVerification from '../pages/auth/EmailVerification';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Freelancer Pages (placeholder components for now)
import Dashboard from '../pages/freelancer/Dashboard';
import Profile from '../pages/freelancer/Profile';
import Settings from '../pages/freelancer/Settings';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/freelancer/dashboard" replace />} />
        
        {/* Auth Routes - No Sidebar Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/freelancer/register" element={<FreelancerRegister />} />
        <Route path="/freelancer/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Freelancer Dashboard Routes - With Sidebar Layout */}
        <Route path="/freelancer/*" element={<FreelancerRoutes />} />
        
        {/* Future Client Module */}
        <Route path="/client/*" element={<div>Client Module - Coming Soon</div>} />
        
        {/* Future Admin Module */}
        <Route path="/admin/*" element={<div>Admin Module - Coming Soon</div>} />
        
        {/* 404 Page */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

// Freelancer module routes with dashboard layout
const FreelancerRoutes = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<div>Edit Profile - Coming Soon</div>} />
        <Route path="skills" element={<div>Skills Management - Coming Soon</div>} />
        <Route path="portfolio" element={<div>Portfolio - Coming Soon</div>} />
        
        <Route path="projects" element={<div>Available Projects - Coming Soon</div>} />
        <Route path="recommendations" element={<div>AI Recommendations - Coming Soon</div>} />
        <Route path="projects/:projectId" element={<div>Project Details - Coming Soon</div>} />
        <Route path="proposals/new" element={<div>Create Proposal - Coming Soon</div>} />
        <Route path="proposals" element={<div>My Proposals - Coming Soon</div>} />
        
        <Route path="my-projects" element={<div>My Active Projects - Coming Soon</div>} />
        <Route path="workspace/:projectId" element={<div>Project Workspace - Coming Soon</div>} />
        <Route path="workspace/:projectId/milestones" element={<div>Milestones - Coming Soon</div>} />
        <Route path="workspace/:projectId/submit" element={<div>Submit Work - Coming Soon</div>} />
        <Route path="submissions" element={<div>Submission History - Coming Soon</div>} />
        
        <Route path="messages" element={<div>Messages - Coming Soon</div>} />
        <Route path="notifications" element={<div>Notifications - Coming Soon</div>} />
        
        <Route path="reviews" element={<div>Reviews & Ratings - Coming Soon</div>} />
        <Route path="earnings" element={<div>Earnings Overview - Coming Soon</div>} />
        <Route path="transactions" element={<div>Transaction History - Coming Soon</div>} />
        
        <Route path="ai-tools" element={<div>AI Tools Dashboard - Coming Soon</div>} />
        <Route path="ai-tools/proposal-assistant" element={<div>Proposal Assistant - Coming Soon</div>} />
        
        <Route path="settings" element={<Settings />} />
        <Route path="settings/security" element={<div>Security Settings - Coming Soon</div>} />
        <Route path="support" element={<div>Support Center - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default AppRouter;