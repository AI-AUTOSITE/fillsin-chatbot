/**
 * Reservation Database Operations
 * 
 * Reusable functions for managing reservations/bookings
 * Includes: availability checking, CRUD operations, seat capacity validation
 */

import { supabase } from './client';
import type {
  Reservation,
  ReservationWithRestaurant,
  CreateReservationInput,
  UpdateReservationInput,
  AvailabilityCheck,
  AvailabilityResult,
  ReservationFilters,
  ReservationSummary,
  ReservationStatus,
} from '@/types/reservation';

// ============================================
// AVAILABILITY CHECKING
// ============================================

/**
 * Check if a reservation slot is available
 * Prevents double-booking and seat capacity overflow
 */
export async function checkAvailability(
  check: AvailabilityCheck
): Promise<AvailabilityResult> {
  try {
    const { date, time, party_size, restaurant_id } = check;

    // 1. Get restaurant capacity
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('total_seats')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return {
        available: false,
        reason: 'Restaurant not found',
      };
    }

    // 2. Get existing reservations for this date/time
   const { data: existingReservations, error: reservationsError } = await supabase
  .from('reservations')
  .select('party_size')
  .eq('restaurant_id', restaurant_id)
  .eq('reservation_date', date)
  .eq('reservation_time', time)
  .neq('status', 'cancelled');

// 3. Calculate total booked seats
const totalBooked = (existingReservations || []).reduce(
  (sum: number, res: { party_size: number }) => sum + res.party_size,
  0
);

    // 4. Check if new reservation would exceed capacity
    const newTotal = totalBooked + party_size;
    const totalSeats = restaurant.total_seats || 0;

    if (newTotal > totalSeats) {
      return {
        available: false,
        reason: `Not enough seats available. ${totalSeats - totalBooked} seats remaining.`,
        current_bookings: totalBooked,
        total_seats: totalSeats,
      };
    }

    return {
      available: true,
      current_bookings: totalBooked,
      total_seats: totalSeats,
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      available: false,
      reason: 'Error checking availability',
    };
  }
}

// ============================================
// CREATE RESERVATION
// ============================================

/**
 * Create a new reservation
 * Automatically checks availability before creating
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<{ data: Reservation | null; error: string | null }> {
  try {
    // 1. Check availability first
    const availability = await checkAvailability({
      date: input.reservation_date,
      time: input.reservation_time,
      party_size: input.party_size,
      restaurant_id: input.restaurant_id,
    });

    if (!availability.available) {
      return {
        data: null,
        error: availability.reason || 'Reservation not available',
      };
    }

    // 2. Create reservation
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        ...input,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return {
      data: null,
      error: error.message || 'Failed to create reservation',
    };
  }
}

// ============================================
// GET RESERVATIONS
// ============================================

/**
 * Get reservations with optional filters
 */
export async function getReservations(
  filters: ReservationFilters
): Promise<Reservation[]> {
  try {
    let query = supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    // Apply filters
    if (filters.restaurant_id) {
      query = query.eq('restaurant_id', filters.restaurant_id);
    }

    if (filters.date) {
      query = query.eq('reservation_date', filters.date);
    }

    if (filters.date_from) {
      query = query.gte('reservation_date', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('reservation_date', filters.date_to);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.guest_phone) {
      query = query.eq('guest_phone', filters.guest_phone);
    }

    if (filters.guest_name) {
      query = query.ilike('guest_name', `%${filters.guest_name}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting reservations:', error);
    return [];
  }
}

/**
 * Get a single reservation by ID
 */
export async function getReservationById(
  id: string
): Promise<Reservation | null> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting reservation:', error);
    return null;
  }
}

// ============================================
// UPDATE RESERVATION
// ============================================

/**
 * Update an existing reservation
 */
export async function updateReservation(
  id: string,
  input: UpdateReservationInput
): Promise<{ data: Reservation | null; error: string | null }> {
  try {
    // If changing date/time/party_size, check availability
    if (
      input.reservation_date ||
      input.reservation_time ||
      input.party_size
    ) {
      const currentReservation = await getReservationById(id);
      
      if (!currentReservation) {
        return { data: null, error: 'Reservation not found' };
      }

      const availability = await checkAvailability({
        date: input.reservation_date || currentReservation.reservation_date,
        time: input.reservation_time || currentReservation.reservation_time,
        party_size: input.party_size || currentReservation.party_size,
        restaurant_id: currentReservation.restaurant_id,
      });

      if (!availability.available) {
        return {
          data: null,
          error: availability.reason || 'New time slot not available',
        };
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return {
      data: null,
      error: error.message || 'Failed to update reservation',
    };
  }
}

// ============================================
// CANCEL RESERVATION
// ============================================

/**
 * Cancel a reservation
 */
export async function cancelReservation(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel reservation',
    };
  }
}

// ============================================
// GET TODAY'S RESERVATIONS
// ============================================

/**
 * Get all reservations for today
 * Useful for dashboard quick view
 */
export async function getTodaysReservations(
  restaurant_id: string
): Promise<Reservation[]> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return getReservations({
    restaurant_id,
    date: today,
    status: ['confirmed', 'pending'],
  });
}

// ============================================
// GET RESERVATION SUMMARY
// ============================================

/**
 * Get reservation statistics for a date range
 */
export async function getReservationSummary(
  restaurant_id: string,
  date_from?: string,
  date_to?: string
): Promise<ReservationSummary> {
  try {
    let query = supabase
      .from('reservations')
      .select('status, party_size')
      .eq('restaurant_id', restaurant_id);

    if (date_from) {
      query = query.gte('reservation_date', date_from);
    }

    if (date_to) {
      query = query.lte('reservation_date', date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const summary: ReservationSummary = {
      total_reservations: data?.length || 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      no_shows: 0,
      total_guests: 0,
    };

    data?.forEach((reservation: { party_size: number; status: string }) => {
  summary.total_guests += reservation.party_size;
  
  switch (reservation.status as ReservationStatus) {
        case 'confirmed':
        case 'pending':
          summary.confirmed++;
          break;
        case 'cancelled':
          summary.cancelled++;
          break;
        case 'completed':
          summary.completed++;
          break;
        case 'no-show':
          summary.no_shows++;
          break;
      }
    });

    return summary;
  } catch (error) {
    console.error('Error getting reservation summary:', error);
    return {
      total_reservations: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      no_shows: 0,
      total_guests: 0,
    };
  }
}