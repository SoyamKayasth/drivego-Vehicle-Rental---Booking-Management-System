import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

// Public Pages
import { HomePage } from './pages/public/HomePage.jsx';
import { VehiclesPage } from './pages/public/VehiclesPage.jsx';
import { VehicleDetailPage } from './pages/public/VehicleDetailPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';
import { AboutPage } from './pages/public/AboutPage.jsx';
import { ContactPage } from './pages/public/ContactPage.jsx';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard.jsx';
import { PaymentSimulationPage } from './pages/customer/PaymentSimulationPage.jsx';

// Owner Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard.jsx';
import { AddVehiclePage } from './pages/owner/AddVehiclePage.jsx';
import { EditVehiclePage } from './pages/owner/EditVehiclePage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:bookingId/payment"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <PaymentSimulationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Routes */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'admin']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/add-vehicle"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'admin']}>
                      <AddVehiclePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/edit-vehicle/:id"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'admin']}>
                      <EditVehiclePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
