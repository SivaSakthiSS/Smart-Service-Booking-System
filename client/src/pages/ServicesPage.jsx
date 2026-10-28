import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import ServiceCard from '../components/services/ServiceCard.jsx';
import ServiceDetailModal from '../components/services/ServiceDetailModal.jsx';
import {
  Search,
  SlidersHorizontal,
  Wrench,
  Sparkles,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Hammer,
  Bug,
  Trees,
  Filter,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All Services', icon: Sparkles },
  { key: 'home_cleaning', label: 'Deep Cleaning', icon: Droplets },
  { key: 'plumbing', label: 'Plumbing', icon: Wrench },
  { key: 'electrical', label: 'Electrical', icon: Zap },
  { key: 'hvac', label: 'HVAC & AC', icon: Wind },
  { key: 'painting', label: 'Painting', icon: Paintbrush },
  { key: 'carpentry', label: 'Carpentry', icon: Hammer },
  { key: 'pest_control', label: 'Pest Control', icon: Bug },
  { key: 'gardening', label: 'Gardening', icon: Trees }
];

export default function ServicesPage({ onNavigateToLogin, onBookingSuccess }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getServices({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        sort: sortBy
      });
      setServices(res.data?.data?.services || []);
    } catch (err) {
      setError(err.message || 'Failed to load services catalog.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-[#FF8A00] border border-orange-200 uppercase tracking-wider">
            Verified Contractor Marketplace
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
            On-Demand Trade & Home Services
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Browse background-verified electricians, plumbers, HVAC technicians, and cleaning specialists. Transparent rates with guaranteed appointment dispatch.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services, skills, or tags (e.g. pipe, ac, paint)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D47A1] bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={fetchServices}
              title="Refresh services"
              className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#FF8A00]' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-white border border-slate-200 p-4 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl text-xs text-rose-700 space-y-3">
          <p>{error}</p>
          <button
            onClick={fetchServices}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No matching services found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or selecting a different service category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      )}

      {/* Service Detail & Booking Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onNavigateToLogin={onNavigateToLogin}
          onBookingSuccess={(booking) => {
            setSelectedService(null);
            if (onBookingSuccess) onBookingSuccess(booking);
          }}
        />
      )}
    </div>
  );
}
