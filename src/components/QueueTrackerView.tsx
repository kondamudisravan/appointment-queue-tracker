import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  FastForward,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const QueueTrackerView: React.FC = () => {
  const {
    currentBooking,
    queueState,
    advanceQueue,
    bookings,
    setCurrentBooking,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultMsg, setSearchResultMsg] = useState<string | null>(null);

  const servingToken = queueState.currentServingToken;

  // Calculate user position
  let patientsAhead = 0;
  let estimatedWaitMins = 0;
  let userStatus: 'waiting' | 'in_consultation' | 'completed' | 'none' = 'none';

  if (currentBooking) {
    if (currentBooking.tokenNumber < servingToken) {
      userStatus = 'completed';
      patientsAhead = 0;
      estimatedWaitMins = 0;
    } else if (currentBooking.tokenNumber === servingToken) {
      userStatus = 'in_consultation';
      patientsAhead = 0;
      estimatedWaitMins = 0;
    } else {
      userStatus = 'waiting';
      patientsAhead = currentBooking.tokenNumber - servingToken;
      estimatedWaitMins = patientsAhead * queueState.averageConsultationMinutes;
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResultMsg(null);
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = bookings.find(
      b =>
        b.bookingId.toLowerCase() === q ||
        b.phone.includes(q) ||
        b.tokenNumber.toString() === q ||
        b.patientName.toLowerCase().includes(q)
    );

    if (found) {
      setCurrentBooking(found);
      setSearchResultMsg(`Found booking for ${found.patientName} (Token #${found.tokenNumber})`);
    } else {
      setSearchResultMsg('No booking found matching that reference or phone number.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search / Lookup Bar for existing patients */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Clinic Queue Status & Token Lookup
          </h3>
          <p className="text-xs text-slate-500">
            Check real-time queue position for yourself or any family member
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Token, Phone, or ID"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-all"
          >
            Lookup
          </button>
        </form>
      </div>

      {searchResultMsg && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center justify-between">
          <span>{searchResultMsg}</span>
          <button
            onClick={() => setSearchResultMsg(null)}
            className="text-teal-600 hover:text-teal-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Primary Patient Status Card (Requirement 3: position & estimated wait time) */}
      {currentBooking ? (
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800/40"
          style={{ backgroundColor: '#042f2e' }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Patient Details & Token */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Confirmed Patient Pass
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {currentBooking.bookingId}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {currentBooking.patientName}
              </h2>
              <p className="text-sm text-teal-200/90 mt-1 flex items-center gap-2">
                <span>{currentBooking.serviceTitle}</span>
                <span>•</span>
                <span className="font-mono text-xs text-teal-300">{currentBooking.room}</span>
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Today ({currentBooking.slotTime})</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{currentBooking.room}</span>
                </div>
              </div>
            </div>

            {/* Right: Live Queue Metrics (Token, Position, Estimated Wait) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              
              {/* Token Number */}
              <div className="text-center p-3 rounded-xl bg-white/5">
                <span className="text-[11px] font-semibold text-slate-300 block uppercase">
                  Your Token
                </span>
                <span className="text-3xl font-mono font-black text-teal-300 block mt-0.5">
                  #{currentBooking.tokenNumber}
                </span>
              </div>

              {/* Patients Ahead */}
              <div className="text-center p-3 rounded-xl bg-white/5">
                <span className="text-[11px] font-semibold text-slate-300 block uppercase">
                  In Front of You
                </span>
                <span className="text-3xl font-mono font-black text-amber-300 block mt-0.5">
                  {userStatus === 'completed'
                    ? '0'
                    : userStatus === 'in_consultation'
                    ? '0 (You!)'
                    : patientsAhead}
                </span>
                <span className="text-[10px] text-slate-400">
                  {patientsAhead === 1 ? '1 patient ahead' : `${patientsAhead} patients ahead`}
                </span>
              </div>

              {/* Estimated Wait Time */}
              <div className="text-center p-3 rounded-xl bg-white/5 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-slate-300 block uppercase">
                  Estimated Wait
                </span>
                <span className="text-2xl font-mono font-black text-emerald-300 block mt-0.5">
                  {userStatus === 'completed'
                    ? 'Done'
                    : userStatus === 'in_consultation'
                    ? 'Now Serving!'
                    : `~${estimatedWaitMins}m`}
                </span>
                <span className="text-[10px] text-slate-400">
                  {userStatus === 'in_consultation'
                    ? 'Enter consultation room'
                    : `Avg ~${queueState.averageConsultationMinutes}m/patient`}
                </span>
              </div>

            </div>

          </div>

          {/* Status Alert Bar depending on position */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {userStatus === 'in_consultation' ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold animate-pulse">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>It is your turn! Please proceed to {currentBooking.room}</span>
                </div>
              ) : userStatus === 'completed' ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Consultation marked completed. Thank you for visiting CarePulse!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-teal-200">
                  <Clock className="w-4 h-4 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>
                    Currently serving Token #{servingToken}. Relax in the lobby; your turn is estimated in ~{estimatedWaitMins} minutes.
                  </span>
                </div>
              )}
            </div>

            {/* Quick advance button right inside patient card */}
            <button
              onClick={advanceQueue}
              className="px-3 py-1.5 rounded-lg bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border border-teal-400/30 font-semibold cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-auto"
              title="Doctor completes current consultation and calls next token"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Simulate Next Patient Call</span>
            </button>
          </div>

        </div>
      ) : (
        /* Prompt to book if no booking active yet */
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Track Your Clinic Queue Live
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            You don't have an active booking selected in this session. Book a slot from the schedule or lookup an existing token above to view live wait times.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 cursor-pointer transition-all flex items-center gap-2"
            >
              <span>Book an Available Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Clinic Public Queue Board */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Today's Live Queue Board
              </h3>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live OPD
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Serving: <strong className="text-slate-800">Token #{servingToken}</strong> • Average consultation: ~{queueState.averageConsultationMinutes} minutes
            </p>
          </div>

          <button
            onClick={advanceQueue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs self-start sm:self-auto"
          >
            <FastForward className="w-3.5 h-3.5 text-teal-400" />
            <span>Call Next Token (#{servingToken + 1})</span>
          </button>
        </div>

        {/* Tokens List */}
        <div className="mt-4 divide-y divide-slate-100">
          {queueState.activeQueue.map((item) => {
            const isServing = item.tokenNumber === servingToken;
            const isPassed = item.tokenNumber < servingToken;
            const isYours = currentBooking?.tokenNumber === item.tokenNumber;

            return (
              <div
                key={item.tokenNumber}
                className={`py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 transition-all ${
                  isYours
                    ? 'bg-teal-50/80 border border-teal-300 ring-2 ring-teal-500/10'
                    : isServing
                    ? 'bg-amber-50/70 border border-amber-200/70'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center shrink-0 ${
                      isServing
                        ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                        : isYours
                        ? 'bg-teal-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    #{item.tokenNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.patientName}
                      </span>
                      {isYours && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.serviceTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {isServing ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      In Consultation
                    </span>
                  ) : isPassed ? (
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Completed
                    </span>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">
                        Waiting (Token #{item.tokenNumber})
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ~{Math.max(0, (item.tokenNumber - servingToken) * queueState.averageConsultationMinutes)}m wait
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
