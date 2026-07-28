import { useState } from 'react';
import { useApp, usePersistedActions, generateId } from '../store';
import type { Ingredient, Recipe } from '../types';

export default function PizzaMasterclass() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const [activeTab, setActiveTab] = useState<'dough' | 'sauces' | 'ratios' | 'baking'>('dough');
  const [imported, setImported] = useState(false);

  // ─── 1-Click Import Sample Pizza Data into Costing App ───
  function handleImportToCosting() {
    const pizzaIngredients: Omit<Ingredient, 'id'>[] = [
      { name: 'Bread Flour / 00 Flour (Zero 00)', purchasePrice: 85, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
      { name: 'SAF Instant Yeast (Gold/Blue)', purchasePrice: 150, purchaseQty: 500, purchaseUnit: 'g', category: 'Staples' },
      { name: 'Honey', purchasePrice: 120, purchaseQty: 250, purchaseUnit: 'g', category: 'Staples' },
      { name: 'Olive Oil (Extra Virgin)', purchasePrice: 350, purchaseQty: 500, purchaseUnit: 'mL', category: 'Condiments' },
      { name: 'Mozzarella Cheese', purchasePrice: 380, purchaseQty: 1, purchaseUnit: 'kg', category: 'Dairy' },
      { name: 'Cheddar Cheese', purchasePrice: 280, purchaseQty: 500, purchaseUnit: 'g', category: 'Dairy' },
      { name: 'Parmesan Cheese', purchasePrice: 220, purchaseQty: 250, purchaseUnit: 'g', category: 'Dairy' },
      { name: 'Cream Cheese', purchasePrice: 160, purchaseQty: 225, purchaseUnit: 'g', category: 'Dairy' },
      { name: 'Wipping / Heavy Cream', purchasePrice: 190, purchaseQty: 1, purchaseUnit: 'L', category: 'Dairy' },
      { name: 'Pepperoni Slices', purchasePrice: 320, purchaseQty: 500, purchaseUnit: 'g', category: 'Meat' },
      { name: 'Fresh Basil Leaves', purchasePrice: 80, purchaseQty: 100, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Pine Nuts', purchasePrice: 250, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Truffle Oil', purchasePrice: 450, purchaseQty: 250, purchaseUnit: 'mL', category: 'Condiments' },
      { name: 'Canned Tomatoes / Fresh Tomatoes', purchasePrice: 90, purchaseQty: 1, purchaseUnit: 'kg', category: 'Canned Goods' },
      { name: 'Spinach (Fresh / Frozen)', purchasePrice: 70, purchaseQty: 500, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'White Wine (Cooking)', purchasePrice: 180, purchaseQty: 750, purchaseUnit: 'mL', category: 'Condiments' },
      { name: 'Nutmeg & White Pepper', purchasePrice: 45, purchaseQty: 1, purchaseUnit: 'pack', category: 'Spices' },
    ];

    const addedIngIds: Record<string, string> = {};

    // Check if ingredient already exists to prevent duplicates
    pizzaIngredients.forEach((pi) => {
      const existing = state.ingredients.find((i) => i.name.toLowerCase() === pi.name.toLowerCase());
      if (existing) {
        addedIngIds[pi.name] = existing.id;
      } else {
        const newId = generateId();
        addedIngIds[pi.name] = newId;
        actions.addIngredient({ ...pi, id: newId });
      }
    });

    // Create sample recipes
    const samplePizzaRecipes: Omit<Recipe, 'id'>[] = [
      {
        name: 'Chef EJ Four Cheese Pizza (10" - 12")',
        category: 'Merienda',
        servings: 4,
        sellingPrice: 299,
        notes: 'Chef EJ Ratio: Mozzarella 70g, Cheddar 28g, Parmesan 21g, Cream Cheese 21g + Light White/Tomato Sauce (70-80g). Keep sauce lighter so cheese shines!',
        overhead: {
          prepTimeMin: 20,
          cookingTimeMin: 10,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Pizza Oven / Home Oven', type: 'lpg-oven', minutes: 25 }],
          packagingPerServing: 12,
          otherCost: 15,
          otherCostLabel: 'Pizza Box & Parchment',
        },
        ingredients: [
          { ingredientId: addedIngIds['Bread Flour / 00 Flour (Zero 00)'] || '', qty: 0.3, unit: 'kg' },
          { ingredientId: addedIngIds['Mozzarella Cheese'] || '', qty: 0.07, unit: 'kg' },
          { ingredientId: addedIngIds['Cheddar Cheese'] || '', qty: 0.028, unit: 'kg' },
          { ingredientId: addedIngIds['Parmesan Cheese'] || '', qty: 0.021, unit: 'kg' },
          { ingredientId: addedIngIds['Cream Cheese'] || '', qty: 0.021, unit: 'kg' },
          { ingredientId: addedIngIds['Olive Oil (Extra Virgin)'] || '', qty: 15, unit: 'mL' },
        ],
      },
      {
        name: 'Classic Pepperoni Pizza (10" - 12")',
        category: 'Merienda',
        servings: 4,
        sellingPrice: 275,
        notes: 'Chef EJ Ratio: Tomato sauce 90-100g, Mozzarella 150-170g, Pepperoni 40-60g. Warning: Do not overload pepperoni as it releases excess oil during baking!',
        overhead: {
          prepTimeMin: 15,
          cookingTimeMin: 10,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Pizza Oven / Home Oven', type: 'lpg-oven', minutes: 20 }],
          packagingPerServing: 12,
          otherCost: 15,
          otherCostLabel: 'Pizza Box',
        },
        ingredients: [
          { ingredientId: addedIngIds['Bread Flour / 00 Flour (Zero 00)'] || '', qty: 0.3, unit: 'kg' },
          { ingredientId: addedIngIds['Canned Tomatoes / Fresh Tomatoes'] || '', qty: 0.1, unit: 'kg' },
          { ingredientId: addedIngIds['Mozzarella Cheese'] || '', qty: 0.16, unit: 'kg' },
          { ingredientId: addedIngIds['Pepperoni Slices'] || '', qty: 0.05, unit: 'kg' },
          { ingredientId: addedIngIds['Olive Oil (Extra Virgin)'] || '', qty: 10, unit: 'mL' },
        ],
      },
      {
        name: 'Truffle Mushroom Pizza (10" - 12")',
        category: 'Merienda',
        servings: 4,
        sellingPrice: 349,
        notes: 'Chef EJ Rule: White sauce 70-80g, Mozzarella 140-150g, Truffle Oil 5-10g. NEVER bake truffle oil — always drizzle AFTER baking so it preserves its premium aroma!',
        overhead: {
          prepTimeMin: 20,
          cookingTimeMin: 10,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Pizza Oven / Home Oven', type: 'lpg-oven', minutes: 20 }],
          packagingPerServing: 15,
          otherCost: 20,
          otherCostLabel: 'Premium Pizza Box & Foil',
        },
        ingredients: [
          { ingredientId: addedIngIds['Bread Flour / 00 Flour (Zero 00)'] || '', qty: 0.3, unit: 'kg' },
          { ingredientId: addedIngIds['Mozzarella Cheese'] || '', qty: 0.145, unit: 'kg' },
          { ingredientId: addedIngIds['Wipping / Heavy Cream'] || '', qty: 80, unit: 'mL' },
          { ingredientId: addedIngIds['Truffle Oil'] || '', qty: 8, unit: 'mL' },
        ],
      }
    ];

    samplePizzaRecipes.forEach((r) => {
      const existingRec = state.recipes.find((er) => er.name.toLowerCase() === r.name.toLowerCase());
      if (!existingRec) {
        actions.addRecipe({ ...r, id: generateId() });
      }
    });

    setImported(true);
    setTimeout(() => setImported(false), 3500);
  }

  return (
    <div className="space-y-5 pb-6 md:space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform shrink-0"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
            🍕 Chef EJ's Pizza Masterclass
          </h1>
          <p className="text-xs text-gray-500">Dough stages, artisan sauces, ratios & oven techniques</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-orange-200">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-black/10 rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>👨‍🍳 Professional Guide & Ratios</span>
          </div>
          <h2 className="text-lg font-extrabold leading-tight">Master the Art of Perfect Pizza</h2>
          <p className="text-xs text-orange-100 mt-1 leading-relaxed">
            Includes handwritten notes, poolish preferments, authentic sauce procedures, assembly ratios, and golden rules from Chef EJ.
          </p>

          <button
            onClick={handleImportToCosting}
            disabled={imported}
            className={`mt-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
              imported
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-white text-orange-700 hover:bg-orange-50 active:scale-98'
            }`}
          >
            {imported ? (
              <>✅ Imported Ingredients & 3 Costed Recipes!</>
            ) : (
              <>📥 Import Pizza Data to Costing Calculator</>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 p-1.5 rounded-2xl">
        {[
          { id: 'dough', label: '🥖 Dough', sub: '7 Stages' },
          { id: 'sauces', label: '🥫 Sauces', sub: '3 Recipes' },
          { id: 'ratios', label: '🍕 Ratios', sub: '6 Styles' },
          { id: 'baking', label: '🔥 Baking', sub: '& Tips' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 font-extrabold shadow-sm scale-[1.02]'
                : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <p className="text-xs leading-none">{tab.label}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{tab.sub}</p>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: DOUGH (7 STAGES) ─── */}
      {activeTab === 'dough' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <span>✍️ Chef EJ's Dough Notes & Flour Guide</span>
            </h3>
            <ul className="text-xs text-amber-800 space-y-1 pl-4 list-disc">
              <li><strong>Flour Type:</strong> Use <strong>00 Flour (Zero 00)</strong> for high temp (400–500°C) 3–4 mins on pizza stone.</li>
              <li><strong>Regular Home Oven:</strong> Use <strong>Bread Flour</strong> (ideal 230–250°C, common 200–220°C).</li>
              <li><strong>If using APF:</strong> Add vital wheat gluten at <strong>2% of the flour's total weight</strong>.</li>
              <li><strong>Blooming time:</strong> 2 minutes.</li>
              <li><strong>Straight dough vs Bread type:</strong> Preferment (poolish/sponge) adds superior digestibility and crispness.</li>
            </ul>
          </div>

          {/* Stage 1 */}
          <StageCard
            stage="Stage 1"
            title="Preferment (Sponge / Poolish)"
            ingredients={[
              { name: 'Flour', amount: '300 g' },
              { name: 'Water', amount: '300 g' },
              { name: 'Honey', amount: '5 g' },
              { name: 'Yeast', amount: '5 g (SAF instant gold/blue)' },
            ]}
            notes={[
              'Preferment title note: (poolish)',
              '+ SAF instant (gold). If high sugar/fat use blue yeast.',
              'Correction: 1 hour room temp then min 16–24 hrs inside the chiller.',
            ]}
            steps={[
              'In a mixing bowl, combine water and yeast. Stir until dissolved.',
              'Add the honey and mix briefly.',
              'Add bread flour and mix until smooth (no dry lumps).',
              'Cover the bowl and let ferment at room temp for 1 hour, then min 16–24 hrs inside the chiller. This builds flavor and texture.',
            ]}
          />

          {/* Stage 2 */}
          <StageCard
            stage="Stage 2"
            title="Autolyse (Rest)"
            ingredients={[
              { name: 'Flour', amount: '1,250 g' },
              { name: 'Water', amount: '350 ml room temp (updated + add poolish)' },
              { name: 'Salt', amount: '5 g (Crossed out 40 g)' },
            ]}
            notes={[
              'Beside Stage 2: (Rest)',
              'Beside Water (700 ml original): use 350 ml water + add poolish. Water temp: room temp.',
            ]}
            steps={[
              'In a large bowl, combine flour and water (350 ml + poolish). Mix until a shaggy dough forms (no dry flour).',
              'Cover and rest for 20 minutes. This helps gluten develop naturally and improves extensibility.',
            ]}
          />

          {/* Stage 3 & 4 */}
          <StageCard
            stage="Stage 3 & 4"
            title="Final Mixing & Kneading"
            ingredients={[
              { name: 'Olive oil', amount: '33 g' },
              { name: 'Preferment', amount: 'All poolish from Stage 1' },
            ]}
            notes={[
              'In mixer: Start with 5 mins, then add oil, mix for 10s, then mix at high speed for 1–3 mins.',
            ]}
            steps={[
              'Transfer dough to a mixer with dough hook.',
              'Knead for 8–10 minutes until smooth and elastic, pulling away from the bowl.',
              'Dough should be slightly tacky but not sticky.',
              'Windowpane test: Dough should stretch thin without tearing.',
            ]}
          />

          {/* Stage 5 */}
          <StageCard
            stage="Stage 5"
            title="Bulk Fermentation"
            notes={['Rest time update: 2 hours at room temp (replaced 30–60 mins).']}
            steps={[
              'Lightly oil a container or bowl. Place dough inside and cover.',
              'Let rest at room temperature for 2 hours, or until dough has expanded 1.5–2x in size.',
              'Do 1 fold halfway through if you want better structure.',
            ]}
          />

          {/* Stage 6 */}
          <StageCard
            stage="Stage 6"
            title="Dividing & Balling"
            steps={[
              'Turn dough onto a clean surface. Divide according to desired size.',
              'Shape each portion into tight dough balls: pull edges inward, roll gently to create surface tension.',
            ]}
          >
            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">📏 Pizza Size to Dough Weight Chart</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-800">8-inch</p>
                  <p className="text-sm font-extrabold text-orange-600 mt-0.5">200 g</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-800">10-inch</p>
                  <p className="text-sm font-extrabold text-orange-600 mt-0.5">300 g</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <p className="text-xs font-bold text-gray-800">12-inch</p>
                  <p className="text-sm font-extrabold text-orange-600 mt-0.5">400 g</p>
                </div>
              </div>
            </div>
          </StageCard>

          {/* Stage 7 */}
          <StageCard
            stage="Stage 7 & Shaping"
            title="Cold Fermentation & Baking Setup"
            steps={[
              'Place dough balls in a lightly oiled tray or container with space between each ball.',
              'Cover tightly with lid or plastic wrap. Refrigerate for 12–24 hours to develop superior flavor, airy texture, and easy stretching.',
              'When ready: Lightly flour work surface. Gently stretch dough (avoid rolling pin if possible).',
              'Add sauce, cheese, and toppings. Bake at 250–300°C (480–570°F) or highest oven temperature.',
            ]}
          />
        </div>
      )}

      {/* ─── TAB 2: SAUCES & BASES ─── */}
      {activeTab === 'sauces' && (
        <div className="space-y-4">
          {/* White Sauce */}
          <RecipeCard
            icon="🥛"
            title="Savory White Sauce (Béchamel-Style)"
            subtitle="Rich, creamy base perfect for Four Cheese, Shrimp, or Truffle pizzas"
            ingredients={[
              { name: 'All-purpose flour (APF)', amount: '10 g' },
              { name: 'Butter', amount: '50 g' },
              { name: 'Milk', amount: '150 g' },
              { name: 'Water', amount: '100 g (only tsp if too thick)' },
              { name: 'Nutmeg & White Pepper', amount: '2 g each' },
              { name: 'Salt', amount: '5 g' },
            ]}
            chefTips={[
              'If sauce is too thick &rarr; add a little milk or water.',
              'If too thin &rarr; cook longer on simmer.',
              'For extra flavor: Add oregano or basil, or a touch of cream for richness.',
              '⚠️ Too much sauce = soggy pizza!',
            ]}
            steps={[
              '1. Prepare Liquids: Combine milk & water in a container. Mix well and set aside.',
              '2. Make the Roux: In a saucepan, melt butter over low-medium heat. Once melted (not browned), add flour. Stir continuously for 1–2 mins until smooth paste forms with no raw flour smell. Keep pale (do not brown).',
              '3. Add Liquids: Slowly pour in milk-water while whisking continuously in small amounts to avoid lumps.',
              '4. Cook Sauce: Increase heat to medium-low. Stir constantly 3–5 mins until smooth, creamy, and coats back of a spoon. Season with salt, white pepper, and nutmeg.',
            ]}
          />

          {/* Pesto Sauce */}
          <RecipeCard
            icon="🌿"
            title="Artisan Pesto Sauce Procedure"
            subtitle="Bright green, aromatic basil base for specialty pizzas"
            ingredients={[
              { name: 'Fresh Basil leaves', amount: '150 g' },
              { name: 'Garlic', amount: '10 g' },
              { name: 'Olive oil', amount: '350 g' },
              { name: 'Parmesan cheese', amount: '40 g' },
              { name: 'Pine nuts', amount: '15 g' },
              { name: 'Black pepper & Nutmeg', amount: '1 g each' },
            ]}
            steps={[
              '1. Prepare Ingredients: Wash basil thoroughly. Dry completely using a salad spinner or clean towel (moisture ruins pesto).',
              '2. Blend Base: In food processor, combine basil, garlic, and pine nuts. Pulse until coarsely chopped (do not over-blend yet).',
              '3. Add Cheese & Seasoning: Add Parmesan, black pepper, and nutmeg. Pulse briefly to combine.',
              '4. Drizzle Olive Oil: While blending, slowly drizzle in olive oil until smooth with slight texture and bright green consistency.',
            ]}
          />

          {/* Tomato Sauce */}
          <RecipeCard
            icon="🍅"
            title="Tomato Sauce (Pizza / Pasta Style)"
            subtitle="Authentic simmered tomato sauce with wine and aromatics"
            ingredients={[
              { name: 'Tomatoes', amount: '1000 g (boil 10 mins)' },
              { name: 'Onions', amount: '60 g' },
              { name: 'Olive oil & Garlic', amount: '60 ml / 20 g -> puree' },
              { name: 'White wine', amount: '60 ml' },
              { name: 'Sugar & Chili powder', amount: '1 tsp each' },
              { name: 'Salt', amount: '20 g' },
            ]}
            chefTips={[
              'Simmer time correction: Cook 20–45 minutes on low-medium heat (replaced 20–30 mins). Longer cooking = deeper flavor.',
              'Cool completely before using on pizza dough. Sauce must be thick and spreadable (not watery).',
              'Storage: Chiller 3–5 days. Freezer up to 1 month.',
            ]}
            steps={[
              '1. Prepare Tomatoes: Score bottom of tomatoes, blanch in boiling water 30–60 sec, peel skin and remove seeds (prevents bitterness). Chop into chunks.',
              '2. Sauté Aromatics: Heat olive oil over medium heat. Sauté finely chopped onions 3–5 mins until soft/translucent. Add minced garlic for 30–60s until fragrant (do NOT burn). Pour in white wine and simmer 1–2 mins to reduce alcohol.',
              '3. Simmer: Add chopped tomatoes, salt, sugar, and chili powder. Cook on low-medium heat for 20–45 mins, stirring occasionally until tomatoes break down and sauce thickens.',
              '4. Blend (Optional): For smooth pizza sauce, blend with hand blender. For rustic style, leave chunky. Adjust seasoning to taste.',
            ]}
          />
        </div>
      )}

      {/* ─── TAB 3: ASSEMBLY & RATIOS ─── */}
      {activeTab === 'ratios' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-orange-900 flex items-center gap-1.5 mb-1">
              <span>⚖️ Quick Visual Balance Sweet Spot (10–12" Pizza)</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Sauce</p>
                <p className="text-base font-extrabold text-orange-600 mt-0.5">80–100 g</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Cheese</p>
                <p className="text-base font-extrabold text-orange-600 mt-0.5">150–180 g</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Toppings</p>
                <p className="text-base font-extrabold text-orange-600 mt-0.5">60–100 g</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <RatioCard
              num="1"
              title="Marinara Pizza (No Cheese Classic)"
              style="Light, simple, tomato-forward"
              ratios={[
                { label: 'Tomato sauce', val: '100–120 g' },
                { label: 'Cheese', val: '❌ None' },
                { label: 'Olive oil', val: 'Drizzle (5–10 g)' },
              ]}
              note="Optional: Fresh minced garlic & oregano sprinkled on top."
            />

            <RatioCard
              num="2"
              title="Four Cheese Pizza"
              style="Keep sauce lighter so the cheese blend shines"
              ratios={[
                { label: 'White / Light Tomato Sauce', val: '70–80 g (12")' },
                { label: 'Total Cheese Weight', val: '180–200 g (12")' },
                { label: 'Mozzarella (10" Example)', val: '70 g' },
                { label: 'Cheddar (10" Example)', val: '28 g' },
                { label: 'Parmesan & Cream Cheese', val: '21 g each' },
              ]}
            />

            <RatioCard
              num="3"
              title="Pepperoni Pizza"
              style="Classic American favorite"
              ratios={[
                { label: 'Tomato sauce', val: '90–100 g' },
                { label: 'Mozzarella cheese', val: '150–170 g' },
                { label: 'Pepperoni slices', val: '40–60 g' },
              ]}
              alert="⚠️ Don't overload! Pepperoni releases significant oil during baking."
            />

            <RatioCard
              num="4"
              title="Shrimp Pizza"
              style="Best with savory white sauce or light tomato"
              ratios={[
                { label: 'White sauce', val: '80–90 g' },
                { label: 'Mozzarella cheese', val: '140–160 g' },
                { label: 'Pre-cooked Shrimp', val: '80–100 g' },
              ]}
              note="Tip: Add minced garlic + chili flakes for incredible flavor contrast."
            />

            <RatioCard
              num="5"
              title="Pesto Pizza"
              style="Herbaceous specialty pizza"
              ratios={[
                { label: 'Pesto sauce (Thin layer)', val: '60–70 g' },
                { label: 'Mozzarella cheese', val: '140–160 g' },
                { label: 'Optional Toppings', val: 'Grilled chicken / cherry tomatoes' },
              ]}
              alert="⚠️ Pesto has a strong, concentrated flavor — don't overuse!"
            />

            <RatioCard
              num="6"
              title="Truffle Pizza (Truffle Oil Finish)"
              style="Luxurious earthy aroma"
              ratios={[
                { label: 'White sauce', val: '70–80 g' },
                { label: 'Mozzarella cheese', val: '140–150 g' },
                { label: 'Mushrooms (Optional)', val: '60–80 g' },
                { label: 'Truffle oil (AFTER baking)', val: '5–10 g drizzle' },
              ]}
              alert="🔥 Golden Rule: NEVER bake truffle oil! High oven heat destroys its delicate aroma. Always drizzle immediately after baking."
            />

            {/* Creamy Spinach Note */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                <span>🍃 Chef EJ Creamy Spinach Specialty Note</span>
              </h4>
              <p className="text-xs text-emerald-800 mb-2">
                Handwritten note from bottom right page for Creamy Spinach topping / white pie base:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Cream Cheese', 'Whipping / Heavy Cream', 'Fresh Spinach', 'Minced Parsley', 'Parmesan Cheese', 'Salt to taste'].map((item) => (
                  <span key={item} className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 shadow-2xs">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: BAKING & TIPS ─── */}
      {activeTab === 'baking' && (
        <div className="space-y-4">
          {/* Baking Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Regular Oven (Home)</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Standard Household Setup</p>
                </div>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 pt-1">
                <li>• <strong>Preheat:</strong> 250–270°C (max temp) for at least <strong>30–45 minutes</strong> before baking.</li>
                <li>• <strong>Surface:</strong> Use a Pizza Stone OR an upside-down baking tray.</li>
                <li>• <strong>Bake Time:</strong> <strong>7–12 minutes</strong>. Place on lowest rack first, then move higher if needed.</li>
                <li>• <strong>Top Browning:</strong> Turn on top broiler heat for the last 1–2 minutes.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎡</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Pizza Rotating Oven</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Commercial Style</p>
                </div>
              </div>
              <ul className="text-xs text-gray-700 space-y-1.5 pt-1">
                <li>• <strong>Temperature:</strong> <strong>300–350°C</strong>.</li>
                <li>• <strong>Bake Time:</strong> <strong>3–5 minutes</strong> only!</li>
                <li>• <strong>Rotation:</strong> Ensures even cooking and balanced crust color. Watch closely as baking happens very fast.</li>
              </ul>
            </div>
          </div>

          {/* Golden Rules */}
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-2xl p-5 shadow-md space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <span>⭐ Chef EJ's Golden Rules of Pizza Making</span>
            </h3>

            <div className="space-y-2.5 text-xs text-gray-200 divide-y divide-white/10">
              <div className="pt-2 flex items-start gap-2">
                <span className="text-orange-400 font-bold">1.</span>
                <div>
                  <strong className="text-white">Less sauce = Better crust:</strong> Never drench your dough. Too much sauce or cheese creates excess moisture, resulting in a soggy, floppy pie.
                </div>
              </div>

              <div className="pt-2 flex items-start gap-2">
                <span className="text-orange-400 font-bold">2.</span>
                <div>
                  <strong className="text-white">Standard Layering Order:</strong> Always apply Sauce &rarr; Cheese &rarr; Toppings. This protects the crust and ensures toppings roast properly.
                </div>
              </div>

              <div className="pt-2 flex items-start gap-2">
                <span className="text-orange-400 font-bold">3.</span>
                <div>
                  <strong className="text-white">Post-Bake Finishing:</strong> For premium finishes, add delicate oils (Olive oil, Truffle oil) or fresh basil leaves AFTER baking so they don't burn or lose aroma.
                </div>
              </div>

              <div className="pt-2 flex items-start gap-2">
                <span className="text-orange-400 font-bold">4.</span>
                <div>
                  <strong className="text-white">Cold Fermentation is King:</strong> Giving your dough balls 12–24 hours in the chiller breaks down complex starches, making the pizza much lighter, easier to digest, and crispier.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponents for Clean Formatting ───

function StageCard({
  stage,
  title,
  ingredients,
  notes,
  steps,
  children,
}: {
  stage: string;
  title: string;
  ingredients?: { name: string; amount: string }[];
  notes?: string[];
  steps?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-extrabold">{stage}</span>
        <h4 className="text-sm font-bold text-gray-900 flex-1 ml-2.5 truncate">{title}</h4>
      </div>

      {ingredients && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">🥘 Ingredients</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ingredients.map((ing, i) => (
              <div key={i} className="text-xs flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">{ing.name}</span>
                <span className="font-bold text-orange-600">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 space-y-1">
          <p className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-1">
            <span>✍️ Handwritten Note / Tip</span>
          </p>
          {notes.map((n, i) => (
            <p key={i} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-amber-600">
              {n}
            </p>
          ))}
        </div>
      )}

      {steps && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">📝 Procedure</p>
          <div className="space-y-1">
            {steps.map((s, i) => (
              <p key={i} className="text-xs text-gray-700 leading-relaxed bg-gray-50/60 px-3 py-2 rounded-xl border border-gray-100/80">
                {s}
              </p>
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

function RecipeCard({
  icon,
  title,
  subtitle,
  ingredients,
  chefTips,
  steps,
}: {
  icon: string;
  title: string;
  subtitle: string;
  ingredients: { name: string; amount: string }[];
  chefTips?: string[];
  steps: string[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-start gap-2.5 border-b border-gray-100 pb-3">
        <span className="text-2xl p-2 bg-orange-50 rounded-xl">{icon}</span>
        <div>
          <h4 className="text-sm font-extrabold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">🥘 Ingredients</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ingredients.map((ing, i) => (
            <div key={i} className="text-xs flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100">
              <span className="font-medium text-gray-700 truncate mr-1">{ing.name}</span>
              <span className="font-bold text-orange-600 shrink-0">{ing.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {chefTips && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <p className="text-[10px] font-bold uppercase text-amber-700">👨‍🍳 Chef EJ Tips & Ratios</p>
          {chefTips.map((tip, i) => (
            <p key={i} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-amber-600">
              {tip}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">📝 Step-by-Step Procedure</p>
        <div className="space-y-1.5">
          {steps.map((s, i) => (
            <p key={i} className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 px-3 py-2 rounded-xl border border-gray-100">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function RatioCard({
  num,
  title,
  style,
  ratios,
  note,
  alert,
}: {
  num: string;
  title: string;
  style: string;
  ratios: { label: string; val: string }[];
  note?: string;
  alert?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
          <p className="text-[11px] text-gray-500">{style}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {ratios.map((r, i) => (
          <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-xs">
            <span className="text-gray-600 font-medium">{r.label}</span>
            <span className="font-extrabold text-gray-900 ml-2">{r.val}</span>
          </div>
        ))}
      </div>

      {note && (
        <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
          💡 {note}
        </p>
      )}

      {alert && (
        <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-xl border border-red-100 font-medium">
          {alert}
        </p>
      )}
    </div>
  );
}
