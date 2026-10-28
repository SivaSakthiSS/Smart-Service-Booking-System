import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { ApiError } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Session Restoration:
   * Pings GET /api/v1/auth/me on application mount.
   * If an active HTTP-only session cookie exists, the user profile is restored seamlessly.
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      // First fetch CSRF token to establish session cookie & synchronizer token
      await api.getCsrfToken().catch(() => {});

      const res = await api.getMe();
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 is expected when the visitor has no active session
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      } else {
        console.warn('[AuthContext] Session restore note:', err.message);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Authenticate with email and password
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login({ email, password });
      const authenticatedUser = res.data?.data?.user;
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  };

  /**
   * Public Customer Registration
   */
  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.register({ name, email, password });
      const registeredUser = res.data?.data?.user;
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  };

  /**
   * Terminate session on server and reset local auth state
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('[AuthContext] Logout request error:', err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isProvider: user?.role === 'PROVIDER',
    isCustomer: user?.role === 'CUSTOMER',
    loading,
    authError,
    clearError: () => setAuthError(null),
    login,
    register,
    logout,
    refreshUser: restoreSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
