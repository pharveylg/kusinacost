import { useState } from 'react';
import { useApp, usePersistedActions, generateId } from '../store';
import type { Ingredient, Recipe } from '../types';

export default function MexicanMasterclass() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const [activeTab, setActiveTab] = useState<'meats' | 'dishes' | 'salsas' | 'seasoning'>('meats');
  const [imported, setImported] = useState(false);

  // ─── 1-Click Import Mexican Data into Costing App ───
  function handleImportToCosting() {
    const mexicanIngredients: Omit<Ingredient, 'id'>[] = [
      { name: 'Ox Tail (Beef)', purchasePrice: 450, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
      { name: 'Beef Shank', purchasePrice: 380, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
      { name: 'Pork Kasim (Shoulder)', purchasePrice: 310, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
      { name: 'Ancho Chili / Guajillo Chili', purchasePrice: 150, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Corn or Flour Tortillas', purchasePrice: 120, purchaseQty: 20, purchaseUnit: 'pcs', category: 'Staples' },
      { name: 'Jasmine Rice', purchasePrice: 60, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
      { name: 'Cumin & Paprika Powder', purchasePrice: 80, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Cayenne & Chili Powder', purchasePrice: 75, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Garlic & Onion Powder', purchasePrice: 65, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Fresh Avocado', purchasePrice: 180, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Fresh Mango (Ripe)', purchasePrice: 130, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Cilantro (Wansoy)', purchasePrice: 40, purchaseQty: 100, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Limes / Calamansi', purchasePrice: 80, purchaseQty: 500, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Mozzarella Cheese (Shredded)', purchasePrice: 380, purchaseQty: 1, purchaseUnit: 'kg', category: 'Dairy' },
      { name: 'Pineapple Juice (Canned)', purchasePrice: 55, purchaseQty: 500, purchaseUnit: 'mL', category: 'Canned Goods' },
      { name: 'Tomato Paste / Canned Tomatoes', purchasePrice: 65, purchaseQty: 400, purchaseUnit: 'g', category: 'Canned Goods' },
      { name: 'Honey & White Wine Vinegar', purchasePrice: 95, purchaseQty: 250, purchaseUnit: 'mL', category: 'Condiments' },
    ];

    const addedIngIds: Record<string, string> = {};

    mexicanIngredients.forEach((pi) => {
      const existing = state.ingredients.find((i) => i.name.toLowerCase() === pi.name.toLowerCase());
      if (existing) {
        addedIngIds[pi.name] = existing.id;
      } else {
        const newId = generateId();
        addedIngIds[pi.name] = newId;
        actions.addIngredient({ ...pi, id: newId });
      }
    });

    const sampleMexicanRecipes: Omit<Recipe, 'id'>[] = [
      {
        name: 'Chef Michael Authentic Beef Birria Tacos',
        category: 'Ulam',
        servings: 6,
        sellingPrice: 199,
        notes: 'Chef Michael Navarra Birria: Shredded slow-cooked oxtail/shank (20g/taco), basted tortilla with manteca, served with rich birria consommé dip and lime.',
        overhead: {
          prepTimeMin: 25,
          cookingTimeMin: 15,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Griddle / Thick Pan', type: 'lpg-stove', minutes: 25 }],
          packagingPerServing: 10,
          otherCost: 20,
          otherCostLabel: 'Consommé Cup & Foil',
        },
        ingredients: [
          { ingredientId: addedIngIds['Ox Tail (Beef)'] || '', qty: 0.3, unit: 'kg' },
          { ingredientId: addedIngIds['Beef Shank'] || '', qty: 0.3, unit: 'kg' },
          { ingredientId: addedIngIds['Corn or Flour Tortillas'] || '', qty: 6, unit: 'pcs' },
          { ingredientId: addedIngIds['Ancho Chili / Guajillo Chili'] || '', qty: 15, unit: 'g' },
          { ingredientId: addedIngIds['Cilantro (Wansoy)'] || '', qty: 20, unit: 'g' },
          { ingredientId: addedIngIds['Limes / Calamansi'] || '', qty: 100, unit: 'g' },
        ],
      },
      {
        name: 'Carne Asada Tacos Al Pastor Plate',
        category: 'Ulam',
        servings: 4,
        sellingPrice: 249,
        notes: 'Slow roasted pork Kasim marinated in Mexican seasoning and pineapple juice for 3-4 hours. Served on tortilla with salsa, white sauce & cilantro.',
        overhead: {
          prepTimeMin: 20,
          cookingTimeMin: 15,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Oven / Griddle', type: 'lpg-oven', minutes: 30 }],
          packagingPerServing: 12,
          otherCost: 15,
          otherCostLabel: 'Salsa Cups',
        },
        ingredients: [
          { ingredientId: addedIngIds['Pork Kasim (Shoulder)'] || '', qty: 0.6, unit: 'kg' },
          { ingredientId: addedIngIds['Corn or Flour Tortillas'] || '', qty: 8, unit: 'pcs' },
          { ingredientId: addedIngIds['Pineapple Juice (Canned)'] || '', qty: 250, unit: 'mL' },
          { ingredientId: addedIngIds['Cumin & Paprika Powder'] || '', qty: 20, unit: 'g' },
          { ingredientId: addedIngIds['Cilantro (Wansoy)'] || '', qty: 15, unit: 'g' },
        ],
      },
      {
        name: 'Loaded Beef & Mozzarella Quesadilla w/ Mango Salsa',
        category: 'Merienda',
        servings: 4,
        sellingPrice: 225,
        notes: 'Chef Michael Recipe: 2 large tortillas, 40g Pomodoro, 45g shredded mozzarella, 45g meat per serving. Served with sweet-spicy Mango Salsa.',
        overhead: {
          prepTimeMin: 15,
          cookingTimeMin: 10,
          laborPax: 1,
          appliances: [{ id: generateId(), name: 'Griddle', type: 'lpg-stove', minutes: 15 }],
          packagingPerServing: 12,
          otherCost: 15,
          otherCostLabel: 'Quesadilla Box',
        },
        ingredients: [
          { ingredientId: addedIngIds['Corn or Flour Tortillas'] || '', qty: 8, unit: 'pcs' },
          { ingredientId: addedIngIds['Mozzarella Cheese (Shredded)'] || '', qty: 0.18, unit: 'kg' },
          { ingredientId: addedIngIds['Beef Shank'] || '', qty: 0.2, unit: 'kg' },
          { ingredientId: addedIngIds['Fresh Mango (Ripe)'] || '', qty: 0.16, unit: 'kg' },
          { ingredientId: addedIngIds['Honey & White Wine Vinegar'] || '', qty: 30, unit: 'mL' },
        ],
      }
    ];

    sampleMexicanRecipes.forEach((r) => {
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
            🌮 The Skillerist — Flavors of Mexico
          </h1>
          <p className="text-xs text-gray-500">Chef Michael Navarra • Birria, Asada, Salsas & Ratios</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-red-800 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-emerald-200">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-black/15 rounded-full" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>👨‍🍳 Chef Michael Navarra Masterclass</span>
          </div>
          <h2 className="text-lg font-extrabold leading-tight">Authentic Mexican Flavors & Techniques</h2>
          <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
            Includes exact spice ratios, slow-cooked Barbacoa & Birria consommé procedures, Tacos Al Pastor, Guacamole Brunoise, and 3 Signature Salsas.
          </p>

          <button
            onClick={handleImportToCosting}
            disabled={imported}
            className={`mt-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
              imported
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98'
            }`}
          >
            {imported ? (
              <>✅ Imported Ingredients & 3 Costed Recipes!</>
            ) : (
              <>📥 Import Mexican Data to Costing Calculator</>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-gray-200/60 p-1.5 rounded-2xl">
        {[
          { id: 'meats', label: '🥩 Meats', sub: 'Birria/Asada' },
          { id: 'dishes', label: '🌮 Tacos', sub: '4 Dishes' },
          { id: 'salsas', label: '🥑 Salsas', sub: '& Guac' },
          { id: 'seasoning', label: '🌶️ Spices', sub: '& Rice' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              activeTab === tab.id
                ? 'bg-white text-emerald-700 font-extrabold shadow-sm scale-[1.02]'
                : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <p className="text-xs leading-none">{tab.label}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{tab.sub}</p>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: MEATS & SLOW COOKS (BARBACOA & CARNE ASADA) ─── */}
      {activeTab === 'meats' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <span>💡 Chef Michael's Slow Cook & Storage Rules</span>
            </h3>
            <ul className="text-xs text-emerald-800 space-y-1 pl-4 list-disc">
              <li><strong>Consommé Protection:</strong> If cooking Birria/Barbacoa a day ahead, pour a portion of the broth over the meat before storing to prevent drying.</li>
              <li><strong>Shelf Life (Barbacoa):</strong> 3 days Chilled (1–4°C) | 2 weeks Frozen (0 to -16°C).</li>
              <li><strong>Carne Asada Marinade:</strong> Rest marinated Kasim for at least <strong>1 hour up to overnight</strong> before searing.</li>
              <li><strong>Shredding Target:</strong> Shred roasted Carne Asada into clean <strong>1–1.5 cm shreds</strong> for perfect taco bite.</li>
            </ul>
          </div>

          {/* Barbacoa */}
          <RecipeCard
            icon="🥩"
            title="3. Barbacoa (Birria Consommé Base)"
            subtitle="Rich, fall-off-the-bone beef shank & oxtail slow simmered with chilies"
            ingredients={[
              { name: 'Ox Tail & Beef Shank', amount: '2 kg each (4 kg total)' },
              { name: 'Ancho Chili & Guajillo Chili', amount: '20 g (or 2 pcs each)' },
              { name: 'Leeks / Celery / Onion', amount: '120 g / 60 g / 150 g' },
              { name: 'Garlic', amount: '60 g (5–6 cloves)' },
              { name: 'Canned Tomatoes / Paste', amount: '300 g / 45 g' },
              { name: 'Beef Stock', amount: '4 Liters (or 2 beef cubes)' },
              { name: 'Mexican Seasoning', amount: '15 g (adjust to preference)' },
              { name: 'Smoked Peppers (Optional)', amount: '100 g' },
            ]}
            chefTips={[
              'Simmer Time: 3–4 hours in a covered pot, OR under 1 hour in a pressure cooker on low heat.',
              'Tenderness Check: Meat should be falling off the bones with fat fully rendered.',
              'Strain the birria consommé and set aside for dipping and basting.',
            ]}
            steps={[
              '1. Season both meats with dry Mexican seasoning.',
              '2. Sear the meat in a thick bottom pan or pressure cooker until browned, then transfer to a bowl to rest.',
              '3. Sweat aromatics over medium heat (garlic, onion, leek, celery), followed by tomato paste and canned tomatoes. Continue sweating until soft enough to mash with a wooden spoon. Stir in chopped chilies.',
              '4. Deglaze pan with beef stock and add seared meat. Cover pot and simmer 3–4 hours (or <1 hr in pressure cooker).',
              '5. Separate meat from bones by fork or hand, gently separating fibers. Strain consommé.',
            ]}
          />

          {/* Carne Asada */}
          <RecipeCard
            icon="🍖"
            title="12. Carne Asada"
            subtitle="Caramelized pork Kasim roasted in pineapple juice & aromatics (Yield: 2 servings base)"
            ingredients={[
              { name: 'Pork Kasim (Shoulder)', amount: '4000 g (4 kg)' },
              { name: 'Mexican Seasoning', amount: '60 g' },
              { name: 'Olive Oil', amount: '60 g' },
              { name: 'Pineapple Juice', amount: '2 Cans (500 mL)' },
              { name: 'Canned Tomato', amount: '1 Can' },
              { name: 'Ancho Chili (or Pasilla)', amount: '1 pc' },
              { name: 'Garlic & Onion', amount: '100 g / 200 g' },
              { name: 'Celery & Atsuete Oil', amount: 'As needed' },
            ]}
            chefTips={[
              'Optional Aromatics: Cinnamon, Cloves, Bay Leaf add authentic warmth.',
              'Shelf Life: Serve immediately or store in fridge no longer than 48 hours.',
            ]}
            steps={[
              '1. Marinate pork Kasim with Mexican seasoning. Cover and rest for 1 hour to overnight.',
              '2. Grill or sear marinated Kasim until all sides are caramelized, then transfer to a baking tray.',
              '3. Pour in olive oil, pineapple juice, canned tomato, and aromatics.',
              '4. Cover with foil and slow cook in a preheated oven for 3–4 hours.',
              '5. Season to taste and shred meat into 1–1.5 cm shreds.',
            ]}
          />
        </div>
      )}

      {/* ─── TAB 2: TACOS, BIRRIA & QUESADILLAS ─── */}
      {activeTab === 'dishes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Birria */}
            <DishCard
              num="4"
              title="Birria Tacos"
              subtitle="Crispy griddle-basted tortilla w/ dipping broth"
              ratios={[
                { label: 'Shredded Beef Meat', val: '20 g (2 tbsp)' },
                { label: 'Cheese (Optional)', val: '10 g' },
                { label: 'Tortilla', val: '1 pc (Flour or Corn)' },
                { label: 'Manteca (Lard/Oil)', val: 'For basting' },
              ]}
              steps={[
                'Hold tortilla forming a half fold; fill with shredded meat, cheese, and cilantro.',
                'Baste both sides of tortilla with manteca/broth oil.',
                'Cook over medium heat on a griddle or thick bottom pan until reddish to golden brown.',
                'Serve hot with a cup of warm beef consommé dip and lime wedge.',
              ]}
            />

            {/* Quesadilla */}
            <DishCard
              num="5"
              title="Quesadilla"
              subtitle="Large golden toasted cheese & meat fold"
              ratios={[
                { label: 'Tortilla (Large)', val: '2 pcs' },
                { label: 'Shredded Mozzarella', val: '45 g' },
                { label: 'Meat of choice', val: '45 g' },
                { label: 'Pomodoro (Optional)', val: '40 g' },
              ]}
              steps={[
                'Lay first tortilla on clean chopping board. Scoop pomodoro sauce and spread evenly.',
                'Distribute meat evenly across sauce, then sprinkle shredded mozzarella all throughout.',
                'Top with second tortilla. Cook over medium heat on a griddle until both sides are reddish to golden brown.',
                'Slice and serve with fresh salsa and guacamole.',
              ]}
            />

            {/* Tacos Al Pastor */}
            <DishCard
              num="6"
              title="Tacos Al Pastor"
              subtitle="Grilled spiced meat w/ white sauce & herbs (Yield: 2 servings)"
              ratios={[
                { label: 'Flour Tortilla', val: '1 pc' },
                { label: 'Grilled Meat', val: '20 g' },
                { label: 'White Sauce & Salsa', val: '5 g each' },
                { label: 'Chopped Cilantro', val: '3 g' },
              ]}
              steps={[
                'Place grilled meat inside flour or corn tortilla.',
                'Drizzle evenly with savory white sauce.',
                'Finish with fresh chopped cilantro.',
                'Serve with salsa and guacamole. (Tip: Excellent with pickled red onion or cucumbers!).',
              ]}
            />

            {/* Fajitas */}
            <DishCard
              num="7"
              title="Fajitas Plate"
              subtitle="Sizzling peppers, onions & spiced meat"
              ratios={[
                { label: 'Mexican Rice', val: '200 g (or 1 cup / 1 tortilla)' },
                { label: 'Sliced Onion & Peppers', val: '30 g each' },
                { label: 'Spiced Oil / Olive Oil', val: '15 g' },
                { label: 'Mexican Seasoning', val: 'To taste' },
              ]}
              steps={[
                'In a hot griddle or thick pan, brown the sliced onions and peppers.',
                'Place sliced meat of your choice; season with salt, pepper, or Mexican seasoning.',
                'Serve alongside 200g Mexican rice or a large flour tortilla.',
                'Garnish with lime wedge and chopped cilantro.',
              ]}
            />
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALSAS, GUACAMOLE & SIDES ─── */}
      {activeTab === 'salsas' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <span>🥑 Chef Michael's Salsa & Brunoise Rules</span>
            </h3>
            <ul className="text-xs text-amber-800 space-y-1 pl-4 list-disc">
              <li><strong>Brunoise Cut:</strong> All salsa vegetables and mangoes should be diced into clean, uniform small cubes (Brunoise).</li>
              <li><strong>1-Second Bursts:</strong> For Salsa Verde and Spicy Salsa, pulse in a blender in <strong>1-second bursts</strong> so ingredients emulsify without turning into liquid puree.</li>
              <li><strong>Guacamole Freshness:</strong> Store in fridge no longer than <strong>24 hours</strong> to prevent oxidation and browning.</li>
            </ul>
          </div>

          {/* Guacamole */}
          <RecipeCard
            icon="🥑"
            title="8. Guacamole (Authentic Brunoise)"
            subtitle="Creamy avocado dip with lime, cilantro & small chunks (Yield: 2 servings)"
            ingredients={[
              { name: 'Avocado (Fresh)', amount: '125 g' },
              { name: 'Tomato & Red Onion', amount: '25 g / 15 g' },
              { name: 'Lime Juice & Cilantro', amount: '1 tsp / 5 g' },
              { name: 'Garlic Paste (Optional)', amount: '5 g' },
              { name: 'Sugar', amount: '6 g (~1/2 tsp)' },
              { name: 'Salt & Mexican Seasoning', amount: '1/2 tsp / 1 g' },
            ]}
            steps={[
              '1. Pit Technique: Cut avocado in half lengthwise and twist apart. Carefully tap sharp knife against pit and twist to dislodge. Scoop flesh into bowl.',
              '2. Mash: Roughly mash avocado with a fork, intentionally leaving small chunks.',
              '3. Brunoise: Cut tomato and red onion into uniform small cubes (brunoise).',
              '4. Fold & Season: Fold in diced veggies, cilantro, sugar, salt, and lime juice.',
              '5. Serve immediately or store chilled no longer than 24 hours.',
            ]}
          />

          {/* Salsas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SalsaCard
              title="9. Salsa Verde"
              tag="Herbaceous & Sweet"
              ingredients={[
                { name: 'Tomato & Red Onion', val: '80 g / 60 g' },
                { name: 'Cucumber', val: '60 g' },
                { name: 'Lime & Calamansi Juice', val: '8 g / 2 tsp' },
                { name: 'Honey', val: '2 tbsp' },
                { name: 'Coriander & Spring Onion', val: '10 g each' },
              ]}
              procedure="Combine all ingredients; pulse using blender in 1-second bursts until incorporated."
            />

            <SalsaCard
              title="10. Salsa Spicy"
              tag="🔥 Fiery Chili Kick"
              ingredients={[
                { name: 'Fresh Chili', val: '10 g' },
                { name: 'Tomato & Red Onion', val: '80 g / 60 g' },
                { name: 'Cucumber', val: '60 g' },
                { name: 'Lime & Calamansi Juice', val: '8 g / 2 tsp' },
                { name: 'Honey', val: '2 tbsp' },
                { name: 'Coriander & Spring Onion', val: '10 g each' },
              ]}
              procedure="Add 10g fresh chili to Verde base; pulse in 1-second bursts."
            />

            <SalsaCard
              title="11. Salsa Mango"
              tag="🥭 Sweet & Refreshing"
              ingredients={[
                { name: 'Fresh Ripe Mango', val: '80 g' },
                { name: 'Tomato & Red Onion', val: '80 g / 60 g' },
                { name: 'Cucumber', val: '60 g' },
                { name: 'Lime & Calamansi Juice', val: '8 g / 2 tsp' },
                { name: 'Honey', val: '2 tbsp' },
                { name: 'Coriander & Spring Onion', val: '10 g each' },
              ]}
              procedure="Cut all into Brunoise cubes. Fold in honey, lime juice, and cilantro. Season with salt/pepper."
            />
          </div>

          {/* Bonus Pickled Onion */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-extrabold">Bonus Recipe #13</span>
              <h4 className="text-sm font-bold text-gray-900 flex-1 ml-2.5 truncate">Pickled Red Onion</h4>
            </div>
            <p className="text-xs text-gray-500">
              Alternate Chef Ratio Note: <strong className="text-purple-700">1 cup white vinegar : 1/2 cup sugar</strong>
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { name: 'Red Onions (Sliced)', val: '100 g' },
                { name: 'White Vinegar', val: '200 g' },
                { name: 'Water', val: '200 g' },
                { name: 'White Sugar', val: '60 g' },
                { name: 'Peppercorns', val: '1 tsp' },
              ].map((ing, i) => (
                <div key={i} className="text-xs flex justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-700">{ing.name}</span>
                  <span className="font-bold text-purple-700">{ing.val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
              📝 Combine vinegar, water, sugar, and peppercorns; heat until sugar dissolves. Pour warm liquid over sliced red onions and chill until pickled.
            </p>
          </div>
        </div>
      )}

      {/* ─── TAB 4: MEXICAN SEASONING & RICE ─── */}
      {activeTab === 'seasoning' && (
        <div className="space-y-4">
          {/* Mexican Seasoning */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-extrabold">Core Blend #2</span>
              <h4 className="text-sm font-bold text-gray-900 flex-1 ml-2.5 truncate">Chef Michael's Mexican Seasoning</h4>
            </div>
            <p className="text-xs text-gray-500">
              Universal dry rub & spice mix used in Barbacoa, Carne Asada, Rice, and Fajitas. Make in bulk and store in airtight jar.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {[
                { name: 'Iodized Salt', val: '120 g', color: 'text-gray-800' },
                { name: 'Chili Powder', val: '60 g', color: 'text-red-600' },
                { name: 'Ground Paprika', val: '120 g', color: 'text-red-700' },
                { name: 'Ground Cumin', val: '80 g', color: 'text-amber-700' },
                { name: 'Garlic Powder', val: '40 g', color: 'text-amber-800' },
                { name: 'Black Pepper', val: '20 g', color: 'text-gray-700' },
                { name: 'Cayenne Powder', val: '60 g', color: 'text-red-600' },
                { name: 'Onion Powder', val: '40 g', color: 'text-amber-800' },
              ].map((sp, i) => (
                <div key={i} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-600">{sp.name}</p>
                  <p className={`text-base font-extrabold mt-0.5 ${sp.color}`}>{sp.val}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
              Total yield per batch: <strong>540 grams</strong> of authentic Mexican seasoning.
            </p>
          </div>

          {/* Mexican Rice */}
          <RecipeCard
            icon="🍚"
            title="1. Authentic Mexican Rice"
            subtitle="Rich tomato, broth & spice infused Jasmine rice"
            ingredients={[
              { name: 'Jasmine Rice', amount: '4 Cups' },
              { name: 'Chicken Stock', amount: '8 Cups' },
              { name: 'White Onion (Minced)', amount: '1 Cup' },
              { name: 'Garlic (Minced)', amount: '2 Cloves' },
              { name: 'Tomato Paste', amount: '2 tbsp' },
              { name: 'Celery (with leaves)', amount: '2 pcs' },
              { name: 'Ground Coriander', amount: '2 tsp' },
              { name: 'Mexican Seasoning', amount: '4 tsp' },
              { name: 'Butter', amount: '6 tbsp' },
              { name: 'Salt', amount: 'To taste' },
            ]}
            chefTips={[
              'Sauté vegetables in butter first until lightly brown to build foundational aroma.',
              'Use low heat when adding water/tomato sauce to prevent hot oil spattering.',
              'Fluff rice and let sit covered for 5–10 minutes after turning off heat.',
            ]}
            steps={[
              '1. Sauté rice over medium-high heat. Add vegetables and cook until lightly brown. Add garlic and tomato paste for 1 minute. Add stock and salt.',
              '2. Stir in 4 tsp Mexican seasoning.',
              '3. Reduce heat to low. Gently pour in warm water, tomato sauce, chili powder, Caldo de Tomate, and minced garlic. Bring to a boil on medium-high, then cover on low and simmer 20 minutes until water is absorbed.',
              '4. Turn off heat, fluff rice, and rest covered 5–10 minutes before serving.',
            ]}
          />
        </div>
      )}
    </div>
  );
}

// ─── Subcomponents for Clean Formatting ───

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
        <span className="text-2xl p-2 bg-emerald-50 rounded-xl">{icon}</span>
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
              <span className="font-bold text-emerald-700 shrink-0">{ing.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {chefTips && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <p className="text-[10px] font-bold uppercase text-amber-700">👨‍🍳 Chef Michael Navarra Tips</p>
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

function DishCard({
  num,
  title,
  subtitle,
  ratios,
  steps,
}: {
  num: string;
  title: string;
  subtitle: string;
  ratios: { label: string; val: string }[];
  steps: string[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
            {num}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
            <p className="text-[11px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {ratios.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
              <span className="text-gray-600 font-medium">{r.label}</span>
              <span className="font-bold text-emerald-800 ml-2">{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">📝 Assembly</p>
        <div className="space-y-1">
          {steps.map((s, i) => (
            <p key={i} className="text-xs text-gray-700 leading-relaxed bg-emerald-50/40 px-2.5 py-1.5 rounded-lg border border-emerald-100/60">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SalsaCard({
  title,
  tag,
  ingredients,
  procedure,
}: {
  title: string;
  tag: string;
  ingredients: { name: string; val: string }[];
  procedure: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
          <h4 className="text-sm font-extrabold text-gray-900 truncate">{title}</h4>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold shrink-0">
            {tag}
          </span>
        </div>

        <div className="space-y-1">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between text-xs bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium truncate">{ing.name}</span>
              <span className="font-bold text-gray-900 ml-2">{ing.val}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 mt-2">
        📝 {procedure}
      </p>
    </div>
  );
}
