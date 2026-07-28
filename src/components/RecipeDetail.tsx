import { useState } from 'react';
import {
  useApp,
  usePersistedActions,
  getIngredientsTotalCost,
  getLpgCost,
  getElectricityCost,
  getLaborCost,
  getPackagingCost,
  getOtherCost,
  getTotalOverheadCost,
  getRecipeTotalCost,
  getRecipeCostPerServing,
  getRecipeProfit,
  getRecipeProfitMargin,
  getIngredientCostPerUnit,
  getApplianceLpgCost,
  formatPeso,
  getPriceForMargin,
  getMarginFromPrice,
  getMarkupFromPrice,
  generateId,
} from '../store';


export default function RecipeDetail() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const recipe = state.recipes.find((r) => r.id === state.selectedRecipeId);
  const [showDelete, setShowDelete] = useState(false);

  // ─── Batch Scaler & Recipe Multiplier State ───
  const [scaleMode, setScaleMode] = useState<'quick' | 'anchor' | 'servings' | 'bakers'>('quick');
  const [multiplier, setMultiplier] = useState<number>(1);
  const [customServings, setCustomServings] = useState<string>((recipe?.servings || 1).toString());
  
  const defaultAnchorId = recipe?.ingredients[0]?.ingredientId || '';
  const [anchorIngId, setAnchorIngId] = useState<string>(defaultAnchorId);
  const anchorRecipeIng = recipe?.ingredients.find((ri) => ri.ingredientId === anchorIngId) || recipe?.ingredients[0];
  const [anchorQtyInput, setAnchorQtyInput] = useState<string>((anchorRecipeIng?.qty || 1).toString());

  // ─── Baker's Math State (100% Flour Base) ───
  const flourRecipeIngs = (recipe?.ingredients || []).filter((ri) => {
    const ing = state.ingredients.find((i) => i.id === ri.ingredientId);
    const name = (ing?.name || '').toLowerCase();
    return name.includes('flour') || name.includes('harina') || name.includes('wheat') || name.includes('semolina');
  });
  const origTotalFlourQty = flourRecipeIngs.length > 0
    ? flourRecipeIngs.reduce((sum, ri) => sum + ri.qty, 0)
    : (recipe?.ingredients[0]?.qty || 1);
  const origTotalDoughQty = (recipe?.ingredients || []).reduce((sum, ri) => sum + ri.qty, 0) || 1;
  const [targetFlourInput, setTargetFlourInput] = useState<string>(origTotalFlourQty.toString());
  const [targetDoughInput, setTargetDoughInput] = useState<string>(origTotalDoughQty.toString());

  const [copiedToast, setCopiedToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-2">😕</p>
        <p className="text-sm text-gray-600">Recipe not found</p>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipes' })}
          className="mt-4 text-sm text-orange-600 font-semibold"
        >
          ← Back to Recipes
        </button>
      </div>
    );
  }

  const { ingredients, overheadSettings: settings } = state;
  const oh = recipe.overhead;

  const rawCost = getIngredientsTotalCost(recipe, ingredients);
  const lpgCost = getLpgCost(recipe, settings);
  const elecCost = getElectricityCost(recipe, settings);
  const laborCost = getLaborCost(recipe, settings);
  const packCost = getPackagingCost(recipe);
  const otherCost = getOtherCost(recipe);
  const overheadTotal = getTotalOverheadCost(recipe, settings);
  const totalCost = getRecipeTotalCost(recipe, ingredients, settings);
  const costPerServing = getRecipeCostPerServing(recipe, ingredients, settings);
  const profit = getRecipeProfit(recipe, ingredients, settings);
  const margin = getRecipeProfitMargin(recipe, ingredients, settings);
  const totalRevenue = recipe.sellingPrice * recipe.servings;
  const totalProfit = totalRevenue - totalCost;
  const isLoss = profit < 0;
  const isLow = margin >= 0 && margin < 30;

  const suggestedPrice60 = costPerServing > 0 ? costPerServing / (1 - 0.60) : 0;
  const suggestedPrice50 = costPerServing > 0 ? costPerServing / (1 - 0.50) : 0;

  const totalLaborMins = oh.prepTimeMin + oh.cookingTimeMin;

  // Group appliances by type for display
  const lpgAppliances = oh.appliances.filter(a => a.type === 'lpg-stove' || a.type === 'lpg-oven');
  const electricAppliances = oh.appliances.filter(a => a.type === 'electric');

  // ─── Batch Scaling Calculations & Handlers ───
  const isScaled = Math.abs(multiplier - 1) > 0.001;

  function handleSetMultiplier(m: number) {
    if (!recipe) return;
    setMultiplier(m);
    setCustomServings((recipe.servings * m).toFixed(1).replace(/\.0$/, ''));
    if (anchorRecipeIng) {
      setAnchorQtyInput((anchorRecipeIng.qty * m).toFixed(2).replace(/\.00$/, ''));
    }
  }

  function handleServingsChange(val: string) {
    if (!recipe) return;
    setCustomServings(val);
    const numServings = parseFloat(val) || 0;
    const newMult = recipe.servings > 0 ? numServings / recipe.servings : 1;
    setMultiplier(newMult > 0 ? newMult : 0);
    if (anchorRecipeIng) {
      setAnchorQtyInput((anchorRecipeIng.qty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    }
  }

  function handleAnchorQtyChange(val: string) {
    if (!recipe) return;
    setAnchorQtyInput(val);
    const qty = parseFloat(val) || 0;
    const origQty = anchorRecipeIng?.qty || 1;
    const newMult = origQty > 0 ? qty / origQty : 1;
    setMultiplier(newMult > 0 ? newMult : 0);
    setCustomServings((recipe.servings * (newMult || 0)).toFixed(1).replace(/\.0$/, ''));
    setTargetFlourInput((origTotalFlourQty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    setTargetDoughInput((origTotalDoughQty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
  }

  function handleFlourWeightChange(val: string) {
    if (!recipe) return;
    setTargetFlourInput(val);
    const newFlour = parseFloat(val) || 0;
    const newMult = origTotalFlourQty > 0 ? newFlour / origTotalFlourQty : 1;
    setMultiplier(newMult > 0 ? newMult : 0);
    setCustomServings((recipe.servings * (newMult || 0)).toFixed(1).replace(/\.0$/, ''));
    setTargetDoughInput((origTotalDoughQty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    if (anchorRecipeIng) {
      setAnchorQtyInput((anchorRecipeIng.qty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    }
  }

  function handleDoughWeightChange(val: string) {
    if (!recipe) return;
    setTargetDoughInput(val);
    const newDough = parseFloat(val) || 0;
    const newMult = origTotalDoughQty > 0 ? newDough / origTotalDoughQty : 1;
    setMultiplier(newMult > 0 ? newMult : 0);
    setCustomServings((recipe.servings * (newMult || 0)).toFixed(1).replace(/\.0$/, ''));
    setTargetFlourInput((origTotalFlourQty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    if (anchorRecipeIng) {
      setAnchorQtyInput((anchorRecipeIng.qty * (newMult || 0)).toFixed(2).replace(/\.00$/, ''));
    }
  }

  function handleSelectAnchor(ingId: string) {
    if (!recipe) return;
    setAnchorIngId(ingId);
    const targetIng = recipe.ingredients.find((ri) => ri.ingredientId === ingId);
    if (targetIng) {
      setAnchorQtyInput((targetIng.qty * multiplier).toFixed(2).replace(/\.00$/, ''));
    }
  }

  function copyScaledShoppingList() {
    if (!recipe) return;
    const lines: string[] = [
      `🛒 Shopping List: ${recipe.name} (${multiplier.toFixed(2).replace(/\.00$/, '')}x batch / ${(recipe.servings * multiplier).toFixed(1).replace(/\.0$/, '')} servings)`,
      `────────────────────────────`,
    ];
    recipe.ingredients.forEach((ri) => {
      const ing = ingredients.find((i) => i.id === ri.ingredientId);
      if (ing) {
        const scaledQty = ri.qty * multiplier;
        lines.push(`• ${scaledQty.toFixed(2).replace(/\.00$/, '')} ${ri.unit} - ${ing.name}`);
      }
    });
    lines.push(`────────────────────────────`);
    lines.push(`Estimated Ingredients Cost: ${formatPeso(rawCost * multiplier)}`);
    
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  }

  function saveScaledAsNewRecipe() {
    if (!recipe) return;
    const scaledRecipe = {
      ...recipe,
      id: generateId(),
      name: `${recipe.name} (${multiplier.toFixed(2).replace(/\.00$/, '')}x Scaled)`,
      servings: parseFloat((recipe.servings * multiplier).toFixed(1)),
      ingredients: recipe.ingredients.map((ri) => ({
        ...ri,
        qty: parseFloat((ri.qty * multiplier).toFixed(3)),
      })),
      notes: `${recipe.notes}\n[Scaled ${multiplier.toFixed(2)}x from original ${recipe.servings} servings batch on ${new Date().toLocaleDateString('en-PH')}]`.trim(),
    };
    actions.addRecipe(scaledRecipe);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      dispatch({ type: 'SET_VIEW', view: 'recipes' });
    }, 2000);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipes' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-xl font-extrabold text-gray-900 md:text-3xl">{recipe.name}</h1>
          <p className="text-xs text-gray-500">{recipe.category} • {recipe.servings} servings</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'edit-recipe', recipeId: recipe.id })}
          className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-xl active:scale-95 transition-transform"
        >
          ✏️ Edit
        </button>
      </div>

      {/* Profit Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-5 text-white md:p-8 ${
        isLoss ? 'bg-gradient-to-br from-red-500 to-red-700'
          : isLow ? 'bg-gradient-to-br from-amber-500 to-amber-600'
          : 'bg-gradient-to-br from-green-500 to-green-700'
      }`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -right-10 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-sm font-medium opacity-80">
            {isLoss ? '🚨 Lugi per Serving!' : isLow ? '⚠️ Low Margin' : '✅ Healthy Margin'}
          </p>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-4xl font-extrabold md:text-5xl">{margin.toFixed(1)}%</p>
            <p className="text-sm opacity-80 mb-1">profit margin</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-[10px] opacity-70 uppercase font-semibold">Cost/Serving</p>
              <p className="text-base font-extrabold">{formatPeso(costPerServing)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase font-semibold">SRP</p>
              <p className="text-base font-extrabold">{formatPeso(recipe.sellingPrice)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase font-semibold">Kita/Serving</p>
              <p className="text-base font-extrabold">{formatPeso(profit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cost Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">💰 Cost Breakdown (per batch)</h2>
        <div className="space-y-1.5">
          <CostRow label="🧅 Raw Ingredients" value={formatPeso(rawCost)} />

          <div className="pt-2 border-t border-gray-50">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1.5">Overhead Costs</p>
          </div>

          {/* LPG Appliances */}
          {lpgAppliances.length > 0 && lpgAppliances.map((a) => (
            <CostRow
              key={a.id}
              label={`🔥 ${a.name} (LPG)`}
              value={formatPeso(getApplianceLpgCost(a, settings))}
              sub={`${a.minutes} mins`}
            />
          ))}

          {/* Electric Appliances */}
          {electricAppliances.length > 0 && electricAppliances.map((a) => (
            <CostRow
              key={a.id}
              label={`⚡ ${a.name} (Electric)`}
              value={formatPeso(getElectricityCost({ id: a.id, name: a.name, type: 'electric', minutes: a.minutes, watts: a.watts, prepTimeMin: 0, cookingTimeMin: 0, appliances: [], packagingPerServing: 0, otherCost: 0, otherCostLabel: '' } as any, settings))}
              sub={`${a.watts || 0}W × ${a.minutes} mins`}
            />
          ))}

          <CostRow label="👷 Labor" value={formatPeso(laborCost)} sub={`${oh.prepTimeMin} prep + ${oh.cookingTimeMin} cook = ${totalLaborMins} mins × ${oh.laborPax || 1} pax`} />
          <CostRow label="📦 Packaging" value={formatPeso(packCost)} sub={`${formatPeso(oh.packagingPerServing)} × ${recipe.servings} servings`} />
          {otherCost > 0 && <CostRow label={`🏷️ ${oh.otherCostLabel || 'Other'}`} value={formatPeso(otherCost)} />}

          <div className="bg-orange-50 rounded-xl p-2.5 mt-1">
            <CostRow label="Overhead Subtotal" value={formatPeso(overheadTotal)} bold />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <CostRow label="Total Cost (batch)" value={formatPeso(totalCost)} bold />
          </div>
          <CostRow label={`Cost per Serving (÷${recipe.servings})`} value={formatPeso(costPerServing)} />
          <div className="pt-2 border-t border-gray-100">
            <CostRow label="Revenue (batch)" value={formatPeso(totalRevenue)} />
            <CostRow
              label="Batch Profit"
              value={formatPeso(totalProfit)}
              bold
              color={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}
            />
          </div>
        </div>
      </div>

      {/* Cost Split Visual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">📊 Cost Split</h2>
        <div className="space-y-2">
          <CostBar label="Ingredients" amount={rawCost} total={totalCost} color="bg-orange-500" />
          <CostBar label="Labor" amount={laborCost} total={totalCost} color="bg-blue-400" />
          {lpgCost > 0 && <CostBar label="LPG/Gas" amount={lpgCost} total={totalCost} color="bg-red-400" />}
          {elecCost > 0 && <CostBar label="Electricity" amount={elecCost} total={totalCost} color="bg-yellow-400" />}
          {packCost > 0 && <CostBar label="Packaging" amount={packCost} total={totalCost} color="bg-green-400" />}
          {otherCost > 0 && <CostBar label={oh.otherCostLabel || 'Other'} amount={otherCost} total={totalCost} color="bg-purple-400" />}
        </div>
      </div>

      {/* Pricing Calculator */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">💰 Pricing Calculator</h2>
        <p className="text-[10px] text-gray-500">Cost per serving: <span className="font-bold text-gray-800">{formatPeso(costPerServing)}</span></p>

        {/* Quick preset buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[40, 50, 60].map((m) => (
            <button
              key={m}
              onClick={() => actions.updateRecipe({ ...recipe, sellingPrice: parseFloat(getPriceForMargin(costPerServing, m).toFixed(0)) })}
              className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700 active:scale-95 transition-transform"
            >
              {m}% Margin → {formatPeso(getPriceForMargin(costPerServing, m))}
            </button>
          ))}
        </div>

        {/* Current analysis */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-gray-700">Current SRP Analysis</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-gray-500">Current Margin</p>
              <p className="text-sm font-bold text-gray-800">{getMarginFromPrice(costPerServing, recipe.sellingPrice).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Current Markup</p>
              <p className="text-sm font-bold text-gray-800">{getMarkupFromPrice(costPerServing, recipe.sellingPrice).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Profit/Serving</p>
              <p className="text-sm font-bold text-green-700">{formatPeso(profit)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Profit/Batch</p>
              <p className="text-sm font-bold text-green-700">{formatPeso(totalProfit / recipe.servings * recipe.servings - (totalCost - rawCost - laborCost - lpgCost - elecCost - packCost - otherCost))}</p>
            </div>
          </div>
        </div>

        {/* Suggested prices */}
        {(isLoss || isLow) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-xs font-bold text-orange-800 mb-2">💡 Suggested Pricing for Better Margin</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border border-orange-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">50% Margin</p>
                <p className="text-lg font-extrabold text-orange-600">{formatPeso(getPriceForMargin(costPerServing, 50))}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-orange-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">60% Margin</p>
                <p className="text-lg font-extrabold text-green-600">{formatPeso(getPriceForMargin(costPerServing, 60))}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Batch Scaler & Recipe Multiplier ─── */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs md:p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
              <span>⚖️ Batch Scaler & Recipe Multiplier</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Scale by batch size, target servings, or available ingredient weight
            </p>
          </div>
          {isScaled && (
            <button
              onClick={() => handleSetMultiplier(1)}
              className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 text-[11px] font-extrabold rounded-lg shrink-0 transition-colors"
            >
              Reset (1x)
            </button>
          )}
        </div>

        {/* Scaler Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl text-center">
          {[
            { id: 'quick', label: '⚡ Multiplier' },
            { id: 'anchor', label: '🥩 By Ingredient' },
            { id: 'servings', label: '🍽️ By Servings' },
            { id: 'bakers', label: "🍞 Baker's Math" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setScaleMode(tab.id as any)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                scaleMode === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MODE 1: QUICK MULTIPLIERS */}
        {scaleMode === 'quick' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-gray-600">
              Current scale: <strong className="text-orange-600 font-extrabold">{multiplier.toFixed(2).replace(/\.00$/, '')}x</strong> batch ({ (recipe.servings * multiplier).toFixed(1).replace(/\.0$/, '') } servings)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[0.5, 1, 1.5, 2, 3, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSetMultiplier(val)}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                    Math.abs(multiplier - val) < 0.001
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {val}x {val === 0.5 ? '(Half)' : val === 1 ? '(Orig)' : val === 2 ? '(Double)' : ''}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-gray-500 font-medium shrink-0">Custom Multiplier:</label>
              <input
                type="number"
                value={multiplier === 0 ? '' : multiplier}
                onChange={(e) => handleSetMultiplier(parseFloat(e.target.value) || 0)}
                placeholder="1.0"
                step="0.1"
                min="0"
                className="w-24 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <span className="text-xs font-bold text-orange-600">x batch</span>
            </div>
          </div>
        )}

        {/* MODE 2: BY ANCHOR INGREDIENT */}
        {scaleMode === 'anchor' && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-amber-900">
              💡 How much of your main ingredient do you have right now?
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase font-extrabold text-amber-800">1. Select Anchor Ingredient:</label>
                <select
                  value={anchorIngId}
                  onChange={(e) => handleSelectAnchor(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {recipe.ingredients.map((ri) => {
                    const ingObj = ingredients.find((i) => i.id === ri.ingredientId);
                    return (
                      <option key={ri.ingredientId} value={ri.ingredientId}>
                        {ingObj?.name || 'Unknown Item'} (Orig: {ri.qty} {ri.unit})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                  <p className="text-[10px] font-semibold text-gray-500">Original Quantity</p>
                  <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                    {anchorRecipeIng?.qty || 0} {anchorRecipeIng?.unit}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-700">2. Available Quantity ({anchorRecipeIng?.unit})</label>
                  <input
                    type="number"
                    value={anchorQtyInput}
                    onChange={(e) => handleAnchorQtyChange(e.target.value)}
                    placeholder={anchorRecipeIng?.qty.toString() || '1'}
                    step="0.01"
                    min="0"
                    className="mt-1 w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-extrabold text-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <p className="text-xs text-amber-950 font-medium pt-1">
                &rarr; All ingredients, recipe yield ({ (recipe.servings * multiplier).toFixed(1).replace(/\.0$/, '') } pax), and batch costs scaled by <strong>{multiplier.toFixed(2).replace(/\.00$/, '')}x</strong>!
              </p>
            </div>
          </div>
        )}

        {/* MODE 3: BY TARGET SERVINGS */}
        {scaleMode === 'servings' && (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-emerald-900">
              🍽️ How many guests or orders do you need to serve?
            </p>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <p className="text-[10px] font-semibold text-gray-500">Original Recipe Yield</p>
                <p className="text-base font-extrabold text-gray-800 mt-0.5">{recipe.servings} servings</p>
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-900">Target Servings (Pax):</label>
                <input
                  type="number"
                  value={customServings}
                  onChange={(e) => handleServingsChange(e.target.value)}
                  placeholder={recipe.servings.toString()}
                  min="1"
                  className="mt-1 w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-extrabold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
            <p className="text-xs text-emerald-950 font-medium">
              &rarr; Multiplier automatically calculated at <strong>{multiplier.toFixed(2).replace(/\.00$/, '')}x</strong> to yield exact portions!
            </p>
          </div>
        )}

        {/* MODE 4: BAKER'S MATH / BAKER'S FORMULA (100% FLOUR BASE) */}
        {scaleMode === 'bakers' && (
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                <span>🍞 Baker's Math & Formula Scaling</span>
              </p>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-md">
                100% Flour Base
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              In professional baking & pastry, <strong>Total Flour is ALWAYS 100%</strong>. Every other ingredient is scaled relative to total flour weight.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-extrabold text-amber-900 uppercase">1. Target Total Flour Weight</label>
                <input
                  type="number"
                  value={targetFlourInput}
                  onChange={(e) => handleFlourWeightChange(e.target.value)}
                  placeholder={origTotalFlourQty.toString()}
                  step="0.01"
                  min="0"
                  className="mt-1 w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-extrabold text-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-[10px] text-amber-700 mt-0.5">Orig flour: {origTotalFlourQty} kg/g</p>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-amber-900 uppercase">2. Target Total Dough Weight</label>
                <input
                  type="number"
                  value={targetDoughInput}
                  onChange={(e) => handleDoughWeightChange(e.target.value)}
                  placeholder={origTotalDoughQty.toString()}
                  step="0.01"
                  min="0"
                  className="mt-1 w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-extrabold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-[10px] text-amber-700 mt-0.5">Orig dough: {origTotalDoughQty} kg/g</p>
              </div>
            </div>
            <p className="text-xs text-amber-950 font-medium">
              &rarr; All ingredients scaled by <strong>{multiplier.toFixed(2).replace(/\.00$/, '')}x</strong> while maintaining exact Baker's Percentages!
            </p>
          </div>
        )}

        {/* ─── Ingredients Used Table w/ Scaled Quantities & Baker's Math ─── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>🧅 Ingredients List ({recipe.ingredients.length})</span>
              {isScaled && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold rounded-full animate-pulse">
                  Scaled {multiplier.toFixed(2).replace(/\.00$/, '')}x
                </span>
              )}
            </h3>
            {isScaled && (
              <span className="text-xs font-bold text-orange-600">
                Total: {formatPeso(rawCost * multiplier)}
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {recipe.ingredients.map((ri, idx) => {
              const ing = ingredients.find((i) => i.id === ri.ingredientId);
              if (!ing) return <div key={idx} className="text-xs text-red-500 italic p-3">Unknown ingredient (deleted?)</div>;
              const unitCost = getIngredientCostPerUnit(ing);
              const lineCost = unitCost * ri.qty;
              const scaledQty = ri.qty * multiplier;
              const scaledLineCost = lineCost * multiplier;
              const pctOfTotal = rawCost > 0 ? (lineCost / rawCost) * 100 : 0;
              const bakersPct = origTotalFlourQty > 0 ? (ri.qty / origTotalFlourQty) * 100 : 0;

              return (
                <div key={idx} className={`flex items-center justify-between p-3 ${isScaled ? 'bg-orange-50/30 hover:bg-orange-50/60' : 'bg-white hover:bg-gray-50/70'} transition-colors`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 truncate">{ing.name}</p>
                      {scaleMode === 'bakers' && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md border border-amber-200">
                          🌾 {bakersPct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {isScaled ? (
                      <div className="text-xs mt-0.5">
                        <span className="font-extrabold text-orange-600 bg-orange-100/80 px-1.5 py-0.5 rounded-md border border-orange-200">
                          {scaledQty.toFixed(2).replace(/\.00$/, '')} {ri.unit}
                        </span>
                        <span className="text-gray-400 ml-1.5 text-[11px]">(was {ri.qty} {ri.unit})</span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">{ri.qty} {ri.unit} × {formatPeso(unitCost)}/{ing.purchaseUnit}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-extrabold ${isScaled ? 'text-orange-600' : 'text-gray-900'}`}>
                      {formatPeso(scaledLineCost)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {isScaled ? `was ${formatPeso(lineCost)}` : `${pctOfTotal.toFixed(1)}%`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scaled Batch Summary Card & Actions */}
        {isScaled && (
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-4 text-white space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">📦 Scaled Batch Summary</p>
                <h4 className="text-sm font-extrabold text-white">{recipe.name} ({multiplier.toFixed(2).replace(/\.00$/, '')}x)</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Total Yield</p>
                <p className="text-base font-extrabold text-orange-400">{(recipe.servings * multiplier).toFixed(1).replace(/\.0$/, '')} pax</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="text-[10px] text-gray-300 font-semibold uppercase">Ingredients</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{formatPeso(rawCost * multiplier)}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="text-[10px] text-gray-300 font-semibold uppercase">Packaging</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{formatPeso(packCost * multiplier)}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="text-[10px] text-gray-300 font-semibold uppercase">Overhead & Labor</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{formatPeso(laborCost + lpgCost + elecCost + otherCost)}</p>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/40 p-2 rounded-xl">
                <p className="text-[10px] text-orange-300 font-bold uppercase">Scaled Total</p>
                <p className="text-sm font-extrabold text-orange-400 mt-0.5">{formatPeso((rawCost + packCost) * multiplier + laborCost + lpgCost + elecCost + otherCost)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={copyScaledShoppingList}
                disabled={copiedToast}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  copiedToast ? 'bg-green-600 text-white' : 'bg-white/15 hover:bg-white/25 text-white active:scale-95'
                }`}
              >
                {copiedToast ? '✅ Copied to Clipboard!' : '📋 Copy Scaled Shopping List'}
              </button>

              <button
                onClick={saveScaledAsNewRecipe}
                disabled={savedToast}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  savedToast ? 'bg-green-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white active:scale-95'
                }`}
              >
                {savedToast ? '✅ Saved as New Recipe!' : '💾 Save Scaled as New Recipe'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appliances Used */}
      {recipe.overhead.appliances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">🔥 Appliances Used ({recipe.overhead.appliances.length})</h2>
          <div className="space-y-2">
            {recipe.overhead.appliances.map((app) => {
              const isLpg = app.type === 'lpg-stove' || app.type === 'lpg-oven';
              const isElec = app.type === 'electric';
              return (
                <div key={app.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{app.name}</p>
                    <p className="text-xs text-gray-400">
                      {app.type.replace('-', ' ')} • {app.minutes} mins
                      {isElec && app.watts && ` • ${app.watts}W`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {isLpg && (
                      <p className="text-sm font-bold text-red-600">{formatPeso(getApplianceLpgCost(app, settings))}</p>
                    )}
                    {isElec && (
                      <p className="text-sm font-bold text-yellow-600">{formatPeso(getElectricityCost({ ...app, type: 'electric' } as any, settings))}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Suggestions */}
      {(isLoss || isLow) && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-orange-800 mb-2">💡 Suggested Pricing</h2>
          <p className="text-xs text-orange-600 mb-3">Para mas maganda ang kita:</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">50% Margin</p>
              <p className="text-lg font-extrabold text-orange-600">{formatPeso(suggestedPrice50)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-orange-100">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">60% Margin</p>
              <p className="text-lg font-extrabold text-green-600">{formatPeso(suggestedPrice60)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {recipe.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">📝 Notes</h2>
          <p className="text-sm text-gray-600">{recipe.notes}</p>
        </div>
      )}

      {/* Delete */}
      {!showDelete ? (
        <button onClick={() => setShowDelete(true)} className="w-full py-3 text-sm font-semibold text-red-500 text-center">
          🗑️ Delete Recipe
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-3">
          <p className="text-sm font-bold text-red-800">Delete "{recipe.name}"?</p>
          <p className="text-xs text-red-600">Hindi na ito pwedeng i-undo.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
            <button
              onClick={() => {
                actions.deleteRecipe(recipe.id);
                dispatch({ type: 'SET_VIEW', view: 'recipes' });
              }}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CostRow({ label, value, sub, bold, color }: {
  label: string; value: string; sub?: string; bold?: boolean; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <div>
        <p className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
      <p className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function CostBar({ label, amount, total, color }: {
  label: string; amount: number; total: number; color: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  if (pct < 0.1) return null;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{formatPeso(amount)} ({pct.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}