import React from 'react';
import { GraduationCap, ShieldAlert, Code2 } from 'lucide-react';

export const EducationalBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white border-b border-navy-800/80 px-4 py-2.5 text-xs no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wide text-[10px] uppercase">
            <GraduationCap className="w-3.5 h-3.5" />
            Aditya University • Batch 13
          </div>
          <span className="font-semibold text-slate-200">
            Bank Account Management System Using C++
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            Guide: <strong className="text-cyan-300">T. Vijaya Lakshmi Madam</strong> (AIML / CSE Dept)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Educational Simulation Prototype. Real banking/UPI networks are not connected.</span>
        </div>
      </div>
    </div>
  );
};
