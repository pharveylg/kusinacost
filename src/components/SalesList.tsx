import { useState } from 'react';
import {
  useApp,
  formatPeso,
  formatDate,
  groupSalesByDate,
  getOverallSalesSummary,
  getRecipeCostPerServing,
} from '../store';

export default function SalesList() {
  const { state, dispatch } = useApp();
  const { sales, recipes, ingredients, overheadSettings: settings } = state;
  const [showAll, setShowAll] = useState(false);

  const summary = getOverallSalesSummary(sales, recipes, ingredients, settings);
  const grouped = groupSalesByDate(sales);
  const dateEntries = [...grouped.entries()];
  const displayEntries = showAll ? dateEntries : dateEntries.slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 md:text-3xl">Sales</h1>
          <p className="text-xs text-gray-500 mt-0.5">{sales.length} records</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-sale' })}
          className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform shadow-lg shadow-green-200"
        >
          + Record Sale
        </button>
      </div>

      {/* Overall Sales Summary Hero */}
      {sales.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-5 text-white md:p-8">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -right-10 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Overall Sales Summary</p>

            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Revenue</p>
                <p className="text-xl font-extrabold">{formatPeso(summary.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Cost</p>
                <p className="text-xl font-extrabold">{formatPeso(summary.totalCost)}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Actual Profit</p>
                <p className={`text-xl font-extrabold ${summary.actualProfit >= 0 ? '' : 'text-red-200'}`}>
                  {formatPeso(summary.actualProfit)}
                </p>
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase font-semibold">Margin</p>
                <p className="text-xl font-extrabold">{summary.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            {/* Spoilage alert */}
            {summary.totalWasted > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗑️</span>
                  <p className="text-xs">
                    <span className="font-bold">{summary.totalWasted}</span> servings wasted ={' '}
                    <span className="font-bold">{formatPeso(summary.totalSpoilage)}</span> lost
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sales.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-sm font-semibold text-gray-700">No sales recorded yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Record your actual sales para makita ang totoong kita at lugi mo
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-sale' })}
            className="mt-4 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl"
          >
            + Record First Sale
          </button>
        </div>
      )}

      {/* Sales by Date */}
      <div className="grid items-start gap-4 xl:grid-cols-2">
      {displayEntries.map(([date, dateSales]) => {
        const dateSummary = getOverallSalesSummary(dateSales, recipes, ingredients, settings);
        return (
          <div key={date} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Date Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="text-sm font-bold text-gray-900">{formatDate(date)}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {dateSales.length} record{dateSales.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Date-level totals */}
            <div className="px-4 py-2 grid grid-cols-4 gap-2 text-center border-b border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Revenue</p>
                <p className="text-xs font-bold text-green-700">{formatPeso(dateSummary.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Cost</p>
                <p className="text-xs font-bold text-gray-700">{formatPeso(dateSummary.totalCost)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Profit</p>
                <p className={`text-xs font-bold ${dateSummary.actualProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatPeso(dateSummary.actualProfit)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Wasted</p>
                <p className={`text-xs font-bold ${dateSummary.totalWasted > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {dateSummary.totalWasted > 0 ? `🗑️ ${dateSummary.totalWasted}` : '0'}
                </p>
              </div>
            </div>

            {/* Individual sale records */}
            <div className="divide-y divide-gray-50">
              {dateSales.map((sale) => {
                const recipe = recipes.find((r) => r.id === sale.recipeId);
                const totalMade = sale.batchesMade * (recipe?.servings ?? 0);
                const costPerServing = recipe ? getRecipeCostPerServing(recipe, ingredients, settings) : 0;
                const revenue = sale.servingsSold * (recipe?.sellingPrice ?? 0);
                const cost = sale.batchesMade * (recipe ? costPerServing * (recipe.servings) : 0);
                const profit = revenue - cost;

                return (
                  <button
                    key={sale.id}
                    onClick={() => dispatch({ type: 'SET_VIEW', view: 'edit-sale', saleId: sale.id })}
                    className="w-full px-4 py-3 text-left active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {recipe?.name || 'Unknown Recipe'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.batchesMade} batch{sale.batchesMade > 1 ? 'es' : ''} ({totalMade} servings) &rarr;{' '}
                          <span className="text-green-600 font-semibold">{sale.servingsSold} sold</span>
                          {sale.servingsWasted > 0 && (
                            <span className="text-red-500 font-semibold"> · {sale.servingsWasted} wasted</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-sm font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {formatPeso(profit)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Rev {formatPeso(revenue)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>

      {!showAll && dateEntries.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-sm font-semibold text-orange-600 text-center"
        >
          Show all {dateEntries.length} dates →
        </button>
      )}
    </div>
  );
}
