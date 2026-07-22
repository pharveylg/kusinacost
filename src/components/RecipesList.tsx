import { useState } from 'react';
import {
  useApp,
  getRecipeCostPerServing,
  getRecipeProfitMargin,
  getRecipeProfit,
  formatPeso,
} from '../store';

export default function RecipesList() {
  const { state, dispatch } = useApp();
  const { recipes, ingredients, overheadSettings: settings } = state;
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'margin' | 'price'>('name');

  const categories = ['All', ...Array.from(new Set(recipes.map((r) => r.category)))];

  let filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || r.category === filterCat;
    return matchSearch && matchCat;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'margin') return getRecipeProfitMargin(b, ingredients, settings) - getRecipeProfitMargin(a, ingredients, settings);
    if (sortBy === 'price') return b.sellingPrice - a.sellingPrice;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Recipes</h1>
          <p className="text-xs text-gray-500 mt-0.5">{recipes.length} menu items</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-recipe' })}
          className="px-4 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform shadow-lg shadow-orange-200"
        >
          + Add
        </button>
      </div>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
        />
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterCat === cat ? 'bg-orange-600 text-white shadow-md shadow-orange-200' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {([['name', 'A-Z'], ['margin', 'Margin ↓'], ['price', 'Price ↓']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">🍳</p>
          <p className="text-sm font-semibold text-gray-700">No recipes found</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search or add a new recipe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => {
            const costPerServing = getRecipeCostPerServing(recipe, ingredients, settings);
            const margin = getRecipeProfitMargin(recipe, ingredients, settings);
            const profit = getRecipeProfit(recipe, ingredients, settings);
            const isLoss = profit < 0;
            const isLow = margin >= 0 && margin < 30;

            return (
              <button
                key={recipe.id}
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipe-detail', recipeId: recipe.id })}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{recipe.name}</p>
                      {isLoss && <span className="text-xs">🚨</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {recipe.category} • {recipe.servings} servings • {recipe.ingredients.length} ingredients
                    </p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Cost</p>
                        <p className="text-sm font-bold text-gray-800">{formatPeso(costPerServing)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">SRP</p>
                        <p className="text-sm font-bold text-gray-800">{formatPeso(recipe.sellingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Kita</p>
                        <p className={`text-sm font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                          {formatPeso(profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`shrink-0 px-3.5 py-2 rounded-xl text-center min-w-[60px] ${
                    isLoss ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <p className="text-base font-extrabold">{margin.toFixed(0)}%</p>
                    <p className="text-[10px] font-medium">margin</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
