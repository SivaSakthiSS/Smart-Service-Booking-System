import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Shield,
  Database,
  Code2,
  CalendarCheck,
  Star,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function ArchitectureViewer() {
  const [activeTab, setActiveTab] = useState('roles');

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      icon: Users,
      badge: 'Role: customer',
      accent: 'border-blue-200 bg-blue-50/50 text-blue-700',
      description: 'End-users discovering verified local service professionals.',
      features: [
        'Search & filter services by category, price, and distance',
        'Book instant appointments or request custom quotes',
        'Real-time status tracking (Pending → Confirmed → In-Progress → Completed)',
        'Leave verified reviews and ratings after service delivery'
      ]
    },
    {
      id: 'provider',
      title: 'Service Provider',
      icon: Briefcase,
      badge: 'Role: provider',
      accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
      description: 'Certified professionals offering skilled services and managing bookings.',
      features: [
        'Profile & business verification with credentials',
        'Create, publish, and price service offerings (Fixed/Hourly)',
        'Accept, reject, and reschedule booking appointments',
        'Earnings analytics and customer review management'
      ]
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      icon: Shield,
      badge: 'Role: admin',
      accent: 'border-purple-200 bg-purple-50/50 text-purple-700',
      description: 'Superusers maintaining marketplace integrity and operations.',
      features: [
        'Provider credential verification & onboarding approval',
        'Service catalog category & pricing moderation',
        'Dispute resolution and booking cancellations/refunds',
        'Platform-wide transaction telemetry and compliance audits'
      ]
    }
  ];

  const models = [
    {
      name: 'User',
      purpose: 'Unified identity for Customer, Provider, and Admin roles',
      fields: [
        'name: String (required)',
        'email: String (unique, indexed)',
        'password: String (hashed, select: false)',
        'role: "customer" | "provider" | "admin"',
        'address: { street, city, state, postalCode }',
        'providerProfile: { businessName, bio, skills, hourlyRate, isApproved }',
        'isActive: Boolean, isEmailVerified: Boolean'
      ]
    },
    {
      name: 'Service',
      purpose: 'Catalog items created and managed by approved providers',
      fields: [
        'title: String (indexed for search)',
        'category: "home_cleaning" | "plumbing" | "electrical" | ...',
        'provider: ObjectId ref User (required)',
        'price: Number, pricingType: "fixed" | "hourly"',
        'estimatedDurationMinutes: Number',
        'images: [String], coverImage: String',
        'ratingAverage: Number, ratingCount: Number'
      ]
    },
    {
      name: 'Booking',
      purpose: 'Core marketplace transaction state machine',
      fields: [
        'bookingReference: String (unique, e.g. SSH-20261026-X19)',
        'customer: ObjectId ref User, provider: ObjectId ref User',
        'service: ObjectId ref Service',
        'status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"',
        'scheduledDate: Date, timeSlot: String',
        'serviceLocation: { street, city, postalCode }',
        'totalAmount: Number, paymentStatus: "pending" | "completed"'
      ]
    },
    {
      name: 'Review',
      purpose: 'Verified customer feedback linked to completed bookings',
      fields: [
        'booking: ObjectId ref Booking (unique, 1-to-1)',
        'service: ObjectId ref Service',
        'customer: ObjectId ref User',
        'provider: ObjectId ref User',
        'rating: Number (1-5 stars)',
        'comment: String (min 5, max 1000 chars)'
      ]
    }
  ];

  const milestones = [
    {
      phase: 'Phase 1',
      title: 'Foundational Infrastructure & Monorepo Baseline',
      status: 'Completed',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      items: [
        'Clean client-server monorepo with npm workspaces',
        'Express REST server with Helmet, CORS, and request logging',
        'System health endpoint with real-time uptime & DB telemetry',
        'Mongoose initial schemas (User, Service, Booking, Review)',
        'React 19 + Tailwind CSS v4 design system baseline'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Authentication & Role-Based Access Control (RBAC)',
      status: 'Completed (Current)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      items: [
        'User model with bcrypt password hashing and normalized email',
        'Maintained server-side sessions via connect-mongo with HTTP-only cookies',
        'Anti-CSRF origin defense and brute-force rate limiting',
        'Reusable requireAuth, requireRole, and checkOwnership middleware',
        'React AuthContext, ProtectedRoute, Login, Register, and RBAC Tester UI'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Service Catalog & Provider Management',
      status: 'Next Up',
      statusColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      items: [
        'Provider onboarding & approval workflow',
        'Full CRUD service management with categories and pricing',
        'Client service catalog discovery, filtering, and search',
        'Detailed service view and provider public profile'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Booking Engine & State Lifecycle',
      status: 'Planned',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      items: [
        'Booking creation with slot reservation and address validation',
        'Provider booking acceptance / rejection flow',
        'Real-time appointment status progression',
        'Customer booking dashboard and history'
      ]
    },
    {
      phase: 'Phase 5',
      title: 'Reviews, Ratings & Admin Oversight',
      status: 'Planned',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      items: [
        'Verified post-service customer reviews',
        'Automatic recalculation of provider rating averages',
        'Admin oversight dashboard for dispute and platform audit',
        'Comprehensive pagination, sorting, and error logging'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Three-Role Marketplace Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'models'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Core Mongoose Data Models</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'milestones'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Engineering Roadmap</span>
        </button>
      </div>

      {/* Tab: Roles */}
      {activeTab === 'roles' && (
        <div id="roles" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${role.accent}`}>
                      {role.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {role.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-4">
                    {role.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Capabilities
                    </span>
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  Secured by RBAC Middleware
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Models */}
      {activeTab === 'models' && (
        <div id="models" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-bold font-mono text-slate-900">
                    models/{model.name}.js
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Mongoose Schema
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{model.purpose}</p>

              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                {model.fields.map((field, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed">
                    <span className="text-indigo-300">{field.split(':')[0]}</span>:
                    <span className="text-emerald-400">{field.split(':')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Milestones */}
      {activeTab === 'milestones' && (
        <div id="roadmap" className="space-y-4">
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {milestone.phase}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${milestone.statusColor}`}
                  >
                    {milestone.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {milestone.title}
                </h4>
              </div>

              <div className="md:w-2/3">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {milestone.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
