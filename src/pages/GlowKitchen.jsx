import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Star, Search, ChevronDown, Printer, ShoppingCart } from 'lucide-react';

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

const BASICS_SKILLS = [
  { title: 'Knife Safety Basics', emoji: '🔪' },
  { title: 'Mise en Place', emoji: '📋' },
  { title: 'Knife Mastery: The Pinch Grip', emoji: '🖐️' },
  { title: 'How to Meal Prep for the Week', emoji: '🍱' },
  { title: 'How to Make a Smoothie', emoji: '🥤' },
  { title: 'Sautéing: Quick & Flavorful', emoji: '🍳' },
  { title: 'Roasting: Oven Magic', emoji: '🍗' },
  { title: 'Boiling & Simmering', emoji: '🫖' },
  { title: 'Salt: The Flavor Enhancer', emoji: '🧂' },
  { title: 'Fat: Flavor Carrier & Texture Builder', emoji: '🧈' },
  { title: 'Acid: The Secret Brightener', emoji: '🍋' },
  { title: 'Heat: Controlling Texture & Flavor', emoji: '🔥' },
  { title: 'Using a Meat Thermometer', emoji: '🌡️' },
  { title: 'Preventing Cross-Contamination', emoji: '🧼' },
];

const HEALTHY_GUIDES = [
  { id: 'hydration', title: 'Hydration & Water', emoji: '💧', color: 'rgba(59,130,246,0.1)' },
  { id: 'antiflame', title: 'Anti-Inflammatory Eating', emoji: '🔥', color: 'rgba(236,72,153,0.1)' },
  { id: 'gut', title: 'Gut Health', emoji: '🧠', color: 'rgba(251,146,60,0.1)' },
  { id: 'skin', title: 'Eat for Glowing Skin', emoji: '✨', color: 'rgba(251,146,60,0.1)' },
  { id: 'budget', title: 'Eating Healthy on a Budget', emoji: '💚', color: 'rgba(34,197,94,0.1)' },
];

export default function GlowKitchen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mentoring');
  const [user, setUser] = useState(null);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [mealPlanLoaded, setMealPlanLoaded] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
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
    }).catch(() => base44.auth.redirectToLogin());
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
  const filteredSkills = BASICS_SKILLS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Community food posts coming soon 📸</p>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Recipe library coming soon 👨‍🍳</p>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Budget meals feed coming soon 💰</p>
          </div>
        )}

        {activeTab === 'cultural' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Cultural recipes coming soon 🌍</p>
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

            <div className="space-y-2">
              {filteredSkills.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => setExpandedSkill(expandedSkill === idx ? null : idx)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-lg flex-shrink-0">{skill.emoji}</span>
                    <span className="flex-1 font-semibold text-sm text-white">{skill.title}</span>
                    <ChevronDown size={16} className={`text-gray-500 transition ${expandedSkill === idx ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedSkill === idx && (
                    <div className="mt-2 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-gray-400">Step-by-step instructions and tips for {skill.title.toLowerCase()}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'healthy' && (
          <div className="space-y-3">
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
                    <p className="text-xs text-gray-400 mt-0.5">Actionable habits & tips</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition ${expandedGuide === guide.id ? 'rotate-180' : ''}`} />
                </div>
                {expandedGuide === guide.id && (
                  <div className="mt-2 px-4 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase">Daily Habits</p>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="flex gap-2 text-xs text-gray-300">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span>Habit {n} for better {guide.title.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
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
    </div>
  );
}