import React from 'react';
import { Star, Clock, ShieldCheck, Tag } from 'lucide-react';

const CATEGORY_NAMES = {
  home_cleaning: 'Home Cleaning',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'HVAC & AC Repair',
  appliance_repair: 'Appliance Repair',
  painting: 'Painting',
  carpentry: 'Carpentry',
  pest_control: 'Pest Control',
  gardening: 'Gardening & Landscaping',
  other: 'General Service'
};

const CATEGORY_COLORS = {
  home_cleaning: 'bg-blue-50 text-blue-700 border-blue-200',
  plumbing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  electrical: 'bg-amber-50 text-amber-700 border-amber-200',
  hvac: 'bg-sky-50 text-sky-700 border-sky-200',
  appliance_repair: 'bg-violet-50 text-violet-700 border-violet-200',
  painting: 'bg-rose-50 text-rose-700 border-rose-200',
  carpentry: 'bg-orange-50 text-orange-700 border-orange-200',
  pest_control: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gardening: 'bg-lime-50 text-lime-700 border-lime-200',
  other: 'bg-slate-50 text-slate-700 border-slate-200'
};

export default function ServiceCard({ service, onSelect }) {
  const categoryLabel = CATEGORY_NAMES[service.category] || service.category;
  const categoryColor = CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div
      onClick={() => onSelect(service)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-[#FF8A00] hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Cover Image or Category Gradient Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {service.coverImage ? (
          <img
            src={service.coverImage}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-slate-100 to-indigo-50 flex items-center justify-center">
            <Tag className="h-10 w-10 text-indigo-300" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-2xs ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-800 shadow-2xs">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
          <span>{service.ratingAverage > 0 ? service.ratingAverage.toFixed(1) : 'New'}</span>
          {service.ratingCount > 0 && (
            <span className="text-slate-400 text-[10px]">({service.ratingCount})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0D47A1] transition-colors line-clamp-1">
            {service.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Provider Details & Meta */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-[#0D47A1] text-white text-[10px] flex items-center justify-center font-bold">
                {service.provider?.name?.charAt(0) || 'P'}
              </div>
              <span className="font-medium truncate max-w-[140px]">
                {service.provider?.providerProfile?.businessName || service.provider?.name || 'Verified Provider'}
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#22C55E] shrink-0" />
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Clock className="h-3 w-3" />
              <span>{service.estimatedDurationMinutes} mins</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {service.pricingType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
              </span>
              <div className="text-lg font-black text-[#0D47A1]">
                ${service.price}
                {service.pricingType === 'hourly' && (
                  <span className="text-xs font-normal text-slate-500">/hr</span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(service);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#e67c00] text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-orange-500/20"
            >
              Book Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
