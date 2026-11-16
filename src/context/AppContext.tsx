import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TimeSlot, ServiceItem, ActiveLock, BookingRecord, QueueState } from '../types';
import { CLINIC_SERVICES, INITIAL_SLOTS } from '../data/doctorsAndServices';
import { getSessionId, generateBookingId } from '../utils/session';
import confetti from 'canvas-confetti';

const LOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)
const STORAGE_KEYS = {
  SLOTS: 'carepulse_slots_v2',
  ACTIVE_LOCK: 'carepulse_active_lock_v2',
  BOOKINGS: 'carepulse_bookings_v2',
  CURRENT_BOOKING_ID: 'carepulse_current_booking_id_v2',
  QUEUE_SERVING_TOKEN: 'carepulse_queue_serving_token_v2',
};

interface AppContextType {
  services: ServiceItem[];
  selectedService: ServiceItem;
  setSelectedService: (service: ServiceItem) => void;
  slots: TimeSlot[];
  activeLock: ActiveLock | null;
  lockSecondsRemaining: number;
  lockProgressPercent: number;
  lockSlot: (slotId: string) => boolean;
  releaseActiveLock: (reason?: 'user_cancelled' | 'timeout' | 'booked') => void;
  updateDraftInfo: (name: string, phone: string) => void;
  confirmBooking: (patientName: string, phone: string) => BookingRecord | null;
  bookings: BookingRecord[];
  currentBooking: BookingRecord | null;
  setCurrentBooking: (booking: BookingRecord | null) => void;
  queueState: QueueState;
  advanceQueue: () => void;
  fastForwardTimerTo5Seconds: () => void;
  resetAllDemoData: () => void;
  timeoutModalOpen: boolean;
  setTimeoutModalOpen: (open: boolean) => void;
  lastExpiredSlotTime: string | null;
  activeTab: 'booking' | 'queue';
  setActiveTab: (tab: 'booking' | 'queue') => void;
  sessionId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionId = useRef(getSessionId()).current;

