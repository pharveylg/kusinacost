import { useState } from 'react';
import { useApp, usePersistedActions, generateId } from '../store';
import type { Ingredient, Recipe } from '../types';

type Tab = 'bakery' | 'prep' | 'sandwiches';

interface GuideRecipe {
  icon: string;
  title: string;
  subtitle: string;
  yieldText?: string;
  ingredients: { name: string; amount: string; note?: string }[];
  steps: string[];
  notes?: string[];
  assembly?: string[];
}

const bakeryRecipes: GuideRecipe[] = [
  {
    icon: '🍔',
    title: '1. Brioche Bun',
    subtitle: 'Bread + bun (Philnico)',
    yieldText: 'Yield: 7–8 pcs at 100g each; mold at 90g',
    ingredients: [
      { name: 'Fresh Milk', amount: '60 g', note: 'Tangzhong' },
      { name: 'Bread Flour', amount: '20 g', note: 'Tangzhong' },
      { name: 'Water', amount: '30 ml', note: 'Tangzhong' },
      { name: 'Bread Flour', amount: '320 g', note: 'Dough' },
      { name: 'Instant Dried Yeast', amount: '9 g', note: 'SAF Gold' },
      { name: 'Salt', amount: '7 g', note: 'Iodized' },
      { name: 'Sugar', amount: '25 g' },
      { name: 'Egg', amount: '1 large' },
      { name: 'Milk Powder', amount: '12 g' },
      { name: 'Unsalted Butter', amount: '45 g', note: 'Room temp, not melted' },
      { name: 'Fresh Milk', amount: '120 ml' },
    ],
    notes: [
      'Windowpane check every 5 minutes: stretchy, sticky, but comes off easily.',
      'Egg wash: 1:1 ratio with milk.',
      'Do not overproof and do not deflate the dough like in the videos.',
    ],
    steps: [
      'Cook the Tangzhong with milk, bread flour, and water in a hot pan until combined. Cool at room temperature.',
      'Whisk the dry dough ingredients in one bowl. Combine the wet ingredients except butter in another bowl.',
      'Add dry ingredients to a stand mixer, then wet ingredients and Tangzhong. Mix at medium speed for 3 minutes (changed from 5).',
      'Add butter one piece at a time while mixing for 10–12 minutes.',
      'Place dough in an oiled bowl, cover, and let rise to twice its size. Mold into 90g buns.',
      'Brush with 1:1 egg wash and proof again for 10–12 minutes. Bake at 190°C for 10–15 minutes.',
      'Optional: brush the hot tops with clarified butter.',
    ],
  },
  {
    icon: '🥖',
    title: '2. Ciabatta Bread',
    subtitle: 'Sourdough-style texture using an easy instant starter',
    yieldText: 'Starter timing: 8–12 hours before baking; can rest 12–24 hours',
    ingredients: [
      { name: 'Flour', amount: '125 g', note: 'Starter; APF or bread flour' },
      { name: 'Water', amount: '120 g', note: 'Starter' },
      { name: 'Instant Yeast', amount: '¼ tsp', note: 'Starter' },
      { name: 'APF', amount: '250 g', note: 'Dough' },
      { name: 'Salt', amount: '6 g', note: 'Dough' },
      { name: 'Instant Yeast', amount: '½ tsp', note: 'Dough' },
      { name: 'Water', amount: '180 g', note: 'Lukewarm' },
      { name: 'Milk', amount: '60 g', note: 'Lukewarm' },
    ],
    notes: [
      'Knead at medium-high speed.',
      'If too gooey or sticky, add 1 tbsp (20g) flour and knead 2 minutes.',
      'If too dry, add 1 tsp fresh milk at a time.',
    ],
    steps: [
      'Starter: combine flour, water, and instant yeast until incorporated. Cover and leave overnight or 12–24 hours.',
      'Mix APF, salt, and yeast. Add starter, water, and milk in a mixer with hook attachment.',
      'Knead for 10 minutes at medium-high speed. Cover an oiled bowl and rest for 1 hour.',
      'Fold by hand 15 times, rest 30 minutes, fold another 15 times, then rest in a container for 30 minutes.',
      'Flour the table generously, cut and mold dough, place on a floured tray, and rest another 30 minutes.',
      'Cut to desired size. Bake 15 minutes, rotate tray, then bake another 10 minutes.',
    ],
  },
];

