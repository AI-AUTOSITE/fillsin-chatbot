/**
 * Reservation Type Definitions
 * 
 * Extensible types for reservations, appointments, bookings
 * Can be reused for: restaurant reservations, medical appointments, property viewings, etc.
 */

// ============================================
// RESERVATION STATUS
// ============================================
export type ReservationStatus = 
  | 'pending'    // Awaiting confirmation
  | 'confirmed'  // Confirmed reservation
  | 'cancelled'  // Cancelled by guest or restaurant
  | 'completed'  // Guest showed up and completed
  | 'no-show';   // Guest didn't show up

// ============================================
// RESERVATION (Main Entity)
// ============================================
export interface Reservation {
  id: string;
  restaurant_id: string;
  
  // Reservation Details
  reservation_date: string;  // ISO date: "2025-11-22"
  reservation_time: string;  // Time: "19:00"
  party_size: number;
  
  // Guest Information
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  
  // Additional Details
  special_requests: string | null;
  
  // Status
  status: ReservationStatus;
  
  // Notification Tracking
  confirmation_sent: boolean;
  reminder_sent: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================
// RESERVATION WITH RESTAURANT INFO
// ============================================
export interface ReservationWithRestaurant extends Reservation {
  restaurant: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
  };
}

// ============================================
// RESERVATION AVAILABILITY CHECK
// ============================================
export interface AvailabilityCheck {
  date: string;
  time: string;
  party_size: number;
  restaurant_id: string;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string; // If not available, why?
  current_bookings?: number; // Total people already booked
  total_seats?: number;
}

// ============================================
// CREATE / UPDATE TYPES (for forms)
// ============================================
export type CreateReservationInput = {
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  special_requests?: string;
};

export type UpdateReservationInput = {
  reservation_date?: string;
  reservation_time?: string;
  party_size?: number;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  special_requests?: string;
  status?: ReservationStatus;
};

// ============================================
// RESERVATION FILTERS (for dashboard)
// ============================================
export interface ReservationFilters {
  restaurant_id?: string;
  date?: string;          // Specific date
  date_from?: string;     // Date range start
  date_to?: string;       // Date range end
  status?: ReservationStatus | ReservationStatus[];
  guest_phone?: string;   // Search by phone
  guest_name?: string;    // Search by name
}

// ============================================
// RESERVATION SUMMARY (for analytics)
// ============================================
export interface ReservationSummary {
  total_reservations: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  no_shows: number;
  total_guests: number;
}