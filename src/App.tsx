import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { ServiceSelector } from './components/ServiceSelector';
import { SlotGrid } from './components/SlotGrid';
import { BookingModal } from './components/BookingModal';
import { TimeoutModal } from './components/TimeoutModal';
import { QueueTrackerView } from './components/QueueTrackerView';
import { ShieldCheck, Clock, CheckCircle2, RefreshCw, Sparkles, HeartPulse, ExternalLink } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, activeLock } = useApp();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // If a slot is actively locked and user is on booking tab, keep modal accessible
  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans selection:bg-teal-500 selection:text-white">
      {/* Interactive Evaluation Sandbox Bar */}
      <DemoBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Hero Header Section */}
      <div className="bg-gradient-to-b from-teal-900/5 via-transparent to-transparent py-6 sm:py-8 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Smart Clinic Scheduling System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Interactive Appointment Slot & Queue Tracker
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Book diagnostics and specialist consultations with <strong>2-minute temporary slot locking</strong>, 
                <strong> refresh-resilient countdown</strong>, automatic timeout protection, and <strong>live OPD queue tracking</strong>.
              </p>
            </div>

            {/* Quick Badges Checklist */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>2-Min Slot Locking</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Auto-Timeout Release</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Live Queue Position</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>F5 Refresh Resilient</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'booking' ? (
          <div>
            <ServiceSelector />
            <SlotGrid onOpenBookingModal={handleOpenBookingModal} />
          </div>
        ) : (
          <QueueTrackerView />
        )}
      </main>

      {/* Active Booking Drawer/Modal */}
      <BookingModal
        isOpen={isBookingModalOpen || !!activeLock}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Timeout Alert Modal (Auto-triggered when 2:00 timer reaches zero) */}
      <TimeoutModal />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">CarePulse Health Systems</span>
            <span>• Built with React 19, TypeScript & Tailwind CSS</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Client Timestamp Persistence</span>
            <span>•</span>
            <span>BroadcastChannel Multi-Tab Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