const prepRecipes: GuideRecipe[] = [
  {
    icon: '🧄',
    title: '3. Garlic Aioli',
    subtitle: 'Emulsified sauce for burgers and sandwiches',
    ingredients: [
      { name: 'Egg Yolk', amount: '4 large' },
      { name: 'Lemon Juice', amount: '1 pc' },
      { name: 'Lemon Zest', amount: '1 pc' },
      { name: 'Mustard', amount: '½ tbsp' },
      { name: 'Worcestershire Sauce', amount: '1 tbsp' },
      { name: 'Garlic', amount: '6 cloves' },
      { name: 'Canola Oil', amount: '1 liter' },
      { name: 'Salt & Water', amount: 'To taste / as needed' },
      { name: 'Cracked Black Pepper', amount: 'To taste', note: 'Strictly use cracked black pepper' },
    ],
    notes: ['If sauce breaks: beat another egg with lemon juice in a separate bowl, then slowly whisk in the broken aioli.'],
    steps: [
      'Beat egg yolks with lemon juice for about 1 minute using a hand mixer.',
      'Slowly add canola oil until the mixture emulsifies.',
      'When emulsified, add mustard, lemon zest, and garlic while continuing to add oil.',
      'Season with salt, cracked black pepper, and Worcestershire sauce.',
      'Whenever the mixture thickens, add a little water until smooth.',
    ],
  },
  {
    icon: '🥫',
    title: '4. Burger Sauce',
    subtitle: 'Tangy diced relish sauce',
    ingredients: [
      { name: 'Red Onion', amount: '100 g diced' },
      { name: 'Pickles', amount: '80 g diced' },
      { name: 'Jalapeno', amount: '10 g diced' },
      { name: 'Pickled Shallots', amount: '10 g diced' },
      { name: 'Tomato Ketchup', amount: '128 g' },
      { name: 'Aioli', amount: '128 g' },
      { name: 'Salt', amount: '5 g' },
      { name: 'Pepper', amount: '4 g' },
    ],
    steps: ['Mix all ingredients together.', 'Adjust with salt and pepper.'],
  },
  {
    icon: '🧅',
    title: '5. Caramelized Onion',
    subtitle: 'Slow-cooked sweet onion topping',
    ingredients: [
      { name: 'White Onion', amount: '2 large' },
      { name: 'Olive Oil', amount: '3 tbsp' },
      { name: 'White Sugar', amount: '20 g' },
      { name: 'Water & Salt', amount: 'To taste' },
    ],
    steps: [
      'Slowly cook sliced white onions in a pan over medium-low heat until brown.',
      'Add sugar so caramelization starts.',
      'Add water and salt to adjust the taste.',
    ],
  },
  {
    icon: '🥒',
    title: '6. Pickling Juice',
    subtitle: 'Multi-purpose sweet and sour pickle base',
    ingredients: [
      { name: 'Water', amount: '750 g' },
      { name: 'Vinegar', amount: '500 g' },
      { name: 'Salt', amount: '36 g' },
      { name: 'Sugar', amount: '200 g' },
    ],
    notes: ['Must boil!'],
    steps: ['Put all ingredients in a saucepan or pot and cook until it boils.'],
  },
  {
    icon: '🍗',
    title: '7. Fillet Dry Mix',
    subtitle: 'Crispy coating blend for fried fish or chicken',
    ingredients: [
      { name: 'All-Purpose Flour', amount: '450 g' },
      { name: 'Polenta', amount: '45 g', note: 'Optional' },
      { name: 'Garlic Powder', amount: '19 g' },
      { name: 'Onion Powder', amount: '14 g' },
      { name: 'Black Pepper', amount: '6 g', note: 'Cracked' },
      { name: 'Fine / Iodized Salt', amount: '10 g' },
      { name: 'Cayenne Pepper', amount: '5 g' },
      { name: 'Paprika', amount: '5 g' },
    ],
    steps: ['Mix all ingredients together.'],
  },
  {
    icon: '🍄',
    title: '8. Fajitas',
    subtitle: 'Julienned vegetables for burgers, sandwiches, or plates',
    ingredients: [
      { name: 'Red Bell Pepper', amount: '2 pcs' },
      { name: 'Green Bell Pepper', amount: '2 pcs' },
      { name: 'White Onion', amount: '2 pcs' },
      { name: 'Button Mushrooms', amount: '10 pcs' },
    ],
    steps: ['Julienne-cut all ingredients.', 'Sear white onions first before adding remaining ingredients.', 'Adjust with salt and pepper until cooked properly.'],
  },
  {
    icon: '🍄',
    title: '12. Mixed Mushrooms',
    subtitle: 'Mushroom and spinach filling',
    ingredients: [
      { name: 'Mushroom', amount: '100 g' },
      { name: 'Garlic', amount: '4 cloves' },
      { name: 'Spinach', amount: '15 g' },
      { name: 'Oil', amount: '10 g' },
      { name: 'Salt & Pepper', amount: 'To taste' },
    ],
    steps: ['Blanch spinach for 10 seconds, then shock in ice water.', 'Sauté garlic, then add mushroom and cook until ready.', 'Turn heat off before adding spinach.', 'Adjust with salt and pepper.'],
  },
];

