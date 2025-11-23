/**
 * Supabase Client
 * 
 * Reusable Supabase client configuration
 * Can be used across all projects (restaurants, real estate, medical, etc.)
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Privacy: Don't store sessions in localStorage
  },
});

// Export types for TypeScript
//export type { Database } from '@/types/supabase';