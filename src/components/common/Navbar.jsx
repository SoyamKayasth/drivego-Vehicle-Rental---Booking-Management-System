import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Car,
  KeyRound,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  PlusCircle,
  Calendar,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, switchAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully. See you again!');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleQuickSwitch = async (roleType) => {
    try {
      setIsSwitching(true);
      const switchedUser = await switchAccount(roleType);
      showToast(`Switched to test account: ${switchedUser.name} (${roleType.toUpperCase()})`, 'info');
      if (roleType === 'admin') navigate('/admin/dashboard');
      else if (roleType === 'owner') navigate('/owner/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to switch account', 'error');
    } finally {
      setIsSwitching(false);
      setMobileMenuOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/customer/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-600 transition-colors">
              <Car className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Drive<span className="text-emerald-600">Go</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/vehicles"
              className={`transition-colors hover:text-slate-900 ${
                isActive('/vehicles') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Browse Fleet
            </Link>
            <Link
              to="/about"
              className={`transition-colors hover:text-slate-900 ${
                isActive('/about') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              className={`transition-colors hover:text-slate-900 ${
                isActive('/contact') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Support
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className={`transition-colors hover:text-slate-900 flex items-center gap-1.5 ${
                  location.pathname.includes('/dashboard') ? 'text-emerald-600 font-semibold' : ''
                }`}
              >
                <span>Dashboard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                  {user?.role}
                </span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Quick Demo Role Switcher & Auth Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Academic/Reviewer Quick Account Switcher */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 text-xs text-slate-600">
              <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Demo:
              </span>
              <button
                disabled={isSwitching}
                onClick={() => handleQuickSwitch('customer')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  user?.role === 'customer'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Log in as Test Customer (Aarav Mehta)"
              >
                Customer
              </button>
              <button
                disabled={isSwitching}
                onClick={() => handleQuickSwitch('owner')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  user?.role === 'owner'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Log in as Test Owner (Vikram Sharma)"
              >
                Owner
              </button>
              <button
                disabled={isSwitching}
                onClick={() => handleQuickSwitch('admin')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Log in as System Admin"
              >
                Admin
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <img
                    src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <Link
              to="/vehicles"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Browse Fleet
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              How It Works
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Contact Support
            </Link>
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold"
              >
                Go to Dashboard ({user?.role})
              </Link>
            )}
          </nav>

          {/* Mobile Demo Switcher */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-2">Switch Test Account:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickSwitch('customer')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Customer
              </button>
              <button
                onClick={() => handleQuickSwitch('owner')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Owner
              </button>
              <button
                onClick={() => handleQuickSwitch('admin')}
                className="px-2 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Auth mobile buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
