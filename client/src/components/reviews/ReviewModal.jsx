import React, { useState } from 'react';
import api from '../../services/api.js';
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setError('Please provide at least 5 characters of feedback.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createReview({
        bookingId: booking._id,
        rating,
        comment: comment.trim()
      });

      if (onSuccess) {
        onSuccess(res.data?.data?.review);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Post-Service Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Service: <strong className="text-slate-700">{booking.service?.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Stars */}
          <div className="text-center py-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Rate your experience
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        isActive
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-700 block">
              {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
              {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
              {rating === 3 && 'Average ⭐⭐⭐'}
              {rating === 2 && 'Needs Improvement ⭐⭐'}
              {rating === 1 && 'Unsatisfactory ⭐'}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feedback Comment *
            </label>
            <textarea
              required
              rows={4}
              placeholder="How was the punctuality, cleanliness, quality of work, and professional conduct?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Minimum 5 characters. Your review helps maintain high community standards.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-indigo-600 text-white cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
