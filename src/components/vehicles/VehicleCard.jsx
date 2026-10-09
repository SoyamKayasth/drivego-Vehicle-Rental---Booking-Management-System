import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Fuel, Gauge, Users, ShieldAlert } from 'lucide-react';

export const VehicleCard = ({ vehicle }) => {
  const [imageError, setImageError] = useState(false);

  const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Vehicle Image Container */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={vehicle.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <span className="text-3xl mb-1">🚗</span>
            <span className="text-xs font-medium text-slate-600">{vehicle.title}</span>
          </div>
        )}

        {/* Top Badges: Category & Rating */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase">
            {vehicle.category}
          </span>
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md text-xs font-bold text-slate-800 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{vehicle.rating ? vehicle.rating.toFixed(1) : '5.0'}</span>
            {vehicle.numReviews > 0 && (
              <span className="text-[10px] text-slate-400 font-normal">({vehicle.numReviews})</span>
            )}
          </div>
        </div>

        {/* Location pill on bottom image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-white/90 bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{vehicle.location}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            {vehicle.brand}
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {vehicle.title}
          </h3>

          {/* Clean Unboxed Metadata Specs with Typographic Separator */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 mt-2.5">
            <span className="inline-flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              {vehicle.fuelType}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              {vehicle.transmission}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {vehicle.seatingCapacity} Seats
            </span>
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                ₹{vehicle.dailyRate}
              </span>
              <span className="text-xs text-slate-500 font-medium">/day</span>
            </div>
            {vehicle.hourlyRate && (
              <div className="text-[11px] text-slate-400 tabular-nums">
                or ₹{vehicle.hourlyRate}/hr
              </div>
            )}
          </div>

          <Link
            to={`/vehicles/${vehicle._id}`}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-200"
          >
            Rent Now
          </Link>
        </div>
      </div>
    </div>
  );
};
