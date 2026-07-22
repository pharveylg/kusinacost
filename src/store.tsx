import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  Ingredient,
  Recipe,
  RecipeOverhead,
  ApplianceUsage,
  OverheadSettings,
  SaleRecord,
  AppView,
  AppState,
} from './types';
import { dataService } from './lib/dataService';
import { isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './lib/auth';

// ─── Default Overhead Settings (PH market 2024-2026) ───────────────────────
export const defaultOverheadSettings: OverheadSettings = {
  lpgTankPrice: 1050,
  lpgTankKg: 11,
  lpgBurnRateKgPerHr: 0.8,
  electricityPerKwh: 12,
  laborRatePerHour: 75,
  packagingPerServing: 5,
};

export const defaultRecipeOverhead: RecipeOverhead = {
  prepTimeMin: 15,
  cookingTimeMin: 30,
  laborPax: 1,
  appliances: [],
  packagingPerServing: 5,
  otherCost: 0,
  otherCostLabel: '',
};

// ─── Helper to create default appliance list ─────────────────────────────
export function defaultAppliances(overhead: RecipeOverhead): ApplianceUsage[] {
  const hasStove = overhead.prepTimeMin > 0 || overhead.cookingTimeMin > 0;
  const appliances: ApplianceUsage[] = [];
  if (hasStove) {
    const stoveMins = Math.max(overhead.prepTimeMin, overhead.cookingTimeMin, 15);
    appliances.push({
      id: 'default-stove',
      name: 'Stove / Burner',
      type: 'lpg-stove',
      minutes: stoveMins,
    });
  }
  return appliances;
}

// ─── Sample Data (used when no data exists for first-time users) ─────────
const sampleIngredients: Ingredient[] = [
  { id: '1', name: 'Bigas (Rice)', purchasePrice: 55, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
  { id: '2', name: 'Manok (Chicken)', purchasePrice: 180, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
  { id: '3', name: 'Baboy (Pork)', purchasePrice: 280, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
  { id: '4', name: 'Sibuyas (Onion)', purchasePrice: 15, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Vegetables' },
  { id: '5', name: 'Bawang (Garlic)', purchasePrice: 10, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Vegetables' },
  { id: '6', name: 'Kamatis (Tomato)', purchasePrice: 10, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Vegetables' },
  { id: '7', name: 'Toyo (Soy Sauce)', purchasePrice: 25, purchaseQty: 350, purchaseUnit: 'mL', category: 'Condiments' },
  { id: '8', name: 'Suka (Vinegar)', purchasePrice: 20, purchaseQty: 350, purchaseUnit: 'mL', category: 'Condiments' },
  { id: '9', name: 'Cooking Oil', purchasePrice: 85, purchaseQty: 1, purchaseUnit: 'L', category: 'Condiments' },
  { id: '10', name: 'Laurel (Bay Leaves)', purchasePrice: 10, purchaseQty: 1, purchaseUnit: 'pack', category: 'Spices' },
  { id: '11', name: 'Pamintang Buo (Peppercorn)', purchasePrice: 15, purchaseQty: 1, purchaseUnit: 'pack', category: 'Spices' },
  { id: '12', name: 'Asukal (Sugar)', purchasePrice: 70, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
  { id: '13', name: 'Gata (Coconut Milk)', purchasePrice: 35, purchaseQty: 400, purchaseUnit: 'mL', category: 'Canned Goods' },
  { id: '14', name: 'Luya (Ginger)', purchasePrice: 8, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Spices' },
  { id: '15', name: 'Patatas (Potato)', purchasePrice: 60, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
  { id: '16', name: 'Sili (Chili)', purchasePrice: 5, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Vegetables' },
];

const sampleRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Chicken Adobo',
    category: 'Ulam',
    servings: 5,
    sellingPrice: 65,
    notes: 'Best seller — serve with steamed rice',
    overhead: {
      prepTimeMin: 15,
      cookingTimeMin: 45,
      laborPax: 1,
      appliances: [{ id: 'stove1', name: 'Main Burner', type: 'lpg-stove', minutes: 45 }],
      packagingPerServing: 5,
      otherCost: 0,
      otherCostLabel: '',
    },
    ingredients: [
      { ingredientId: '2', qty: 1, unit: 'kg' },
      { ingredientId: '7', qty: 80, unit: 'mL' },
      { ingredientId: '8', qty: 60, unit: 'mL' },
      { ingredientId: '5', qty: 1, unit: 'pcs' },
      { ingredientId: '4', qty: 1, unit: 'pcs' },
      { ingredientId: '10', qty: 0.5, unit: 'pack' },
      { ingredientId: '11', qty: 0.25, unit: 'pack' },
    ],
  },
  {
    id: 'r2',
    name: 'Pork Sinigang',
    category: 'Sabaw',
    servings: 6,
    sellingPrice: 70,
    notes: 'Sour soup — use sampalok for authentic taste',
    overhead: {
      prepTimeMin: 20,
      cookingTimeMin: 60,
      laborPax: 1,
      appliances: [{ id: 'stove2', name: 'Large Pot', type: 'lpg-stove', minutes: 60 }],
      packagingPerServing: 7,
      otherCost: 15,
      otherCostLabel: 'Sampalok mix packet',
    },
    ingredients: [
      { ingredientId: '3', qty: 0.75, unit: 'kg' },
      { ingredientId: '6', qty: 2, unit: 'pcs' },
      { ingredientId: '4', qty: 1, unit: 'pcs' },
      { ingredientId: '16', qty: 3, unit: 'pcs' },
    ],
  },
  {
    id: 'r3',
    name: 'Ginataang Manok',
    category: 'Ulam',
    servings: 5,
    sellingPrice: 75,
    notes: 'Creamy coconut chicken — popular during rainy days',
    overhead: {
      prepTimeMin: 15,
      cookingTimeMin: 40,
      laborPax: 1,
      appliances: [
        { id: 'stove3', name: 'Main Burner', type: 'lpg-stove', minutes: 30 },
        { id: 'elec3', name: 'Rice Cooker', type: 'electric', minutes: 45, watts: 700 },
      ],
      packagingPerServing: 5,
      otherCost: 0,
      otherCostLabel: '',
    },
    ingredients: [
      { ingredientId: '2', qty: 0.8, unit: 'kg' },
      { ingredientId: '13', qty: 400, unit: 'mL' },
      { ingredientId: '14', qty: 1, unit: 'pcs' },
      { ingredientId: '5', qty: 1, unit: 'pcs' },
      { ingredientId: '4', qty: 1, unit: 'pcs' },
      { ingredientId: '16', qty: 2, unit: 'pcs' },
    ],
  },
];

// ─── Actions ───────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_VIEW'; view: AppView; recipeId?: string; ingredientId?: string; saleId?: string }
  | { type: 'HYDRATE'; ingredients: Ingredient[]; recipes: Recipe[]; sales: SaleRecord[]; overheadSettings: OverheadSettings }
  | { type: 'ADD_INGREDIENT'; ingredient: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; ingredient: Ingredient }
  | { type: 'DELETE_INGREDIENT'; id: string }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'UPDATE_RECIPE'; recipe: Recipe }
  | { type: 'DELETE_RECIPE'; id: string }
  | { type: 'UPDATE_OVERHEAD_SETTINGS'; settings: OverheadSettings }
  | { type: 'ADD_SALE'; sale: SaleRecord }
  | { type: 'UPDATE_SALE'; sale: SaleRecord }
  | { type: 'DELETE_SALE'; id: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        view: action.view,
        selectedRecipeId: action.recipeId ?? null,
        selectedIngredientId: action.ingredientId ?? null,
        selectedSaleId: action.saleId ?? null,
      };
    case 'HYDRATE':
      return {
        ...state,
        ingredients: action.ingredients,
        recipes: action.recipes,
        sales: action.sales,
        overheadSettings: action.overheadSettings,
      };
    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, action.ingredient] };
    case 'UPDATE_INGREDIENT':
      return { ...state, ingredients: state.ingredients.map((i) => (i.id === action.ingredient.id ? action.ingredient : i)) };
    case 'DELETE_INGREDIENT':
      return { ...state, ingredients: state.ingredients.filter((i) => i.id !== action.id) };
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.recipe] };
    case 'UPDATE_RECIPE':
      return { ...state, recipes: state.recipes.map((r) => (r.id === action.recipe.id ? action.recipe : r)) };
    case 'DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter((r) => r.id !== action.id) };
    case 'UPDATE_OVERHEAD_SETTINGS':
      return { ...state, overheadSettings: action.settings };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.sale] };
    case 'UPDATE_SALE':
      return { ...state, sales: state.sales.map((s) => (s.id === action.sale.id ? action.sale : s)) };
    case 'DELETE_SALE':
      return { ...state, sales: state.sales.filter((s) => s.id !== action.id) };
    default:
      return state;
  }
}