  // 1. Services
  const [services] = useState<ServiceItem[]>(CLINIC_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceItem>(CLINIC_SERVICES[0]);
  const [activeTab, setActiveTab] = useState<'booking' | 'queue'>('booking');

  // 2. Slots State (Hydrated from localStorage)
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLOTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading slots from localStorage', e);
    }
    return INITIAL_SLOTS;
  });

  // 3. Bookings State
  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading bookings from localStorage', e);
    }
    return [
      {
        bookingId: 'BK-8901',
        tokenNumber: 101,
        patientName: 'David Miller',
        phone: '+1 555-0192',
        serviceId: 'doc-gen-1',
        serviceTitle: 'Dr. Rajesh Mehta, MBBS',
        serviceType: 'doctor',
        room: 'OPD Room 102',
        slotId: 'slot-0900',
        slotTime: '09:00 AM',
        bookedAt: Date.now() - 3600000,
        status: 'completed'
      },
      {
        bookingId: 'BK-8902',
        tokenNumber: 102,
        patientName: 'Sarah Jenkins',
        phone: '+1 555-0143',
        serviceId: 'doc-gen-1',
        serviceTitle: 'Dr. Rajesh Mehta, MBBS',
        serviceType: 'doctor',
        room: 'OPD Room 102',
        slotId: 'slot-0920',
        slotTime: '09:20 AM',
        bookedAt: Date.now() - 1800000,
        status: 'in_consultation'
      }
    ];
  });

  // 4. Current user's confirmed booking
  const [currentBooking, setCurrentBooking] = useState<BookingRecord | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_BOOKING_ID);
      if (savedId) {
        const savedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        if (savedBookings) {
          const list: BookingRecord[] = JSON.parse(savedBookings);
          return list.find(b => b.bookingId === savedId) || null;
        }
      }
    } catch (e) {
      console.error('Failed reading current booking', e);
    }
    return null;
  });

  // 5. Active Lock State (Refresh-resilient via timestamp in localStorage)
  const [activeLock, setActiveLock] = useState<ActiveLock | null>(() => {
    try {
      const savedLock = localStorage.getItem(STORAGE_KEYS.ACTIVE_LOCK);
      if (savedLock) {
        const parsed: ActiveLock = JSON.parse(savedLock);
        // Check if lock has already expired while user was away
        if (parsed.expiresAt > Date.now()) {
          return parsed;
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_LOCK);
        }
      }
    } catch (e) {
      console.error('Failed reading active lock', e);
    }
    return null;
  });

  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<number>(0);
  const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);
  const [lastExpiredSlotTime, setLastExpiredSlotTime] = useState<string | null>(null);

  // 6. Clinic Queue Serving Token
  const [servingToken, setServingToken] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUEUE_SERVING_TOKEN);
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 102; // Default now serving Token 102
  });

  // Broadcast channel for multi-tab sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel('carepulse_sync_channel');
      channelRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_SLOTS') {
          setSlots(payload);
        } else if (type === 'SYNC_BOOKINGS') {
          setBookings(payload);
        } else if (type === 'SYNC_SERVING_TOKEN') {
          setServingToken(payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Save slots to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    } catch (e) {}
  }, [slots]);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {}
  }, [bookings]);

  // Save serving token
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE_SERVING_TOKEN, servingToken.toString());
    } catch (e) {}
  }, [servingToken]);

  // Broadcast slot changes
  const broadcastSlots = (updatedSlots: TimeSlot[]) => {
    channelRef.current?.postMessage({ type: 'SYNC_SLOTS', payload: updatedSlots });
  };

  const broadcastBookings = (updatedBookings: BookingRecord[]) => {
    channelRef.current?.postMessage({ type: 'SYNC_BOOKINGS', payload: updatedBookings });
  };

  const broadcastServingToken = (token: number) => {
    channelRef.current?.postMessage({ type: 'SYNC_SERVING_TOKEN', payload: token });
  };

  // Release Active Lock
  const releaseActiveLock = useCallback((reason: 'user_cancelled' | 'timeout' | 'booked' = 'user_cancelled') => {
    if (!activeLock) return;

    const lockedSlotId = activeLock.slotId;
    const expiredSlot = slots.find(s => s.id === lockedSlotId);

    // If reason is timeout, notify user
    if (reason === 'timeout' && expiredSlot) {
      setLastExpiredSlotTime(expiredSlot.time);
      setTimeoutModalOpen(true);
    }

    // Clean up local storage
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LOCK);
    setActiveLock(null);
    setLockSecondsRemaining(0);

    // Revert slot status back to available if not booked
    if (reason !== 'booked') {
      setSlots(prev => {
        const updated = prev.map(slot => {
          if (slot.id === lockedSlotId && slot.status !== 'booked') {
            return {
              ...slot,
              status: 'available' as const,
              lockedUntil: undefined,
              lockedBySessionId: undefined,
            };
          }
          return slot;
        });
        broadcastSlots(updated);
        return updated;
      });
    }
  }, [activeLock, slots]);

  // Lock a Slot (Requirement 1 & 4: 2 minutes hold with timestamp resilience)
  const lockSlot = useCallback((slotId: string): boolean => {
    const targetSlot = slots.find(s => s.id === slotId);
    if (!targetSlot || targetSlot.status === 'booked') {
      return false;
    }

    // If user already has another slot locked, release it first
    if (activeLock && activeLock.slotId !== slotId) {
      releaseActiveLock('user_cancelled');
    }

    const now = Date.now();
    const expiresAt = now + LOCK_DURATION_MS;

    const newLock: ActiveLock = {
      slotId,
      serviceId: selectedService.id,
      sessionId,
      lockedAt: now,
      expiresAt,
      draftName: activeLock?.draftName || '',
      draftPhone: activeLock?.draftPhone || '',
    };

    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LOCK, JSON.stringify(newLock));
    } catch (e) {}

    setActiveLock(newLock);
    setLockSecondsRemaining(Math.ceil(LOCK_DURATION_MS / 1000));

    // Update slots state
    setSlots(prev => {
      const updated = prev.map(slot => {
        if (slot.id === slotId) {
          return {
            ...slot,
            status: 'locked_by_user' as const,
            lockedUntil: expiresAt,
            lockedBySessionId: sessionId,
          };
        } else if (slot.status === 'locked_by_user' && slot.id !== slotId) {
          return {
            ...slot,
            status: 'available' as const,
            lockedUntil: undefined,
            lockedBySessionId: undefined,
          };
        }
        return slot;
      });
      broadcastSlots(updated);
      return updated;
    });

    return true;
  }, [slots, activeLock, releaseActiveLock, selectedService.id, sessionId]);

  // Update draft name/phone during locking to preserve across page refresh
  const updateDraftInfo = useCallback((name: string, phone: string) => {
    if (!activeLock) return;
    const updated = { ...activeLock, draftName: name, draftPhone: phone };
    setActiveLock(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LOCK, JSON.stringify(updated));
    } catch (e) {}
  }, [activeLock]);

  // High-precision Countdown Interval (Requirement 1, 2, 4)
  useEffect(() => {
    if (!activeLock) {
      setLockSecondsRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remainingMs = activeLock.expiresAt - Date.now();
      if (remainingMs <= 0) {
        // TIMEOUT REACHED! Auto-release slot and notify user
        releaseActiveLock('timeout');
      } else {
        setLockSecondsRemaining(Math.ceil(remainingMs / 1000));
      }
    };

    // Run immediately on mount or lock change
    updateTimer();

    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [activeLock, releaseActiveLock]);

  // Confirm booking
  const confirmBooking = useCallback((patientName: string, phone: string): BookingRecord | null => {
    if (!activeLock) return null;

    const slot = slots.find(s => s.id === activeLock.slotId);
    if (!slot) return null;

    // Next token number calculation
    const maxToken = bookings.reduce((max, b) => Math.max(max, b.tokenNumber), 102);
    const newToken = maxToken + 1;
    const bookingId = generateBookingId();

    const newBooking: BookingRecord = {
      bookingId,
      tokenNumber: newToken,
      patientName: patientName.trim(),
      phone: phone.trim(),
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      serviceType: selectedService.type,
      room: selectedService.room,
      slotId: slot.id,
      slotTime: slot.time,
      bookedAt: Date.now(),
      status: 'waiting',
    };

    // Update slots
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.id === slot.id) {
          return {
            ...s,
            status: 'booked' as const,
            lockedUntil: undefined,
            lockedBySessionId: undefined,
            bookedBy: {
              bookingId,
              tokenNumber: newToken,
              patientName: patientName.trim(),
              phone: phone.trim(),
            }
          };
        }
        return s;
      });
      broadcastSlots(updated);
      return updated;
    });

    // Update bookings
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    broadcastBookings(updatedBookings);

    // Save current user booking
    setCurrentBooking(newBooking);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_BOOKING_ID, newBooking.bookingId);
    } catch (e) {}

    // Clean up active lock
    releaseActiveLock('booked');

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Switch to queue view to show their position immediately!
    setActiveTab('queue');

    return newBooking;
  }, [activeLock, slots, bookings, selectedService, releaseActiveLock]);

  // Demo tool: fast forward lock timer to 5s remaining (for quick evaluator timeout testing)
  const fastForwardTimerTo5Seconds = useCallback(() => {
    if (!activeLock) return;
    const newExpiresAt = Date.now() + 5000;
    const updated = {
      ...activeLock,
      expiresAt: newExpiresAt,
      lockedAt: newExpiresAt - LOCK_DURATION_MS
    };
    setActiveLock(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LOCK, JSON.stringify(updated));
    } catch (e) {}
  }, [activeLock]);

  // Advance clinic queue (Simulates doctor finishing patient and calling next)
  const advanceQueue = useCallback(() => {
    const nextToken = servingToken + 1;
    setServingToken(nextToken);
    broadcastServingToken(nextToken);

    // Update booking statuses
    setBookings(prev => {
      const updated = prev.map(b => {
        if (b.tokenNumber < nextToken) {
          return { ...b, status: 'completed' as const };
        } else if (b.tokenNumber === nextToken) {
          return { ...b, status: 'in_consultation' as const };
        }
        return { ...b, status: 'waiting' as const };
      });
      broadcastBookings(updated);
      return updated;
    });

    // Update currentBooking if affected
    if (currentBooking) {
      if (currentBooking.tokenNumber < nextToken) {
        setCurrentBooking(prev => prev ? { ...prev, status: 'completed' } : null);
      } else if (currentBooking.tokenNumber === nextToken) {
        setCurrentBooking(prev => prev ? { ...prev, status: 'in_consultation' } : null);
      }
    }
  }, [servingToken, currentBooking]);

  // Reset demo to clean initial state
  const resetAllDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SLOTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LOCK);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BOOKING_ID);
    localStorage.removeItem(STORAGE_KEYS.QUEUE_SERVING_TOKEN);

    setSlots(INITIAL_SLOTS);
    setActiveLock(null);
    setLockSecondsRemaining(0);
    setServingToken(102);
    setCurrentBooking(null);
    setBookings([
      {
        bookingId: 'BK-8901',
        tokenNumber: 101,
        patientName: 'David Miller',
        phone: '+1 555-0192',
        serviceId: 'doc-gen-1',
        serviceTitle: 'Dr. Rajesh Mehta, MBBS',
        serviceType: 'doctor',
        room: 'OPD Room 102',
        slotId: 'slot-0900',
        slotTime: '09:00 AM',
        bookedAt: Date.now() - 3600000,
        status: 'completed'
      },
      {
        bookingId: 'BK-8902',
        tokenNumber: 102,
        patientName: 'Sarah Jenkins',
        phone: '+1 555-0143',
        serviceId: 'doc-gen-1',
        serviceTitle: 'Dr. Rajesh Mehta, MBBS',
        serviceType: 'doctor',
        room: 'OPD Room 102',
        slotId: 'slot-0920',
        slotTime: '09:20 AM',
        bookedAt: Date.now() - 1800000,
        status: 'in_consultation'
      }
    ]);
    setActiveTab('booking');
  }, []);

  // Compute live queue state
  const queueState: QueueState = {
    currentServingToken: servingToken,
    averageConsultationMinutes: selectedService.durationMinutes,
    lastUpdated: Date.now(),
    activeQueue: bookings
      .filter(b => b.status !== 'completed' || b.tokenNumber === servingToken - 1)
      .map(b => ({
        tokenNumber: b.tokenNumber,
        patientName: b.patientName,
        serviceTitle: b.serviceTitle,
        status: b.tokenNumber === servingToken ? 'in_consultation' : b.tokenNumber < servingToken ? 'completed' : 'waiting',
        isCurrentUser: currentBooking ? b.bookingId === currentBooking.bookingId : false,
      }))
      .sort((a, b) => a.tokenNumber - b.tokenNumber),
  };

  const lockProgressPercent = Math.min(100, Math.max(0, (lockSecondsRemaining / 120) * 100));

  return (
    <AppContext.Provider
      value={{
        services,
        selectedService,
        setSelectedService,
        slots,
        activeLock,
        lockSecondsRemaining,
        lockProgressPercent,
        lockSlot,
        releaseActiveLock,
        updateDraftInfo,
        confirmBooking,
        bookings,
        currentBooking,
        setCurrentBooking,
        queueState,
        advanceQueue,
        fastForwardTimerTo5Seconds,
        resetAllDemoData,
        timeoutModalOpen,
        setTimeoutModalOpen,
        lastExpiredSlotTime,
        activeTab,
        setActiveTab,
        sessionId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
