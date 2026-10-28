import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Wrench,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Home,
  CheckCircle,
  Terminal,
  Layers,
  Star,
  Paintbrush,
  Car,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import BackendHealthCard from '../components/health/BackendHealthCard.jsx';
import ArchitectureViewer from '../components/architecture/ArchitectureViewer.jsx';
import BrandLogo from '../components/common/BrandLogo.jsx';
import api from '../services/api.js';

export default function LandingPage({
  healthData,
  loading,
  error,
  latency,
  onRefreshHealth,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToServices
}) {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    setLoadingServices(true);
    api
      .getServices({ limit: 4 })
      .then((res) => {
        setFeaturedServices(res.data?.data?.services || []);
      })
      .catch(() => setFeaturedServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  const serviceCategories = [
    {
      title: 'Deep Home Cleaning',
      category: 'home_cleaning',
      icon: Home,
      startingPrice: '$89',
      duration: '3-4 hrs',
      description: 'Comprehensive room sanitization, kitchen degreasing, and floor scrubbing.',
      providersCount: 'Available Now'
    },
    {
      title: 'Master Electrical Repair',
      category: 'electrical',
      icon: Zap,
      startingPrice: '$55',
      duration: '45-90 mins',
      description: 'Circuit breakers, rewiring, fixture installations, and load safety diagnostics.',
      providersCount: 'Available Now'
    },
    {
      title: 'Plumbing & Pipeworks',
      category: 'plumbing',
      icon: Droplets,
      startingPrice: '$65',
      duration: '30-60 mins',
      description: 'High-pressure leak detection, drain unclogging, faucets, and heater installations.',
      providersCount: 'Available Now'
    },
    {
      title: 'HVAC & Air Conditioning',
      category: 'hvac',
      icon: Wind,
      startingPrice: '$75',
      duration: '60-90 mins',
      description: 'Filter cleaning, refrigerant level top-up, duct inspection, and coil jet cleaning.',
      providersCount: 'Available Now'
    },
    {
      title: 'Interior Painting',
      category: 'painting',
      icon: Paintbrush,
      startingPrice: '$160',
      duration: '4-5 hrs',
      description: 'Dustless preparation, accent wall texture, washable low-VOC emulsions.',
      providersCount: 'Available Now'
    },
    {
      title: 'Carpentry & Woodwork',
      category: 'carpentry',
      icon: Hammer,
      startingPrice: '$70',
      duration: '1-2 hrs',
      description: 'Custom furniture assembly, door alignment, lock repair, and cabinetry fabrication.',
      providersCount: 'Available Now'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Official Brand Visuals */}
      <section id="overview" className="pt-10 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8A00] text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
              <span>Book. Track. Manage. Smarter. Easier. Together.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              All Your Services,{' '}
              <span className="text-[#0D47A1] underline decoration-[#FF8A00] decoration-wavy underline-offset-8">
                One Hub.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
              Connect directly with verified local tradespeople, plumbers, electricians, and deep cleaning technicians. Transparent rates, zero booking surprises, and real-time appointment dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateToServices}
                className="px-6 py-3.5 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Get Started — Browse Services</span>
              </button>

              <button
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#0D47A1] text-[#0D47A1] text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Login to Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
                <span>Background-Verified Pros</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <Clock className="h-4 w-4 text-[#0D47A1]" />
                <span>Guaranteed Time Slots</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <Award className="h-4 w-4 text-[#FF8A00]" />
                <span>100% Quality Assurance</span>
              </div>
            </div>
          </div>

          {/* Right Brand Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#0A3882] rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-950/20 overflow-hidden">
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FF8A00]/20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-md">
                  <BrandLogo size="lg" iconOnly={true} />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
                    Quick Service, Better Life
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    Book your service in just a few taps!
                  </h3>
                  <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                    Choose from 10+ trade categories. Instant booking dispatch, live technician status updates, and post-service customer reviews.
                  </p>
                </div>

                {/* Palette chips */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 block">
                    Official Brand Color System
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#0D47A1] border border-white/20 text-[10px] font-mono text-white">
                      #0D47A1 Blue
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#FF8A00] text-[10px] font-mono text-white font-bold">
                      #FF8A00 Orange
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#22C55E] text-[10px] font-mono text-white font-bold">
                      #22C55E Green
                    </span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToServices}
                  className="w-full py-3 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold text-xs tracking-wide shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Explore All Services</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Showcase */}
      {featuredServices.length > 0 && (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] font-mono">
                Live Catalog
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Featured Marketplace Services
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verified background-checked specialists ready for immediate booking.
              </p>
            </div>

            <button
              onClick={onNavigateToServices}
              className="text-xs font-bold text-[#0D47A1] hover:text-[#FF8A00] flex items-center gap-1 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <span>View All Services</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service._id}
                onClick={onNavigateToServices}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#FF8A00] hover:shadow-lg transition-all cursor-pointer p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0D47A1] border border-blue-100">
                      {service.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                      <span>{service.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0D47A1] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Price
                    </span>
                    <div className="text-base font-black text-slate-900">
                      ${service.price}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#FF8A00] group-hover:underline">
                    Book Now →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Backend Diagnostics Section */}
      <section id="health">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] font-mono">
            System Telemetry
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Live Server & Database Connectivity
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ping verification connecting the React client with the Express backend REST endpoint.
          </p>
        </div>

        <BackendHealthCard
          healthData={healthData}
          loading={loading}
          error={error}
          latency={latency}
          onRefresh={onRefreshHealth}
        />
      </section>

      {/* Service Categories Catalog Preview */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] font-mono">
              Marketplace Taxonomy
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Curated Trade Services
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Standardized catalog mapped directly to the Mongoose <code className="font-mono text-slate-800">Service</code> schema enum.
            </p>
          </div>

          <button
            onClick={onNavigateToServices}
            className="text-xs font-bold text-[#0D47A1] hover:text-[#FF8A00] flex items-center gap-1 cursor-pointer self-start sm:self-auto transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={onNavigateToServices}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#0D47A1] transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0D47A1] group-hover:bg-[#0D47A1] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      {item.providersCount}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#0D47A1] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Starting from</span>
                    <p className="font-bold text-[#0D47A1] text-sm">{item.startingPrice}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Est. Time</span>
                    <p className="font-semibold text-slate-700">{item.duration}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Deep Dive */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D47A1] font-mono">
            Full-Stack Specifications
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            System Design & Data Architecture
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Engineered around three distinct user roles, robust data models, and phased development milestones.
          </p>
        </div>

        <ArchitectureViewer />
      </section>

      {/* Monorepo Developer Quick Reference */}
      <section className="bg-slate-900 text-slate-100 rounded-3xl p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-slate-800 rounded-xl text-orange-400 border border-slate-700">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Developer Monorepo Quickstart
            </h3>
            <p className="text-xs text-slate-400">
              Run commands directly from the project root using npm workspaces.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
              Full Test Suite
            </span>
            <code className="text-[#22C55E] font-bold">npm test</code>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Executes all 38 backend integration tests across 4 test suites.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
              Seed Demo Database
            </span>
            <code className="text-[#FF8A00] font-bold">npm run seed</code>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Seeds verified providers, catalog services, bookings & reviews.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
              Run Client & Server
            </span>
            <code className="text-sky-300 font-bold">npm run dev</code>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Spawns backend on :5000 and Vite frontend on :5173 concurrently.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
              Production Build
            </span>
            <code className="text-amber-300 font-bold">npm run build</code>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Compiles and bundles the client with Vite & Tailwind CSS.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
