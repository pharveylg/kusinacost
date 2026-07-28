import { useState } from 'react';
import { useApp, formatPeso, getIngredientCostPerUnit } from '../store';

export default function IngredientsList() {
  const { state, dispatch } = useApp();
  const { ingredients } = state;
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const categories = ['All', ...Array.from(new Set(ingredients.map((i) => i.category)))];

  const filtered = ingredients.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || i.category === filterCat;
    return matchSearch && matchCat;
  });

  // Group by category
  const grouped: Record<string, typeof ingredients> = {};
  for (const ing of filtered) {
    if (!grouped[ing.category]) grouped[ing.category] = [];
    grouped[ing.category].push(ing);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 md:text-3xl">Ingredients</h1>
          <p className="text-xs text-gray-500 mt-0.5">{ingredients.length} items tracked</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-ingredient' })}
          className="px-4 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform shadow-lg shadow-orange-200"
        >
          + Add
        </button>
      </div>

      {/* Search */}
      <div className="relative md:max-w-xl">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterCat === cat
                ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ingredients list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">🧅</p>
          <p className="text-sm font-semibold text-gray-700">No ingredients found</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{category}</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {items.map((ing) => {
                const costPerUnit = getIngredientCostPerUnit(ing);
                return (
                  <button
                    key={ing.id}
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'edit-ingredient', ingredientId: ing.id })}
                    className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{ing.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatPeso(ing.purchasePrice)} / {ing.purchaseQty} {ing.purchaseUnit}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-orange-600">{formatPeso(costPerUnit)}</p>
                        <p className="text-[10px] text-gray-400">per {ing.purchaseUnit}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
