import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, FastForward, Users, RotateCcw, ShieldCheck, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const {
    activeLock,
    fastForwardTimerTo5Seconds,
    advanceQueue,
    resetAllDemoData,
    queueState,
  } = useApp();

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border-b border-teal-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Key Requirement Highlights */}
          <div className="flex items-center flex-wrap gap-2 text-slate-300">
            <span className="flex items-center gap-1.5 font-bold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded">
              <Sparkles className="w-3.5 h-3.5" />
              Evaluation Sandbox
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh Resilient (Press F5 anytime)</span>
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span>2-Min Slot Lock with Auto-Timeout</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span>Live Clinic Queue Tracker</span>
          </div>

          {/* Quick Simulation Actions for Evaluator */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Fast-forward timer button (enabled only when a slot is locked) */}
            <button
              onClick={fastForwardTimerTo5Seconds}
              disabled={!activeLock}
              title={activeLock ? 'Jump timer to 5s remaining to test auto-release and timeout modal' : 'Lock a slot first to test timeout'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                activeLock
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer shadow-xs'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-forward to 5s (Test Timeout)</span>
            </button>

            {/* Advance Queue button */}
            <button
              onClick={advanceQueue}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-medium transition-all cursor-pointer shadow-xs"
              title="Doctor completes current patient consultation and calls next token"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Next Patient (Token #{queueState.currentServingToken + 1})</span>
            </button>

            {/* Reset Demo State */}
            <button
              onClick={resetAllDemoData}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 font-medium transition-all cursor-pointer"
              title="Clear stored locks and reset to fresh initial state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
