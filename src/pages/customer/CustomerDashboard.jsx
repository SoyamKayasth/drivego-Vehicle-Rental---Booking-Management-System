import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ReviewModal } from '../../components/booking/ReviewModal.jsx';
import {
  Calendar,
  Clock,
  Car,
  Star,
  XCircle,
  PlayCircle,
  CreditCard,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Any mock payment will be marked as refunded.')) {
      return;
    }
    try {
      setActionLoading(bookingId);
      await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer from dashboard',
      });
      showToast('Booking cancelled successfully. Simulated refund applied.', 'info');
      await fetchBookings();
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartRental = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/bookings/${bookingId}/start`);
      showToast('Rental activated! Enjoy your drive.', 'success');
      await fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to start rental', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return b.bookingStatus === 'active';
    if (activeTab === 'upcoming') return b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending';
    if (activeTab === 'completed') return b.bookingStatus === 'completed';
    if (activeTab === 'cancelled') return b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected';
    return true;
  });

  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => b.bookingStatus === 'active').length,
    upcoming: bookings.filter((b) => b.bookingStatus === 'confirmed' || b.bookingStatus === 'pending').length,
    completed: bookings.filter((b) => b.bookingStatus === 'completed').length,
    cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Customer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} · {user?.phone || 'No phone set'} · {user?.city || 'India'}
            </p>
          </div>
        </div>

        <Link
          to="/vehicles"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
        >
          Book Another Vehicle
        </Link>
      </div>

      {/* Booking Statistics / Filter Segment Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { key: 'all', label: 'All Bookings', count: counts.all },
          { key: 'active', label: 'Active Rentals', count: counts.active },
          { key: 'upcoming', label: 'Upcoming & Pending', count: counts.upcoming },
          { key: 'completed', label: 'Completed', count: counts.completed },
          { key: 'cancelled', label: 'Cancelled / Rejected', count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] tabular-nums font-bold ${
                activeTab === tab.key ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Retrieving customer bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Car}
          title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
          description="You do not have any rentals under this status category."
          action={
            <Link
              to="/vehicles"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Explore Vehicles
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'confirmed';
            const isPending = b.bookingStatus === 'pending';
            const isActive = b.bookingStatus === 'active';
            const isCompleted = b.bookingStatus === 'completed';
            const isPaid = b.paymentStatus === 'paid';
            const isCancelled = b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected';

            const canCancel = isPending || (isConfirmed && new Date(b.startDateTime).getTime() > Date.now());

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Vehicle Thumbnail and Specs */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={b.vehicle?.images?.[0] || '/src/assets/images/category_premium_cars_1791462718047.jpg'}
                      alt={b.vehicle?.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{b.vehicle?.title}</h3>
                      <StatusBadge status={b.bookingStatus} type="booking" />
                      <StatusBadge status={b.paymentStatus} type="payment" />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Pickup: {new Date(b.startDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>Return: {new Date(b.endDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{b.vehicle?.location}</span>
                      <span>·</span>
                      <span>Host: {b.owner?.name || 'Verified Owner'}</span>
                    </div>
                  </div>
                </div>

                {/* Amount and Action Buttons */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Total Charge</div>
                    <div className="text-base font-extrabold text-slate-900 tabular-nums">
                      ₹{b.totalAmount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pay now if pending payment */}
                    {!isPaid && !isCancelled && (
                      <Link
                        to={`/bookings/${b._id}/payment`}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs"
                      >
                        Complete Payment
                      </Link>
                    )}

                    {/* Start rental if confirmed */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleStartRental(b._id)}
                        disabled={actionLoading === b._id}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Rental</span>
                      </button>
                    )}

                    {/* Review if completed */}
                    {isCompleted && (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Write Review</span>
                      </button>
                    )}

                    {/* Cancel booking if eligible */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={actionLoading === b._id}
                        className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          isOpen={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          booking={selectedBookingForReview}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};
