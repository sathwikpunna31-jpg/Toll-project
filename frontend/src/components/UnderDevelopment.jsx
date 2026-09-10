import React from 'react';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

function UnderDevelopment({ 
  moduleName = "Module In Progress", 
  scheduledPhase = "Phase 1 - Review 2", 
  description = "The frontend interface and data models are defined. Real-time transaction simulation and backend engine integration are scheduled for the next review cycle."
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{moduleName}</h1>
          <p className="text-slate-400 text-sm mt-1">Status: Architecture Planned & UI Scaffolded</p>
        </div>
        <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Scheduled: {scheduledPhase}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Development In Progress</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          </div>

          {/* Progress Timeline Checklist */}
          <div className="border-t border-slate-800/80 pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Review Milestone Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Phase 1 - Review 1 (Completed)</p>
                  <p className="text-slate-500 mt-1">System Architecture, Security, User/Vehicle/Plaza Schemas & UI</p>
                </div>
              </div>

              <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sky-400">Phase 1 - Review 2 (Scheduled)</p>
                  <p className="text-slate-400 mt-1">Calculation Engine, Payment Simulation & Ledger Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderDevelopment;
