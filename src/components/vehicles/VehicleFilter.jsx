import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export const VehicleFilter = ({ filters, setFilters, onReset }) => {
  const categories = ['All', 'Car', 'SUV', 'Bike', 'Scooter', 'Van', 'Truck', 'Other'];
  const locations = ['All', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'];
  const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const transmissions = ['All', 'Automatic', 'Manual'];

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'All' ? '' : value,
      page: 1, // reset to first page on filter change
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Vehicle Category */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = (!filters.category && cat === 'All') || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          City Location
        </label>
        <select
          value={filters.location || 'All'}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-emerald-500 focus:bg-white"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc === 'All' ? 'All Locations' : loc}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Slider / Inputs */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Max Daily Budget (₹)
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={filters.maxPrice || 10000}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 font-medium tabular-nums">
            <span>₹500</span>
            <span className="font-bold text-slate-900">₹{filters.maxPrice || 10000}/day</span>
            <span>₹10,000+</span>
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Fuel Type
        </label>
        <select
          value={filters.fuelType || 'All'}
          onChange={(e) => handleChange('fuelType', e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-emerald-500 focus:bg-white"
        >
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel === 'All' ? 'Any Fuel' : fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Transmission
        </label>
        <div className="grid grid-cols-2 gap-2">
          {transmissions.filter(t => t !== 'All').map((trans) => {
            const isSelected = filters.transmission === trans;
            return (
              <button
                key={trans}
                type="button"
                onClick={() => handleChange('transmission', isSelected ? '' : trans)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-colors ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {trans}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
