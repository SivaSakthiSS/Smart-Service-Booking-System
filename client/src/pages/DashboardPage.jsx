import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ReviewModal from '../components/reviews/ReviewModal.jsx';
import {
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Briefcase,
  Layers,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Terminal,
  RefreshCw,
  Edit,
  Trash2,
  Check,
  X,
  Phone,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const BOOKING_STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-slate-50 text-slate-700 border-slate-200'
};

const SERVICE_CATEGORIES = [
  { key: 'home_cleaning', label: 'Home Cleaning' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'hvac', label: 'HVAC & AC' },
  { key: 'painting', label: 'Painting' },
  { key: 'carpentry', label: 'Carpentry' },
  { key: 'pest_control', label: 'Pest Control' },
  { key: 'gardening', label: 'Gardening' },
  { key: 'other', label: 'Other Service' }
];

export default function DashboardPage({ onLogout, onExploreServices }) {
  const { user, isAdmin, isProvider, isCustomer, logout, refreshUser } = useAuth();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState(
    isAdmin ? 'overview' : isProvider ? 'provider_bookings' : 'my_bookings'
  );

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);

  // Provider: My Services state
  const [myServices, setMyServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    category: 'home_cleaning',
    price: 50,
    pricingType: 'fixed',
    estimatedDurationMinutes: 60,
    description: '',
    tags: '',
    coverImage: ''
  });
  const [serviceActionError, setServiceActionError] = useState(null);

  // Customer: Become a Provider form state
  const [onboardingForm, setOnboardingForm] = useState({
    businessName: '',
    bio: '',
    skills: '',
    experienceYears: 2,
    hourlyRate: 45,
    phoneNumber: user?.phoneNumber || ''
  });
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(false);
  const [onboardError, setOnboardError] = useState(null);

  // Admin state
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // RBAC diagnostic tester state
  const [testResult, setTestResult] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  // Fetch Bookings
  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await api.getMyBookings({
        status: bookingFilter === 'all' ? undefined : bookingFilter
      });
      setBookings(res.data?.data?.bookings || []);
    } catch (err) {
      console.warn('Failed to load bookings:', err.message);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingFilter]);

  // Fetch Provider Services
  const fetchMyServices = useCallback(async () => {
    if (!isProvider && !isAdmin) return;
    setServicesLoading(true);
    try {
      const res = await api.getMyServices();
      setMyServices(res.data?.data?.services || []);
    } catch (err) {
      console.warn('Failed to load provider services:', err.message);
    } finally {
      setServicesLoading(false);
    }
  }, [isProvider, isAdmin]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const [statsRes, usersRes, pendingRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getPendingProviders()
      ]);
      setAdminStats(statsRes.data?.data);
      setAdminUsers(usersRes.data?.data?.users || []);
      setPendingProviders(pendingRes.data?.data?.providers || []);
    } catch (err) {
      console.warn('Failed to load admin data:', err.message);
    } finally {
      setAdminLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchBookings();
    if (isProvider || isAdmin) fetchMyServices();
    if (isAdmin) fetchAdminData();
  }, [fetchBookings, fetchMyServices, fetchAdminData, isProvider, isAdmin]);

  // Booking Status Handler
  const handleUpdateBookingStatus = async (bookingId, status, cancellationReason) => {
    try {
      await api.updateBookingStatus(bookingId, { status, cancellationReason });
      await fetchBookings();
      if (isAdmin) await fetchAdminData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  // Provider Service Creation
  const handleCreateService = async (e) => {
    e.preventDefault();
    setServiceActionError(null);
    try {
      await api.createService({
        ...newService,
        price: Number(newService.price),
        estimatedDurationMinutes: Number(newService.estimatedDurationMinutes),
        tags: newService.tags.split(',').map((t) => t.trim()).filter(Boolean)
      });
      setShowCreateServiceModal(false);
      setNewService({
        title: '',
        category: 'home_cleaning',
        price: 50,
        pricingType: 'fixed',
        estimatedDurationMinutes: 60,
        description: '',
        tags: '',
        coverImage: ''
      });
      await fetchMyServices();
    } catch (err) {
      setServiceActionError(err.message || 'Failed to create service listing.');
    }
  };

  // Provider Service Deletion
  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to permanently delete this service listing?')) return;
    try {
      await api.deleteService(serviceId);
      await fetchMyServices();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // Onboard Provider
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardLoading(true);
    setOnboardError(null);
    try {
      await api.onboardProvider({
        ...onboardingForm,
        skills: onboardingForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
      });
      setOnboardSuccess(true);
      if (refreshUser) await refreshUser();
      setTimeout(() => {
        setActiveTab('provider_bookings');
      }, 1200);
    } catch (err) {
      setOnboardError(err.message || 'Failed to submit provider onboarding profile.');
    } finally {
      setOnboardLoading(false);
    }
  };

  // Admin User Role Update
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      await fetchAdminData();
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  // Admin User Account Status Update
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      await fetchAdminData();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Admin Provider Approval
  const handleApproveProvider = async (providerId) => {
    try {
      await api.approveProvider(providerId);
      await fetchAdminData();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // RBAC Tests
  const handleTestMe = async () => {
    setTestingEndpoint(true);
    setTestResult(null);
    try {
      const startTime = performance.now();
      const res = await api.getMe();
      const latencyMs = Math.round(performance.now() - startTime);
      setTestResult({
        endpoint: 'GET /api/v1/auth/me',
        status: res.status,
        latencyMs,
        success: true,
        data: res.data
      });
    } catch (err) {
      setTestResult({
        endpoint: 'GET /api/v1/auth/me',
        status: err.status || 500,
        success: false,
        error: err.message
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  const handleTestAdmin = async () => {
    setTestingEndpoint(true);
    setTestResult(null);
    try {
      const startTime = performance.now();
      const res = await api.getAdminStats();
      const latencyMs = Math.round(performance.now() - startTime);
      setTestResult({
        endpoint: 'GET /api/v1/admin/dashboard-stats',
        status: res.status,
        latencyMs,
        success: true,
        data: res.data
      });
    } catch (err) {
      setTestResult({
        endpoint: 'GET /api/v1/admin/dashboard-stats',
        status: err.status || 403,
        success: false,
        error: err.message,
        details: err.details
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  const roleStyles = {
    ADMIN: 'bg-purple-50 text-purple-800 border-purple-200',
    CUSTOMER: 'bg-blue-50 text-[#0D47A1] border-blue-200',
    PROVIDER: 'bg-orange-50 text-[#FF8A00] border-orange-200'
  };

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / User Welcome */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold text-xl shadow-xs ring-1 ring-slate-800">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {user?.name}
              </h2>
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${roleStyles[user?.role] || 'bg-slate-100 text-slate-700'}`}
              >
                ROLE: {user?.role}
              </span>
              <StatusBadge status="online" label="Session Active" size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {user?.email} • {user?.phoneNumber || 'No phone set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCustomer && (
            <button
              onClick={() => setActiveTab('onboard_provider')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Become a Provider</span>
            </button>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {/* CUSTOMER TABS */}
        {isCustomer && (
          <>
            <button
              onClick={() => setActiveTab('my_bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'my_bookings'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="h-4 w-4 text-[#FF8A00]" />
              <span>My Bookings ({bookings.length})</span>
            </button>

            <button
              onClick={() => {
                if (onExploreServices) onExploreServices();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-[#0D47A1]" />
              <span>Browse Services</span>
            </button>

            <button
              onClick={() => setActiveTab('onboard_provider')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'onboard_provider'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="h-4 w-4 text-[#FF8A00]" />
              <span>Upgrade to Provider</span>
            </button>
          </>
        )}

        {/* PROVIDER TABS */}
        {isProvider && (
          <>
            <button
              onClick={() => setActiveTab('provider_bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'provider_bookings'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="h-4 w-4 text-[#FF8A00]" />
              <span>Incoming Job Orders ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('provider_services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'provider_services'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-4 w-4 text-[#FF8A00]" />
              <span>My Service Listings ({myServices.length})</span>
            </button>
          </>
        )}

        {/* ADMIN TABS */}
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-[#FF8A00]" />
              <span>Platform Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('admin_users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'admin_users'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4 text-[#FF8A00]" />
              <span>User Accounts ({adminUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('admin_approvals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'admin_approvals'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
              <span>Pending Verifications ({pendingProviders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all_bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'all_bookings'
                  ? 'bg-[#0D47A1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="h-4 w-4 text-[#FF8A00]" />
              <span>Platform Bookings</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('rbac_diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ml-auto ${
            activeTab === 'rbac_diagnostics'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Security & RBAC Inspector</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CUSTOMER VIEW: MY BOOKINGS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                My Service Appointments
              </h3>
              <p className="text-xs text-slate-500">
                Track contractor dispatches, cancel pending bookings, or post verified reviews.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchBookings}
                className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {bookingsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No bookings found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't requested any service appointments yet.
              </p>
              {onExploreServices && (
                <button
                  onClick={onExploreServices}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Browse Marketplace
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {booking.bookingReference}
                        </span>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            BOOKING_STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {booking.service?.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">
                        ${booking.totalAmount}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Date & Time */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{booking.timeSlot}</span>
                    </div>
                  </div>

                  {/* Location & Contractor */}
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {booking.serviceLocation?.street}, {booking.serviceLocation?.city} (
                        {booking.serviceLocation?.postalCode})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Provider:{' '}
                        <strong>
                          {booking.provider?.providerProfile?.businessName || booking.provider?.name}
                        </strong>{' '}
                        ({booking.provider?.phoneNumber || 'Dispatched'})
                      </span>
                    </div>
                  </div>

                  {/* Review feedback if completed and reviewed */}
                  {booking.review && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1 text-amber-800 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>Your Rating: {booking.review.rating} / 5</span>
                      </div>
                      <p className="text-slate-600 italic">"{booking.review.comment}"</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    {/* Cancellation for customer */}
                    {['pending', 'confirmed'].includes(booking.status) ? (
                      <button
                        onClick={() => {
                          const reason = prompt('Please enter cancellation reason:');
                          if (reason !== null) {
                            handleUpdateBookingStatus(booking._id, 'cancelled', reason);
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* Write review if completed and not reviewed */}
                    {booking.status === 'completed' && !booking.review && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Star className="h-3.5 w-3.5 fill-white" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PROVIDER VIEW: INCOMING DISPATCHES & ORDERS                            */}
      {/* ========================================================================= */}
      {activeTab === 'provider_bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Incoming Customer Job Dispatches
              </h3>
              <p className="text-xs text-slate-500">
                Review appointment requests, accept new bookings, and mark completed jobs.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {bookingsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No active job dispatches</h4>
              <p className="text-xs text-slate-500">
                Customers will appear here when they request appointments for your services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {booking.bookingReference}
                        </span>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            BOOKING_STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {booking.service?.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">
                        ${booking.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{booking.customer?.name}</span>
                      <span className="font-normal text-slate-500 font-mono text-[11px]">
                        ({booking.customer?.email})
                      </span>
                    </div>
                    {booking.customer?.phoneNumber && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{booking.customer.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {booking.serviceLocation?.street}, {booking.serviceLocation?.city} (
                        {booking.serviceLocation?.postalCode})
                      </span>
                    </div>
                    {booking.customerNotes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                        Note: "{booking.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Scheduled Time */}
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      {booking.timeSlot}
                    </span>
                  </div>

                  {/* Provider Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Accept & Confirm
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking._id, 'in_progress')}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Start Service (In Progress)
                      </button>
                    )}

                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Complete Service</span>
                      </button>
                    )}

                    {['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Finished ({booking.status})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROVIDER VIEW: MY SERVICE LISTINGS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'provider_services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                My Service Catalog
              </h3>
              <p className="text-xs text-slate-500">
                Manage the trade and home services you offer to marketplace customers.
              </p>
            </div>

            <button
              onClick={() => setShowCreateServiceModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Service</span>
            </button>
          </div>

          {servicesLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your services...</div>
          ) : myServices.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <Layers className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No services listed yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first service listing to start receiving customer job bookings.
              </p>
              <button
                onClick={() => setShowCreateServiceModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Add Service Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {service.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        ${service.price} {service.pricingType === 'hourly' ? '/hr' : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base line-clamp-1">
                      {service.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.estimatedDurationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                        <span>{service.ratingAverage.toFixed(1)} ({service.ratingCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      Active on Marketplace
                    </span>

                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Create Service */}
          {showCreateServiceModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Publish New Service Listing
                  </h3>
                  <button
                    onClick={() => setShowCreateServiceModal(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {serviceActionError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {serviceActionError}
                  </div>
                )}

                <form onSubmit={handleCreateService} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Circuit Breaker Installation"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        {SERVICE_CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pricing Type
                      </label>
                      <select
                        value={newService.pricingType}
                        onChange={(e) => setNewService({ ...newService, pricingType: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        min="5"
                        required
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Est. Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min="15"
                        value={newService.estimatedDurationMinutes}
                        onChange={(e) =>
                          setNewService({ ...newService, estimatedDurationMinutes: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Service Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail what is included, materials provided, warranties..."
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Search Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. electrical, smart home, wiring"
                      value={newService.tags}
                      onChange={(e) => setNewService({ ...newService, tags: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cover Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newService.coverImage}
                      onChange={(e) => setNewService({ ...newService, coverImage: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateServiceModal(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-indigo-600 text-white cursor-pointer shadow-2xs"
                    >
                      Publish Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CUSTOMER VIEW: ONBOARD / UPGRADE TO PROVIDER                           */}
      {/* ========================================================================= */}
      {activeTab === 'onboard_provider' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              Contractor Onboarding
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              Offer Services on Smart Service Hub
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set up your business identity to unlock provider dispatching and catalog creation.
            </p>
          </div>

          {onboardSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                You are now a Verified Provider!
              </h4>
              <p className="text-xs text-slate-600">
                Your account privileges have been elevated to <strong>PROVIDER</strong>. Loading your contractor portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              {onboardError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {onboardError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Trade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Master Plumbing Co."
                  value={onboardingForm.businessName}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, businessName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio & Experience Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Highlight your qualifications, years in the trade, equipment, and background..."
                  value={onboardingForm.bio}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={onboardingForm.experienceYears}
                    onChange={(e) =>
                      setOnboardingForm({ ...onboardingForm, experienceYears: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Hourly Rate ($) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={onboardingForm.hourlyRate}
                    onChange={(e) =>
                      setOnboardingForm({ ...onboardingForm, hourlyRate: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills & Certifications (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Copper Soldering, Leak Detection, Drainage"
                  value={onboardingForm.skills}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, skills: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={onboardingForm.phoneNumber}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, phoneNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={onboardLoading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{onboardLoading ? 'Configuring Profile...' : 'Submit Contractor Application'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN VIEW: PLATFORM OVERVIEW & METRICS                                */}
      {/* ========================================================================= */}
      {isAdmin && activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                System Health & Commercial Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Real-time operational indicators and transaction volume.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${adminLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Users
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {adminStats?.counts?.totalUsers || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {adminStats?.counts?.customers || 0} Customers • {adminStats?.counts?.providers || 0} Providers
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ${adminStats?.counts?.totalRevenue || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                From {adminStats?.counts?.completedBookings || 0} completed bookings
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {adminStats?.counts?.totalBookings || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {adminStats?.counts?.pendingBookings || 0} Pending • {adminStats?.counts?.confirmedBookings || 0} Confirmed
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Services
              </span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {adminStats?.counts?.activeServices || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Across {adminStats?.counts?.totalReviews || 0} verified customer reviews
              </div>
            </div>
          </div>

          {/* Recent Platform Dispatches */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Recent Platform Transactions
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {adminStats?.recentBookings?.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {b.bookingReference}
                      </td>
                      <td className="p-3">{b.service?.title}</td>
                      <td className="p-3">{b.customer?.name}</td>
                      <td className="p-3">{b.provider?.name}</td>
                      <td className="p-3 font-bold">${b.totalAmount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            BOOKING_STATUS_STYLES[b.status] || 'bg-slate-100'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ADMIN VIEW: USER MANAGEMENT                                            */}
      {/* ========================================================================= */}
      {isAdmin && activeTab === 'admin_users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registered Platform Accounts
              </h3>
              <p className="text-xs text-slate-500">
                Audit credentials, modify user roles, or suspend abusive accounts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {adminUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                        className="px-2 py-1 text-[11px] rounded-lg border border-slate-300 font-semibold"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="PROVIDER">PROVIDER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.accountStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateUserStatus(u._id, 'SUSPENDED')}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserStatus(u._id, 'ACTIVE')}
                          className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ADMIN VIEW: PENDING PROVIDER APPROVALS                                  */}
      {/* ========================================================================= */}
      {isAdmin && activeTab === 'admin_approvals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Contractor Verification Queue
            </h3>
            <p className="text-xs text-slate-500">
              Review and approve provider applications before their services become publicly bookable.
            </p>
          </div>

          {pendingProviders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No contractors currently awaiting approval. All active providers verified!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProviders.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {p.providerProfile?.businessName || p.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {p.email} • {p.providerProfile?.experienceYears || 0} Years Exp • ${p.providerProfile?.hourlyRate || 50}/hr
                    </p>
                    <p className="text-xs text-slate-600 italic mt-1">"{p.providerProfile?.bio}"</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveProvider(p._id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ADMIN VIEW: ALL PLATFORM BOOKINGS                                      */}
      {/* ========================================================================= */}
      {isAdmin && activeTab === 'all_bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Global Platform Ledger
              </h3>
              <p className="text-xs text-slate-500">
                All customer orders across all providers.
              </p>
            </div>
            <button
              onClick={fetchBookings}
              className="p-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {b.bookingReference}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      BOOKING_STATUS_STYLES[b.status] || 'bg-slate-100'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{b.service?.title}</h4>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Customer: {b.customer?.name} ({b.customer?.email})</div>
                  <div>Provider: {b.provider?.name}</div>
                  <div>Date: {new Date(b.scheduledDate).toLocaleDateString()} at {b.timeSlot}</div>
                  <div className="font-bold text-slate-900">Amount: ${b.totalAmount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SECURITY & RBAC LIVE TESTER (ALL USERS)                                */}
      {/* ========================================================================= */}
      {activeTab === 'rbac_diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-600" />
                <span>Live Role-Based Access Control (RBAC) Tester</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Test server-side authorization enforcement directly against active Express endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestMe}
                disabled={testingEndpoint}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Test /auth/me (All Auth)
              </button>

              <button
                onClick={handleTestAdmin}
                disabled={testingEndpoint}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-purple-600" />
                <span>Test /admin/dashboard-stats (Admin Only)</span>
              </button>
            </div>
          </div>

          {testResult ? (
            <div
              className={`p-5 rounded-2xl border ${
                testResult.success
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-white ${
                      testResult.status === 200
                        ? 'bg-emerald-600'
                        : testResult.status === 403
                          ? 'bg-rose-600'
                          : 'bg-slate-700'
                    }`}
                  >
                    HTTP {testResult.status}
                  </span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {testResult.endpoint}
                  </span>
                </div>
                {testResult.latencyMs && (
                  <span className="font-mono text-slate-500">
                    Latency: {testResult.latencyMs} ms
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 mb-3 font-medium">
                {testResult.success ? (
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Access Granted: Your role ({user?.role}) has valid authorization.
                  </span>
                ) : (
                  <span className="text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                    Access Blocked by Server Middleware: {testResult.error}
                  </span>
                )}
              </p>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-48">
                {JSON.stringify(testResult.data || testResult, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Click either button above to dispatch a live authenticated request and view server-side RBAC responses in real time.
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
