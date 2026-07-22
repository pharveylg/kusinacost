import { supabase, isSupabaseConfigured } from './supabase';
import type { Ingredient, Recipe, SaleRecord, OverheadSettings } from '../types';

// ─── Data Service: abstracts localStorage vs Supabase ────────────────────
//
// - When Supabase IS configured: all writes go to Supabase, reads fetch fresh.
// - When NOT configured: fall back to localStorage (single-user local mode).
//
// The store uses this service for persistence so the UI code stays the same.

type UserId = string | null;

function lsKey(userId: UserId) {
  return userId ? `kusinacost_data_${userId}` : 'kusinacost_data_v4';
}

export const dataService = {
  async loadInitial(userId: UserId): Promise<{
    ingredients: Ingredient[];
    recipes: Recipe[];
    sales: SaleRecord[];
    overheadSettings: OverheadSettings | null;
  }> {
    if (isSupabaseConfigured && supabase && userId) {
      const [ings, recs, salesRes, settingsRes] = await Promise.all([
        supabase.from('ingredients').select('*').eq('user_id', userId),
        supabase.from('recipes').select('*').eq('user_id', userId),
        supabase.from('sales').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('overhead_settings').select('*').eq('user_id', userId).maybeSingle(),
      ]);
      return {
        ingredients: (ings.data || []).map(mapIngredient),
        recipes: (recs.data || []).map(mapRecipe),
        sales: (salesRes.data || []).map(mapSale),
        overheadSettings: settingsRes.data ? mapSettings(settingsRes.data) : null,
      };
    }
    // LocalStorage mode
    try {
      const raw = localStorage.getItem(lsKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ingredients: parsed.ingredients || [],
          recipes: parsed.recipes || [],
          sales: parsed.sales || [],
          overheadSettings: parsed.overheadSettings || null,
        };
      }
    } catch {
      // ignore
    }
    return { ingredients: [], recipes: [], sales: [], overheadSettings: null };
  },

  // ─── Ingredient ops ───────────────────────────────────────────────────
  async saveIngredient(ingredient: Ingredient, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const row = {
        id: ingredient.id,
        user_id: userId,
        name: ingredient.name,
        purchase_price: ingredient.purchasePrice,
        purchase_qty: ingredient.purchaseQty,
        purchase_unit: ingredient.purchaseUnit,
        category: ingredient.category,
      };
      const { error } = await supabase.from('ingredients').upsert(row);
      if (error) throw error;
      return;
    }
    // local
    const all = await dataService.loadInitial(userId);
    const list = all.ingredients.some((i) => i.id === ingredient.id)
      ? all.ingredients.map((i) => (i.id === ingredient.id ? ingredient : i))
      : [...all.ingredients, ingredient];
    await persistLocal(userId, { ingredients: list });
  },

  async deleteIngredient(id: string, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const { error } = await supabase.from('ingredients').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { ingredients: all.ingredients.filter((i) => i.id !== id) });
  },

  // ─── Recipe ops ───────────────────────────────────────────────────────
  async saveRecipe(recipe: Recipe, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const row = {
        id: recipe.id,
        user_id: userId,
        name: recipe.name,
        category: recipe.category,
        servings: recipe.servings,
        selling_price: recipe.sellingPrice,
        ingredients: recipe.ingredients,
        overhead: recipe.overhead,
        notes: recipe.notes,
      };
      const { error } = await supabase.from('recipes').upsert(row);
      if (error) throw error;
      return;
    }
    const all = await dataService.loadInitial(userId);
    const list = all.recipes.some((r) => r.id === recipe.id)
      ? all.recipes.map((r) => (r.id === recipe.id ? recipe : r))
      : [...all.recipes, recipe];
    await persistLocal(userId, { recipes: list });
  },

  async deleteRecipe(id: string, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const { error } = await supabase.from('recipes').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { recipes: all.recipes.filter((r) => r.id !== id) });
  },

  // ─── Sale ops ─────────────────────────────────────────────────────────
  async saveSale(sale: SaleRecord, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const row = {
        id: sale.id,
        user_id: userId,
        recipe_id: sale.recipeId,
        date: sale.date,
        batches_made: sale.batchesMade,
        servings_sold: sale.servingsSold,
        servings_wasted: sale.servingsWasted,
        notes: sale.notes,
        created_at: sale.createdAt,
      };
      const { error } = await supabase.from('sales').upsert(row);
      if (error) throw error;
      return;
    }
    const all = await dataService.loadInitial(userId);
    const list = all.sales.some((s) => s.id === sale.id)
      ? all.sales.map((s) => (s.id === sale.id ? sale : s))
      : [...all.sales, sale];
    await persistLocal(userId, { sales: list });
  },

  async deleteSale(id: string, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const { error } = await supabase.from('sales').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { sales: all.sales.filter((s) => s.id !== id) });
  },

  // ─── Overhead Settings ────────────────────────────────────────────────
  async saveOverheadSettings(settings: OverheadSettings, userId: UserId): Promise<void> {
    if (isSupabaseConfigured && supabase && userId) {
      const row = {
        user_id: userId,
        lpg_tank_price: settings.lpgTankPrice,
        lpg_tank_kg: settings.lpgTankKg,
        lpg_burn_rate_kg_per_hr: settings.lpgBurnRateKgPerHr,
        electricity_per_kwh: settings.electricityPerKwh,
        labor_rate_per_hour: settings.laborRatePerHour,
        packaging_per_serving: settings.packagingPerServing,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('overhead_settings').upsert(row);
      if (error) throw error;
      return;
    }
    await persistLocal(userId, { overheadSettings: settings });
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────

async function persistLocal(
  userId: UserId,
  patch: { ingredients?: Ingredient[]; recipes?: Recipe[]; sales?: SaleRecord[]; overheadSettings?: OverheadSettings }
) {
  const all = await dataService.loadInitial(userId);
  const merged = {
    ingredients: patch.ingredients ?? all.ingredients,
    recipes: patch.recipes ?? all.recipes,
    sales: patch.sales ?? all.sales,
    overheadSettings: patch.overheadSettings ?? all.overheadSettings,
  };
  localStorage.setItem(lsKey(userId), JSON.stringify(merged));
}

function mapIngredient(r: any): Ingredient {
  return {
    id: r.id,
    name: r.name,
    purchasePrice: Number(r.purchase_price),
    purchaseQty: Number(r.purchase_qty),
    purchaseUnit: r.purchase_unit,
    category: r.category,
  };
}

function mapRecipe(r: any): Recipe {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    servings: r.servings,
    sellingPrice: Number(r.selling_price),
    ingredients: r.ingredients || [],
    overhead: r.overhead || {},
    notes: r.notes || '',
  };
}

function mapSale(r: any): SaleRecord {
  return {
    id: r.id,
    recipeId: r.recipe_id,
    date: r.date,
    batchesMade: r.batches_made,
    servingsSold: r.servings_sold,
    servingsWasted: r.servings_wasted,
    notes: r.notes || '',
    createdAt: r.created_at,
  };
}

function mapSettings(r: any): OverheadSettings {
  return {
    lpgTankPrice: Number(r.lpg_tank_price),
    lpgTankKg: Number(r.lpg_tank_kg),
    lpgBurnRateKgPerHr: Number(r.lpg_burn_rate_kg_per_hr),
    electricityPerKwh: Number(r.electricity_per_kwh),
    laborRatePerHour: Number(r.labor_rate_per_hour),
    packagingPerServing: Number(r.packaging_per_serving),
  };
}