const initialState: AppState = {
  ingredients: sampleIngredients,
  recipes: sampleRecipes,
  sales: [],
  overheadSettings: defaultOverheadSettings,
  view: 'dashboard',
  selectedRecipeId: null,
  selectedIngredientId: null,
  selectedSaleId: null,
};

// ─── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const [state, dispatch] = useReducer(reducer, initialState);

  // ─── Hydrate on mount & when user changes ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // When Supabase is configured, wait for auth to settle
      if (isSupabaseConfigured && auth.loading) return;
      if (isSupabaseConfigured && !userId) {
        // Authenticated, but no user — clear state
        if (!cancelled) {
          dispatch({
            type: 'HYDRATE',
            ingredients: [],
            recipes: [],
            sales: [],
            overheadSettings: defaultOverheadSettings,
          });
        }
        return;
      }

      const data = await dataService.loadInitial(userId);
      if (cancelled) return;

      // First-time user (no data anywhere) — seed with samples
      const isFirstTime =
        data.ingredients.length === 0 &&
        data.recipes.length === 0 &&
        data.sales.length === 0;

      dispatch({
        type: 'HYDRATE',
        ingredients: isFirstTime ? sampleIngredients : data.ingredients,
        recipes: isFirstTime ? sampleRecipes : data.recipes,
        sales: data.sales,
        overheadSettings: data.overheadSettings || defaultOverheadSettings,
      });

      // Persist sample data so it shows up next time
      if (isFirstTime) {
        for (const ing of sampleIngredients) {
          await dataService.saveIngredient(ing, userId);
        }
        for (const rec of sampleRecipes) {
          await dataService.saveRecipe(rec, userId);
        }
        await dataService.saveOverheadSettings(defaultOverheadSettings, userId);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, [userId, auth.loading]);

  // ─── Persist on changes (Supabase only — localStorage is handled inside dataService) ──
  // We use a different approach: persist on every state change via the dataService.
  useEffect(() => {
    // Skip initial hydration trigger
    if (state === initialState) return;
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Persisted dispatch wrapper ───────────────────────────────────────────
/**
 * Use this hook for any action that should persist to the backend.
 * It dispatches the action AND saves the relevant entity to Supabase/LocalStorage.
 */
export function usePersistedActions() {
  const { state, dispatch } = useApp();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  async function addIngredient(ingredient: Ingredient) {
    dispatch({ type: 'ADD_INGREDIENT', ingredient });
    try { await dataService.saveIngredient(ingredient, userId); } catch (e) { console.error(e); }
  }
  async function updateIngredient(ingredient: Ingredient) {
    dispatch({ type: 'UPDATE_INGREDIENT', ingredient });
    try { await dataService.saveIngredient(ingredient, userId); } catch (e) { console.error(e); }
  }
  async function deleteIngredient(id: string) {
    dispatch({ type: 'DELETE_INGREDIENT', id });
    try { await dataService.deleteIngredient(id, userId); } catch (e) { console.error(e); }
  }
  async function addRecipe(recipe: Recipe) {
    dispatch({ type: 'ADD_RECIPE', recipe });
    try { await dataService.saveRecipe(recipe, userId); } catch (e) { console.error(e); }
  }
  async function updateRecipe(recipe: Recipe) {
    dispatch({ type: 'UPDATE_RECIPE', recipe });
    try { await dataService.saveRecipe(recipe, userId); } catch (e) { console.error(e); }
  }
  async function deleteRecipe(id: string) {
    dispatch({ type: 'DELETE_RECIPE', id });
    try { await dataService.deleteRecipe(id, userId); } catch (e) { console.error(e); }
  }
  async function addSale(sale: SaleRecord) {
    dispatch({ type: 'ADD_SALE', sale });
    try { await dataService.saveSale(sale, userId); } catch (e) { console.error(e); }
  }
  async function updateSale(sale: SaleRecord) {
    dispatch({ type: 'UPDATE_SALE', sale });
    try { await dataService.saveSale(sale, userId); } catch (e) { console.error(e); }
  }
  async function deleteSale(id: string) {
    dispatch({ type: 'DELETE_SALE', id });
    try { await dataService.deleteSale(id, userId); } catch (e) { console.error(e); }
  }
  async function updateOverheadSettings(settings: OverheadSettings) {
    dispatch({ type: 'UPDATE_OVERHEAD_SETTINGS', settings });
    try { await dataService.saveOverheadSettings(settings, userId); } catch (e) { console.error(e); }
  }

  return {
    state,
    dispatch,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addSale,
    updateSale,
    deleteSale,
    updateOverheadSettings,
  };
}

// ─── Cost Calculation Helpers ──────────────────────────────────────────────

export function getIngredientCostPerUnit(ingredient: Ingredient): number {
  if (ingredient.purchaseQty <= 0) return 0;
  return ingredient.purchasePrice / ingredient.purchaseQty;
}

export function getIngredientsTotalCost(recipe: Recipe, ingredients: Ingredient[]): number {
  let total = 0;
  for (const ri of recipe.ingredients) {
    const ing = ingredients.find((i) => i.id === ri.ingredientId);
    if (ing) {
      total += getIngredientCostPerUnit(ing) * ri.qty;
    }
  }
  return total;
}

export function getApplianceLpgCost(appliance: ApplianceUsage, settings: OverheadSettings): number {
  if (appliance.type !== 'lpg-stove' && appliance.type !== 'lpg-oven') return 0;
  if (settings.lpgTankKg <= 0) return 0;
  const costPerKg = settings.lpgTankPrice / settings.lpgTankKg;
  const hours = appliance.minutes / 60;
  const kgUsed = hours * settings.lpgBurnRateKgPerHr;
  return kgUsed * costPerKg;
}

export function getLpgCost(recipe: Recipe, settings: OverheadSettings): number {
  return recipe.overhead.appliances
    .filter((a) => a.type === 'lpg-stove' || a.type === 'lpg-oven')
    .reduce((sum, a) => sum + getApplianceLpgCost(a, settings), 0);
}

export function getElectricityCost(recipe: Recipe, settings: OverheadSettings): number {
  const kw = recipe.overhead.appliances
    .filter((a) => a.type === 'electric' && a.watts)
    .reduce((sum, a) => sum + (a.watts! / 1000), 0);
  const totalMins = recipe.overhead.appliances
    .filter((a) => a.type === 'electric')
    .reduce((sum, a) => sum + a.minutes, 0);
  const hours = totalMins / 60;
  return kw * hours * settings.electricityPerKwh;
}

export function getLaborCost(recipe: Recipe, settings: OverheadSettings): number {
  const totalMin = recipe.overhead.prepTimeMin + recipe.overhead.cookingTimeMin;
  const totalHours = totalMin / 60;
  const pax = recipe.overhead.laborPax || 1;
  return totalHours * settings.laborRatePerHour * pax;
}

export function getPackagingCost(recipe: Recipe): number {
  return recipe.overhead.packagingPerServing * recipe.servings;
}

export function getOtherCost(recipe: Recipe): number {
  return recipe.overhead.otherCost;
}

export function getTotalOverheadCost(recipe: Recipe, settings: OverheadSettings): number {
  return (
    getLpgCost(recipe, settings) +
    getElectricityCost(recipe, settings) +
    getLaborCost(recipe, settings) +
    getPackagingCost(recipe) +
    getOtherCost(recipe)
  );
}

export function getRecipeTotalCost(recipe: Recipe, ingredients: Ingredient[], settings: OverheadSettings): number {
  return getIngredientsTotalCost(recipe, ingredients) + getTotalOverheadCost(recipe, settings);
}

export function getRecipeCostPerServing(recipe: Recipe, ingredients: Ingredient[], settings: OverheadSettings): number {
  const total = getRecipeTotalCost(recipe, ingredients, settings);
  return recipe.servings > 0 ? total / recipe.servings : 0;
}

export function getRecipeProfit(recipe: Recipe, ingredients: Ingredient[], settings: OverheadSettings): number {
  return recipe.sellingPrice - getRecipeCostPerServing(recipe, ingredients, settings);
}

export function getRecipeProfitMargin(recipe: Recipe, ingredients: Ingredient[], settings: OverheadSettings): number {
  if (recipe.sellingPrice <= 0) return 0;
  const profit = getRecipeProfit(recipe, ingredients, settings);
  return (profit / recipe.sellingPrice) * 100;
}

export function formatPeso(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Sales Helpers ─────────────────────────────────────────────────────────

export function getSalesSummaryForRecipe(
  recipeId: string,
  sales: SaleRecord[],
  recipe: Recipe | undefined,
  ingredients: Ingredient[],
  settings: OverheadSettings
) {
  const records = sales.filter((s) => s.recipeId === recipeId);
  const totalBatches = records.reduce((sum, s) => sum + s.batchesMade, 0);
  const totalSold = records.reduce((sum, s) => sum + s.servingsSold, 0);
  const totalWasted = records.reduce((sum, s) => sum + s.servingsWasted, 0);
  const totalMade = totalBatches * (recipe?.servings ?? 0);

  const batchCost = recipe ? getRecipeTotalCost(recipe, ingredients, settings) : 0;
  const costPerServing = recipe ? getRecipeCostPerServing(recipe, ingredients, settings) : 0;

  const totalCost = totalBatches * batchCost;
  const totalRevenue = totalSold * (recipe?.sellingPrice ?? 0);
  const spoilageCost = totalWasted * costPerServing;
  const actualProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (actualProfit / totalRevenue) * 100 : 0;

  return {
    records,
    totalBatches,
    totalSold,
    totalWasted,
    totalMade,
    totalCost,
    totalRevenue,
    actualProfit,
    spoilageCost,
    profitMargin,
    costPerServing,
  };
}

export function getOverallSalesSummary(
  sales: SaleRecord[],
  recipes: Recipe[],
  ingredients: Ingredient[],
  settings: OverheadSettings
) {
  let totalRevenue = 0;
  let totalCost = 0;
  let totalSpoilage = 0;
  let totalSold = 0;
  let totalWasted = 0;

  const recipeIds = [...new Set(sales.map((s) => s.recipeId))];

  for (const rid of recipeIds) {
    const recipe = recipes.find((r) => r.id === rid);
    const summary = getSalesSummaryForRecipe(rid, sales, recipe, ingredients, settings);
    totalRevenue += summary.totalRevenue;
    totalCost += summary.totalCost;
    totalSpoilage += summary.spoilageCost;
    totalSold += summary.totalSold;
    totalWasted += summary.totalWasted;
  }

  const actualProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (actualProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    totalSpoilage,
    totalSold,
    totalWasted,
    actualProfit,
    profitMargin,
    recordCount: sales.length,
  };
}

export function groupSalesByDate(sales: SaleRecord[]): Map<string, SaleRecord[]> {
  const grouped = new Map<string, SaleRecord[]>();
  for (const sale of sales) {
    const existing = grouped.get(sale.date) || [];
    existing.push(sale);
    grouped.set(sale.date, existing);
  }
  return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Pricing Helpers ────────────────────────────────────────────────────────
export function getPriceForMargin(costPerServing: number, targetMargin: number): number {
  if (targetMargin >= 100 || costPerServing <= 0) return 0;
  return costPerServing / (1 - targetMargin / 100);
}

export function getPriceForMarkup(costPerServing: number, targetMarkup: number): number {
  return costPerServing * (1 + targetMarkup / 100);
}

export function getMarginFromPrice(costPerServing: number, price: number): number {
  if (price <= 0) return 0;
  return ((price - costPerServing) / price) * 100;
}

export function getMarkupFromPrice(costPerServing: number, price: number): number {
  if (costPerServing <= 0) return 0;
  return ((price - costPerServing) / costPerServing) * 100;
}
