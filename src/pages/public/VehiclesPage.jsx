import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { VehicleCard } from '../../components/vehicles/VehicleCard.jsx';
import { VehicleFilter } from '../../components/vehicles/VehicleFilter.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const VehiclesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 9,
          page: filters.page,
          search: filters.search,
          category: filters.category,
          location: filters.location,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          fuelType: filters.fuelType,
          transmission: filters.transmission,
          sort: filters.sort,
        };

        const res = await api.get('/vehicles', { params });
        setVehicles(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      transmission: '',
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Explore Available Fleet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Found <strong className="text-slate-800 tabular-nums">{total}</strong> verified vehicles ready for booking.
          </p>
        </div>

        {/* Search Bar & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search by model, brand, city..."
              className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-emerald-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <button
            type="button"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <VehicleFilter
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showMobileFilter && (
          <div className="lg:hidden col-span-1">
            <VehicleFilter
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Vehicles Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/90 text-xs">
            <span className="font-semibold text-slate-600">
              Showing {vehicles.length} of {total} listings
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-500"
              >
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Filtering vehicle fleet..." />
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="No matching vehicles found"
              description="Try adjusting your category, price range, or city location filters to find available vehicles."
              action={
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Clear All Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = filters.page === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
