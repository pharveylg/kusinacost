import { useState } from 'react';
import {
  useApp,
  usePersistedActions,
  generateId,
  formatPeso,
  getRecipeCostPerServing,
  getRecipeTotalCost,
  getTodayDateStr,
} from '../store';
import type { SaleRecord } from '../types';

interface Props {
  editId?: string | null;
}

export default function SaleForm({ editId }: Props) {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const existing = editId ? state.sales.find((s) => s.id === editId) : null;
  const isEdit = !!existing;
  const { recipes, ingredients, overheadSettings: settings } = state;

  const [recipeId, setRecipeId] = useState(existing?.recipeId || '');
  const [date, setDate] = useState(existing?.date || getTodayDateStr());
  const [batchesMade, setBatchesMade] = useState(existing?.batchesMade.toString() || '1');
  const [servingsSold, setServingsSold] = useState(existing?.servingsSold.toString() || '');
  const [servingsWasted, setServingsWasted] = useState(existing?.servingsWasted.toString() || '0');
  const [notes, setNotes] = useState(existing?.notes || '');

  const selectedRecipe = recipes.find((r) => r.id === recipeId);
  const batchSize = selectedRecipe?.servings ?? 0;
  const totalMade = (parseInt(batchesMade) || 0) * batchSize;
  const maxSold = totalMade;
  const canSave = recipeId && parseInt(batchesMade) > 0;

  const costPerServing = selectedRecipe ? getRecipeCostPerServing(selectedRecipe, ingredients, settings) : 0;
  const batchCost = selectedRecipe ? getRecipeTotalCost(selectedRecipe, ingredients, settings) : 0;
  const totalCost = (parseInt(batchesMade) || 0) * batchCost;
  const revenue = (parseInt(servingsSold) || 0) * (selectedRecipe?.sellingPrice ?? 0);
  const wasteCost = (parseInt(servingsWasted) || 0) * costPerServing;
  const profit = revenue - totalCost;

  function handleSave() {
    if (!canSave) return;
    const sale: SaleRecord = {
      id: existing?.id || generateId(),
      recipeId,
      date,
      batchesMade: parseInt(batchesMade) || 0,
      servingsSold: parseInt(servingsSold) || 0,
      servingsWasted: parseInt(servingsWasted) || 0,
      notes: notes.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    if (isEdit) {
      actions.updateSale(sale);
    } else {
      actions.addSale(sale);
    }
    dispatch({ type: 'SET_VIEW', view: 'sales' });
  }

  function handleDelete() {
    if (existing) {
      actions.deleteSale(existing.id);
      dispatch({ type: 'SET_VIEW', view: 'sales' });
    }
  }

  // Auto-fill sold = total made when batches change
  function handleBatchesChange(val: string) {
    setBatchesMade(val);
    const batches = parseInt(val) || 0;
    if (!isEdit || !existing) {
      setServingsSold((batches * batchSize).toString());
    }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'sales' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 md:text-3xl">{isEdit ? 'Edit' : 'Record'} Sale</h1>
          <p className="text-xs text-gray-500">{isEdit ? 'Update sale record' : 'Log your actual benta'}</p>
        </div>
      </div>

      {/* Live Summary */}
      {selectedRecipe && (parseInt(batchesMade) || 0) > 0 && (
        <div className={`rounded-2xl p-4 text-white ${
          profit >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <p className="text-xs font-medium opacity-80">Live Summary</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div>
              <p className="text-[10px] opacity-70 uppercase">Revenue</p>
              <p className="text-base font-extrabold">{formatPeso(revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase">Total Cost</p>
              <p className="text-base font-extrabold">{formatPeso(totalCost)}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase">Profit</p>
              <p className="text-base font-extrabold">{formatPeso(profit)}</p>
            </div>
          </div>
          {wasteCost > 0 && (
            <p className="text-xs mt-2 opacity-80">
              🗑️ Wastage cost: {formatPeso(wasteCost)}
            </p>
          )}
        </div>
      )}

      {/* Recipe Select */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Recipe</p>

        <div className="space-y-2">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRecipeId(r.id);
                setBatchesMade('1');
                setServingsSold(r.servings.toString());
                setServingsWasted('0');
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                recipeId === r.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.servings} servings/batch · {formatPeso(r.sellingPrice)} each · Cost {formatPeso(costPerServing)}/serving
                  </p>
                </div>
                {recipeId === r.id && (
                  <span className="text-orange-600 text-sm">✓</span>
                )}
              </div>
            </button>
          ))}
          {recipes.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              No recipes yet. Create one first.
            </p>
          )}
        </div>
      </div>

      {/* Sale Details */}
      {recipeId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sale Details</p>

          <div>
            <label className="text-xs font-semibold text-gray-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">
              Batches Made
            </label>
            <p className="text-[10px] text-gray-400">
              1 batch = {batchSize} servings · Total servings made: <span className="font-bold">{totalMade}</span>
            </p>
            <input
              type="number"
              value={batchesMade}
              onChange={(e) => handleBatchesChange(e.target.value)}
              placeholder="1"
              min="1"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Servings Sold ✅
              </label>
              <p className="text-[10px] text-gray-400">
                Max: {maxSold} (made) · {selectedRecipe?.sellingPrice ? formatPeso(selectedRecipe.sellingPrice) : '₱0'}/serving
              </p>
              <input
                type="number"
                value={servingsSold}
                onChange={(e) => setServingsSold(e.target.value)}
                placeholder="0"
                min="0"
                max={maxSold}
                className="mt-1 w-full px-4 py-3 border border-green-200 rounded-xl text-sm font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Wasted / Unsold 🗑️
              </label>
              <p className="text-[10px] text-gray-400">
                Spoiled, gave away, unsold · {formatPeso(costPerServing)}/serving cost
              </p>
              <input
                type="number"
                value={servingsWasted}
                onChange={(e) => setServingsWasted(e.target.value)}
                placeholder="0"
                min="0"
                className="mt-1 w-full px-4 py-3 border border-red-200 rounded-xl text-sm font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>

          {/* Auto-validate: sold + wasted ≤ total made */}
          {(parseInt(servingsSold) || 0) + (parseInt(servingsWasted) || 0) > totalMade && (
            <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700">
              ⚠️ Sold + Wasted ({(() => { const s = parseInt(servingsSold) || 0; const w = parseInt(servingsWasted) || 0; return s + w; })()}) exceeds total made ({totalMade})
            </div>
          )}

          {/* Unaccounted servings */}
          {(() => {
            const s = parseInt(servingsSold) || 0;
            const w = parseInt(servingsWasted) || 0;
            const unaccounted = totalMade - s - w;
            if (unaccounted > 0) {
              return (
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                  📊 {unaccounted} serving{unaccounted > 1 ? 's' : ''} unaccounted (not sold, not wasted)
                </div>
              );
            }
            return null;
          })()}

          <div>
            <label className="text-xs font-semibold text-gray-500">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Rainy day — low foot traffic"
              rows={2}
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      )}

      {/* Cost Summary */}
      {recipeId && (parseInt(batchesMade) || 0) > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">💰 Cost Summary</h2>
          <div className="space-y-1.5">
            <CostRow label="Batch Cost" value={formatPeso(batchCost)} sub={`${batchSize} servings / batch`} />
            <CostRow label={`Total Cost (${batchesMade} batches)`} value={formatPeso(totalCost)} />
            <CostRow label="Revenue" value={formatPeso(revenue)} />
            {wasteCost > 0 && (
              <CostRow label="🗑️ Spoilage Loss" value={formatPeso(wasteCost)} color="text-red-600" />
            )}
            <div className="border-t border-gray-100 pt-1.5">
              <CostRow
                label="Actual Profit"
                value={formatPeso(profit)}
                bold
                color={profit >= 0 ? 'text-green-600' : 'text-red-600'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
          canSave
            ? 'bg-green-600 text-white shadow-lg shadow-green-200 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isEdit ? '💾 Update Sale Record' : '✅ Record Sale'}
      </button>

      {isEdit && (
        <button onClick={handleDelete} className="w-full py-3 text-sm font-semibold text-red-500 text-center">
          🗑️ Delete Sale Record
        </button>
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
