/**
 * Menu Item Type Definitions
 * 
 * Extensible types for menu items, products, services
 * Can be reused for: restaurant menus, service catalogs, product listings, etc.
 */

// ============================================
// MENU CATEGORIES
// ============================================
export type MenuCategory = 
  | 'appetizer'
  | 'main'
  | 'dessert'
  | 'drink'
  | 'special'
  | 'other';

// For future expansion to other industries
export type ServiceCategory = string; // e.g., 'consultation', 'treatment', 'viewing'

// ============================================
// DIETARY INFORMATION
// ============================================
export type Allergen = 
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'nuts'
  | 'peanuts'
  | 'wheat'
  | 'gluten'
  | 'soy'
  | 'sesame';

export type DietaryTag = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'organic'
  | 'low-carb'
  | 'keto';

// ============================================
// MENU ITEM (Main Entity)
// ============================================
export interface MenuItem {
  id: string;
  restaurant_id: string;
  
  // Organization
  category: MenuCategory | string; // string for future extensibility
  subcategory: string | null;
  
  // Item Details
  name: string;
  description: string | null;
  price: number;
  
  // Media
  image_url: string | null;
  
  // Availability
  is_available: boolean;
  
  // Dietary Information
  allergens: Allergen[] | string[];
  dietary_tags: DietaryTag[] | string[];
  
  // Display Order
  sort_order: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================
// MENU ITEM WITH CATEGORY INFO
// ============================================
export interface MenuItemWithCategory extends MenuItem {
  category_display: string; // Human-readable category name
}

// ============================================
// MENU BY CATEGORY (for display)
// ============================================
export interface MenuByCategory {
  category: MenuCategory | string;
  category_display: string;
  items: MenuItem[];
}

// ============================================
// CREATE / UPDATE TYPES (for forms)
// ============================================
export type CreateMenuItemInput = {
  restaurant_id: string;
  category: MenuCategory | string;
  subcategory?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  allergens?: (Allergen | string)[];
  dietary_tags?: (DietaryTag | string)[];
  sort_order?: number;
};

export type UpdateMenuItemInput = Partial<
  Omit<CreateMenuItemInput, 'restaurant_id'>
>;

// ============================================
// MENU FILTERS (for chatbot queries)
// ============================================
export interface MenuFilters {
  restaurant_id: string;
  category?: MenuCategory | MenuCategory[] | string | string[];
  dietary_tag?: DietaryTag | DietaryTag[] | string | string[];
  exclude_allergen?: Allergen | Allergen[] | string | string[];
  is_available?: boolean;
  search?: string; // Search by name or description
}

// ============================================
// CATEGORY DISPLAY NAMES
// ============================================
export const CATEGORY_DISPLAY_NAMES: Record<MenuCategory, string> = {
  appetizer: 'Appetizers',
  main: 'Main Courses',
  dessert: 'Desserts',
  drink: 'Drinks',
  special: 'Specials',
  other: 'Other',
};

// ============================================
// ALLERGEN DISPLAY NAMES
// ============================================
export const ALLERGEN_DISPLAY_NAMES: Record<Allergen, string> = {
  dairy: 'Dairy',
  eggs: 'Eggs',
  fish: 'Fish',
  shellfish: 'Shellfish',
  nuts: 'Tree Nuts',
  peanuts: 'Peanuts',
  wheat: 'Wheat',
  gluten: 'Gluten',
  soy: 'Soy',
  sesame: 'Sesame',
};

// ============================================
// DIETARY TAG DISPLAY NAMES
// ============================================
export const DIETARY_TAG_DISPLAY_NAMES: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
  halal: 'Halal',
  kosher: 'Kosher',
  organic: 'Organic',
  'low-carb': 'Low-Carb',
  keto: 'Keto',
};