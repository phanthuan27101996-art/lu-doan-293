/**
 * Repository interface for data access.
 * Extends the concept from types/crud.ts with method names aligned to Supabase (insert, remove).
 */
export interface RepositoryQueryOptions {
  orderBy?: string;
  ascending?: boolean;
  /** Limit number of rows (Supabase: .range(offset, offset + limit - 1)) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

export interface IRepository<
  T extends { id: string },
  TCreate = Omit<T, 'id'>,
  TUpdate = Partial<T>,
> {
  getAll(options?: RepositoryQueryOptions): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  insert(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  remove(ids: string[]): Promise<void>;
  upsert?(data: TCreate | TCreate[]): Promise<T[]>;
}
