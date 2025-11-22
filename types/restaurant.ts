/**
 * Restaurant Type Definitions
 * 
 * Extensible types for restaurants and other business types
 * Can be reused for: restaurants, real estate, medical, etc.
 */

// ============================================
// BUSINESS TYPES (for future expansion)
// ============================================
export type BusinessType = 'restaurant' | 'real-estate' | 'medical' | 'salon' | 'other';

// ============================================
// OPERATING HOURS
// ============================================
export interface DaySchedule {
  open: string;    // e.g., "11:00"
  close: string;   // e.g., "22:00"
  closed: boolean; // Is this day closed?
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// ============================================
// RESTAURANT (Main Entity)
// ============================================
export interface Restaurant {
  id: string;
  name: string;
  business_type: BusinessType;
  
  // Capacity (restaurant-specific, null for other businesses)
  total_seats: number | null;
  
  // Contact Information
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  
  // Additional Info
  parking_info: string | null;
  accessibility_info: string | null;
  
  // Operating Hours
  operating_hours: OperatingHours;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================
// RESTAURANT SETTINGS
// ============================================
export interface CustomMessages {
  welcome: string;
  menu_intro: string;
  reservation_confirmed: string;
  reservation_reminder: string;
}

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  
  // Reservation Settings
  advance_booking_days: number;
  min_party_size: number;
  max_party_size: number;
  
  // Time Slot Settings
  slot_duration_minutes: number;
  booking_interval_minutes: number;
  
  // Notification Settings
  send_sms_confirmation: boolean;
  send_email_confirmation: boolean;
  send_reminder: boolean;
  reminder_hours_before: number;
  
  // Cancellation Policy
  cancellation_hours_before: number;
  
  // Custom Messages
  custom_messages: CustomMessages;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================
// CREATE / UPDATE TYPES (for forms)
// ============================================
export type CreateRestaurantInput = Omit<
  Restaurant,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;

export type UpdateSettingsInput = Partial<
  Omit<RestaurantSettings, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
>;