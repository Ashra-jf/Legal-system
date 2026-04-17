import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ClientDashboard from './pages/ClientDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { authService } from './api/authService';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Wrapper components that use navigation hooks
function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onNavigate={(page, param) => navigate(param ? `/${page}/${param}` : `/${page}`)} />;
}

function ServiceDetailsPageWrapper() {
  const navigate = useNavigate();
  const serviceSlug = window.location.pathname.split('/')[2] || 'legal-consultation';
  return <ServiceDetailsPage service={serviceSlug} onNavigate={(page) => navigate(`/${page}`)} />;
}

function LoginPageWrapper() {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // Redirect based on role
    if (user.role === 'client') {
      navigate('/client-dashboard');
    } else if (user.role === 'lawyer') {
      navigate('/lawyer-dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin-dashboard');
    }
  };

  return <LoginPage onNavigate={(page) => navigate(`/${page}`)} onLogin={handleLogin} />;
}

function RegistrationPageWrapper() {
  const navigate = useNavigate();
  return <RegistrationPage onNavigate={(page) => navigate(`/${page}`)} />;
}

function ClientDashboardWrapper() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return <ClientDashboard user={user} onLogout={handleLogout} onNavigate={(page) => navigate(`/${page}`)} />;
}

function LawyerDashboardWrapper() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return <LawyerDashboard user={user} onLogout={handleLogout} onNavigate={(page) => navigate(`/${page}`)} />;
}

function AdminDashboardWrapper() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return <AdminDashboard user={user} onLogout={handleLogout} onNavigate={(page) => navigate(`/${page}`)} />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPageWrapper />} />
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route path="/register" element={<RegistrationPageWrapper />} />
          <Route path="/service-details/:slug" element={<ServiceDetailsPageWrapper />} />

          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboardWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lawyer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerDashboardWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;