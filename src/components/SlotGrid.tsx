import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DayPeriod, TimeSlot } from '../types';
import { formatTime } from '../utils/session';
import { Clock, Lock, Check, Sun, Sunset, Moon, Sparkles, AlertCircle } from 'lucide-react';

interface SlotGridProps {
  onOpenBookingModal: () => void;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ onOpenBookingModal }) => {
  const {
    slots,
    activeLock,
    lockSlot,
    lockSecondsRemaining,
    selectedService,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<'all' | DayPeriod>('all');

  const filteredSlots = slots.filter(slot => {
    if (selectedPeriod === 'all') return true;
    return slot.period === selectedPeriod;
  });

  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = slots.filter(s => s.status === 'booked').length;
  const lockedCount = slots.filter(s => s.status === 'locked_by_user' || s.status === 'locked_by_other').length;

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'booked') return;

    if (slot.status === 'locked_by_user') {
      // Already locked by this user; open the booking form
      onOpenBookingModal();
      return;
    }

    if (slot.status === 'available') {
      // Lock slot for 2 minutes
      const success = lockSlot(slot.id);
      if (success) {
        onOpenBookingModal();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              2. Available Time Slots for Today
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Booking for <span className="font-semibold text-slate-700">{selectedService.title}</span> • Slots are locked for 2 minutes once clicked
          </p>
        </div>

        {/* Status Legend & Counts */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-md bg-teal-500 ring-2 ring-teal-100"></span>
            <span>Available ({availableCount})</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-3 h-3 rounded-md bg-amber-400 ring-2 ring-amber-100 animate-pulse"></span>
            <span>Your Lock ({lockedCount})</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-400">
            <span className="w-3 h-3 rounded-md bg-slate-300"></span>
            <span>Booked ({bookedCount})</span>
          </div>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPeriod('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedPeriod === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Slots ({slots.length})</span>
        </button>

        <button
          onClick={() => setSelectedPeriod('morning')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedPeriod === 'morning'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Morning (09:00 AM - 12:00 PM)</span>
        </button>

        <button
          onClick={() => setSelectedPeriod('afternoon')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedPeriod === 'afternoon'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Sunset className="w-3.5 h-3.5 text-orange-400" />
          <span>Afternoon (12:00 PM - 04:00 PM)</span>
        </button>

        <button
          onClick={() => setSelectedPeriod('evening')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedPeriod === 'evening'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
          <span>Evening (04:00 PM - 07:00 PM)</span>
        </button>
      </div>

      {/* Active Lock Notification Banner if locked */}
      {activeLock && lockSecondsRemaining > 0 && (
        <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-500 text-white shadow-xs animate-bounce">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-amber-950">
                You currently have a slot reserved!
              </p>
              <p className="text-xs text-amber-800">
                Time remaining to complete booking:{' '}
                <span className="font-mono font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded">
                  {formatTime(lockSecondsRemaining)}
                </span>{' '}
                • Protected against page reloads
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBookingModal}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Complete Booking Form &rarr;
          </button>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSlots.map(slot => {
          const isUserLocked = activeLock?.slotId === slot.id && lockSecondsRemaining > 0;
          const isBooked = slot.status === 'booked';
          const isAvailable = !isBooked && !isUserLocked;

          if (isUserLocked) {
            return (
              <div
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className="group relative p-3.5 rounded-xl border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-amber-100/60 shadow-md ring-2 ring-amber-500/20 cursor-pointer text-center transition-all transform hover:-translate-y-0.5"
              >
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  {formatTime(lockSecondsRemaining)}
                </div>

                <div className="text-xs font-bold text-amber-950 mt-1 font-mono">
                  {slot.time}
                </div>
                <div className="text-[11px] font-semibold text-amber-800 mt-1">
                  Locked by You
                </div>
                <div className="text-[10px] text-amber-700/80 mt-1 font-medium">
                  Click to finalize &rarr;
                </div>
              </div>
            );
          }

          if (isBooked) {
            return (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-100/70 text-center opacity-75 cursor-not-allowed select-none"
              >
                <div className="text-xs font-semibold text-slate-500 font-mono">
                  {slot.time}
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-slate-400" />
                  <span>Booked</span>
                </div>
                {slot.bookedBy && (
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Token #{slot.bookedBy.tokenNumber}
                  </div>
                )}
              </div>
            );
          }

          // Available slot
          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className="group p-3.5 rounded-xl border-2 border-teal-200/90 hover:border-teal-600 bg-white hover:bg-teal-50/50 shadow-xs hover:shadow-md cursor-pointer text-center transition-all duration-150 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-900 font-mono">
                {slot.time}
              </div>
              <div className="text-[11px] font-semibold text-teal-700 mt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>Available</span>
              </div>
              <div className="text-[10px] text-slate-400 group-hover:text-teal-600 mt-1">
                Lock 2 Mins
              </div>
            </button>
          );
        })}
      </div>

      {filteredSlots.length === 0 && (
        <div className="py-12 text-center text-slate-400 text-sm">
          No slots available for this time period.
        </div>
      )}
    </div>
  );
};
