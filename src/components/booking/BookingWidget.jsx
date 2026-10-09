import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';

export const BookingWidget = ({ vehicle }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Initialize start date tomorrow 10:00 AM, end date in 3 days 10:00 AM
  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const getEndDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [rentalType, setRentalType] = useState('daily');
  const [startDateTime, setStartDateTime] = useState(getTomorrowDefault());
  const [endDateTime, setEndDateTime] = useState(getEndDefault());

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Re-check availability whenever dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!vehicle?._id || !startDateTime || !endDateTime) return;
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      if (end <= start) {
        setAvailabilityResult({
          available: false,
          message: 'Return date & time must be strictly after pickup time.',
        });
        return;
      }

      try {
        setCheckingAvailability(true);
        const res = await api.get(`/vehicles/${vehicle._id}/availability`, {
          params: {
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
          },
        });
        setAvailabilityResult(res.data);
      } catch (err) {
        setAvailabilityResult({
          available: false,
          message: err.message || 'Availability conflict detected.',
        });
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timer = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timer);
  }, [vehicle?._id, startDateTime, endDateTime]);

  // Client-side Price Estimation for immediate visual feedback
  const calculateEstimate = () => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) return { duration: 0, base: 0, deposit: vehicle.securityDeposit || 0, total: 0 };

    const totalHours = diffMs / (1000 * 60 * 60);
    const totalDays = diffMs / (1000 * 60 * 60 * 24);

    let duration = 0;
    let base = 0;

    switch (rentalType) {
      case 'hourly':
        duration = Math.max(1, Math.ceil(totalHours));
        base = duration * (vehicle.hourlyRate || Math.ceil((vehicle.dailyRate || 1000) / 10));
        break;
      case 'daily':
        duration = Math.max(1, Math.ceil(totalHours / 24));
        base = duration * (vehicle.dailyRate || 1000);
        break;
      case 'weekly':
        duration = Math.max(1, Math.ceil(totalDays / 7));
        base = duration * (vehicle.weeklyRate || (vehicle.dailyRate ? vehicle.dailyRate * 6 : 5000));
        break;
      case 'monthly':
        duration = Math.max(1, Math.ceil(totalDays / 30));
        base = duration * (vehicle.monthlyRate || (vehicle.dailyRate ? vehicle.dailyRate * 22 : 18000));
        break;
      default:
        break;
    }

    const deposit = vehicle.securityDeposit || 0;
    return {
      duration,
      base: Math.round(base),
      deposit: Math.round(deposit),
      total: Math.round(base + deposit),
    };
  };

  const estimate = calculateEstimate();

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to complete your booking.', 'info');
      navigate('/login', { state: { from: `/vehicles/${vehicle._id}` } });
      return;
    }

    if (user.role === 'owner' && String(vehicle.owner?._id || vehicle.owner) === String(user._id)) {
      showToast('You cannot book your own vehicle listing.', 'error');
      return;
    }

    if (user.role !== 'customer') {
      showToast(`Logged in as ${user.role}. Only customer accounts can book rentals. Please switch or sign in as customer.`, 'error');
      return;
    }

    if (availabilityResult && !availabilityResult.available) {
      showToast(availabilityResult.message || 'Vehicle is not available for selected dates.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        vehicleId: vehicle._id,
        rentalType,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
      });

      const booking = res.data.data;
      showToast('Booking request initialized! Redirecting to secure mock payment...', 'success');
      navigate(`/bookings/${booking._id}/payment`);
    } catch (err) {
      showToast(err.message || 'Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sticky top-24">
      {/* Rate Header */}
      <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            ₹{vehicle.dailyRate}
          </span>
          <span className="text-sm font-medium text-slate-500"> /day</span>
        </div>
        <div className="text-xs text-slate-500 text-right">
          <div>₹{vehicle.hourlyRate}/hour</div>
          <div>₹{vehicle.weeklyRate}/week</div>
        </div>
      </div>

      {/* Rental Type Segmented Buttons */}
      <div className="mt-5">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Select Rental Plan
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {['hourly', 'daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRentalType(type)}
              className={`py-2 rounded-lg transition-all capitalize ${
                rentalType === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time Selectors */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pickup Date & Time</span>
          </label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-emerald-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Return Date & Time</span>
          </label>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Availability Status Indicator */}
      <div className="mt-4">
        {checkingAvailability ? (
          <div className="text-xs text-slate-500 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
            <span>Checking vehicle reservation calendar...</span>
          </div>
        ) : availabilityResult ? (
          <div
            className={`text-xs flex items-center gap-2 p-2.5 rounded-xl border ${
              availabilityResult.available
                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {availabilityResult.available ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{availabilityResult.message}</span>
          </div>
        ) : null}
      </div>

      {/* Itemized Price Breakdown */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>
            Rental Duration ({estimate.duration} {rentalType === 'hourly' ? 'hours' : rentalType === 'daily' ? 'days' : rentalType === 'weekly' ? 'weeks' : 'months'})
          </span>
          <span className="font-semibold text-slate-800 tabular-nums">₹{estimate.base}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">
            <span>Refundable Security Deposit</span>
            <span title="Returned immediately upon safe vehicle return" className="cursor-help text-slate-400">ℹ</span>
          </span>
          <span className="font-semibold text-slate-800 tabular-nums">₹{estimate.deposit}</span>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
          <span>Total Payable Amount</span>
          <span className="text-base text-emerald-700 tabular-nums">₹{estimate.total}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleBookNow}
        disabled={submitting || (availabilityResult && !availabilityResult.available)}
        className={`w-full mt-5 py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          availabilityResult && !availabilityResult.available
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        <span>{submitting ? 'Creating Booking...' : 'Instant Reserve'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Free cancellation before rental starts · Zero hidden fees</span>
      </div>
    </div>
  );
};
