import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronDown, Plus, Star, Search, ShoppingCart, Printer } from 'lucide-react';
import RecipeList from '@/components/glow-kitchen/RecipeList';
import AddRecipeModal from '@/components/glow-kitchen/AddRecipeModal';
import PostModal from '@/components/glow-kitchen/PostModal';
import KitchenPostCard from '@/components/glow-kitchen/KitchenPostCard';
import HealthyTabContent from './GlowKitchenHealthy';
import Mentorship from './Mentorship';

const TABS = [
  { id: 'feed', label: 'Feed', emoji: '📸' },
  { id: 'recipes', label: 'Recipes', emoji: '👨‍🍳' },
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
  { id: 'budget', label: 'Budget', emoji: '💰' },
  { id: 'cultural', label: 'Cultural', emoji: '🌍' },
  { id: 'basics', label: 'Basics', emoji: '⭐' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'mentorship', label: 'Mentorship', emoji: '👩‍🍳', important: true },
];

function MentorshipTabContent() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '2px solid rgba(236,72,153,0.3)' }}>
        <div className="text-5xl mb-3">👩‍🍳</div>
        <h2 className="text-2xl font-bold text-white mb-2">Cooking Mentorship</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          Get 1-on-1 guidance from experienced cooks in our community.
        </p>
        <button
          onClick={() => navigate('/mentorship')}
          className="px-8 py-3 rounded-full font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          👩‍🍳 Go to Mentorship Hub
        </button>
      </div>
      
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs text-gray-400 text-center">
          Visit the full Mentorship Hub to find mentors, ask questions anonymously, or become a mentor yourself.
        </p>
      </div>
    </div>
  );
}

