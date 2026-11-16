export type SlotStatus = 'available' | 'locked_by_user' | 'locked_by_other' | 'booked';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export type ServiceType = 'doctor' | 'diagnostic';

export interface TimeSlot {
  id: string;
  time: string;
  period: DayPeriod;
  status: SlotStatus;
  lockedUntil?: number;
  lockedBySessionId?: string;
  bookedBy?: {
    bookingId: string;
    tokenNumber: number;
    patientName: string;
    phone: string;
  };
}

export interface ServiceItem {
  id: string;
  type: ServiceType;
  title: string;
  subtitle: string;
  category: string;
  room: string;
  durationMinutes: number;
  price: string;
  badge: string;
  iconName: string;
}

export interface ActiveLock {
  slotId: string;
  serviceId: string;
  sessionId: string;
  lockedAt: number;
  expiresAt: number;
  draftName?: string;
  draftPhone?: string;
}

export interface BookingRecord {
  bookingId: string;
  tokenNumber: number;
  patientName: string;
  phone: string;
  serviceId: string;
  serviceTitle: string;
  serviceType: ServiceType;
  room: string;
  slotId: string;
  slotTime: string;
  bookedAt: number;
  status: 'waiting' | 'in_consultation' | 'completed';
}

export interface QueueState {
  currentServingToken: number;
  averageConsultationMinutes: number;
  lastUpdated: number;
  activeQueue: {
    tokenNumber: number;
    patientName: string;
    serviceTitle: string;
    status: 'in_consultation' | 'waiting' | 'completed';
    estimatedStartTime?: string;
    isCurrentUser?: boolean;
  }[];
}
