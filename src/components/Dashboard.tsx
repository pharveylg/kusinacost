import {
  useApp,
  getRecipeTotalCost,
  getRecipeCostPerServing,
  getRecipeProfitMargin,
  getRecipeProfit,
  getOverallSalesSummary,
  formatPeso,
  formatDate,
  groupSalesByDate,
  canAccessGuide,
} from '../store';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const auth = useAuth();
  const userEmail = auth.user?.email;
  const { ingredients, recipes, overheadSettings: settings, sales, guideAccess } = state;
  const canPizza = canAccessGuide('masterclass', guideAccess, userEmail);
  const canMexican = canAccessGuide('mexican-masterclass', guideAccess, userEmail);
  const canChefEj = canAccessGuide('chef-ej-masterclass', guideAccess, userEmail);

  const totalIngredients = ingredients.length;
  const totalRecipes = recipes.length;

  const avgMargin =
    recipes.length > 0
      ? recipes.reduce((sum, r) => sum + getRecipeProfitMargin(r, ingredients, settings), 0) / recipes.length
      : 0;

  const bestRecipe = recipes.length > 0
    ? [...recipes].sort((a, b) => getRecipeProfitMargin(b, ingredients, settings) - getRecipeProfitMargin(a, ingredients, settings))[0]
    : null;

  const lowMarginRecipes = recipes.filter((r) => {
    const margin = getRecipeProfitMargin(r, ingredients, settings);
    return margin < 30 && margin >= 0;
  });

  const negativeRecipes = recipes.filter((r) => getRecipeProfit(r, ingredients, settings) < 0);

  // Sales summary
  const salesSummary = getOverallSalesSummary(sales, recipes, ingredients, settings);
  const groupedSales = groupSalesByDate(sales);
  const latestDateEntry = [...groupedSales.entries()][0]; // first = most recent

  return (
    <div className="space-y-5 md:space-y-7">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 p-5 text-white md:p-8">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -right-10 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative">
          <p className="text-orange-100 text-sm font-medium">Magandang araw! 👋</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-4xl">KusinaCost</h1>
          <p className="mt-1 text-sm text-orange-100 md:max-w-xl md:text-base">Track your food costs, understand actual sales, and maximize your kita.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard emoji="🥘" label="Recipes" value={totalRecipes.toString()} sub="menu items" bg="bg-amber-50" border="border-amber-100" />
        <StatCard emoji="🧅" label="Ingredients" value={totalIngredients.toString()} sub="tracked items" bg="bg-green-50" border="border-green-100" />
        <StatCard
          emoji="📈"
          label="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          sub={avgMargin >= 30 ? 'Maganda!' : 'Needs review'}
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatCard
          emoji="⭐"
          label="Best Seller"
          value={bestRecipe ? `${getRecipeProfitMargin(bestRecipe, ingredients, settings).toFixed(0)}%` : '—'}
          sub={bestRecipe?.name || 'No recipes yet'}
          bg="bg-purple-50"
          border="border-purple-100"
        />
      </div>

      {/* Sales Summary Hero Callout */}
      {sales.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-5 text-white md:p-7">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -right-10 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Actual Sales</p>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'sales' })}
                className="text-xs text-white/70 font-semibold"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Revenue</p>
                <p className="text-lg font-extrabold">{formatPeso(salesSummary.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Actual Profit</p>
                <p className={`text-lg font-extrabold ${salesSummary.actualProfit >= 0 ? '' : 'text-red-200'}`}>
                  {formatPeso(salesSummary.actualProfit)}
                </p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Margin</p>
                <p className="text-lg font-extrabold">{salesSummary.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            {/* Spoilage Warning */}
            {salesSummary.totalWasted > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                <span>🗑️</span>
                <p className="text-xs">
                  <span className="font-bold">{salesSummary.totalWasted}</span> servings wasted ·{' '}
                  <span className="font-bold">{formatPeso(salesSummary.totalSpoilage)}</span> lost
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {negativeRecipes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-sm font-bold text-red-800">Lugi Alert!</p>
              <p className="text-xs text-red-600 mt-0.5">
                {negativeRecipes.length} recipe{negativeRecipes.length > 1 ? 's' : ''} losing money.
              </p>
              {negativeRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipe-detail', recipeId: r.id })}
                  className="text-xs text-red-700 font-semibold underline mt-1 block"
                >
                  • {r.name} ({formatPeso(getRecipeProfit(r, ingredients, settings))}/serving)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lowMarginRecipes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Low Margin Warning</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {lowMarginRecipes.length} recipe{lowMarginRecipes.length > 1 ? 's' : ''} below 30% margin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Latest Sales */}
      {latestDateEntry && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Latest Sales</h2>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'sales' })}
              className="text-xs font-semibold text-orange-600"
            >
              View All →
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white md:shadow-sm">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <span className="text-sm">📅</span>
              <span className="text-xs font-bold text-gray-700">{formatDate(latestDateEntry[0])}</span>
            </div>
            {latestDateEntry[1].slice(0, 3).map((sale) => {
              const recipe = recipes.find((r) => r.id === sale.recipeId);
              const costPerSrv = recipe ? getRecipeCostPerServing(recipe, ingredients, settings) : 0;
              const rev = sale.servingsSold * (recipe?.sellingPrice ?? 0);
              const cost = sale.batchesMade * (costPerSrv * (recipe?.servings ?? 0));
              return (
                <div key={sale.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{recipe?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{sale.servingsSold} sold · {sale.batchesMade} batch{sale.batchesMade > 1 ? 'es' : ''}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-bold ${rev - cost >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatPeso(rev - cost)}
                    </p>
                    <p className="text-[10px] text-gray-400">{formatPeso(rev)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recipe Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Recipe Overview</h2>
          <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'recipes' })} className="text-xs font-semibold text-orange-600">
            View All →
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-3xl mb-2">🍳</p>
            <p className="text-sm font-semibold text-gray-700">No recipes yet</p>
            <p className="text-xs text-gray-500 mt-1">Add your first recipe para makastart!</p>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-recipe' })}
              className="mt-4 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl"
            >
              + Add Recipe
            </button>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recipes.slice(0, 5).map((recipe) => {
              const totalCost = getRecipeTotalCost(recipe, ingredients, settings);
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
                      <p className="text-sm font-bold text-gray-900 truncate">{recipe.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{recipe.category} • {recipe.servings} servings</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Cost/Serving</p>
                          <p className="text-sm font-bold text-gray-800">{formatPeso(costPerServing)}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-100" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">SRP</p>
                          <p className="text-sm font-bold text-gray-800">{formatPeso(recipe.sellingPrice)}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-100" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Cost</p>
                          <p className="text-sm font-bold text-gray-800">{formatPeso(totalCost)}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 px-3 py-1.5 rounded-xl text-center ${
                      isLoss ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <p className="text-xs font-bold">{margin.toFixed(0)}%</p>
                      <p className="text-[10px] font-medium">margin</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Masterclass Guides Section */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Chef Masterclasses & Guides</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Pizza Masterclass Banner */}
          {canPizza && (
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-4 text-white relative overflow-hidden shadow-md shadow-orange-200">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1"><span>👨‍🍳 Chef EJ Masterclass</span></div>
                  <h3 className="text-base font-extrabold leading-tight">Pizza Making Guide & Ratios</h3>
                  <p className="text-xs text-orange-100 mt-0.5">Dough stages, poolish preferments, artisan sauces & costing</p>
                </div>
                <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'masterclass' })} className="px-3.5 py-2 bg-white text-orange-700 text-xs font-extrabold rounded-xl shrink-0 shadow-sm hover:bg-orange-50 active:scale-95 transition-all">Open Guide &rarr;</button>
              </div>
            </div>
          )}

          {/* Mexican Masterclass Banner */}
          {canMexican && (
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-red-700 rounded-3xl p-4 text-white relative overflow-hidden shadow-md shadow-emerald-200">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1"><span>👨‍🍳 Chef Michael Navarra</span></div>
                  <h3 className="text-base font-extrabold leading-tight">Flavors of Mexico Guide</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Birria, Barbacoa, Asada, 3 Salsas, Guacamole & exact spice ratios</p>
                </div>
                <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'mexican-masterclass' })} className="px-3.5 py-2 bg-white text-emerald-800 text-xs font-extrabold rounded-xl shrink-0 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all">Open Guide &rarr;</button>
              </div>
            </div>
          )}

          {/* Chef EJ Recipes Banner */}
          {canChefEj && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-800 via-red-700 to-orange-600 p-4 text-white shadow-md shadow-rose-200">
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-lg" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md"><span>👨‍🍳 Chef EJ Recipes</span></div>
                  <h3 className="text-base font-extrabold leading-tight">Brioche, Sauces & Burgers Guide</h3>
                  <p className="mt-0.5 text-xs text-rose-100">Buns, ciabatta, aioli, patty mix, sandwiches & costing</p>
                </div>
                <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'chef-ej-masterclass' })} className="shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-rose-800 shadow-sm transition-all hover:bg-rose-50 active:scale-95">Open Guide &rarr;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-6">
          {canPizza && <QuickAction emoji="🍕" label="Pizza Guide" onClick={() => dispatch({ type: 'SET_VIEW', view: 'masterclass' })} />}
          {canMexican && <QuickAction emoji="🌮" label="Mexican Guide" onClick={() => dispatch({ type: 'SET_VIEW', view: 'mexican-masterclass' })} />}
          {canChefEj && <QuickAction emoji="🍔" label="Chef EJ Guide" onClick={() => dispatch({ type: 'SET_VIEW', view: 'chef-ej-masterclass' })} />}
          <QuickAction emoji="📝" label="New Recipe" onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-recipe' })} />
          <QuickAction emoji="🧺" label="Ingredient" onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-ingredient' })} />
          <QuickAction emoji="💰" label="Record Sale" onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-sale' })} />
          <QuickAction emoji="⚙️" label="Settings" onClick={() => dispatch({ type: 'SET_VIEW', view: 'settings' })} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ emoji, label, value, sub, bg, border }: {
  emoji: string; label: string; value: string; sub: string; bg: string; border: string;
}) {
  return (
    <div className={`${bg} ${border} rounded-2xl border p-4 md:p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 md:text-3xl">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>
    </div>
  );
}

function QuickAction({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-3 text-center active:scale-95 transition-transform hover:shadow-md"
    >
      <span className="text-xl">{emoji}</span>
      <p className="text-[10px] font-semibold text-gray-800 mt-1">{label}</p>
    </button>
  );
}
