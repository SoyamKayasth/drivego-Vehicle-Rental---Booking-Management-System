import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Car,
  ArrowLeft,
  Upload,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AddVehiclePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Car',
    brand: '',
    model: '',
    registrationNumber: '',
    manufacturingYear: 2024,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    color: 'Black',
    location: 'Mumbai',
    description: '',
    features: ['Air Conditioning', 'Bluetooth Audio', 'GPS Navigation', 'ABS Brakes'],
    images: ['/src/assets/images/category_premium_cars_1791462718047.jpg'],
    hourlyRate: 300,
    dailyRate: 3000,
    weeklyRate: 18000,
    monthlyRate: 60000,
    securityDeposit: 3000,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const imagePresets = [
    { label: 'Executive Luxury Sedan', url: '/src/assets/images/category_premium_cars_1791462718047.jpg' },
    { label: 'All-Terrain Adventure SUV', url: '/src/assets/images/category_suv_adventure_1791462729440.jpg' },
    { label: 'Street Motorcycle / EV', url: '/src/assets/images/category_urban_motorcycle_1791462741204.jpg' },
    { label: 'Multi-Utility Passenger Van', url: '/src/assets/images/category_van_utility_1791462751657.jpg' },
    { label: 'Modern Fleet Showcase', url: '/src/assets/images/hero_fleet_showcase_1791462708482.jpg' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    if (!formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (feat) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feat),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.brand || !formData.model || !formData.registrationNumber || !formData.dailyRate) {
      setError('Please provide title, brand, model, registration number, and daily rate.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/vehicles', formData);
      showToast('Vehicle listing submitted! Awaiting administrator approval.', 'success');
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create vehicle listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Owner Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            List a New Vehicle for Rent
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the vehicle specifications, photos, and rental tariff. All listings undergo swift admin review.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Vehicle Identity & Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Listing Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. BMW 3 Series Luxury Sedan"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 bg-white"
                >
                  <option value="Car">Car / Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Bike">Bike / Motorcycle</option>
                  <option value="Scooter">Scooter / EV</option>
                  <option value="Van">Van / Multi-Utility</option>
                  <option value="Truck">Truck / Commercial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand / Make
                </label>
                <input
                  type="text"
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. BMW, Toyota, Royal Enfield"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Model Variant
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. 330i M Sport"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registration Number (Unique)
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. MH02EK4021"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 bg-white"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Goa">Goa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Technical Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 bg-white"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transmission
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 bg-white"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seats
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  min="1"
                  max="20"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mfg Year
                </label>
                <input
                  type="number"
                  name="manufacturingYear"
                  min="2010"
                  max="2026"
                  value={formData.manufacturingYear}
                  onChange={handleChange}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Tariffs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              3. Rental Rates (₹)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Rate
                </label>
                <input
                  type="number"
                  name="dailyRate"
                  required
                  value={formData.dailyRate}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Weekly Rate
                </label>
                <input
                  type="number"
                  name="weeklyRate"
                  value={formData.weeklyRate}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Rate
                </label>
                <input
                  type="number"
                  name="monthlyRate"
                  value={formData.monthlyRate}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Security Deposit
                </label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Photos Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              4. Photos & Presets
            </h3>

            <p className="text-xs text-slate-500">
              Select one of our high-resolution curated asset presets for your vehicle:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {imagePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, images: [preset.url] }))}
                  className={`p-2 rounded-xl border text-left space-y-1 transition-all ${
                    formData.images[0] === preset.url
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-full h-16 object-cover rounded-lg" />
                  <div className="text-[10px] font-bold text-slate-800 line-clamp-1">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Highlights
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Highlight condition, cleanliness, delivery rules, or standout features..."
              className="w-full text-xs font-normal p-3 rounded-xl border border-slate-200 focus:outline-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Submitting Listing...' : 'Publish Vehicle Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
