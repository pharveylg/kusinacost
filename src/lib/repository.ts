import { supabase, isSupabaseConfigured } from './supabase';
import type { Ingredient, Recipe, OverheadSettings, SaleRecord } from '../types';

/**
 * Repository layer — kept simple for future expansion.
 * Most CRUD goes through `dataService` which handles localStorage vs Supabase routing.
 */
export interface DataRepository {
  loadAll(userId: string | null): Promise<{
    ingredients: Ingredient[];
    recipes: Recipe[];
    sales: SaleRecord[];
    overheadSettings: OverheadSettings | null;
  }>;
}

export const isBackendConfigured = isSupabaseConfigured;

export function getSupabaseClient() {
  return supabase;
}
