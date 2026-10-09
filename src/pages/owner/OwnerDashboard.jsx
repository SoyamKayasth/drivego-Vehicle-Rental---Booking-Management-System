import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import {
  Car,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Layers,
  Settings,
  Trash2,
  Edit3,
  Users,
  MapPin,
  CalendarCheck,
  RotateCcw
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resVehicles, resBookings] = await Promise.all([
        api.get('/vehicles/owner/my-listings'),
        api.get('/bookings'),
      ]);
      setVehicles(resVehicles.data.data || []);
      setBookings(resBookings.data.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load owner data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/bookings/${bookingId}/approve`);
      showToast('Booking request accepted and confirmed!', 'success');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to approve booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = window.prompt('Please provide a reason for rejecting this booking:', 'Vehicle undergoing scheduled maintenance.');
    if (reason === null) return;

    try {
      setActionLoading(bookingId);
      await api.patch(`/bookings/${bookingId}/reject`, { reason });
      showToast('Booking request rejected. Simulated refund issued.', 'info');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to reject booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRental = async (bookingId) => {
    if (!window.confirm('Mark this vehicle rental as safely returned and completed?')) return;

    try {
      setActionLoading(bookingId);
      await api.patch(`/bookings/${bookingId}/complete`);
      showToast('Rental marked as completed! Driver can now leave a verified review.', 'success');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to complete rental', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (vehicleId, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    try {
      await api.patch(`/vehicles/${vehicleId}/status`, { availabilityStatus: nextStatus });
      showToast(`Vehicle status changed to ${nextStatus}`, 'success');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update vehicle status', 'error');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle listing? This action cannot be undone.')) return;
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      showToast('Vehicle listing deleted successfully.', 'info');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete vehicle', 'error');
    }
  };

  // Metrics Calculations
  const pendingRequests = bookings.filter((b) => b.bookingStatus === 'pending');
  const activeRentals = bookings.filter((b) => b.bookingStatus === 'active');
  const confirmedRentals = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const completedRentals = bookings.filter((b) => b.bookingStatus === 'completed');

  const totalEarnings = bookings
    .filter((b) => (b.bookingStatus === 'completed' || b.bookingStatus === 'active') && b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.baseAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Owner Header */}
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Vehicle Host / Owner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} · Fleet Base: {user?.city || 'India'}
            </p>
          </div>
        </div>

        <Link
          to="/owner/add-vehicle"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Vehicle Listing</span>
        </Link>
      </div>

      {/* Basic Earnings & Statistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Fleet
          </span>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {vehicles.length}
          </div>
          <div className="text-[11px] text-slate-500">
            {vehicles.filter(v => v.availabilityStatus === 'available').length} Available for rent
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pending Requests
          </span>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Requires approval
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active On-Road
          </span>
          <div className="text-2xl font-black text-sky-600 tabular-nums">
            {activeRentals.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Currently rented
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed Trips
          </span>
          <div className="text-2xl font-black text-purple-600 tabular-nums">
            {completedRentals.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Safely returned
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Gross Earnings
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            ₹{totalEarnings}
          </div>
          <div className="text-[11px] text-emerald-600">
            Base rental payouts
          </div>
        </div>
      </div>

      {/* Tabs: Booking Requests vs My Fleet */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Booking Requests & Lifecycle ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'fleet'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>My Vehicles ({vehicles.length})</span>
        </button>
      </div>

      {/* Content depending on tab */}
      {loading ? (
        <LoadingSpinner text="Retrieving host data..." />
      ) : activeTab === 'bookings' ? (
        /* Booking Requests Table / Cards */
        bookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No booking requests yet"
            description="When customers reserve your vehicles, they will appear here for your review and approval."
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isPending = b.bookingStatus === 'pending';
              const isConfirmed = b.bookingStatus === 'confirmed';
              const isActive = b.bookingStatus === 'active';
              const isCompleted = b.bookingStatus === 'completed';

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={b.vehicle?.images?.[0] || '/src/assets/images/category_premium_cars_1791462718047.jpg'}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{b.vehicle?.title}</h3>
                        <StatusBadge status={b.bookingStatus} type="booking" />
                        <StatusBadge status={b.paymentStatus} type="payment" />
                      </div>
                      <div className="text-xs text-slate-500">
                        Driver: <strong className="text-slate-800">{b.customer?.name}</strong> ({b.customer?.phone || b.customer?.email})
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Schedule: {new Date(b.startDateTime).toLocaleDateString()} → {new Date(b.endDateTime).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="capitalize">{b.rentalType} rental</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Rental Payout</div>
                      <div className="text-base font-extrabold text-slate-900 tabular-nums">
                        ₹{b.baseAmount}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Owner Accept / Reject for Pending Bookings */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveBooking(b._id)}
                            disabled={actionLoading === b._id}
                            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRejectBooking(b._id)}
                            disabled={actionLoading === b._id}
                            className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Active or Confirmed: Mark as Returned/Completed */}
                      {(isActive || isConfirmed) && (
                        <button
                          onClick={() => handleCompleteRental(b._id)}
                          disabled={actionLoading === b._id}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Mark Returned</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* My Fleet Grid */
        vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles in your fleet"
            description="You haven't listed any vehicles yet. List your car, bike, or van to start earning rental income."
            action={
              <Link
                to="/owner/add-vehicle"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                List Your First Vehicle
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-100">
                    <img
                      src={v.images?.[0] || '/src/assets/images/category_premium_cars_1791462718047.jpg'}
                      alt={v.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={v.approvalStatus} type="approval" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={v.availabilityStatus} type="availability" />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-xs font-semibold text-emerald-600 uppercase">
                      {v.brand} · {v.category}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {v.title}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.location}</span>
                      <span>·</span>
                      <span>Reg: {v.registrationNumber}</span>
                    </div>

                    <div className="pt-2 text-xs font-semibold text-slate-800 tabular-nums">
                      ₹{v.dailyRate}/day · ₹{v.hourlyRate}/hr
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(v._id, v.availabilityStatus)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {v.availabilityStatus === 'available' ? 'Mark Maintenance' : 'Set Available'}
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/owner/edit-vehicle/${v._id}`}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteVehicle(v._id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
