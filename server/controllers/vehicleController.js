import { Vehicle, Booking } from '../models/index.js';
import { checkBookingConflict } from '../utils/conflictChecker.js';

export const getVehicles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      location = '',
      minPrice,
      maxPrice,
      fuelType = '',
      transmission = '',
      sort = 'newest',
    } = req.query;

    const queryFilter = {
      approvalStatus: 'approved',
    };

    if (category) {
      queryFilter.category = category;
    }

    if (fuelType) {
      queryFilter.fuelType = fuelType;
    }

    if (transmission) {
      queryFilter.transmission = transmission;
    }

    let allVehicles = await Vehicle.find(queryFilter);
    let items = allVehicles.items || [];

    // Filter by text search
    if (search) {
      const term = search.toLowerCase().trim();
      items = items.filter(v =>
        (v.title && v.title.toLowerCase().includes(term)) ||
        (v.brand && v.brand.toLowerCase().includes(term)) ||
        (v.model && v.model.toLowerCase().includes(term)) ||
        (v.location && v.location.toLowerCase().includes(term)) ||
        (v.category && v.category.toLowerCase().includes(term))
      );
    }

    // Filter by location
    if (location) {
      const locTerm = location.toLowerCase().trim();
      items = items.filter(v => v.location && v.location.toLowerCase().includes(locTerm));
    }

    // Filter by price range
    if (minPrice) {
      items = items.filter(v => (v.dailyRate || 0) >= Number(minPrice));
    }
    if (maxPrice) {
      items = items.filter(v => (v.dailyRate || 0) <= Number(maxPrice));
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        items.sort((a, b) => (a.dailyRate || 0) - (b.dailyRate || 0));
        break;
      case 'price_desc':
        items.sort((a, b) => (b.dailyRate || 0) - (a.dailyRate || 0));
        break;
      case 'rating':
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    const total = items.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = items.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: paginatedItems,
    });
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate('owner');
    const result = Array.isArray(vehicle?.items) ? vehicle.items[0] : vehicle;

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Both startDateTime and endDateTime are required query parameters.',
      });
    }

    const vehicle = await Vehicle.findById(id);
    const v = Array.isArray(vehicle.items) ? vehicle.items[0] : vehicle;

    if (!v) {
      return res.status(404).json({
        success: false,
        available: false,
        message: 'Vehicle not found.',
      });
    }

    if (v.approvalStatus !== 'approved') {
      return res.json({
        success: true,
        available: false,
        message: 'This vehicle is currently pending administrative review.',
      });
    }

    if (v.availabilityStatus !== 'available') {
      return res.json({
        success: true,
        available: false,
        message: `Vehicle is currently marked as ${v.availabilityStatus}.`,
      });
    }

    const { hasConflict } = await checkBookingConflict(id, startDateTime, endDateTime);

    if (hasConflict) {
      return res.json({
        success: true,
        available: false,
        message: 'Vehicle is already booked for the selected period.',
      });
    }

    res.json({
      success: true,
      available: true,
      message: 'Vehicle is available for the requested schedule!',
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnerVehicles = async (req, res, next) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const vehicles = await Vehicle.find({ owner: ownerId });
    const items = vehicles.items || [];
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

export const createVehicle = async (req, res, next) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const {
      title,
      category,
      brand,
      model,
      registrationNumber,
      manufacturingYear,
      fuelType,
      transmission,
      seatingCapacity,
      color,
      location,
      description,
      features = [],
      images = [],
      hourlyRate,
      dailyRate,
      weeklyRate,
      monthlyRate,
      securityDeposit = 1500,
    } = req.body;

    if (!title || !category || !brand || !model || !registrationNumber || !dailyRate || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: title, category, brand, model, registrationNumber, dailyRate, location.',
      });
    }

    const cleanReg = registrationNumber.toUpperCase().trim();
    const existing = await Vehicle.findOne({ registrationNumber: cleanReg });
    if (existing && (Array.isArray(existing.items) ? existing.items.length > 0 : existing._id)) {
      return res.status(400).json({
        success: false,
        message: `A vehicle with registration number ${cleanReg} is already registered.`,
      });
    }

    const defaultImages = images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ];

    const newVehicle = await Vehicle.create({
      owner: ownerId,
      title: title.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      registrationNumber: cleanReg,
      manufacturingYear: Number(manufacturingYear) || 2024,
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Automatic',
      seatingCapacity: Number(seatingCapacity) || 4,
      color: color || 'Black',
      location: location.trim(),
      description: description || '',
      features: Array.isArray(features) ? features : [],
      images: defaultImages,
      hourlyRate: Number(hourlyRate) || Math.round(Number(dailyRate) / 10),
      dailyRate: Number(dailyRate),
      weeklyRate: Number(weeklyRate) || Math.round(Number(dailyRate) * 6),
      monthlyRate: Number(monthlyRate) || Math.round(Number(dailyRate) * 22),
      securityDeposit: Number(securityDeposit) || 1500,
      approvalStatus: 'pending', // Requires admin review
      availabilityStatus: 'available',
      rating: 5.0,
      numReviews: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle listing created successfully. Submitted for administrator approval.',
      data: newVehicle,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id || req.user.id;

    const existing = await Vehicle.findById(id);
    const item = Array.isArray(existing.items) ? existing.items[0] : existing;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    // Owner authorization rule
    if (String(item.owner) !== String(ownerId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit vehicles that belong to you.',
      });
    }

    const updateData = { ...req.body };
    delete updateData.owner;
    delete updateData.approvalStatus; // only admin can approve

    const updated = await Vehicle.findByIdAndUpdate(id, updateData);

    res.json({
      success: true,
      message: 'Vehicle details updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const existing = await Vehicle.findById(id);
    const item = Array.isArray(existing.items) ? existing.items[0] : existing;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    if (String(item.owner) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete vehicles that belong to you.',
      });
    }

    await Vehicle.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Vehicle listing removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const updateVehicleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;
    const ownerId = req.user._id || req.user.id;

    if (!['available', 'unavailable', 'maintenance'].includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status. Must be available, unavailable, or maintenance.',
      });
    }

    const existing = await Vehicle.findById(id);
    const item = Array.isArray(existing.items) ? existing.items[0] : existing;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }

    if (String(item.owner) !== String(ownerId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the owner or an admin can update status.',
      });
    }

    const updated = await Vehicle.findByIdAndUpdate(id, { availabilityStatus });

    res.json({
      success: true,
      message: `Vehicle availability status updated to ${availabilityStatus}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
