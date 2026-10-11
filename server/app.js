import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
// import { seedDatabase } from './seed/seedData.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize DB and Seed
await connectDB();
// await seedDatabase();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'DriveGo Vehicle Rental API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Seed reset endpoint for demo testing convenience
app.post('/api/dev/reset-seed', async (req, res) => {
  try {
    const { dbStore } = await import('./config/db.js');
    dbStore.state.users = [];
    dbStore.state.vehicles = [];
    dbStore.state.bookings = [];
    dbStore.state.payments = [];
    dbStore.state.reviews = [];
    dbStore.save();
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling (for API routes)
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

export default app;
