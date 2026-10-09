import { User, Vehicle, Booking } from '../models/index.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const allUsers = (await User.find()).items || [];
    const allVehicles = (await Vehicle.find()).items || [];
    const allBookings = (await Booking.find()).items || [];

    const totalUsers = allUsers.length;
    const totalOwners = allUsers.filter(u => u.role === 'owner').length;
    const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
    const totalVehicles = allVehicles.length;
    const pendingVehicles = allVehicles.filter(v => v.approvalStatus === 'pending').length;
    const approvedVehicles = allVehicles.filter(v => v.approvalStatus === 'approved').length;

    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter(b => b.bookingStatus === 'active').length;
    const pendingBookings = allBookings.filter(b => b.bookingStatus === 'pending').length;
    const completedBookings = allBookings.filter(b => b.bookingStatus === 'completed').length;

    const totalGrossRevenue = allBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalCustomers,
        totalVehicles,
        pendingVehicles,
        approvedVehicles,
        totalBookings,
        activeBookings,
        pendingBookings,
        completedBookings,
        totalGrossRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role) filter.role = role;

    const users = (await User.find(filter)).items || [];
    let safeUsers = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    if (search) {
      const term = search.toLowerCase();
      safeUsers = safeUsers.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
      );
    }

    safeUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: safeUsers.length,
      data: safeUsers,
    });
  } catch (err) {
    next(err);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    const user = Array.isArray(target.items) ? target.items[0] : target;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot block an administrator.' });
    }

    const updated = await User.findByIdAndUpdate(id, { isBlocked: true });
    const safeUser = { ...updated };
    delete safeUser.password;

    res.json({
      success: true,
      message: `User ${user.name} has been suspended/blocked.`,
      data: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    const user = Array.isArray(target.items) ? target.items[0] : target;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await User.findByIdAndUpdate(id, { isBlocked: false });
    const safeUser = { ...updated };
    delete safeUser.password;

    res.json({
      success: true,
      message: `User ${user.name} has been unblocked.`,
      data: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminVehicles = async (req, res, next) => {
  try {
    const { category, approvalStatus, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const vehicles = await Vehicle.find(filter).populate('owner');
    let items = Array.isArray(vehicles) ? [...vehicles] : vehicles?.items ? [...vehicles.items] : [];

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.brand.toLowerCase().includes(term) ||
        v.registrationNumber.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term)
      );
    }

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

export const approveVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Vehicle.findByIdAndUpdate(id, { approvalStatus: 'approved' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({
      success: true,
      message: 'Vehicle listing approved! It is now live in search results.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Vehicle.findByIdAndUpdate(id, { approvalStatus: 'rejected' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({
      success: true,
      message: 'Vehicle listing rejected.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const adminCancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by system administrator' } = req.body;

    const b = await Booking.findById(id);
    const booking = Array.isArray(b.items) ? b.items[0] : b;

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const updated = await Booking.findByIdAndUpdate(id, {
      bookingStatus: 'cancelled',
      cancellationReason: reason,
      paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus,
    });

    res.json({
      success: true,
      message: 'Booking cancelled by administrator.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