const KITCHEN_BASICS = [
  {
    id: 'knife-safety',
    emoji: '🔪',
    title: 'Knife Safety Basics',
    category: 'Safety',
    description: 'Essential knife safety techniques to prevent injuries',
    steps: [
      'Always curl fingers under (the \'claw\' grip)',
      'Keep knife sharp — dull knives slip and cut you',
      'Never catch a falling knife — step back',
      'Cut away from your body',
      'Keep your cutting board stable (wet towel underneath)',
      'Store knives in a block, not loose in a drawer'
    ]
  },
  {
    id: 'mise-en-place',
    emoji: '👨‍🍳',
    title: 'Mise en Place (Everything in Its Place)',
    category: 'Prep',
    description: 'The pro kitchen habit that prevents burning and mistakes',
    steps: [
      'French for \'everything in its place\' — the #1 pro kitchen habit',
      'Read the full recipe BEFORE you start cooking',
      'Chop, measure, and prep ALL ingredients before turning on the stove',
      'Arrange ingredients in the order you\'ll use them',
      'This prevents burning garlic while scrambling to chop onions',
      'Clean as you go — a clear workspace = a clear mind'
    ]
  },
  {
    id: 'pinch-grip',
    emoji: '✌️',
    title: 'Knife Mastery: The Pinch Grip',
    category: 'Technique',
    description: 'Master the pinch grip for full knife control',
    steps: [
      'Hold the blade between your thumb and index finger — not the handle',
      'This \'pinch grip\' gives you full control and reduces fatigue',
      'Curl your other hand\'s fingertips under (the \'claw\')',
      'The knuckles guide the blade — never your fingertips',
      'Keep your blade sharp — a dull knife is more dangerous',
      'Practice on soft vegetables like zucchini before moving to harder ones'
    ]
  },
  {
    id: 'meal-prep-week',
    emoji: '🥗',
    title: 'How to Meal Prep for the Week',
    category: 'Prep',
    description: 'Prepare meals efficiently for the whole week',
    steps: [
      'Pick 1–2 proteins, 2 grains, 3–4 vegetables',
      'Cook proteins and grains in large batches Sunday',
      'Wash, chop, and store vegetables in containers',
      'Mix and match throughout the week for different meals',
      'Prep sauces and dressings in small jars',
      'Label everything with day it was made'
    ]
  },
  {
    id: 'smoothie',
    emoji: '🍓',
    title: 'How to Make a Smoothie',
    category: 'Technique',
    description: 'Create delicious and nutritious smoothies every time',
    steps: [
      'Start with liquid: 1 cup milk, juice, or water',
      'Add frozen fruit: berries, mango, banana (frozen = thicker)',
      'Add protein: Greek yogurt, nut butter, or protein powder',
      'Add extras: spinach (you won\'t taste it!), chia seeds, honey',
      'Blend on high 60 seconds until smooth',
      'Taste and adjust — add more liquid if too thick'
    ]
  },
  {
    id: 'sauteing',
    emoji: '🍳',
    title: 'Sautéing: Quick & Flavorful',
    category: 'Cooking Methods',
    description: 'Master the art of sautéing for flavorful meals',
    steps: [
      'Heat the pan FIRST on medium-high, then add oil',
      'Oil should shimmer — if it smokes, it\'s too hot',
      'Add food in a single layer — don\'t crowd the pan',
      'Crowding causes steaming instead of browning',
      'Stir or toss frequently to cook evenly',
      'Season at the end — salt draws out moisture mid-cook'
    ]
  },
  {
    id: 'roasting',
    emoji: '🥔',
    title: 'Roasting: Oven Magic',
    category: 'Cooking Methods',
    description: 'Create caramelized, delicious roasted foods',
    steps: [
      'Preheat oven to 400°F (200°C) or higher for roasting',
      'Toss vegetables or meat in oil, salt, and pepper',
      'Spread in a single layer on a sheet pan — no overlapping',
      'High heat caramelizes the outside for sweet, savory flavor',
      'Flip halfway through for even browning',
      'Vegetables: 20–30 min. Chicken thighs: 35–45 min.'
    ]
  },
  {
    id: 'boiling-simmering',
    emoji: '💧',
    title: 'Boiling & Simmering',
    category: 'Cooking Methods',
    description: 'Use boiling and simmering for perfect results',
    steps: [
      'Boiling (212°F/100°C): vigorous bubbles — use for pasta, blanching',
      'Always salt pasta water generously — it should taste like the sea',
      'Simmering (180–200°F): gentle bubbles — use for soups, beans, grains',
      'Bring to a boil first, then reduce heat to simmer',
      'Keep a lid on to retain heat and speed up cooking',
      'Al dente pasta: cook 1–2 minutes less than the package says'
    ]
  },
  {
    id: 'salt',
    emoji: '🧂',
    title: 'Salt: The Flavor Enhancer',
    category: 'Seasoning',
    description: 'Use salt to bring out natural flavors',
    steps: [
      'Salt doesn\'t make food salty — it enhances natural flavors',
      'Season in layers: a little salt at each stage of cooking',
      'Taste as you go — add salt gradually, you can\'t take it back',
      'Different salts: kosher salt for cooking, flaky salt for finishing',
      'Under-salted food tastes flat and dull',
      'Salt pasta water, blanching water, and dough — not just the final dish'
    ]
  },
  {
    id: 'fat',
    emoji: '🧈',
    title: 'Fat: Flavor Carrier & Texture Builder',
    category: 'Seasoning',
    description: 'Understand how fat builds flavor and texture',
    steps: [
      'Fat carries flavor compounds — food without fat tastes bland',
      'Olive oil: great for sautéing, dressings, and finishing',
      'Butter: best for baking, finishing sauces, and pan sauces',
      'Avocado oil: high smoke point — ideal for high-heat cooking',
      'Fat prevents food from sticking to pans',
      'A drizzle of good olive oil or butter at the end elevates any dish'
    ]
  },
  {
    id: 'acid',
    emoji: '🍋',
    title: 'Acid: The Secret Brightener',
    category: 'Seasoning',
    description: 'Use acid to brighten and balance flavors',
    steps: [
      'If a dish tastes flat or heavy, it usually needs acid — not more salt',
      'Acid sources: lemon juice, lime juice, vinegar, tomatoes, yogurt',
      'Add a squeeze of lemon to soups, pasta, roasted veggies, and fish',
      'Acid balances richness — it cuts through fatty or heavy dishes',
      'Add acid at the END of cooking for the brightest flavor',
      'Try: red wine vinegar in salad dressings, lime juice in tacos'
    ]
  },
  {
    id: 'heat-control',
    emoji: '🔥',
    title: 'Heat: Controlling Texture & Flavor',
    category: 'Cooking Methods',
    description: 'Master heat control for perfect cooking results',
    steps: [
      'Heat dictates texture — too high burns outside before inside cooks',
      'Low & slow: ideal for tough cuts, braises, and slow-cooked sauces',
      'High heat: for searing, stir-frying, and caramelizing',
      'The Maillard reaction (browning) creates complex, savory flavors',
      'Let your pan fully preheat before adding food',
      'Resting meat after cooking lets juices redistribute — don\'t skip this'
    ]
  },
  {
    id: 'cross-contamination',
    emoji: '🧼',
    title: 'Preventing Cross-Contamination',
    category: 'Food Safety',
    description: 'Keep your kitchen safe from food-borne illness',
    steps: [
      'Use SEPARATE cutting boards for raw meat and ready-to-eat foods',
      'Never put cooked food back on a plate that held raw meat',
      'Wash hands thoroughly for 20 seconds after handling raw protein',
      'Clean and sanitize cutting boards between uses',
      'Store raw meat on the BOTTOM shelf of the fridge',
      'Never rinse raw chicken — it splashes bacteria around your sink'
    ]
  },
  {
    id: 'meat-thermometer',
    emoji: '🌡️',
    title: 'Using a Meat Thermometer',
    category: 'Food Safety',
    description: 'Ensure meat is safely cooked every time',
    steps: [
      'Never guess if meat is done — always use an instant-read thermometer',
      'Chicken & poultry: must reach 165°F (74°C) internal temperature',
      'Ground beef: must reach 160°F (71°C)',
      'Pork: 145°F (63°C) with a 3-minute rest',
      'Fish: 145°F (63°C) or until flesh flakes easily',
      'Insert thermometer into the thickest part, away from bone'
    ]
  }
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
  const [feedPosts, setFeedPosts] = useState([]);
  const [budgetPosts, setBudgetPosts] = useState([]);
  const [culturalPosts, setCulturalPosts] = useState([]);
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
      
      // Load kitchen basics from database
      const basicsData = await base44.entities.KitchenBasic.list();
      setBasics(basicsData);
      
      // Load healthy guides
      const guidesData = await base44.entities.HealthyGuide.list();
      setHealthyGuides(guidesData);
      
      // Load recipes (public + user's own) - remove duplicates by id
      const recipesData = await base44.entities.Recipe.filter({ is_public: true });
      const uniqueRecipes = Array.from(new Map(recipesData.map(r => [r.id, r])).values());
      setRecipes(uniqueRecipes);
      
      // Load community posts
      const allPosts = await base44.entities.KitchenPost.list();
      setFeedPosts(allPosts.filter(p => p.category === 'feed').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setBudgetPosts(allPosts.filter(p => p.category === 'budget').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setCulturalPosts(allPosts.filter(p => p.category === 'cultural').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      
      setLoadingData(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // Track page view with metadata
    base44.analytics.track({ eventName: 'page_view', metadata: { page: 'Glow Kitchen', path: '/glow-kitchen' } });
    
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

  const handleLike = async (postId) => {
    const post = feedPosts.find(p => p.id === postId) || budgetPosts.find(p => p.id === postId) || culturalPosts.find(p => p.id === postId);
    if (!post) return;

    const likedBy = JSON.parse(post.liked_by || '[]');
    const isLiked = likedBy.includes(user.email);
    const newLikedBy = isLiked ? likedBy.filter(email => email !== user.email) : [...likedBy, user.email];
    const newLikes = (post.likes || 0) + (isLiked ? -1 : 1);

    await base44.entities.KitchenPost.update(post.id, {
      likes: newLikes,
      liked_by: JSON.stringify(newLikedBy)
    });

    // Update local state
    const updatePosts = (posts) => posts.map(p => p.id === postId ? { ...p, likes: newLikes, liked_by: JSON.stringify(newLikedBy) } : p);
    setFeedPosts(updatePosts(feedPosts));
    setBudgetPosts(updatePosts(budgetPosts));
    setCulturalPosts(updatePosts(culturalPosts));
  };

  const handleComment = (postId, newComments) => {
    const updatePosts = (posts) => posts.map(p => p.id === postId ? { ...p, comments: JSON.stringify(newComments) } : p);
    setFeedPosts(updatePosts(feedPosts));
    setBudgetPosts(updatePosts(budgetPosts));
    setCulturalPosts(updatePosts(culturalPosts));
  };

  const handleDeletePost = async (postId) => {
    await base44.entities.KitchenPost.delete(postId);
    setFeedPosts(feedPosts.filter(p => p.id !== postId));
    setBudgetPosts(budgetPosts.filter(p => p.id !== postId));
    setCulturalPosts(culturalPosts.filter(p => p.id !== postId));
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

            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading posts...</p>
              </div>
            ) : feedPosts.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-400 text-sm">No posts yet</p>
                <p className="text-gray-500 text-xs mt-1">Be the first to share your kitchen moment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedPosts.map(post => (
                  <KitchenPostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
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
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💚</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Budget-Friendly Meals</h3>
                  <p className="text-xs text-gray-400">Share & discover money-saving tips</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4">Delicious meals don't have to be expensive. Share your budget tips and learn from the community!</p>
              <button onClick={() => setShowPostModal(true)} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                <Plus size={16} /> Share Budget Tip
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading tips...</p>
              </div>
            ) : budgetPosts.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">💚</div>
                <p className="text-gray-400 text-sm">No budget tips yet</p>
                <p className="text-gray-500 text-xs mt-1">Share your first money-saving cooking tip!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgetPosts.map(post => (
                  <KitchenPostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cultural' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(249,115,22,0.15))', border: '1px solid rgba(249,115,22,0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌍</span>
                <div>
                  <h3 className="font-bold text-white text-lg">Cultural Recipes & Traditions</h3>
                  <p className="text-xs text-gray-400">Share your heritage through food</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4">Explore authentic recipes and cooking techniques from different cultures. Share your family traditions!</p>
              <button onClick={() => setShowPostModal(true)} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #a855f7, #f97316)' }}>
                <Plus size={16} /> Share Cultural Dish
              </button>
            </div>

            {loadingData ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading posts...</p>
              </div>
            ) : culturalPosts.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-gray-400 text-sm">No cultural posts yet</p>
                <p className="text-gray-500 text-xs mt-1">Share your first cultural recipe or tradition!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {culturalPosts.map(post => (
                  <KitchenPostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onLike={handleLike}
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                  />
                ))}
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
                          <p className="text-xs text-gray-500">{skill.category || 'Kitchen Skill'}</p>
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
          <HealthyTabContent expandedGuide={expandedGuide} setExpandedGuide={setExpandedGuide} />
        )}

        {activeTab === 'mentorship' && (
          <MentorshipTabContent />
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
        category={activeTab === 'budget' ? 'budget' : activeTab === 'cultural' ? 'cultural' : 'feed'}
        onPostCreated={() => {
          loadData();
          setShowPostModal(false);
        }}
      />
    </div>
  );
}