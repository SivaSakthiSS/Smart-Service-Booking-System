import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function ProtectedRoute({
  children,
  allowedRoles,
  onNavigateToLogin
}) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Verifying session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-16 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            This area requires an active session. Please sign in with your verified credentials to continue.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="py-16 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs text-center">
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Access Restricted (403)
          </h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Your current account role (<strong className="font-mono text-slate-900">{user.role}</strong>) does not have sufficient permissions to access this administrative portal.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 text-left mb-6">
            Required Role: {allowedRoles.join(', ')}
          </div>
          <p className="text-xs text-slate-400">
            Enforced server-side via <code className="font-mono">requireRole</code> middleware.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
