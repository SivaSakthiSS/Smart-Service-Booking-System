import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import BrandLogo from '../common/BrandLogo.jsx';
import {
  Activity,
  LogOut,
  LayoutDashboard,
  UserPlus,
  LogIn,
  ShoppingBag
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

export default function Navbar({
  serverStatus,
  currentView,
  onNavigate,
  onScrollToSection
}) {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  const roleStyles = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    CUSTOMER: 'bg-blue-100 text-[#0D47A1] border-blue-200',
    PROVIDER: 'bg-orange-100 text-[#FF8A00] border-orange-200'
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Identity with Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer select-none transition-transform hover:scale-[1.01]"
          >
            <BrandLogo size="md" withTagline={true} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('services')}
              className={`inline-flex items-center gap-1.5 py-1 transition-colors cursor-pointer ${
                currentView === 'services'
                  ? 'text-[#0D47A1] font-bold border-b-2 border-[#0D47A1]'
                  : 'hover:text-[#0D47A1]'
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-[#FF8A00]" />
              <span>Browse Services</span>
            </button>

            {currentView === 'home' && (
              <>
                <button
                  onClick={() => onScrollToSection('overview')}
                  className="hover:text-[#0D47A1] transition-colors cursor-pointer"
                >
                  Overview
                </button>
                <button
                  onClick={() => onScrollToSection('roles')}
                  className="hover:text-[#0D47A1] transition-colors cursor-pointer"
                >
                  Roles & RBAC
                </button>
                <button
                  onClick={() => onScrollToSection('models')}
                  className="hover:text-[#0D47A1] transition-colors cursor-pointer"
                >
                  Data Models
                </button>
                <button
                  onClick={() => onScrollToSection('health')}
                  className="hover:text-[#0D47A1] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5 text-[#0D47A1]" />
                  <span>Diagnostics</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Home Switcher when on subpages */}
            {currentView !== 'home' && (
              <button
                onClick={() => onNavigate('home')}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-[#0D47A1] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Home
              </button>
            )}

            {/* Authenticated State vs Visitor Controls */}
            {authLoading ? (
              <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs ${
                    currentView === 'dashboard'
                      ? 'bg-[#0D47A1] text-white shadow-[#0D47A1]/20'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#FF8A00]" />
                  <span>Dashboard</span>
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      roleStyles[user?.role] || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user?.role}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Sign out of current session"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    currentView === 'login'
                      ? 'bg-[#0D47A1] text-white border-[#0D47A1]'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onNavigate('register')}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
