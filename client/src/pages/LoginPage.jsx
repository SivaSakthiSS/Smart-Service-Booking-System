import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from '../components/common/BrandLogo.jsx';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function LoginPage({ onNavigateToRegister, onSuccess }) {
  const { login, authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (type) => {
    setLocalError(null);
    clearError();
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin1234!');
    } else if (type === 'provider') {
      setEmail('priya.cleaning@example.com');
      setPassword('Provider1234!');
    } else {
      setEmail('customer@example.com');
      setPassword('Customer1234!');
    }
  };

  const activeError = localError || authError;

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
        {/* Header with Official Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo size="lg" withTagline={false} className="mb-3" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Login to continue to your Smart Service Hub portal
          </p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <strong className="font-semibold block">Authentication Error</strong>
              {activeError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0D47A1] hover:bg-[#0a3882] text-white text-xs font-bold tracking-wide shadow-md shadow-blue-900/15 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-4 w-4 text-[#FF8A00]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Helpers for Reviewers */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            Reviewer Demo Quick-Fill
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2 py-2 text-[11px] font-bold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('provider')}
              className="px-2 py-2 text-[11px] font-bold rounded-lg border border-orange-200 bg-orange-50 text-[#FF8A00] hover:bg-orange-100 transition-colors cursor-pointer text-center"
            >
              Provider
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="px-2 py-2 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-[#0D47A1] hover:bg-blue-100 transition-colors cursor-pointer text-center"
            >
              Customer
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="font-bold text-[#FF8A00] hover:text-[#e67c00] cursor-pointer underline"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
