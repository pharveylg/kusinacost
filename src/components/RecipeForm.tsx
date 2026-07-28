import { useState } from 'react';
import {
  useApp,
  usePersistedActions,
  generateId,
  getIngredientCostPerUnit,
  formatPeso,
  getRecipeCostPerServing,
  getRecipeProfitMargin,
  getElectricityCost,
  getLaborCost,
  getApplianceLpgCost,
  defaultRecipeOverhead,
  defaultAppliances,
  getPriceForMargin,
  getPriceForMarkup,
  getMarginFromPrice,
  getMarkupFromPrice,
} from '../store';
import type { Recipe, RecipeIngredient, RecipeOverhead, ApplianceUsage, UnitType } from '../types';
import { APPLIANCE_TYPES } from '../types';

const UNITS: UnitType[] = ['kg', 'g', 'L', 'mL', 'pcs', 'tbsp', 'tsp', 'cup', 'pack', 'bottle', 'can'];
const RECIPE_CATEGORIES = ['Ulam', 'Sabaw', 'Merienda', 'Rice Meals', 'Beverages', 'Dessert', 'Pulutan', 'Others'];

interface Props {
  editId?: string | null;
}

export default function RecipeForm({ editId }: Props) {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const existing = editId ? state.recipes.find((r) => r.id === editId) : null;
  const isEdit = !!existing;
  const settings = state.overheadSettings;

  // Basic info
  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || 'Ulam');
  const [servings, setServings] = useState(existing?.servings.toString() || '5');
  const [sellingPrice, setSellingPrice] = useState(existing?.sellingPrice.toString() || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    existing?.ingredients || []
  );

  // Overhead
  const existingOh = existing?.overhead || defaultRecipeOverhead;
  const [prepTimeMin, setPrepTimeMin] = useState(existingOh.prepTimeMin.toString());
  const [cookingTimeMin, setCookingTimeMin] = useState(existingOh.cookingTimeMin.toString());
  const [laborPax, setLaborPax] = useState((existingOh.laborPax || 1).toString());
  const [appliances, setAppliances] = useState<ApplianceUsage[]>(existingOh.appliances.length ? existingOh.appliances : defaultAppliances(existingOh));
  const [packagingPerServing, setPackagingPerServing] = useState(existingOh.packagingPerServing.toString());
  const [otherCost, setOtherCost] = useState(existingOh.otherCost.toString());
  const [otherCostLabel, setOtherCostLabel] = useState(existingOh.otherCostLabel);

  // Ingredient picker
  const [showAddIng, setShowAddIng] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState('');
  const [ingQty, setIngQty] = useState('');
  const [ingUnit, setIngUnit] = useState<UnitType>('pcs');
  const [ingSearch, setIngSearch] = useState('');

  // Pricing calculator state
  const [targetMargin, setTargetMargin] = useState('50');
  const [targetMarkup, setTargetMarkup] = useState('100');

  const canSave = name.trim() && parseFloat(servings) > 0 && parseFloat(sellingPrice) > 0 && recipeIngredients.length > 0;

  const currentOverhead: RecipeOverhead = {
    prepTimeMin: parseFloat(prepTimeMin) || 0,
    cookingTimeMin: parseFloat(cookingTimeMin) || 0,
    laborPax: parseInt(laborPax) || 1,
    appliances,
    packagingPerServing: parseFloat(packagingPerServing) || 0,
    otherCost: parseFloat(otherCost) || 0,
    otherCostLabel,
  };

  const previewRecipe: Recipe = {
    id: existing?.id || 'preview',
    name,
    category,
    servings: parseFloat(servings) || 1,
    sellingPrice: parseFloat(sellingPrice) || 0,
    ingredients: recipeIngredients,
    overhead: currentOverhead,
    notes,
  };

  const costPerServing = getRecipeCostPerServing(previewRecipe, state.ingredients, settings);
  const margin = getRecipeProfitMargin(previewRecipe, state.ingredients, settings);
  // const previewLpg = getLpgCost(previewRecipe, settings); // not used in form
  // const previewElec = getElectricityCost(previewRecipe, settings); // shown in appliance list
  const previewLabor = getLaborCost(previewRecipe, settings);

  function addIngredient() {
    if (!selectedIngId || parseFloat(ingQty) <= 0) return;
    setRecipeIngredients((prev) => [...prev, { ingredientId: selectedIngId, qty: parseFloat(ingQty), unit: ingUnit }]);
    setSelectedIngId('');
    setIngQty('');
    setIngUnit('pcs');
    setShowAddIng(false);
    setIngSearch('');
  }

  function removeIngredient(index: number) {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  // Appliance helpers
  function addAppliance() {
    const newApp: ApplianceUsage = { id: generateId(), name: 'New Appliance', type: 'lpg-stove', minutes: 15, watts: undefined };
    setAppliances((prev) => [...prev, newApp]);
  }

  function removeAppliance(id: string) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAppliance(id: string, updates: Partial<ApplianceUsage>) {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }

  function handleSave() {
    if (!canSave) return;
    const recipe: Recipe = {
      id: existing?.id || generateId(),
      name: name.trim(),
      category,
      servings: parseFloat(servings),
      sellingPrice: parseFloat(sellingPrice),
      ingredients: recipeIngredients,
      overhead: currentOverhead,
      notes: notes.trim(),
    };

    if (isEdit) {
      actions.updateRecipe(recipe);
    } else {
      actions.addRecipe(recipe);
    }
    dispatch({ type: 'SET_VIEW', view: 'recipes' });
  }

  const filteredIngredients = state.ingredients.filter(
    (i) => i.name.toLowerCase().includes(ingSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipes' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 md:text-3xl">{isEdit ? 'Edit' : 'New'} Recipe</h1>
          <p className="text-xs text-gray-500">{isEdit ? 'Update recipe details' : 'Build your recipe costing'}</p>
        </div>
      </div>

      {/* Live Preview Card */}
      {recipeIngredients.length > 0 && parseFloat(sellingPrice) > 0 && (
        <div className={`rounded-2xl p-4 text-white ${
          margin < 0 ? 'bg-gradient-to-r from-red-500 to-red-600' :
          margin < 30 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
          'bg-gradient-to-r from-green-500 to-green-600'
        }`}>
          <p className="text-xs font-medium opacity-80">📊 Live Preview</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className="text-[10px] opacity-70 uppercase">Cost/Serving</p>
              <p className="text-base font-extrabold">{formatPeso(costPerServing)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase">Margin</p>
              <p className="text-base font-extrabold">{margin.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase">Kita/Serving</p>
              <p className="text-base font-extrabold">{formatPeso((parseFloat(sellingPrice) || 0) - costPerServing)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Basic Info</p>

        <div>
          <label className="text-xs font-semibold text-gray-500">Recipe Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken Adobo"
            className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {RECIPE_CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  category === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Servings</label>
            <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="5" min="1"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">SRP (₱/serving)</label>
            <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="65" min="0" step="1"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>

      {/* ─── Pricing Calculator ─── */}
      {recipeIngredients.length > 0 && costPerServing > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">💰 Pricing Calculator</p>
          <p className="text-[10px] text-gray-500">Cost per serving: <span className="font-bold text-gray-800">{formatPeso(costPerServing)}</span></p>

          {/* Set by Margin */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-blue-800">Set by Profit Margin</p>
              <span className="text-[10px] text-blue-600">Price = Cost ÷ (1 - margin%)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(e.target.value)}
                placeholder="50"
                min="1"
                max="99"
                className="w-24 px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-sm text-blue-700">% margin</span>
              <button
                onClick={() => setSellingPrice(getPriceForMargin(costPerServing, parseFloat(targetMargin) || 50).toFixed(0))}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
              >
                Set SRP: {formatPeso(getPriceForMargin(costPerServing, parseFloat(targetMargin) || 50))}
              </button>
            </div>
            <p className="text-[10px] text-blue-600">
              At {targetMargin}% margin: Profit/serving = {formatPeso((parseFloat(targetMargin) || 50) / 100 * getPriceForMargin(costPerServing, parseFloat(targetMargin) || 50))}
            </p>
          </div>

          {/* Set by Markup */}
          <div className="bg-purple-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-purple-800">Set by Markup</p>
              <span className="text-[10px] text-purple-600">Price = Cost × (1 + markup%)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetMarkup}
                onChange={(e) => setTargetMarkup(e.target.value)}
                placeholder="100"
                min="1"
                className="w-24 px-3 py-2 border border-purple-200 rounded-lg text-sm font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <span className="text-sm text-purple-700">% markup</span>
              <button
                onClick={() => setSellingPrice(getPriceForMarkup(costPerServing, parseFloat(targetMarkup) || 100).toFixed(0))}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform"
              >
                Set SRP: {formatPeso(getPriceForMarkup(costPerServing, parseFloat(targetMarkup) || 100))}
              </button>
            </div>
            <p className="text-[10px] text-purple-600">
              At {targetMarkup}% markup: Profit/serving = {formatPeso((parseFloat(targetMarkup) || 100) / 100 * costPerServing)}
            </p>
          </div>

          {/* Current SRP Analysis */}
          {parseFloat(sellingPrice) > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-700">Current SRP Analysis</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-500">Margin</p>
                  <p className="text-sm font-bold text-gray-800">{getMarginFromPrice(costPerServing, parseFloat(sellingPrice) || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Markup</p>
                  <p className="text-sm font-bold text-gray-800">{getMarkupFromPrice(costPerServing, parseFloat(sellingPrice) || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Profit/Serving</p>
                  <p className="text-sm font-bold text-green-700">{formatPeso((parseFloat(sellingPrice) || 0) - costPerServing)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Profit/Batch</p>
                  <p className="text-sm font-bold text-green-700">{formatPeso(((parseFloat(sellingPrice) || 0) - costPerServing) * (parseFloat(servings) || 1))}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Ingredients ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">🧅 Ingredients ({recipeIngredients.length})</p>
          <button onClick={() => setShowAddIng(true)} className="text-xs font-semibold text-orange-600 active:scale-95 transition-transform">+ Add</button>
        </div>

        {recipeIngredients.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-2xl mb-1">🧺</p>
            <p className="text-xs text-gray-500">Tap "+ Add" to add ingredients.</p>
          </div>
        )}

        {recipeIngredients.map((ri, idx) => {
          const ing = state.ingredients.find((i) => i.id === ri.ingredientId);
          if (!ing) return null;
          const lineCost = getIngredientCostPerUnit(ing) * ri.qty;
          return (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{ing.name}</p>
                <p className="text-xs text-gray-400">{ri.qty} {ri.unit} = {formatPeso(lineCost)}</p>
              </div>
              <button onClick={() => removeIngredient(idx)}
                className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 active:scale-90 transition-transform">×</button>
            </div>
          );
        })}

        {/* Add Ingredient Modal */}
        {showAddIng && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAddIng(false)}>
            <div className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-3">Add Ingredient</h3>

              <input type="text" placeholder="Search ingredients..." value={ingSearch} onChange={(e) => setIngSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-300" />

              <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
                {filteredIngredients.map((ing) => (
                  <button key={ing.id} onClick={() => { setSelectedIngId(ing.id); setIngUnit(ing.purchaseUnit); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      selectedIngId === ing.id ? 'bg-orange-100 text-orange-800 font-semibold border border-orange-200' : 'bg-gray-50 text-gray-700'
                    }`}>
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatPeso(getIngredientCostPerUnit(ing))}/{ing.purchaseUnit}</span>
                  </button>
                ))}
                {filteredIngredients.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No ingredients found. Add them first sa Ingredients tab.</p>
                )}
              </div>

              {selectedIngId && (
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Quantity</label>
                      <input type="number" value={ingQty} onChange={(e) => setIngQty(e.target.value)} placeholder="1" min="0" step="0.01"
                        className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Unit</label>
                      <select value={ingUnit} onChange={(e) => setIngUnit(e.target.value as UnitType)}
                        className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {parseFloat(ingQty) > 0 && (
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-orange-600">
                        Line cost: <span className="font-bold">
                          {formatPeso(getIngredientCostPerUnit(state.ingredients.find((i) => i.id === selectedIngId)!) * parseFloat(ingQty))}
                        </span>
                      </p>
                    </div>
                  )}

                  <button onClick={addIngredient} disabled={!selectedIngId || parseFloat(ingQty) <= 0}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedIngId && parseFloat(ingQty) > 0 ? 'bg-orange-600 text-white active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}>
                    ✅ Add to Recipe
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Labor ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">👷 Labor</p>
          <p className="text-xs text-gray-400">@ {formatPeso(settings.laborRatePerHour)}/hr</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Pax</label>
            <p className="text-[10px] text-gray-400">Workers needed</p>
            <input type="number" value={laborPax} onChange={(e) => setLaborPax(e.target.value)} placeholder="1" min="1"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Prep Time (mins)</label>
            <p className="text-[10px] text-gray-400">Chopping, marinating</p>
            <input type="number" value={prepTimeMin} onChange={(e) => setPrepTimeMin(e.target.value)} placeholder="15" min="0"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Cooking Time (mins)</label>
            <p className="text-[10px] text-gray-400">Active cooking</p>
            <input type="number" value={cookingTimeMin} onChange={(e) => setCookingTimeMin(e.target.value)} placeholder="30" min="0"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        {previewLabor > 0 && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              ⏱️ Total labor: {parseInt(prepTimeMin) + parseInt(cookingTimeMin)} mins × {parseInt(laborPax) || 1} pax = <span className="font-bold">{formatPeso(previewLabor)}</span>
            </p>
          </div>
        )}
      </div>

      {/* ─── Appliances ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">🔥 Appliances</p>
          <button onClick={addAppliance} className="text-xs font-semibold text-orange-600 active:scale-95 transition-transform">+ Add</button>
        </div>

        <p className="text-[10px] text-gray-500">List each appliance used during cooking.</p>

        {appliances.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-500">No appliances listed. Add one above.</p>
          </div>
        )}

        {appliances.map((app, idx) => (
          <div key={app.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">
                {idx === 0 ? 'Main Burner (LPG)' : `Appliance ${idx + 1}`}
              </h4>
              <button onClick={() => removeAppliance(app.id)}
                className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-sm font-bold active:scale-90">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <select value={app.type} onChange={(e) => updateAppliance(app.id, { type: e.target.value as any })}
                  className="mt-1 w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                  {APPLIANCE_TYPES.map((t) => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input type="text" value={app.name} onChange={(e) => updateAppliance(app.id, { name: e.target.value })}
                  className="mt-1 w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Time (mins)</label>
                <input type="number" value={app.minutes} onChange={(e) => updateAppliance(app.id, { minutes: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              {app.type === 'electric' && (
                <div>
                  <label className="text-xs text-gray-500">Watts</label>
                  <input type="number" value={app.watts || ''} onChange={(e) => updateAppliance(app.id, { watts: parseFloat(e.target.value) || undefined })}
                    className="mt-1 w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Appliances cost summary */}
        {appliances.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-gray-700">Appliances Cost Breakdown</p>
            {appliances.filter(a => a.type.startsWith('lpg')).map(a => (
              <div key={a.id} className="flex justify-between text-xs">
                <span className="text-gray-600">{a.name} (LPG): {a.minutes}m</span>
                <span className="font-medium text-gray-800">{formatPeso(getApplianceLpgCost(a, settings))}</span>
              </div>
            ))}
            {appliances.filter(a => a.type === 'electric').map(a => (
              <div key={a.id} className="flex justify-between text-xs">
                <span className="text-gray-600">{a.name} (Electric):</span>
                <span className="font-medium text-gray-800">{formatPeso(getElectricityCost({ ...a, type: 'electric', watts: a.watts || 0 } as any, settings))}</span>
              </div>
            ))}
            {appliances.filter(a => a.type === 'electric').length > 0 && (
              <div className="text-xs text-gray-500">
                Calculated from {formatPeso(settings.electricityPerKwh)}/kWh
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Packaging ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">📦 Packaging Cost (₱/serving)</label>
        <p className="text-[10px] text-gray-500 mt-0.5">Container, bag, utensils per plate</p>
        <input type="number" value={packagingPerServing} onChange={(e) => setPackagingPerServing(e.target.value)} placeholder="5"
          className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* ─── Other Costs ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">🏷️ Other Costs</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Amount (₱)</label>
            <input type="number" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} placeholder="0" min="0" step="1"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Description</label>
            <input type="text" value={otherCostLabel} onChange={(e) => setOtherCostLabel(e.target.value)} placeholder="e.g., Sampalok mix packet"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>
      </div>

      {/* ─── Notes ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">📝 Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tips, variations, reminders..."
          rows={3}
          className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300" />
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={!canSave}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
          canSave ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}>
        {isEdit ? '💾 Update Recipe' : '✅ Save Recipe'}
      </button>
    </div>
  );
}


