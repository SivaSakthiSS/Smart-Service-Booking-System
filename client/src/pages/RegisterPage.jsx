import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from '../components/common/BrandLogo.jsx';
import {
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RegisterPage({ onNavigateToLogin, onSuccess }) {
  const { register, authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name || name.trim().length < 2) {
      setLocalError('Full name must be at least 2 characters long.');
      return;
    }

    if (!email) {
      setLocalError('Please provide a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
        {/* Header with Official Brand Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" withTagline={false} className="mb-3" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign up to book verified trade services on Smart Service Hub
          </p>
        </div>

        {/* Security notice */}
        <div className="mb-6 p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-[#0D47A1]">
          <ShieldCheck className="h-4 w-4 text-[#0D47A1] shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Customer Sign-Up</strong>
            Standard registration enrolls as a <strong>Customer</strong>. You can upgrade to a Service Provider at any time from your dashboard.
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <strong className="font-semibold block">Registration Error</strong>
              {activeError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Siva Sakthi"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0D47A1] focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

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
                placeholder="At least 8 characters"
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
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white text-xs font-bold tracking-wide shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up as Customer</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-bold text-[#0D47A1] hover:underline cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
