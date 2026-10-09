import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import {
  Users,
  Car,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Ban,
  Unlock,
  Search,
  IndianRupee,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('vehicles');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [vehicleApprovalFilter, setVehicleApprovalFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resStats, resUsers, resVehicles, resBookings] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params: { role: userRoleFilter, search: userSearch } }),
        api.get('/admin/vehicles', { params: { approvalStatus: vehicleApprovalFilter } }),
        api.get('/bookings', { params: { status: bookingStatusFilter } }),
      ]);
      setStats(resStats.data.data);
      setUsersList(resUsers.data.data || []);
      setVehiclesList(resVehicles.data.data || []);
      setBookingsList(resBookings.data.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter, vehicleApprovalFilter, bookingStatusFilter]);

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  // Admin Actions: Block / Unblock User
  const handleToggleBlockUser = async (targetUser) => {
    const isCurrentlyBlocked = targetUser.isBlocked;
    const endpoint = isCurrentlyBlocked ? `/admin/users/${targetUser._id}/unblock` : `/admin/users/${targetUser._id}/block`;
    const verb = isCurrentlyBlocked ? 'unblock' : 'block';

    if (!window.confirm(`Are you sure you want to ${verb} ${targetUser.name}?`)) return;

    try {
      setActionLoading(targetUser._id);
      await api.patch(endpoint);
      showToast(`User ${targetUser.name} has been ${verb}ed successfully.`, 'info');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message || `Failed to ${verb} user`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Actions: Approve / Reject Vehicle
  const handleApproveVehicle = async (vehicleId) => {
    try {
      setActionLoading(vehicleId);
      await api.patch(`/admin/vehicles/${vehicleId}/approve`);
      showToast('Vehicle approved! It is now live in public search results.', 'success');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to approve vehicle', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVehicle = async (vehicleId) => {
    try {
      setActionLoading(vehicleId);
      await api.patch(`/admin/vehicles/${vehicleId}/reject`);
      showToast('Vehicle listing rejected.', 'info');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to reject vehicle', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Delete this listing permanently from the platform?')) return;
    try {
      setActionLoading(vehicleId);
      await api.delete(`/vehicles/${vehicleId}`);
      showToast('Vehicle listing permanently removed.', 'info');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete vehicle', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Cancel Booking
  const handleAdminCancelBooking = async (bookingId) => {
    const reason = window.prompt('Specify cancellation reason:', 'Administrative moderation intervention.');
    if (reason === null) return;

    try {
      setActionLoading(bookingId);
      await api.patch(`/admin/bookings/${bookingId}/cancel`, { reason });
      showToast('Booking cancelled by administrator.', 'info');
      await fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Panel Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display">System Administration Console</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform governance, vehicle listing approvals, user moderation, and rental oversight.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Basic Dashboard Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {stats.totalUsers}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.totalCustomers} Customers
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Vehicle Hosts
            </span>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {stats.totalOwners}
            </div>
            <div className="text-[10px] text-slate-500">
              Verified Owners
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Vehicles
            </span>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {stats.totalVehicles}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.approvedVehicles} Approved
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="text-xl font-black text-amber-600 tabular-nums">
              {stats.pendingVehicles}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold">
              Action Required
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Rentals
            </span>
            <div className="text-xl font-black text-sky-600 tabular-nums">
              {stats.activeBookings}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.totalBookings} Total trips
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
              Gross Platform GMV
            </span>
            <div className="text-xl font-black text-emerald-700 tabular-nums">
              ₹{stats.totalGrossRevenue}
            </div>
            <div className="text-[10px] text-emerald-600">
              Paid Transactions
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Moderation ({vehiclesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Access Control ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Platform Bookings ({bookingsList.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Querying administrative database records..." />
      ) : activeTab === 'vehicles' ? (
        /* VEHICLES MODERATION TAB */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Filter by Approval Status:
            </span>
            <div className="flex gap-2 text-xs font-semibold">
              {['', 'pending', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setVehicleApprovalFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    vehicleApprovalFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === '' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Vehicle Listing</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Reg No.</th>
                    <th className="p-4">Rates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vehiclesList.map((veh) => (
                    <tr key={veh._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{veh.title}</div>
                        <div className="text-[11px] text-slate-400">{veh.category} · {veh.location}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{veh.owner?.name || 'Owner'}</div>
                        <div className="text-[11px] text-slate-400">{veh.owner?.email}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {veh.registrationNumber}
                      </td>
                      <td className="p-4 font-semibold tabular-nums">
                        ₹{veh.dailyRate}/day
                      </td>
                      <td className="p-4">
                        <StatusBadge status={veh.approvalStatus} type="approval" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {veh.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleApproveVehicle(veh._id)}
                              disabled={actionLoading === veh._id}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {veh.approvalStatus !== 'rejected' && (
                            <button
                              onClick={() => handleRejectVehicle(veh._id)}
                              disabled={actionLoading === veh._id}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVehicle(veh._id)}
                            disabled={actionLoading === veh._id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* USERS MANAGEMENT TAB */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <form onSubmit={handleUserSearchSubmit} className="relative w-full sm:w-72">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name, email..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <div className="flex gap-2 text-xs font-semibold">
              {['', 'customer', 'owner', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    userRoleFilter === role
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role === '' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">
                        {u.phone || '—'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {u.city || 'India'}
                      </td>
                      <td className="p-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <Ban className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlockUser(u)}
                            disabled={actionLoading === u._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock User' : 'Block User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* BOOKINGS MANAGEMENT TAB */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Duration & Schedule</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookingsList.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-500">
                        {b._id.slice(-6)}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.vehicle?.title || 'Vehicle'}</div>
                        <div className="text-[11px] text-slate-400">Host: {b.owner?.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{b.customer?.name}</div>
                        <div className="text-[11px] text-slate-400">{b.customer?.phone}</div>
                      </td>
                      <td className="p-4">
                        <div>{new Date(b.startDateTime).toLocaleDateString()} → {new Date(b.endDateTime).toLocaleDateString()}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{b.rentalType}</div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div><StatusBadge status={b.bookingStatus} type="booking" /></div>
                        <div><StatusBadge status={b.paymentStatus} type="payment" /></div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 tabular-nums">
                        ₹{b.totalAmount}
                      </td>
                      <td className="p-4 text-right">
                        {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed' && (
                          <button
                            onClick={() => handleAdminCancelBooking(b._id)}
                            disabled={actionLoading === b._id}
                            className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
