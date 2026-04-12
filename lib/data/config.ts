/**
 * Data source: mock hoặc Supabase.
 * - `VITE_DATA_SOURCE=mock` | `supabase`: ép chế độ đó.
 * - Không set: nếu có `VITE_SUPABASE_URL` + khóa publishable/anon → dùng **supabase**, ngược lại **mock**.
 */
export type DataSource = 'mock' | 'supabase';

function hasSupabaseEnv(): boolean {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const key = (
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  )?.trim();
  return Boolean(url && key);
}

export function getDataSource(): DataSource {
  const raw = (import.meta.env.VITE_DATA_SOURCE as string | undefined)?.trim().toLowerCase();
  if (raw === 'mock') return 'mock';
  if (raw === 'supabase') return 'supabase';
  return hasSupabaseEnv() ? 'supabase' : 'mock';
}

export function isSupabase(): boolean {
  return getDataSource() === 'supabase';
}

export function isMock(): boolean {
  return getDataSource() === 'mock';
}
