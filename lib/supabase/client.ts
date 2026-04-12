import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
/** Publishable key (sb_publishable_…) or legacy anon JWT — cả hai đều dùng cho createClient */
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client. Creates once when URL and key are set.
 * Returns null if env vars are not configured (e.g. when using mock).
 * Typed with Database from database.types.ts (replace with generated types when using real project).
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (supabaseInstance !== null) return supabaseInstance;
  if (!url || !anonKey) return null;
  supabaseInstance = createClient<Database>(url, anonKey);
  return supabaseInstance;
}

/**
 * Use getSupabase() in repositories; returns null when env is not set (mock mode).
 */
