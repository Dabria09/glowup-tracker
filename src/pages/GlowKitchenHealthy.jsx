import { ChevronDown } from 'lucide-react';

const HEALTHY_GUIDES = [
  {
    id: 'hydration',
    emoji: '💧',
    title: 'Hydration & Water',
    description: 'Water is the ultimate glow-up secret — most girls are chronically dehydrated.',
    color: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.2))',
    daily_habits: [
      'Drink 8–10 glasses (64–80 oz) of water daily — more if you\'re active',
      'Start every morning with a full glass of water before anything else',
      'Carry a reusable water bottle everywhere — if it\'s visible, you\'ll drink it',
      'Eat water-rich foods: cucumbers, watermelon, strawberries, lettuce, celery',
      'Limit sugary drinks (soda, juice, energy drinks) — they spike blood sugar and crash energy',
      'Add lemon, mint, or cucumber to water if plain water feels boring'
    ],
    foods_to_eat: [
      'Water (obviously!)',
      'Coconut water (natural electrolytes)',
      'Herbal teas (hibiscus, peppermint, chamomile)',
      'Watermelon',
      'Cucumber',
      'Strawberries',
      'Cantaloupe',
      'Celery',
      'Lettuce',
      'Zucchini',
      'Tomatoes',
      'Bell peppers',
      'Grapefruit',
      'Oranges',
      'Peaches'
    ],
    foods_to_limit: [
      'Soda and sugary drinks',
      'Energy drinks',
      'Excessive coffee (more than 2 cups)',
      'Alcohol (dehydrates)',
      'Salty processed snacks (increase water loss)',
      'High-sodium fast food'
    ],
    tips: ['Dehydration causes brain fog, breakouts, fatigue, and mood swings. Water is literally a glow-up.', 'Set hourly water reminders on your phone. Your future glowing skin will thank you!']
  },
  {
    id: 'anti-inflammatory',
    emoji: '🔥',
    title: 'Anti-Inflammatory Eating',
    description: 'Reduce inflammation in your body with foods that fight it naturally.',
    color: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(249,114,22,0.2))',
    daily_habits: [
      'Load up on berries: blueberries, strawberries, raspberries — powerful antioxidants',
      'Eat fatty fish (salmon, sardines) or walnuts for omega-3s that fight inflammation',
      'Use turmeric in cooking — add to rice, soups, smoothies (pair with black pepper to activate it)',
      'Choose olive oil over vegetable oil for cooking and dressings',
      'Limit processed foods, fast food, and refined sugars — they cause inflammation',
      'Add leafy greens daily: spinach, kale, arugula, collard greens'
    ],
    foods_to_eat: [
      'Blueberries and raspberries',
      'Salmon and sardines',
      'Walnuts and almonds',
      'Turmeric (with black pepper)',
      'Ginger',
      'Extra virgin olive oil',
      'Spinach and kale',
      'Broccoli',
      'Cherries',
      'Dark chocolate (70%+ cacao)',
      'Green tea',
      'Tomatoes',
      'Avocado',
      'Sweet potatoes',
      'Garlic'
    ],
    foods_to_limit: [
      'Processed meats (hot dogs, deli meat)',
      'Fried foods',
      'Refined carbs (white bread, pastries)',
      'Sugary snacks and candy',
      'Vegetable oils (soybean, corn oil)',
      'Excessive alcohol',
      'Fast food',
      'Artificial trans fats'
    ],
    tips: ['Chronic inflammation is linked to acne, fatigue, mood issues, and long-term health problems. Food is medicine.', 'Add a pinch of black pepper to turmeric — it increases absorption by 2000%!']
  },
  {
    id: 'gut-health',
    emoji: '🫶',
    title: 'Gut Health',
    description: 'Your gut is your second brain — what you eat directly affects your mood, skin, and energy.',
    color: 'linear-gradient(135deg, rgba(249,114,22,0.2), rgba(234,179,8,0.2))',
    daily_habits: [
      'Eat fermented foods: yogurt, kefir, kimchi, sauerkraut — they feed good gut bacteria',
      'Get 25–30g of fiber daily from beans, oats, fruits, vegetables, and whole grains',
      'Eat prebiotic foods: garlic, onions, bananas, asparagus — they feed probiotics',
      'Limit antibiotics unless medically necessary — they kill good gut bacteria',
      'Chew your food thoroughly — digestion starts in your mouth',
      'Manage stress — the gut-brain connection means anxiety shows up in your stomach'
    ],
    foods_to_eat: [
      'Greek yogurt with live cultures',
      'Kefir',
      'Kimchi',
      'Sauerkraut (refrigerated, not shelf-stable)',
      'Miso',
      'Tempeh',
      'Oats and oatmeal',
      'Beans and lentils',
      'Bananas',
      'Garlic and onions',
      'Asparagus',
      'Apples',
      'Flaxseeds',
      'Jerusalem artichokes',
      'Dandelion greens'
    ],
    foods_to_limit: [
      'Artificial sweeteners (aspartame, sucralose)',
      'Ultra-processed foods',
      'Excessive sugar',
      'Fried and greasy foods',
      'Excessive red meat',
      'Alcohol (kills good bacteria)',
      'Dairy (if you\'re sensitive)',
      'Gluten (if you\'re sensitive)'
    ],
    tips: ['70% of your immune system lives in your gut. A healthy gut = clearer skin, better mood, more energy.', 'Eat a variety of colorful plants — aim for 30 different plants per week for optimal gut diversity.']
  },
  {
    id: 'glowing-skin',
    emoji: '✨',
    title: 'Eat for Glowing Skin',
    description: 'Your skin reflects what you eat — glow from the inside out.',
    color: 'linear-gradient(135deg, rgba(249,114,22,0.2), rgba(239,68,68,0.2))',
    daily_habits: [
      'Vitamin C foods: oranges, bell peppers, strawberries — boost collagen production',
      'Vitamin E foods: almonds, sunflower seeds, avocado — protect skin from damage',
      'Zinc foods: pumpkin seeds, chickpeas, beef — reduces acne and inflammation',
      'Collagen boosters: bone broth, citrus fruits, leafy greens',
      'Limit dairy and high-glycemic foods if you\'re acne-prone — they can trigger breakouts',
      'Drink green tea — packed with antioxidants that protect skin cells'
    ],
    foods_to_eat: [
      'Oranges and citrus fruits',
      'Red bell peppers',
      'Strawberries and kiwi',
      'Almonds and sunflower seeds',
      'Avocado',
      'Pumpkin seeds',
      'Chickpeas and lentils',
      'Bone broth',
      'Sweet potatoes (beta-carotene)',
      'Carrots',
      'Spinach and Swiss chard',
      'Walnuts',
      'Green tea',
      'Dark leafy greens',
      'Pomegranate'
    ],
    foods_to_limit: [
      'Dairy (if acne-prone)',
      'High-glycemic foods (white bread, sugary cereals)',
      'Processed snacks',
      'Excessive sugar',
      'Fast food',
      'Whey protein (can trigger breakouts)',
      'Iodine-rich foods in excess (can worsen acne)',
      'Alcohol (dehydrates skin)'
    ],
    tips: ['The best skincare routine starts in the kitchen. What you eat shows up on your face.', 'Swap your afternoon candy for a handful of walnuts — omega-3s fight inflammation that causes breakouts.']
  },
  {
    id: 'budget-healthy',
    emoji: '💚',
    title: 'Eating Healthy on a Budget',
    description: 'Healthy eating doesn\'t have to be expensive — here\'s how to eat well for less.',
    color: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(74,222,128,0.2))',
    daily_habits: [
      'Buy frozen fruits and vegetables — same nutrition as fresh, way cheaper',
      'Dried beans and lentils are the cheapest protein on the planet — buy in bulk',
      'Eggs are a nutritional powerhouse and cost about $0.25 each',
      'Oats are one of the healthiest breakfast options and cost pennies per serving',
      'Buy in-season produce — it\'s cheaper, fresher, and more nutritious',
      'Meal prep on Sundays to avoid expensive last-minute food decisions'
    ],
    foods_to_eat: [
      'Dried beans and lentils',
      'Eggs',
      'Oats',
      'Frozen vegetables',
      'Frozen fruits',
      'Brown rice',
      'Canned tuna (in water)',
      'Peanut butter (natural)',
      'Sweet potatoes',
      'Bananas',
      'Cabbage',
      'Carrots',
      'Onions',
      'Garlic',
      'Canned tomatoes'
    ],
    foods_to_limit: [
      'Pre-cut vegetables (paying for convenience)',
      'Single-serving snacks',
      'Bottled smoothies and juices',
      'Instant oatmeal packets (loaded with sugar)',
      'Energy bars',
      'Fancy flavored waters',
      'Imported out-of-season produce',
      'Pre-made meals'
    ],
    tips: ['A bag of dried lentils, a dozen eggs, frozen spinach, and oats can fuel you for a week for under $15.', 'Shop the perimeter of the grocery store — that\'s where the whole, affordable foods live.']
  }
];

