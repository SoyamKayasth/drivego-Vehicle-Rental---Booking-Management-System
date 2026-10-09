import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { generateToken } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'customer', address, city, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    // Rule: Public users cannot assign themselves the admin role
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Public registration for Admin accounts is strictly prohibited.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: role === 'owner' ? 'owner' : 'customer',
      address: address || '',
      city: city || '',
      state: state || '',
      isBlocked: false,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(newUser);
    const userSafe = { ...newUser };
    delete userSafe.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DriveGo.',
      data: {
        user: userSafe,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
    }

    const token = generateToken(user);
    const userSafe = { ...user };
    delete userSafe.password;

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userSafe,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }
    const userSafe = { ...user };
    delete userSafe.password;

    res.json({
      success: true,
      data: userSafe,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, address, city, state, profileImage } = req.body;

    const updated = await User.findByIdAndUpdate(userId, {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(profileImage && { profileImage }),
    });

    const userSafe = { ...updated };
    delete userSafe.password;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: userSafe,
    });
  } catch (err) {
    next(err);
  }
};
