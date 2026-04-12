import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import type { IRepository, RepositoryQueryOptions } from './repository';

function ensureClient() {
  const client = getSupabase();
  if (!client)
    throw new Error(
      'Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).',
    );
  return client;
}

/**
 * Supabase-backed repository implementing IRepository.
 * Supports optional select string for relation queries (e.g. '*, phong_ban(ten_phong_ban)').
 */
export class SupabaseRepository<T extends { id: string }> implements IRepository<T> {
  constructor(
    private readonly tableName: string,
    private readonly options?: { select?: string },
  ) {}

  private get select() {
    return this.options?.select ?? '*';
  }

  async getAll(options?: RepositoryQueryOptions): Promise<T[]> {
    const supabase = ensureClient();
    let query = supabase.from(this.tableName).select(this.select);
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit;
    if (limit != null) {
      query = query.range(offset, offset + limit - 1);
    } else if (offset > 0) {
      query = query.range(offset, 999999);
    }
    const { data, error } = await query;
    if (error) handleSupabaseError(error);
    return (data ?? []) as T[];
  }

  async getById(id: string): Promise<T | null> {
    const supabase = ensureClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select(this.select)
      .eq('id', id)
      .maybeSingle();
    if (error) handleSupabaseError(error);
    return data as T | null;
  }

  async insert(row: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const supabase = ensureClient();
    const payload = { ...row } as Record<string, unknown>;
    if (payload.id === undefined) delete payload.id;
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(payload)
      .select(this.select)
      .single();
    if (error) handleSupabaseError(error);
    return data as T;
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    const supabase = ensureClient();
    const payload = { ...partial } as Record<string, unknown>;
    delete payload.id;
    const { data, error } = await supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select(this.select)
      .single();
    if (error) handleSupabaseError(error);
    return data as T;
  }

  async remove(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const supabase = ensureClient();
    const { error } = await supabase.from(this.tableName).delete().in('id', ids);
    if (error) handleSupabaseError(error);
  }

  async upsert(rows: (Omit<T, 'id'> & { id?: string }) | ((Omit<T, 'id'> & { id?: string })[])): Promise<T[]> {
    const supabase = ensureClient();
    const arr = Array.isArray(rows) ? rows : [rows];
    const payload = arr.map((r) => ({ ...r } as Record<string, unknown>));
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(payload, { onConflict: 'id' })
      .select(this.select);
    if (error) handleSupabaseError(error);
    return (data ?? []) as T[];
  }
}
