import React from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/session';
import { HeartPulse, Calendar, Users, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, activeLock, lockSecondsRemaining, slots } = useApp();

  const lockedSlot = activeLock ? slots.find(s => s.id === activeLock.slotId) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">CarePulse</span>
                <span className="text-xs px-2 py-0.5 font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 rounded-full">
                  Clinic & Diagnostics
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interactive Slot Booking & Live Queue Tracking System
              </p>
            </div>
          </div>

          {/* Active Lock Floating Alert in Header */}
          {activeLock && lockSecondsRemaining > 0 && (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 shadow-xs animate-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="text-xs">
                <span className="font-semibold text-amber-900">
                  {lockedSlot ? lockedSlot.time : 'Slot'} Locked:
                </span>{' '}
                <span className="font-mono font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                  {formatTime(lockSecondsRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <nav className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setActiveTab('booking')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'booking'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Slot</span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'queue'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Live Queue</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </button>
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
};
