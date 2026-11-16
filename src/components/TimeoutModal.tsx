import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const TimeoutModal: React.FC = () => {
  const {
    timeoutModalOpen,
    setTimeoutModalOpen,
    lastExpiredSlotTime,
    selectedService,
  } = useApp();

  if (!timeoutModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8"
        style={{
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 100000,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Animated Timeout Icon */}
        <div
          className="mx-auto w-16 h-16 rounded-2xl text-amber-600 flex items-center justify-center mb-4 ring-8 ring-amber-50"
          style={{ backgroundColor: '#fef3c7' }}
        >
          <Clock className="w-8 h-8 animate-bounce text-amber-600" />
        </div>

        <span
          className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: '#fffbeb' }}
        >
          Hold Window Expired
        </span>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Your 2-Minute Lock Has Expired
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The temporary hold on the{' '}
          <strong className="text-slate-900 font-mono">
            {lastExpiredSlotTime || 'selected'}
          </strong>{' '}
          slot for{' '}
          <strong className="text-slate-900">{selectedService.title}</strong> has
          elapsed and has been automatically released back to the clinic schedule for other patients.
        </p>

        <div
          className="mt-4 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-500 text-left flex items-start gap-2"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            To ensure fair access, slots can only be held for 120 seconds while filling out your details. You may select another slot anytime.
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTimeoutModalOpen(false)}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md shadow-teal-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>Choose an Available Slot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
