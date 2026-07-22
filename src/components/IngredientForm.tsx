import { useState } from 'react';
import { useApp, usePersistedActions, generateId } from '../store';
import type { Ingredient, UnitType } from '../types';

const UNITS: UnitType[] = ['kg', 'g', 'L', 'mL', 'pcs', 'tbsp', 'tsp', 'cup', 'pack', 'bottle', 'can'];
const CATEGORIES = ['Meat', 'Vegetables', 'Staples', 'Condiments', 'Spices', 'Canned Goods', 'Dairy', 'Seafood', 'Frozen', 'Others'];

interface Props {
  editId?: string | null;
}

export default function IngredientForm({ editId }: Props) {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const existing = editId ? state.ingredients.find((i) => i.id === editId) : null;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || '');
  const [purchasePrice, setPurchasePrice] = useState(existing?.purchasePrice.toString() || '');
  const [purchaseQty, setPurchaseQty] = useState(existing?.purchaseQty.toString() || '');
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>(existing?.purchaseUnit || 'kg');
  const [category, setCategory] = useState(existing?.category || 'Vegetables');
  const [showDelete, setShowDelete] = useState(false);

  const canSave = name.trim() && parseFloat(purchasePrice) > 0 && parseFloat(purchaseQty) > 0;

  function handleSave() {
    if (!canSave) return;
    const ingredient: Ingredient = {
      id: existing?.id || generateId(),
      name: name.trim(),
      purchasePrice: parseFloat(purchasePrice),
      purchaseQty: parseFloat(purchaseQty),
      purchaseUnit,
      category,
    };

    if (isEdit) {
      actions.updateIngredient(ingredient);
    } else {
      actions.addIngredient(ingredient);
    }
    dispatch({ type: 'SET_VIEW', view: 'ingredients' });
  }

  function handleDelete() {
    if (existing) {
      actions.deleteIngredient(existing.id);
      dispatch({ type: 'SET_VIEW', view: 'ingredients' });
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'ingredients' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{isEdit ? 'Edit' : 'Add'} Ingredient</h1>
          <p className="text-xs text-gray-500">{isEdit ? 'Update details below' : 'Enter ingredient details'}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ingredient Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Manok (Chicken)"
            className="mt-1.5 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Purchase Info (Presyo sa Palengke)</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Price (₱)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Quantity</label>
              <input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                placeholder="1"
                min="0"
                step="0.01"
                className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Unit</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setPurchaseUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    purchaseUnit === u
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Cost preview */}
          {parseFloat(purchasePrice) > 0 && parseFloat(purchaseQty) > 0 && (
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Cost per {purchaseUnit}</p>
              <p className="text-lg font-extrabold text-orange-600">
                ₱{(parseFloat(purchasePrice) / parseFloat(purchaseQty)).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
          canSave
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isEdit ? '💾 Update Ingredient' : '✅ Add Ingredient'}
      </button>

      {isEdit && (
        <>
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full py-3 text-sm font-semibold text-red-500 text-center"
            >
              🗑️ Delete Ingredient
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-3">
              <p className="text-sm font-bold text-red-800">Are you sure?</p>
              <p className="text-xs text-red-600">This will remove it from all recipes.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
