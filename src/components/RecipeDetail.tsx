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
} from '../store';


export default function RecipeDetail() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const recipe = state.recipes.find((r) => r.id === state.selectedRecipeId);
  const [showDelete, setShowDelete] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipes' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-gray-900 truncate">{recipe.name}</h1>
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
      <div className={`rounded-3xl p-5 text-white relative overflow-hidden ${
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
            <p className="text-4xl font-extrabold">{margin.toFixed(1)}%</p>
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

      {/* Ingredients Used */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">🧅 Ingredients ({recipe.ingredients.length})</h2>
        <div className="space-y-2">
          {recipe.ingredients.map((ri, idx) => {
            const ing = ingredients.find((i) => i.id === ri.ingredientId);
            if (!ing) return <div key={idx} className="text-xs text-red-500 italic">Unknown ingredient (deleted?)</div>;
            const unitCost = getIngredientCostPerUnit(ing);
            const lineCost = unitCost * ri.qty;
            const pctOfTotal = rawCost > 0 ? (lineCost / rawCost) * 100 : 0;

            return (
              <div key={idx} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{ing.name}</p>
                  <p className="text-xs text-gray-400">{ri.qty} {ri.unit} × {formatPeso(unitCost)}/{ing.purchaseUnit}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-gray-800">{formatPeso(lineCost)}</p>
                  <p className="text-[10px] text-gray-400">{pctOfTotal.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
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