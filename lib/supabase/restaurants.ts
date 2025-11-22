/**
 * Restaurant Database Operations
 * 
 * Reusable functions for managing restaurant/business information
 * Includes: CRUD operations, settings management
 */

import { supabase } from './client';
import type {
  Restaurant,
  RestaurantSettings,
  CreateRestaurantInput,
  UpdateRestaurantInput,
  UpdateSettingsInput,
} from '@/types/restaurant';

// ============================================
// GET RESTAURANT
// ============================================

/**
 * Get restaurant by ID
 */
export async function getRestaurant(
  id: string
): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting restaurant:', error);
    return null;
  }
}

/**
 * Get all restaurants (for multi-restaurant support)
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting restaurants:', error);
    return [];
  }
}

// ============================================
// CREATE RESTAURANT
// ============================================

/**
 * Create a new restaurant
 */
export async function createRestaurant(
  input: CreateRestaurantInput
): Promise<{ data: Restaurant | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create default settings for new restaurant
    if (data) {
      await createDefaultSettings(data.id);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return {
      data: null,
      error: error.message || 'Failed to create restaurant',
    };
  }
}

// ============================================
// UPDATE RESTAURANT
// ============================================

/**
 * Update restaurant information
 */
export async function updateRestaurant(
  id: string,
  input: UpdateRestaurantInput
): Promise<{ data: Restaurant | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating restaurant:', error);
    return {
      data: null,
      error: error.message || 'Failed to update restaurant',
    };
  }
}

// ============================================
// DELETE RESTAURANT
// ============================================

/**
 * Delete a restaurant (and all related data via CASCADE)
 */
export async function deleteRestaurant(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting restaurant:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete restaurant',
    };
  }
}

// ============================================
// RESTAURANT SETTINGS
// ============================================

/**
 * Get restaurant settings
 */
export async function getRestaurantSettings(
  restaurant_id: string
): Promise<RestaurantSettings | null> {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting restaurant settings:', error);
    return null;
  }
}

/**
 * Update restaurant settings
 */
export async function updateRestaurantSettings(
  restaurant_id: string,
  input: UpdateSettingsInput
): Promise<{ data: RestaurantSettings | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(input)
      .eq('restaurant_id', restaurant_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating restaurant settings:', error);
    return {
      data: null,
      error: error.message || 'Failed to update settings',
    };
  }
}

/**
 * Create default settings for a new restaurant
 */
async function createDefaultSettings(
  restaurant_id: string
): Promise<void> {
  try {
    await supabase
      .from('restaurant_settings')
      .insert({
        restaurant_id,
        // Default values are set in the database schema
      });
  } catch (error) {
    console.error('Error creating default settings:', error);
  }
}

// ============================================
// OPERATING HOURS HELPERS
// ============================================

/**
 * Check if restaurant is open at a specific date/time
 */
export function isRestaurantOpen(
  restaurant: Restaurant,
  date: Date
): boolean {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  
  const dayName = days[date.getDay()] as keyof typeof restaurant.operating_hours;
  const schedule = restaurant.operating_hours[dayName];

  if (schedule.closed) {
    return false;
  }

  const currentTime = date.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= schedule.open && currentTime <= schedule.close;
}

/**
 * Get today's operating hours
 */
export function getTodaysHours(
  restaurant: Restaurant
): { open: string; close: string; closed: boolean } {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  
  const today = new Date();
  const dayName = days[today.getDay()] as keyof typeof restaurant.operating_hours;
  
  return restaurant.operating_hours[dayName];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get restaurant with settings in one call
 */
export async function getRestaurantWithSettings(
  restaurant_id: string
): Promise<{
  restaurant: Restaurant | null;
  settings: RestaurantSettings | null;
}> {
  const [restaurant, settings] = await Promise.all([
    getRestaurant(restaurant_id),
    getRestaurantSettings(restaurant_id),
  ]);

  return { restaurant, settings };
}

/**
 * Format restaurant address for display
 */
export function formatAddress(restaurant: Restaurant): string {
  if (!restaurant.address) {
    return 'Address not available';
  }
  return restaurant.address;
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null): string {
  if (!phone) {
    return 'Phone not available';
  }
  
  // Simple US phone formatting (can be extended for international)
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}