import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import {
  X,
  Star,
  Clock,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  Phone
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

export default function ServiceDetailModal({
  service,
  onClose,
  onBookingSuccess,
  onNavigateToLogin
}) {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'book' | 'reviews'
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Booking Form State
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    if (service?._id) {
      setLoadingReviews(true);
      api
        .getServiceReviews(service._id)
        .then((res) => setReviews(res.data?.data?.reviews || []))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [service?._id]);

  if (!service) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigateToLogin();
      return;
    }

    if (!street || !city || !postalCode) {
      setBookingError('Please provide complete service address details (Street, City, Postal Code).');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await api.createBooking({
        serviceId: service._id,
        scheduledDate,
        timeSlot,
        serviceLocation: {
          street,
          city,
          state,
          postalCode,
          specialInstructions
        },
        customerNotes
      });

      setBookingSuccess(res.data?.data?.booking);
      if (onBookingSuccess) {
        setTimeout(() => {
          onBookingSuccess(res.data?.data?.booking);
        }, 1500);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit service booking appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header with image */}
        <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
          {service.coverImage ? (
            <img
              src={service.coverImage}
              alt={service.title}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-12 w-12" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/90 text-white backdrop-blur-xs uppercase tracking-wider">
                {service.category.replace('_', ' ')}
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5 drop-shadow-xs">
                {service.title}
              </h2>
            </div>

            <div className="text-right bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl shadow-xs">
              <div className="text-xl font-black text-slate-900">
                ${service.price}
                {service.pricingType === 'hourly' && (
                  <span className="text-xs font-normal text-slate-500">/hr</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                <span>~{service.estimatedDurationMinutes} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-6 flex gap-6 text-sm font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-[#0D47A1] text-[#0D47A1] font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Overview & Provider
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'book'
                ? 'border-[#0D47A1] text-[#0D47A1] font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4 text-[#FF8A00]" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#0D47A1] text-[#0D47A1] font-bold'
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Service Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {service.tags && service.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Service Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Information Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center font-bold text-lg">
                      {service.provider?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-base">
                          {service.provider?.providerProfile?.businessName || service.provider?.name}
                        </h4>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-slate-500">
                        Lead Contractor: {service.provider?.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-900 block">
                      {service.provider?.providerProfile?.experienceYears || 3}+ Years Exp.
                    </span>
                    <span className="text-slate-500">Verified Contractor</span>
                  </div>
                </div>

                {service.provider?.providerProfile?.bio && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200 leading-relaxed">
                    "{service.provider.providerProfile.bio}"
                  </p>
                )}

                {service.provider?.providerProfile?.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {service.provider.providerProfile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('book')}
                  className="px-6 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Proceed to Booking</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKING FORM */}
          {activeTab === 'book' && (
            <div>
              {bookingSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Booking Confirmed!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your appointment reference is{' '}
                    <strong className="font-mono text-indigo-600">
                      {bookingSuccess.bookingReference}
                    </strong>
                    . The contractor has been dispatched and will reach out prior to arrival.
                  </p>
                  <p className="text-xs text-slate-400">
                    Redirecting to your active bookings...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  {!isAuthenticated && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                        <span>You need to be signed in to confirm this booking.</span>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="font-bold underline cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}

                  {bookingError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {bookingError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Time Window *
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Service Location Address</span>
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="House / Apartment / Street Name"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Postal Code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Special Entry Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ring flat 302, dog on premises, use service elevator"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Notes for the Technician (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Describe specific symptoms or requests..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Total Payable</span>
                      <span className="text-xl font-black text-slate-900">
                        ${service.price}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-3 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md shadow-orange-500/25"
                    >
                      {bookingLoading ? (
                        <span>Dispatching Request...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                  <span className="text-lg font-bold text-slate-900">
                    {service.ratingAverage > 0 ? service.ratingAverage.toFixed(1) : 'No Ratings Yet'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({reviews.length} verified customer reviews)
                  </span>
                </div>
              </div>

              {loadingReviews ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Loading verified feedback...
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No verified reviews posted yet. Be the first customer to book and review!
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                            {rev.customer?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {rev.customer?.name || 'Verified Customer'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-200 fill-slate-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
