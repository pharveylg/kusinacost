import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './firebase';
import type { Ingredient, Recipe, SaleRecord, OverheadSettings } from '../types';

// ─── Data Service: abstracts localStorage vs Firebase Firestore ──────────
//
// Firestore layout (per-user isolation baked into the path):
//   users/{uid}/ingredients/{id}
//   users/{uid}/recipes/{id}
//   users/{uid}/sales/{id}
//   users/{uid}/meta/overheadSettings
//
// - When Firebase IS configured: all writes go to Firestore.
// - When NOT configured: falls back to localStorage (single-user local mode).

type UserId = string | null;

function lsKey(userId: UserId) {
  return userId ? `kusinacost_data_${userId}` : 'kusinacost_data_v4';
}

function userCol(userId: string, name: string) {
  return collection(firestore!, 'users', userId, name);
}

function userDoc(userId: string, name: string, id: string) {
  return doc(firestore!, 'users', userId, name, id);
}

export const dataService = {
  async loadInitial(userId: UserId): Promise<{
    ingredients: Ingredient[];
    recipes: Recipe[];
    sales: SaleRecord[];
    overheadSettings: OverheadSettings | null;
  }> {
    if (isFirebaseConfigured && firestore && userId) {
      const [ingsSnap, recsSnap, salesSnap, settingsSnap] = await Promise.all([
        getDocs(userCol(userId, 'ingredients')),
        getDocs(userCol(userId, 'recipes')),
        getDocs(userCol(userId, 'sales')),
        getDoc(userDoc(userId, 'meta', 'overheadSettings')),
      ]);

      return {
        ingredients: ingsSnap.docs.map((d) => d.data() as Ingredient),
        recipes: recsSnap.docs.map((d) => d.data() as Recipe),
        sales: salesSnap.docs
          .map((d) => d.data() as SaleRecord)
          .sort((a, b) => b.date.localeCompare(a.date)),
        overheadSettings: settingsSnap.exists()
          ? (settingsSnap.data() as OverheadSettings)
          : null,
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
    if (isFirebaseConfigured && firestore && userId) {
      await setDoc(userDoc(userId, 'ingredients', ingredient.id), ingredient);
      return;
    }
    const all = await dataService.loadInitial(userId);
    const list = all.ingredients.some((i) => i.id === ingredient.id)
      ? all.ingredients.map((i) => (i.id === ingredient.id ? ingredient : i))
      : [...all.ingredients, ingredient];
    await persistLocal(userId, { ingredients: list });
  },

  async deleteIngredient(id: string, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await deleteDoc(userDoc(userId, 'ingredients', id));
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { ingredients: all.ingredients.filter((i) => i.id !== id) });
  },

  // ─── Recipe ops ───────────────────────────────────────────────────────
  async saveRecipe(recipe: Recipe, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await setDoc(userDoc(userId, 'recipes', recipe.id), recipe);
      return;
    }
    const all = await dataService.loadInitial(userId);
    const list = all.recipes.some((r) => r.id === recipe.id)
      ? all.recipes.map((r) => (r.id === recipe.id ? recipe : r))
      : [...all.recipes, recipe];
    await persistLocal(userId, { recipes: list });
  },

  async deleteRecipe(id: string, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await deleteDoc(userDoc(userId, 'recipes', id));
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { recipes: all.recipes.filter((r) => r.id !== id) });
  },

  // ─── Sale ops ─────────────────────────────────────────────────────────
  async saveSale(sale: SaleRecord, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await setDoc(userDoc(userId, 'sales', sale.id), sale);
      return;
    }
    const all = await dataService.loadInitial(userId);
    const list = all.sales.some((s) => s.id === sale.id)
      ? all.sales.map((s) => (s.id === sale.id ? sale : s))
      : [...all.sales, sale];
    await persistLocal(userId, { sales: list });
  },

  async deleteSale(id: string, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await deleteDoc(userDoc(userId, 'sales', id));
      return;
    }
    const all = await dataService.loadInitial(userId);
    await persistLocal(userId, { sales: all.sales.filter((s) => s.id !== id) });
  },

  // ─── Overhead Settings ────────────────────────────────────────────────
  async saveOverheadSettings(settings: OverheadSettings, userId: UserId): Promise<void> {
    if (isFirebaseConfigured && firestore && userId) {
      await setDoc(userDoc(userId, 'meta', 'overheadSettings'), settings);
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