const sandwichRecipes: GuideRecipe[] = [
  {
    icon: '🥩',
    title: '9. Beef Patty Mix',
    subtitle: '100g portioned burger patties',
    ingredients: [
      { name: 'Ground Beef', amount: '5 kg' },
      { name: 'Salt', amount: '2½ tbsp' },
      { name: 'Pepper', amount: '2½ tbsp' },
      { name: 'Onion Powder', amount: '2 tbsp' },
      { name: 'Garlic Powder', amount: '2 tbsp' },
      { name: 'Chicken Powder', amount: '2 tbsp' },
      { name: 'Paprika', amount: '2 tbsp' },
      { name: 'Eggs', amount: '5 pcs' },
    ],
    steps: ['Add all ingredients together, mix thoroughly, and divide into 100g portions.'],
  },
  {
    icon: '🍔',
    title: '10. Premium Beef Burger',
    subtitle: 'Assembly order from bottom up',
    ingredients: [
      { name: 'Brioche Bun', amount: '1 pc' },
      { name: 'Burger Sauce', amount: 'As needed' },
      { name: 'Beef Patty', amount: '100 g' },
      { name: 'Cheddar Cheese', amount: '1 slice' },
      { name: 'Lettuce & Tomato', amount: 'As needed' },
      { name: 'Grilled White Onion', amount: 'As needed' },
    ],
    notes: ['Handwritten note: Bottom-up build order.'],
    assembly: ['Bottom Bun', 'Burger Sauce', 'Pattie', 'Cheddar Cheese', 'Lettuce', 'Tomatoes', 'Grilled White Onion', 'Top Bun'],
    steps: ['Build from the bottom up following the assembly order. Serve immediately while the patty and bun are warm.'],
  },
  {
    icon: '🍔',
    title: '11. Mushroom Melt Beefy Burger',
    subtitle: 'Garlic aioli, mushroom mix, and melted cheese',
    ingredients: [
      { name: 'Brioche Bun', amount: '1 pc' },
      { name: 'Garlic Aioli', amount: 'As needed' },
      { name: 'Lettuce', amount: 'As needed' },
      { name: 'Beef Patty', amount: '100 g' },
      { name: 'Cheddar Cheese', amount: '1 slice' },
      { name: 'Mushroom Mix', amount: 'As needed' },
    ],
    notes: ['Handwritten note: Bottom-up build order.'],
    assembly: ['Bottom Bun', 'Garlic Aioli', 'Lettuce', 'Pattie', 'Cheddar Cheese', 'Mushroom Mix', 'Top Bun'],
    steps: ['Build from the bottom up following the assembly order. Keep mushroom mix hot and drain excess moisture before assembly.'],
  },
  {
    icon: '🐟',
    title: '13. Crispy Fish Garden Sandwich',
    subtitle: 'Crispy fish fillet with aioli and fresh toppings',
    ingredients: [
      { name: 'Fish Fillet', amount: '100 g' },
      { name: 'Egg Whites', amount: '5 pcs' },
      { name: 'Chicken Mix', amount: '100 g' },
      { name: 'Garlic Aioli', amount: '30 g' },
      { name: 'Lettuce, Buns, Pickles', amount: 'As needed' },
    ],
    steps: [
      'Butter and lightly sear buns until golden brown.',
      'Coat fish in chicken mix, then egg whites, then chicken mix again. Deep fry at 175°C for 5–6 minutes.',
      'When golden brown, rest for more than 5 minutes.',
      'Assemble: Top bun, lettuce, fish fillet, pickles, garlic aioli, bottom bun.',
    ],
  },
  {
    icon: '🥪',
    title: '14. Philly Cheesesteak',
    subtitle: 'Beef, fajitas, cheese sauce, and aioli on a bun',
    ingredients: [
      { name: 'Fajitas', amount: '60 g' },
      { name: 'Cheese Sauce', amount: '50 g' },
      { name: 'Beef Slices', amount: '100 g' },
      { name: 'Cheese Slices', amount: '2 pcs' },
      { name: 'Garlic Aioli', amount: '40 g' },
      { name: 'Buns', amount: 'As needed' },
    ],
    notes: ['Handwritten note: Bottom-up build order.'],
    assembly: ['Bottom Bun', 'Garlic Aioli', 'Beef', 'Cheddar Cheese', 'Fajitas', 'Cheese Sauce', 'Top Bun'],
    steps: ['Cook beef and fajitas, melt cheese, then build from the bottom up in the listed order.'],
  },
  {
    icon: '🍞',
    title: '15. Monte Cristo Sandwich',
    subtitle: 'Layered ham, cheese, egg-seared sandwich with sweet finish',
    ingredients: [
      { name: 'Ham', amount: '1–2 slices' },
      { name: 'Cheese Slice', amount: '2–4 slices' },
      { name: 'Sliced Bread', amount: '3 pcs' },
      { name: 'Oil', amount: '10 g' },
      { name: 'Scrambled Egg', amount: '2 pcs' },
      { name: 'Powdered Sugar', amount: 'For topping' },
    ],
    assembly: ['Bread', 'Cheese', 'Ham', 'Bread', 'Ham', 'Cheese', 'Bread'],
    steps: ['Arrange the layered sandwich, cover completely with scrambled egg, and sear all sides in a medium-high pan with oil.', 'Finish with powdered sugar.'],
  },
];

