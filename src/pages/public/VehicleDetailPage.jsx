import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { BookingWidget } from '../../components/booking/BookingWidget.jsx';
import {
  Star,
  MapPin,
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  UserCheck,
  Award
} from 'lucide-react';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setLoading(true);
        const [resVeh, resRev] = await Promise.all([
          api.get(`/vehicles/${id}`),
          api.get(`/reviews/vehicle/${id}`),
        ]);
        setVehicle(resVeh.data.data);
        setReviews(resRev.data.data || []);
      } catch (err) {
        console.error('Failed to load vehicle details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Retrieving vehicle specifications..." />;
  }

  if (!vehicle) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested vehicle listing could not be found or has been unlisted.
        </p>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Other Vehicles</span>
        </Link>
      </div>
    );
  }

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [
    '/images/category_premium_cars_1791462718047.jpg'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/vehicles"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Vehicle Fleet</span>
      </Link>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media & Specifications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={vehicle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                {vehicle.category}
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-emerald-600 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Headline Info */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                {vehicle.brand} · {vehicle.model}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{vehicle.rating ? vehicle.rating.toFixed(1) : '5.0'}</span>
                <span className="text-slate-500 font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1 font-display">
              {vehicle.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available in {vehicle.location}</span>
              <span aria-hidden="true">·</span>
              <span>Reg: {vehicle.registrationNumber}</span>
              <span aria-hidden="true">·</span>
              <span>Year: {vehicle.manufacturingYear}</span>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Fuel Type</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-emerald-600" />
                <span>{vehicle.fuelType}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Transmission</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>{vehicle.transmission}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Seating</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{vehicle.seatingCapacity} Passengers</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Exterior Color</span>
              <div className="text-sm font-bold text-slate-900">
                {vehicle.color || 'Standard'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Vehicle Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {vehicle.description || 'This vehicle is thoroughly inspected, sanitized, and maintained according to OEM specifications before every rental handover.'}
            </p>
          </div>

          {/* Features Checklist */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Key Features & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vehicle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host / Owner Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={vehicle.owner?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${vehicle.owner?.name || 'Owner'}`}
                alt={vehicle.owner?.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{vehicle.owner?.name || 'Verified Owner'}</span>
                  <Award className="w-4 h-4 text-emerald-600" title="Verified Host" />
                </div>
                <div className="text-xs text-slate-500">
                  Location: {vehicle.owner?.city || vehicle.location} · Verified Host
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Member since 2026
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Verified Customer Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{vehicle.rating ? vehicle.rating.toFixed(1) : '5.0'} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No customer reviews yet. Rent this vehicle to become the first verified reviewer!
              </p>
            ) : (
              <div className="space-y-4 pt-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {rev.customer?.name || 'Verified Driver'}
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm font-semibold">
                          Verified Rental
                        </span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Contiguous Booking Module */}
        <div className="lg:col-span-1">
          <BookingWidget vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
};
