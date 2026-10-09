import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../api/client.js';
import { VehicleCard } from '../../components/vehicles/VehicleCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search state
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/vehicles?limit=6&sort=rating');
        setFeaturedVehicles(res.data.data || []);
      } catch (err) {
        console.error('Failed to load featured vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    navigate(`/vehicles?${params.toString()}`);
  };

  const categories = [
    {
      name: 'Luxury & Cars',
      category: 'Car',
      image: '/src/assets/images/category_premium_cars_1791462718047.jpg',
      count: 'Executive sedans & city cars',
    },
    {
      name: 'All-Terrain SUVs',
      category: 'SUV',
      image: '/src/assets/images/category_suv_adventure_1791462729440.jpg',
      count: 'Rugged 4x4 & 7-seaters',
    },
    {
      name: 'Bikes & Scooters',
      category: 'Bike',
      image: '/src/assets/images/category_urban_motorcycle_1791462741204.jpg',
      count: 'Cruisers, street & EVs',
    },
    {
      name: 'Utility & Vans',
      category: 'Van',
      image: '/src/assets/images/category_van_utility_1791462751657.jpg',
      count: 'Multi-seat shuttles & cargo',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_fleet_showcase_1791462708482.jpg"
            alt="DriveGo Rental Fleet"
            className="w-full h-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Vehicle Rental Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-display">
              Drive on your terms. Any vehicle, anytime.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              Rent cars, SUVs, bikes, scooters, and utility vans directly from verified local owners. Real-time availability conflict detection, transparent pricing, and instant booking.
            </p>

            {/* Quick Search Widget */}
            <form
              onSubmit={handleQuickSearch}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl text-slate-900 border border-white/20 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Location
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent focus:outline-hidden"
                  >
                    <option value="">All Cities</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent focus:outline-hidden"
                  >
                    <option value="">All Categories</option>
                    <option value="Car">Cars & Sedans</option>
                    <option value="SUV">SUVs</option>
                    <option value="Bike">Motorcycles</option>
                    <option value="Scooter">Electric Scooters</option>
                    <option value="Van">Passenger Vans</option>
                    <option value="Truck">Cargo Trucks</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Available Fleet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Browse by Vehicle Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select from city-friendly commuters to all-terrain exploration vehicles.
            </p>
          </div>
          <Link
            to="/vehicles"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Fleet</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              to={`/vehicles?category=${cat.category}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="text-base font-bold leading-tight group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vehicles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Featured Top-Rated Vehicles
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Handpicked customer favourites with 4.8+ verified ratings.
            </p>
          </div>
          <Link
            to="/vehicles?sort=rating"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>See Highest Rated</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving verified listings..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* How DriveGo Works */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl font-black tracking-tight font-display">
            How DriveGo Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Book any vehicle in three frictionless steps with zero security guesswork.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold">Pick & Check Availability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select your exact pickup and return dates. Our real-time calendar prevents double bookings and calculates transparent rental rates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold">Mock Payment & Confirmation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate instant payment via mock Card or UPI. The owner reviews the request and confirms your reservation in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold">Drive & Leave a Verified Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick up keys at the specified landmark, enjoy the journey, return the vehicle, and leave your verified 1-5 star review.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Platform Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Admin-Moderated Fleet</h4>
              <p className="text-xs text-slate-600 mt-1">
                Every vehicle listing must be validated by an administrator before appearing in public searches.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Overlap Prevention</h4>
              <p className="text-xs text-slate-600 mt-1">
                Rigorous server-side mathematical validation guarantees no vehicle can ever be double-booked.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Flexible Rental Plans</h4>
              <p className="text-xs text-slate-600 mt-1">
                Choose Hourly, Daily, Weekly, or Monthly tiers tailored for quick errands or extended vacations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
