import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import RequireAuth from '../components/RequireAuth'
import Landing from '../pages/public/Landing'
import NotFound from '../pages/public/NotFound'
import RoleSelection from '../pages/auth/RoleSelection'
import { FreelancerRegister, ClientRegister } from '../pages/auth/Register'
import EmailVerification from '../pages/auth/EmailVerification'
import Login from '../pages/auth/Login'
import PendingApproval from '../pages/auth/PendingApproval'
import { ForgotPassword, ResetPassword } from '../pages/auth/PasswordRecovery'
import FreelancerOnboarding from '../pages/onboarding/FreelancerOnboarding'
import ClientOnboarding from '../pages/onboarding/ClientOnboarding'
import ClientDashboard from '../pages/client/ClientDashboard'
import Dashboard from '../pages/freelancer/Dashboard'
import { Profile, EditProfile } from '../pages/freelancer/Profile'
import Skills from '../pages/freelancer/Skills'
import Portfolio from '../pages/freelancer/Portfolio'
import { BrowseProjects, ProjectDetails, Recommendations } from '../pages/freelancer/Projects'
import { MyProposals, ProposalDetails, SubmitProposal } from '../pages/freelancer/Proposals'
import { ActiveProjects, Workspace, SubmitWork } from '../pages/freelancer/Work'
import Messages from '../pages/freelancer/Messages'
import Notifications from '../pages/freelancer/Notifications'
import Reviews from '../pages/freelancer/Reviews'
import { Earnings, Transactions } from '../pages/freelancer/Money'
import Settings from '../pages/freelancer/Settings'
import Help from '../pages/freelancer/Help'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Auth — narrow layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register/freelancer" element={<FreelancerRegister />} />
        <Route path="/register/client" element={<ClientRegister />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Auth — wide layout (role selection + onboarding) */}
      <Route element={<AuthLayout wide />}>
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/onboarding/freelancer" element={<RequireAuth requireRole="freelancer"><FreelancerOnboarding /></RequireAuth>} />
        <Route path="/onboarding/client" element={<RequireAuth requireRole="client"><ClientOnboarding /></RequireAuth>} />
      </Route>

      {/* Pending approval */}
      <Route path="/pending-approval" element={<RequireAuth><PendingApproval /></RequireAuth>} />

      {/* Freelancer dashboard */}
      <Route path="/freelancer" element={<RequireAuth requireRole="freelancer" requireApproval><DashboardLayout /></RequireAuth>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="skills" element={<Skills />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="projects" element={<BrowseProjects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="projects/:id/apply" element={<SubmitProposal />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="proposals" element={<MyProposals />} />
        <Route path="proposals/:id" element={<ProposalDetails />} />
        <Route path="active" element={<ActiveProjects />} />
        <Route path="active/:id" element={<Workspace />} />
        <Route path="active/:id/submit" element={<SubmitWork />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>

      {/* Client */}
      <Route path="/client" element={<RequireAuth requireRole="client"><Navigate to="/client/dashboard" replace /></RequireAuth>} />
      <Route path="/client/dashboard" element={<RequireAuth requireRole="client"><ClientDashboard /></RequireAuth>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
