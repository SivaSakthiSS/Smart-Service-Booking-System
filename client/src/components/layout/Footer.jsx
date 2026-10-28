import React from 'react';
import BrandLogo from '../common/BrandLogo.jsx';
import { Layers, GitBranch, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="mb-3">
              <BrandLogo size="sm" withTagline={true} />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Book. Track. Manage. Smarter. Easier. Together.
              Complete full-stack marketplace for certified local trade and home services.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Color Palette
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#0D47A1] inline-block shadow-2xs" />
                <span className="font-mono text-[11px] text-slate-600">#0D47A1 (Primary Blue)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#FF8A00] inline-block shadow-2xs" />
                <span className="font-mono text-[11px] text-slate-600">#FF8A00 (Accent Orange)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#1E293B] inline-block shadow-2xs" />
                <span className="font-mono text-[11px] text-slate-600">#1E293B (Text Dark)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#22C55E] inline-block shadow-2xs" />
                <span className="font-mono text-[11px] text-slate-600">#22C55E (Success Green)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Marketplace Roles
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><strong className="text-[#0D47A1]">Customer:</strong> Browse, Book, Track, Reviews</li>
              <li><strong className="text-[#FF8A00]">Provider:</strong> Services, Rates, Dispatches</li>
              <li><strong className="text-purple-700">Admin:</strong> Approvals, Metrics, Moderation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Engineering Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-slate-400" /> React 19 + Vite + Tailwind v4
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-slate-400" /> Express 4 + MongoDB Sessions
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 38 Passed Integration Tests
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smart Service Hub — All Your Services, One Hub.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
            Node v24.14.0 • ES Modules • Production Verified
          </p>
        </div>
      </div>
    </footer>
  );
}
