import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import api from './services/api.js';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // Health probe state (preserved from Phase 1)
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [latency, setLatency] = useState(null);

  const fetchHealthStatus = useCallback(async () => {
    setHealthLoading(true);
    try {
      const response = await api.getHealth();
      setHealthData(response.data);
      setLatency(response.latencyMs);
      setHealthError(null);
    } catch (err) {
      console.warn('Backend health check returned error:', err.message);
      setHealthError(err);
      setHealthData(null);
      setLatency(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthStatus();
  }, [fetchHealthStatus]);

  const handleScrollToSection = (sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        serverStatus={{
          isOnline: !healthError && !!healthData?.success,
          loading: healthLoading
        }}
        currentView={currentView}
        onNavigate={setCurrentView}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <LandingPage
            healthData={healthData}
            loading={healthLoading}
            error={healthError}
            latency={latency}
            onRefreshHealth={fetchHealthStatus}
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToServices={() => setCurrentView('services')}
          />
        )}

        {currentView === 'services' && (
          <ServicesPage
            onNavigateToLogin={() => setCurrentView('login')}
            onBookingSuccess={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigateToRegister={() => setCurrentView('register')}
            onSuccess={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigateToLogin={() => setCurrentView('login')}
            onSuccess={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <ProtectedRoute onNavigateToLogin={() => setCurrentView('login')}>
            <DashboardPage
              onLogout={() => setCurrentView('home')}
              onExploreServices={() => setCurrentView('services')}
            />
          </ProtectedRoute>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