export default function ChefEjMasterclass() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const [activeTab, setActiveTab] = useState<Tab>('bakery');
  const [imported, setImported] = useState(false);

  function handleImportToCosting() {
    const importedIngredients: Omit<Ingredient, 'id'>[] = [
      { name: 'Bread Flour', purchasePrice: 85, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
      { name: 'APF (All-Purpose Flour)', purchasePrice: 70, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
      { name: 'Water', purchasePrice: 35, purchaseQty: 5000, purchaseUnit: 'mL', category: 'Staples' },
      { name: 'Instant Dried Yeast (SAF Gold)', purchasePrice: 150, purchaseQty: 500, purchaseUnit: 'g', category: 'Staples' },
      { name: 'Fresh Milk', purchasePrice: 110, purchaseQty: 1, purchaseUnit: 'L', category: 'Dairy' },
      { name: 'Milk Powder', purchasePrice: 180, purchaseQty: 1, purchaseUnit: 'kg', category: 'Dairy' },
      { name: 'Unsalted Butter', purchasePrice: 180, purchaseQty: 225, purchaseUnit: 'g', category: 'Dairy' },
      { name: 'Eggs', purchasePrice: 10, purchaseQty: 1, purchaseUnit: 'pcs', category: 'Dairy' },
      { name: 'Sugar', purchasePrice: 70, purchaseQty: 1, purchaseUnit: 'kg', category: 'Staples' },
      { name: 'Ground Beef', purchasePrice: 420, purchaseQty: 1, purchaseUnit: 'kg', category: 'Meat' },
      { name: 'Fish Fillet', purchasePrice: 360, purchaseQty: 1, purchaseUnit: 'kg', category: 'Seafood' },
      { name: 'Cheddar Cheese', purchasePrice: 280, purchaseQty: 500, purchaseUnit: 'g', category: 'Dairy' },
      { name: 'Garlic', purchasePrice: 160, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Red Onion', purchasePrice: 60, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'White Onion', purchasePrice: 55, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Lettuce', purchasePrice: 100, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Tomato', purchasePrice: 80, purchaseQty: 1, purchaseUnit: 'kg', category: 'Vegetables' },
      { name: 'Mushroom', purchasePrice: 180, purchaseQty: 250, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Spinach', purchasePrice: 90, purchaseQty: 500, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Canola Oil', purchasePrice: 120, purchaseQty: 1, purchaseUnit: 'L', category: 'Condiments' },
      { name: 'Olive Oil', purchasePrice: 350, purchaseQty: 500, purchaseUnit: 'mL', category: 'Condiments' },
      { name: 'White Vinegar', purchasePrice: 35, purchaseQty: 1, purchaseUnit: 'L', category: 'Condiments' },
      { name: 'Pickles', purchasePrice: 90, purchaseQty: 500, purchaseUnit: 'g', category: 'Condiments' },
      { name: 'Jalapeno', purchasePrice: 120, purchaseQty: 500, purchaseUnit: 'g', category: 'Vegetables' },
      { name: 'Garlic Powder', purchasePrice: 85, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Onion Powder', purchasePrice: 85, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Paprika', purchasePrice: 110, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
      { name: 'Cayenne Pepper', purchasePrice: 100, purchaseQty: 100, purchaseUnit: 'g', category: 'Spices' },
    ];

    const ids: Record<string, string> = {};
    importedIngredients.forEach((item) => {
      const existing = state.ingredients.find((ing) => ing.name.toLowerCase() === item.name.toLowerCase());
      ids[item.name] = existing?.id || generateId();
      if (!existing) actions.addIngredient({ ...item, id: ids[item.name] });
    });

    const recipeTemplates: Omit<Recipe, 'id'>[] = [
      {
        name: 'Chef EJ Brioche Bun', category: 'Merienda', servings: 8, sellingPrice: 45,
        notes: 'Tangzhong brioche bun. Windowpane check every 5 minutes. Egg wash is 1:1 milk. Do not overproof.',
        overhead: { prepTimeMin: 25, cookingTimeMin: 35, laborPax: 1, appliances: [{ id: generateId(), name: 'Stand Mixer + Oven', type: 'electric', minutes: 50, watts: 1800 }], packagingPerServing: 3, otherCost: 0, otherCostLabel: '' },
        ingredients: [
          { ingredientId: ids['Bread Flour'], qty: 340, unit: 'g' }, { ingredientId: ids['Fresh Milk'], qty: 180, unit: 'mL' },
          { ingredientId: ids['Instant Dried Yeast (SAF Gold)'], qty: 9, unit: 'g' }, { ingredientId: ids['Unsalted Butter'], qty: 45, unit: 'g' },
          { ingredientId: ids['Eggs'], qty: 1, unit: 'pcs' }, { ingredientId: ids.Sugar, qty: 25, unit: 'g' }, { ingredientId: ids['Milk Powder'], qty: 12, unit: 'g' },
        ],
      },
      {
        name: 'Chef EJ Ciabatta Bread', category: 'Merienda', servings: 5, sellingPrice: 85,
        notes: 'Easy instant starter: prepare 8–12 hours ahead. If too sticky add 20g flour; if too dry add milk 1 tsp at a time.',
        overhead: { prepTimeMin: 30, cookingTimeMin: 25, laborPax: 1, appliances: [{ id: generateId(), name: 'Stand Mixer + Oven', type: 'electric', minutes: 50, watts: 1800 }], packagingPerServing: 5, otherCost: 0, otherCostLabel: '' },
        ingredients: [
          { ingredientId: ids['APF (All-Purpose Flour)'], qty: 375, unit: 'g' }, { ingredientId: ids.Water || '', qty: 300, unit: 'mL' },
          { ingredientId: ids['Fresh Milk'], qty: 60, unit: 'mL' }, { ingredientId: ids['Instant Dried Yeast (SAF Gold)'], qty: 3, unit: 'g' },
        ],
      },
      {
        name: 'Chef EJ Garlic Aioli', category: 'Others', servings: 10, sellingPrice: 35,
        notes: 'Strictly use cracked black pepper. If sauce breaks, beat another egg with lemon juice and slowly whisk in the broken sauce.',
        overhead: { prepTimeMin: 10, cookingTimeMin: 0, laborPax: 1, appliances: [{ id: generateId(), name: 'Hand Mixer', type: 'electric', minutes: 5, watts: 250 }], packagingPerServing: 2, otherCost: 0, otherCostLabel: '' },
        ingredients: [
          { ingredientId: ids.Eggs, qty: 4, unit: 'pcs' }, { ingredientId: ids.Garlic, qty: 6, unit: 'pcs' }, { ingredientId: ids['Canola Oil'], qty: 1, unit: 'L' },
        ],
      },
      {
        name: 'Chef EJ Beef Patty Mix', category: 'Ulam', servings: 50, sellingPrice: 99,
        notes: 'Mix all ingredients and divide into 100g portions.',
        overhead: { prepTimeMin: 30, cookingTimeMin: 0, laborPax: 1, appliances: [], packagingPerServing: 3, otherCost: 0, otherCostLabel: '' },
        ingredients: [
          { ingredientId: ids['Ground Beef'], qty: 5, unit: 'kg' }, { ingredientId: ids.Eggs, qty: 5, unit: 'pcs' },
          { ingredientId: ids['Garlic Powder'], qty: 20, unit: 'g' }, { ingredientId: ids['Onion Powder'], qty: 20, unit: 'g' }, { ingredientId: ids.Paprika, qty: 20, unit: 'g' },
        ],
      },
    ];

    recipeTemplates.forEach((template) => {
      if (!state.recipes.some((recipe) => recipe.name.toLowerCase() === template.name.toLowerCase())) {
        actions.addRecipe({ ...template, id: generateId() });
      }
    });

    setImported(true);
    setTimeout(() => setImported(false), 3500);
  }

  return (
    <div className="space-y-5 pb-6 md:space-y-7">
      <div className="flex items-center gap-3">
        <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-transform active:scale-95">←</button>
        <div>
          <h1 className="flex items-center gap-1.5 text-xl font-extrabold text-gray-900 md:text-3xl">🍔 Chef EJ Recipes Masterclass</h1>
          <p className="text-xs text-gray-500">Brioche, ciabatta, sauces, burger prep & sandwich assembly</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 via-red-700 to-orange-600 p-5 text-white shadow-lg shadow-rose-200 md:p-8">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">👨‍🍳 Chef EJ's Working Recipes</div>
          <h2 className="text-lg font-extrabold leading-tight md:text-2xl">From dough to finished sandwich</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-rose-100 md:text-sm">A practical masterclass for buns, breads, sauces, prep mixes, burgers, fish sandwiches, cheesesteaks, and Monte Cristo. Import costing-ready starter recipes with one tap.</p>
          <button onClick={handleImportToCosting} disabled={imported} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition-all md:w-auto ${imported ? 'bg-green-500 text-white' : 'bg-white text-rose-800 hover:bg-rose-50 active:scale-[0.98]'}`}>
            {imported ? '✅ Imported Ingredients & 4 Costed Recipes!' : '📥 Import Chef EJ Data to Costing'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-gray-200/60 p-1.5 md:max-w-xl">
        {[
          { id: 'bakery', label: '🥖 Bakery', sub: 'Buns & breads' },
          { id: 'prep', label: '🥫 Prep', sub: 'Sauces & mixes' },
          { id: 'sandwiches', label: '🍔 Sandwiches', sub: 'Build & serve' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`rounded-xl px-1 py-2 text-center transition-all ${activeTab === tab.id ? 'bg-white font-extrabold text-rose-700 shadow-sm' : 'font-medium text-gray-600'}`}>
            <p className="text-xs">{tab.label}</p><p className="mt-0.5 text-[9px] text-gray-400">{tab.sub}</p>
          </button>
        ))}
      </div>

      {activeTab === 'bakery' && <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">{bakeryRecipes.map((recipe) => <GuideCard key={recipe.title} recipe={recipe} accent="rose" />)}</div>}
      {activeTab === 'prep' && <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">{prepRecipes.map((recipe) => <GuideCard key={recipe.title} recipe={recipe} accent="orange" />)}</div>}
      {activeTab === 'sandwiches' && <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">{sandwichRecipes.map((recipe) => <GuideCard key={recipe.title} recipe={recipe} accent="amber" />)}</div>}
    </div>
  );
}

function GuideCard({ recipe, accent }: { recipe: GuideRecipe; accent: 'rose' | 'orange' | 'amber' }) {
  const accentText = accent === 'rose' ? 'text-rose-700' : accent === 'orange' ? 'text-orange-700' : 'text-amber-700';
  const accentBg = accent === 'rose' ? 'bg-rose-50' : accent === 'orange' ? 'bg-orange-50' : 'bg-amber-50';
  return (
    <article className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs md:p-5">
      <div className="flex items-start gap-2.5 border-b border-gray-100 pb-3">
        <span className={`rounded-xl p-2 text-2xl ${accentBg}`}>{recipe.icon}</span>
        <div><h3 className="text-sm font-extrabold text-gray-900 md:text-base">{recipe.title}</h3><p className="mt-0.5 text-xs text-gray-500">{recipe.subtitle}</p>{recipe.yieldText && <p className={`mt-1 text-[11px] font-bold ${accentText}`}>{recipe.yieldText}</p>}</div>
      </div>

      <div className="rounded-xl bg-gray-50 p-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">🥘 Ingredients</p>
        <div className="grid grid-cols-2 gap-1.5">
          {recipe.ingredients.map((ingredient, index) => <div key={`${ingredient.name}-${index}`} className="rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-xs"><span className="font-medium text-gray-700">{ingredient.name}</span><span className={`ml-1 block font-bold ${accentText}`}>{ingredient.amount}</span>{ingredient.note && <span className="block text-[10px] text-gray-400">{ingredient.note}</span>}</div>)}
        </div>
      </div>

      {recipe.assembly && <div className={`${accentBg} rounded-xl border border-gray-200 p-3`}><p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">⬆️ Assembly Order (Bottom Up)</p><div className="flex flex-wrap gap-1.5">{recipe.assembly.map((item, index) => <span key={item} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-gray-700">{index + 1}. {item}</span>)}</div></div>}

      {recipe.notes && <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><p className="text-[10px] font-bold uppercase text-amber-700">✍️ Handwritten Notes</p>{recipe.notes.map((note, index) => <p key={index} className="pl-3 before:absolute before:left-0 before:text-amber-600 before:content-['•'] relative">{note}</p>)}</div>}

      <div className="space-y-1.5"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">📝 Procedure</p>{recipe.steps.map((step, index) => <p key={index} className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-xs leading-relaxed text-gray-700">{step}</p>)}</div>
    </article>
  );
}