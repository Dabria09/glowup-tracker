import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronDown, Plus, Star, Search, ShoppingCart, Printer } from 'lucide-react';
import RecipeList from '@/components/glow-kitchen/RecipeList';
import AddRecipeModal from '@/components/glow-kitchen/AddRecipeModal';
import PostModal from '@/components/glow-kitchen/PostModal';

const TABS = [
  { id: 'feed', label: 'Feed', emoji: '📸' },
  { id: 'recipes', label: 'Recipes', emoji: '👨‍🍳' },
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
  { id: 'budget', label: 'Budget', emoji: '💰' },
  { id: 'cultural', label: 'Cultural', emoji: '🌍' },
  { id: 'mentoring', label: 'Mentoring', emoji: '👩‍🍳', important: true },
  { id: 'basics', label: 'Basics', emoji: '⭐' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
];

export default function GlowKitchen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes');
  const [user, setUser] = useState(null);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [mealPlanLoaded, setMealPlanLoaded] = useState(false);
  const [basics, setBasics] = useState([]);
  const [healthyGuides, setHealthyGuides] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      
      // Load meal plans and generate shopping list
      const mealPlans = await base44.entities.MealPlan.filter({ user_email: u.email });
      const groceryItems = await base44.entities.GroceryItem.filter({ user_email: u.email });
      
      // Extract all linked grocery items from meal plans
      const allGroceryIds = new Set();
      mealPlans.forEach(meal => {
        try {
          const ids = JSON.parse(meal.grocery_items || '[]');
          ids.forEach(id => allGroceryIds.add(id));
        } catch {}
      });
      
      // Get the actual grocery items
      const linkedItems = groceryItems.filter(g => allGroceryIds.has(g.id));
      setShoppingList(linkedItems);
      setMealPlanLoaded(true);
      
      // Load kitchen basics
      const basicsData = await base44.entities.KitchenBasic.list();
      setBasics(basicsData);
      
      // Load healthy guides
      const guidesData = await base44.entities.HealthyGuide.list();
      setHealthyGuides(guidesData);
      
      // Load recipes (public + user's own) - remove duplicates by id
      const recipesData = await base44.entities.Recipe.filter({ is_public: true });
      const uniqueRecipes = Array.from(new Map(recipesData.map(r => [r.id, r])).values());
      setRecipes(uniqueRecipes);
      
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrintShoppingList = () => {
    const printWindow = window.open('', '_blank');
    const listItems = shoppingList.map(g => `• ${g.name}${g.quantity > 1 ? ` (x${g.quantity})` : ''}`).join('\n');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Shopping List - Glow Kitchen</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #8b2d88; border-bottom: 3px solid #8b2d88; padding-bottom: 10px; }
            ul { line-height: 1.8; }
            .date { color: #666; font-size: 14px; margin-top: 5px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>🛒 Shopping List - Glow Kitchen</h1>
          <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="section">
            <ul>
              ${shoppingList.length > 0 ? listItems : '<li>No items in shopping list</li>'}
            </ul>
          </div>
          
          <button class="no-print" onclick="window.print()" style="margin-top: 30px; padding: 12px 24px; background: #8b2d88; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            🖨️ Print This Page
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const activeTabData = TABS.find(t => t.id === activeTab);
  const filteredSkills = basics.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">🍓 Glow Kitchen</h1>
            </div>
            <p className="text-xs text-gray-400">Cook, share, and grow together</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition relative ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                style={
                  isActive
                    ? tab.important
                      ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }
                      : { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.important && isActive && (
                  <Star size={14} className="ml-1 fill-yellow-300 text-yellow-300" />
                )}
                {tab.important && !isActive && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📸</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Community Kitchen Feed</h3>
                  <p className="text-xs text-gray-400">Share your culinary creations</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4">Post photos of your favorite meals, kitchen moments, and cooking wins. Get inspired by what others are making!</p>
              <button onClick={() => setShowPostModal(true)} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                <Plus size={16} /> Share a Post
              </button>
            </div>
            <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-4xl mb-3">📸</div>
              <p className="text-gray-400 text-sm">No posts yet</p>
              <p className="text-gray-500 text-xs mt-1">Be the first to share your kitchen moment!</p>
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading recipes...</p>
              </div>
            ) : (
              <RecipeList
                recipes={recipes}
                user={user}
                onAddRecipe={() => setShowAddRecipe(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <h3 className="font-bold text-white text-lg mb-2">💚 Eating Healthy on a Budget</h3>
              <p className="text-sm text-gray-300 mb-4">Delicious meals don't have to be expensive — here's how to eat well for less.</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p>✓ Buy frozen fruits and vegetables — same nutrition at a fraction of the cost</p>
                <p>✓ Choose leafy greens and seasonal produce for best prices</p>
                <p>✓ Batch cook on Sundays to save time and money throughout the week</p>
                <p>✓ Use eggs, beans, and lentils as your protein base</p>
              </div>
            </div>
            
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase">Budget-Friendly Recipes</p>
              <div className="space-y-2">
                {recipes.filter(r => r.category === 'Budget-Friendly').map(recipe => (
                  <div key={recipe.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl">💚</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{recipe.title}</p>
                      <p className="text-xs text-gray-400">{recipe.servings} servings • {recipe.prep_time + recipe.cook_time} mins</p>
                    </div>
                  </div>
                ))}
                {recipes.filter(r => r.category === 'Budget-Friendly').length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">Budget recipes coming soon!</p>
                )}
              </div>
            </div>
            
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase">Budget Shopping Tips</p>
              <div className="space-y-2">
                {['Rice & Beans', 'Seasonal Produce', 'Eggs & Dairy', 'Frozen Items', 'Bulk Grains', 'Dried Legumes'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-300 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-green-400">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cultural' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(249,115,22,0.15))', border: '1px solid rgba(249,115,22,0.3)' }}>
              <h3 className="font-bold text-white text-lg mb-2">🌍 Culinary Traditions Around the World</h3>
              <p className="text-sm text-gray-300">Explore authentic recipes and cooking techniques from different cultures. Learn to cook like locals!</p>
            </div>
            
            {['African', 'Asian', 'Caribbean', 'European', 'Latin American', 'Middle Eastern'].map(region => {
              const regionRecipes = recipes.filter(r => r.cuisine === region);
              if (regionRecipes.length === 0) return null;
              return (
                <div key={region} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{region === 'African' ? '🍲' : region === 'Asian' ? '🥢' : region === 'Caribbean' ? '🥥' : region === 'European' ? '🍝' : region === 'Latin American' ? '🌮' : '🍆'}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{region} Cuisine</p>
                      <p className="text-xs text-gray-400">{regionRecipes.length} recipe{regionRecipes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {regionRecipes.map(recipe => (
                      <div key={recipe.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-xl">👨‍🍳</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{recipe.title}</p>
                          <p className="text-xs text-gray-400">{recipe.prep_time + recipe.cook_time} mins • {recipe.difficulty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {recipes.filter(r => ['African', 'Asian', 'Caribbean', 'European', 'Latin American', 'Middle Eastern'].includes(r.cuisine)).length === 0 && (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-gray-400 text-sm">Cultural recipes coming soon!</p>
                <p className="text-gray-500 text-xs mt-1">Explore cuisines from around the world</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'basics' && (
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <h3 className="font-bold text-white">Kitchen Basics for Beginners</h3>
                  <p className="text-xs text-gray-400">{filteredSkills.length} skills to master</p>
                </div>
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading skills...</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-gray-400 text-sm">No skills found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSkills.map((skill) => {
                  const steps = JSON.parse(skill.steps || '[]');
                  const tips = JSON.parse(skill.tips || '[]');
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-lg flex-shrink-0">{skill.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm text-white">{skill.title}</p>
                          <p className="text-xs text-gray-500">{skill.category}</p>
                        </div>
                        <ChevronDown size={16} className={`text-gray-500 transition ${expandedSkill === skill.id ? 'rotate-180' : ''}`} />
                      </div>
                      {expandedSkill === skill.id && (
                        <div className="mt-2 px-4 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className="text-sm text-gray-300 mb-3">{skill.description}</p>
                          <div className="mb-3">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Steps:</p>
                            <ol className="space-y-1">
                              {steps.map((step, i) => (
                                <li key={i} className="text-xs text-gray-300 flex gap-2">
                                  <span className="text-pink-400 font-bold">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                          {tips.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Pro Tips:</p>
                              <ul className="space-y-1">
                                {tips.map((tip, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                                    <span className="text-green-400">✓</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'healthy' && (
          <div className="space-y-4">
            {/* Quick Swaps Reference Table */}
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔄</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Quick Healthy Swaps</h3>
                  <p className="text-xs text-gray-400">10 simple substitutions for healthier eating</p>
                </div>
              </div>
              <div className="grid gap-2">
                {[
                  { swap: 'White rice → Cauliflower rice', benefit: 'Lower carbs, more fiber' },
                  { swap: 'Pasta → Zucchini noodles', benefit: 'Lighter, nutrient-dense' },
                  { swap: 'Sour cream → Greek yogurt', benefit: 'More protein, less fat' },
                  { swap: 'White bread → Whole grain/lettuce wraps', benefit: 'More fiber, nutrients' },
                  { swap: 'Soda → Sparkling water with lemon', benefit: 'No sugar, hydrating' },
                  { swap: 'Potato chips → Air-popped popcorn', benefit: 'Whole grain, less fat' },
                  { swap: 'Ice cream → Frozen banana "nice cream"', benefit: 'Natural sweetness, potassium' },
                  { swap: 'Mayonnaise → Avocado mash', benefit: 'Healthy fats, creaminess' },
                  { swap: 'Sugar → Honey or maple syrup', benefit: 'Natural, trace minerals' },
                  { swap: 'Ground beef → Lentils or turkey', benefit: 'Lean protein, fiber' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.swap}</p>
                      <p className="text-xs text-green-300">{item.benefit}</p>
                    </div>
                    <span className="text-lg">✅</span>
                  </div>
                ))}
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading guides...</p>
              </div>
            ) : healthyGuides.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">🥗</div>
                <p className="text-gray-400 text-sm">No guides available</p>
              </div>
            ) : (
              healthyGuides.map((guide) => {
                const habits = JSON.parse(guide.daily_habits || '[]');
                const guideTips = JSON.parse(guide.tips || '[]');
                const foodsToEat = JSON.parse(guide.foods_to_eat || '[]');
                const foodsToAvoid = JSON.parse(guide.foods_to_avoid || '[]');
                return (
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
                            <ul className="space-y-1">
                              {habits.map((habit, i) => (
                                <li key={i} className="text-xs text-gray-300 flex gap-2">
                                  <span className="text-green-400 flex-shrink-0">✓</span>
                                  {habit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {guideTips.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Pro Tips</p>
                              <ul className="space-y-1">
                                {guideTips.map((tip, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                                    <span className="text-blue-400 flex-shrink-0">💡</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {foodsToEat.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-green-400 mb-2 uppercase">Foods to Eat</p>
                              <div className="flex flex-wrap gap-2">
                                {foodsToEat.map((food, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-300 border border-green-700/50">
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {foodsToAvoid.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-red-400 mb-2 uppercase">Foods to Limit</p>
                              <div className="flex flex-wrap gap-2">
                                {foodsToAvoid.map((food, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-700/50">
                                    {food}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'mentoring' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '2px solid rgba(236,72,153,0.3)' }}>
              <div className="text-5xl mb-3">👩‍🍳</div>
              <h2 className="text-2xl font-bold text-white mb-2">Cooking Mentoring</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Get 1-on-1 guidance from experienced cooks in our community. Learn at your own pace, ask questions, and level up your kitchen skills.
              </p>
              <div className="flex gap-3 mt-5 justify-center">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  <Plus size={16} /> Request a Mentor
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  🎓 Become a Mentor
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">How It Works</p>
              <div className="space-y-3">
                {[
                  { num: '1', text: 'Submit a request with your cooking topic and availability' },
                  { num: '2', text: 'We match you with an experienced mentor from our community' },
                  { num: '3', text: 'Connect for a 1-on-1 session online or in-person' },
                  { num: '4', text: 'Learn, cook, and grow your kitchen confidence!' },
                ].map((item) => (
                  <div key={item.num} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                      <span className="text-xs font-bold text-pink-400">{item.num}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Available Mentors</p>
              <div className="text-center py-8">
                <div className="text-3xl mb-2">👨‍🍳</div>
                <p className="text-gray-400 text-sm">Mentors coming soon!</p>
                <p className="text-gray-500 text-xs mt-1">Submit a request and we'll match you with the right mentor.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grocery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">🛒 Auto-Generated Shopping List</h3>
                <p className="text-xs text-gray-400">From your meal plans</p>
              </div>
              <button onClick={handlePrintShoppingList} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Printer size={14} /> Print
              </button>
            </div>

            {!mealPlanLoaded ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading your shopping list...</p>
              </div>
            ) : shoppingList.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-400 text-sm mb-2">No items in your shopping list</p>
                <p className="text-gray-500 text-xs">Add meals with linked grocery items to auto-generate your list</p>
                <button onClick={() => navigate('/meal-planner')} className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  Go to Meal Planner
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingList.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.2)' }}>
                      <ShoppingCart size={14} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.is_checked ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                      {item.is_checked ? '✓ Got it' : 'To buy'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl p-4 mt-4" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.2)' }}>
                  <ShoppingCart size={16} className="text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-300 mb-1">How it works</p>
                  <p className="text-xs text-gray-300">
                    Items are automatically added to your shopping list when you link them to meals in the Meal Planner. 
                    Print this list before heading to the store!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>

      <BottomNav active="discover" />

      <AddRecipeModal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        user={user}
        onRecipeAdded={() => {
          loadData();
          setShowAddRecipe(false);
        }}
      />
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        user={user}
        onPostCreated={() => setShowPostModal(false)}
      />
    </div>
  );
}