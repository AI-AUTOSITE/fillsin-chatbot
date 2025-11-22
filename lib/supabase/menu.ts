/**
 * Menu Item Database Operations
 * 
 * Reusable functions for managing menu items/products/services
 * Includes: CRUD operations, filtering by category/dietary tags, search
 */

import { supabase } from './client';
import type {
  MenuItem,
  MenuByCategory,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  MenuFilters,
  MenuCategory,
  CATEGORY_DISPLAY_NAMES,
} from '@/types/menu';

// ============================================
// GET MENU ITEMS
// ============================================

/**
 * Get all menu items for a restaurant with optional filters
 */
export async function getMenuItems(
  filters: MenuFilters
): Promise<MenuItem[]> {
  try {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', filters.restaurant_id)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // Filter by category
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        query = query.in('category', filters.category);
      } else {
        query = query.eq('category', filters.category);
      }
    }

    // Filter by availability
    if (filters.is_available !== undefined) {
      query = query.eq('is_available', filters.is_available);
    }

    // Filter by dietary tags
    if (filters.dietary_tag) {
      const tags = Array.isArray(filters.dietary_tag)
        ? filters.dietary_tag
        : [filters.dietary_tag];
      
      query = query.overlaps('dietary_tags', tags);
    }

    // Exclude allergens
    if (filters.exclude_allergen) {
      const allergens = Array.isArray(filters.exclude_allergen)
        ? filters.exclude_allergen
        : [filters.exclude_allergen];
      
      // Items that DON'T contain these allergens
      query = query.not('allergens', 'ov', allergens);
    }

    // Search by name or description
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting menu items:', error);
    return [];
  }
}

/**
 * Get menu items organized by category
 */
export async function getMenuByCategory(
  restaurant_id: string,
  only_available: boolean = true
): Promise<MenuByCategory[]> {
  try {
    const items = await getMenuItems({
      restaurant_id,
      is_available: only_available ? true : undefined,
    });

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const category = item.category as MenuCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    // Convert to array format
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      category_display: CATEGORY_DISPLAY_NAMES[category as MenuCategory] || category,
      items,
    }));
  } catch (error) {
    console.error('Error getting menu by category:', error);
    return [];
  }
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItemById(
  id: string
): Promise<MenuItem | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting menu item:', error);
    return null;
  }
}

// ============================================
// CREATE MENU ITEM
// ============================================

/**
 * Create a new menu item
 */
export async function createMenuItem(
  input: CreateMenuItemInput
): Promise<{ data: MenuItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return {
      data: null,
      error: error.message || 'Failed to create menu item',
    };
  }
}

// ============================================
// UPDATE MENU ITEM
// ============================================

/**
 * Update an existing menu item
 */
export async function updateMenuItem(
  id: string,
  input: UpdateMenuItemInput
): Promise<{ data: MenuItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return {
      data: null,
      error: error.message || 'Failed to update menu item',
    };
  }
}

// ============================================
// DELETE MENU ITEM
// ============================================

/**
 * Delete a menu item
 */
export async function deleteMenuItem(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete menu item',
    };
  }
}

// ============================================
// TOGGLE AVAILABILITY
// ============================================

/**
 * Toggle menu item availability (quick action)
 */
export async function toggleMenuItemAvailability(
  id: string,
  is_available: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    return {
      success: false,
      error: error.message || 'Failed to toggle availability',
    };
  }
}

// ============================================
// SEARCH MENU
// ============================================

/**
 * Search menu items by text query
 * Useful for chatbot responses
 */
export async function searchMenu(
  restaurant_id: string,
  query: string
): Promise<MenuItem[]> {
  return getMenuItems({
    restaurant_id,
    search: query,
    is_available: true,
  });
}

/**
 * Get menu items matching dietary requirements
 * Useful for chatbot: "Do you have vegetarian options?"
 */
export async function getMenuByDietaryRequirement(
  restaurant_id: string,
  dietary_tag: string,
  exclude_allergens?: string[]
): Promise<MenuItem[]> {
  return getMenuItems({
    restaurant_id,
    dietary_tag,
    exclude_allergen: exclude_allergens,
    is_available: true,
  });
}

// ============================================
// REORDER MENU ITEMS
// ============================================

/**
 * Update sort order for multiple items
 * Useful for drag-and-drop reordering in dashboard
 */
export async function reorderMenuItems(
  updates: Array<{ id: string; sort_order: number }>
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Update all items in a transaction-like manner
    const promises = updates.map((update) =>
      supabase
        .from('menu_items')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)
    );

    await Promise.all(promises);

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error reordering menu items:', error);
    return {
      success: false,
      error: error.message || 'Failed to reorder menu items',
    };
  }
}