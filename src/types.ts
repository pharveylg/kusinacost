export type UnitType = 'kg' | 'g' | 'L' | 'mL' | 'pcs' | 'tbsp' | 'tsp' | 'cup' | 'pack' | 'bottle' | 'can';

export interface Ingredient {
  id: string;
  name: string;
  purchasePrice: number; // in PHP
  purchaseQty: number;
  purchaseUnit: UnitType;
  category: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  qty: number;
  unit: UnitType;
}

// ─── Overhead / Utility Settings (global) ──────────────────────────────────
export interface OverheadSettings {
  // LPG
  lpgTankPrice: number;       // ₱ per tank (e.g., 11kg tank)
  lpgTankKg: number;          // kg per tank (e.g., 11)
  lpgBurnRateKgPerHr: number; // average kg consumed per hour of cooking

  // Electricity
  electricityPerKwh: number;  // ₱ per kWh

  // Labor
  laborRatePerHour: number;   // ₱ per hour (daily wage / working hours)

  // Packaging default per serving
  packagingPerServing: number; // ₱ per serving default
}

// ─── Appliance Types ────────────────────────────────────────────────────────
export const APPLIANCE_TYPES = ['lpg-stove', 'lpg-oven', 'electric', 'other'] as const;
export type ApplianceType = (typeof APPLIANCE_TYPES)[number];

export interface ApplianceUsage {
  id: string;
  name: string;          // custom name (e.g., "Charcoal oven", "Main burner", "Rice cooker")
  type: ApplianceType;   // lg-stove, lpg-oven, electric, other
  minutes: number;       // time in minutes
  watts?: number;        // for electric only
}

// ─── Per-Recipe Labor & Overhead ───────────────────────────────────────────
export interface RecipeOverhead {
  // Labor
  prepTimeMin: number;       // minutes for prep (chopping, marinating, etc.)
  cookingTimeMin: number;    // minutes actively cooking
  laborPax: number;          // how many people working (e.g., 2 helpers + 1 cook = 3 pax)

  // Appliances - can have multiple
  appliances: ApplianceUsage[];

  // Packaging
  packagingPerServing: number; // ₱ override per serving

  // Miscellaneous / other overhead
  otherCost: number;           // ₱ flat misc cost (water, condiment wastage, etc.)
  otherCostLabel: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  servings: number;
  sellingPrice: number;
  ingredients: RecipeIngredient[];
  overhead: RecipeOverhead;
  notes: string;
}

// ─── Sales Records ──────────────────────────────────────────────────────────
export interface SaleRecord {
  id: string;
  recipeId: string;
  date: string;              // ISO date string (YYYY-MM-DD)
  batchesMade: number;       // how many batches were cooked
  servingsSold: number;      // actual servings sold
  servingsWasted: number;    // unsold / spoiled / gave away
  notes: string;
  createdAt: string;         // timestamp
}

export type AppView =
  | 'dashboard'
  | 'ingredients'
  | 'recipes'
  | 'recipe-detail'
  | 'add-ingredient'
  | 'edit-ingredient'
  | 'add-recipe'
  | 'edit-recipe'
  | 'sales'
  | 'add-sale'
  | 'edit-sale'
  | 'settings'
  | 'masterclass'
  | 'mexican-masterclass'
  | 'chef-ej-masterclass';

// ─── Guide Access Control ───────────────────────────────────────────────────
// Maps guide view name → array of allowed email addresses.
// Empty array or missing key = everyone can access (no restriction).
export type GuideAccessMap = Record<string, string[]>;

export interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  overheadSettings: OverheadSettings;
  sales: SaleRecord[];
  guideAccess: GuideAccessMap;
  view: AppView;
  selectedRecipeId: string | null;
  selectedIngredientId: string | null;
  selectedSaleId: string | null;
}