export default function HealthyTabContent({ expandedGuide, setExpandedGuide }) {
  return (
    <div className="space-y-4">
      {/* 10 Easy Healthy Swaps Card */}
      <button
        onClick={() => setExpandedGuide(expandedGuide === 'swaps' ? null : 'swaps')}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2))', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span className="text-2xl flex-shrink-0">✅</span>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">10 Easy Healthy Swaps</h3>
            <p className="text-xs text-gray-400 mt-0.5">Small changes = big results</p>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition ${expandedGuide === 'swaps' ? 'rotate-180' : ''}`} />
        </div>
        {expandedGuide === 'swaps' && (
          <div className="mt-2 px-4 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="space-y-3">
              {[
                { old: 'White rice', new: 'Brown rice or quinoa', benefit: 'More fiber, keeps you full longer' },
                { old: 'Soda', new: 'Sparkling water + lemon', benefit: 'Zero sugar, still refreshing' },
                { old: 'Chips', new: 'Air-popped popcorn or rice cakes', benefit: 'Less fat, more volume' },
                { old: 'Sugary cereal', new: 'Oats with fruit + honey', benefit: 'Sustained energy, no crash' },
                { old: 'Store-bought dressing', new: 'Olive oil + lemon + garlic', benefit: 'No preservatives, anti-inflammatory' },
                { old: 'Candy bar', new: 'Dark chocolate + almonds', benefit: 'Antioxidants + healthy fat' },
                { old: 'White bread', new: 'Whole grain or sourdough', benefit: 'More nutrients, slower digestion' },
                { old: 'Flavored yogurt', new: 'Plain Greek yogurt + berries', benefit: 'Less sugar, more protein' },
                { old: 'Frying', new: 'Air frying or baking', benefit: 'Same crunch, way less oil' },
                { old: 'Juice', new: 'Whole fruit', benefit: 'Fiber intact, less sugar spike' },
              ].map((swap, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.3)' }}>
                    <span className="text-xs font-bold text-green-400">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">
                      <span className="line-through text-gray-500">{swap.old}</span>
                      <span className="text-green-400 font-semibold"> → {swap.new}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{swap.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </button>

      {/* 5 Healthy Guides */}
      {HEALTHY_GUIDES.map((guide) => (
        <button
          key={guide.id}
          onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: guide.color, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-2xl flex-shrink-0">{guide.emoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">{guide.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{guide.description}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition ${expandedGuide === guide.id ? 'rotate-180' : ''}`} />
          </div>
          {expandedGuide === guide.id && (
            <div className="mt-2 px-4 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Daily Habits</p>
                  <ul className="space-y-2">
                    {guide.daily_habits.map((habit, i) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-2">
                        <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
                        {habit}
                      </li>
                    ))}
                  </ul>
                </div>

                {guide.foods_to_eat && (
                  <div>
                    <p className="text-xs font-bold text-green-400 mb-2 uppercase">🥗 Foods to Eat</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.foods_to_eat.map((food, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {guide.foods_to_limit && (
                  <div>
                    <p className="text-xs font-bold text-red-400 mb-2 uppercase">🚫 Foods to Limit</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.foods_to_limit.map((food, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {guide.tips && guide.tips.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase">💡 Glow Tips</p>
                    <div className="space-y-2">
                      {guide.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-gray-300 flex gap-2">
                          <span className="flex-shrink-0">✨</span>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}