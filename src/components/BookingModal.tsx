import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/session';
import {
  Lock,
  Clock,
  User,
  Phone,
  ShieldCheck,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const {
    activeLock,
    lockSecondsRemaining,
    lockProgressPercent,
    slots,
    selectedService,
    confirmBooking,
    releaseActiveLock,
    updateDraftInfo,
  } = useApp();

  const [name, setName] = useState(activeLock?.draftName || '');
  const [phone, setPhone] = useState(activeLock?.draftPhone || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeLock) {
      if (activeLock.draftName) setName(activeLock.draftName);
      if (activeLock.draftPhone) setPhone(activeLock.draftPhone);
    }
  }, [activeLock]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    updateDraftInfo(val, phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    updateDraftInfo(name, val);
  };

  if (!isOpen || !activeLock) return null;

  const currentSlot = slots.find(s => s.id === activeLock.slotId);
  if (!currentSlot) return null;

  const isUrgent = lockSecondsRemaining <= 30;
  const isCritical = lockSecondsRemaining <= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter the patient full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = confirmBooking(name, phone);
      setIsSubmitting(false);
      if (res) {
        onClose();
      } else {
        setError('Failed to confirm slot. It might have expired or been reallocated.');
      }
    }, 300);
  };

  const handleCancel = () => {
    releaseActiveLock('user_cancelled');
    onClose();
  };

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
        className="w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        style={{
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 100000,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Top Countdown Header Banner */}
        <div
          className="p-6 text-white"
          style={{
            backgroundColor: isCritical ? '#be123c' : isUrgent ? '#d97706' : '#0f766e',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/20">
                <Lock className="w-4 h-4 text-white" />
              </span>
              <div>
                <span className="text-[11px] uppercase font-black tracking-widest text-teal-100 block">
                  TEMPORARY LOCK ACTIVE (2 MINS)
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Slot held exclusively for you
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Release slot & cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Large Countdown Display */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-white/80 font-medium">Time Remaining:</span>
              <div className="text-3xl font-mono font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                <Clock className="w-6 h-6 text-teal-200" />
                <span>{formatTime(lockSecondsRemaining)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-white/80 font-medium">Selected Slot:</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {currentSlot.time}
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-3.5 w-full bg-black/30 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="h-full bg-white transition-all duration-300 ease-linear rounded-full shadow-sm"
              style={{ width: `${lockProgressPercent}%` }}
            />
          </div>

          {isUrgent && (
            <p className="mt-2.5 text-xs font-semibold text-amber-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
              <span>Hurry! Under 30s remaining before slot is released automatically.</span>
            </p>
          )}
        </div>

        {/* Refresh Resilience Informational Pill */}
        <div
          className="px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Refresh Resilient:</strong> Reloading won't reset your timer.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
            2-Min Lock
          </span>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Selected Service Card */}
          <div
            className="p-3.5 rounded-2xl border border-teal-200 flex items-center justify-between text-xs"
            style={{ backgroundColor: '#f0fdfa' }}
          >
            <div>
              <span className="font-bold text-teal-950 text-sm block">
                {selectedService.title}
              </span>
              <span className="text-teal-700 font-medium">
                {selectedService.subtitle} • {selectedService.room}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm block">
                {selectedService.price}
              </span>
              <span className="text-teal-700 font-mono font-medium">~{selectedService.durationMinutes}m</span>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-xl border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
              style={{ backgroundColor: '#fff1f2' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Alex Johnson"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for live SMS queue updates and token lookup.
            </p>
          </div>

          {/* Optional reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Visit / Symptoms (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Routine checkup, mild chest pain, blood test"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-all"
            >
              Release Slot
            </button>

            <button
              type="submit"
              disabled={isSubmitting || lockSecondsRemaining <= 0}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Secure Slot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
