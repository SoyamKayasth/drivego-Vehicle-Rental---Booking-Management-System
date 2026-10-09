import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Send, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';

export const ReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please share a few words about your rental experience.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment: comment.trim(),
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast('Thank you! Your verified rating & review have been posted.', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Your Completed Rental">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="text-xs text-slate-500 mb-1">Vehicle</div>
          <div className="text-sm font-bold text-slate-900">
            {booking?.vehicle?.title || 'Rental Vehicle'}
          </div>
        </div>

        {/* 5-Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Your Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-300 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-slate-700">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Detailed Feedback
          </label>
          <textarea
            rows="4"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the vehicle condition, fuel efficiency, cleanliness, and owner communication?"
            className="w-full text-xs font-normal p-3 rounded-xl border border-slate-200 focus:outline-emerald-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Post Verified Review'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
