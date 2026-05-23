import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, ShoppingCart, ChevronLeft as PrevIcon, ChevronRight, Download, Printer } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_EMOJIS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeek(monday) {
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(end)}`;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

export default function MealPlanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [meals, setMeals] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addDay, setAddDay] = useState('Monday');
  const [addType, setAddType] = useState('Dinner');
  const [addName, setAddName] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [addCalories, setAddCalories] = useState('');
  const [addProtein, setAddProtein] = useState('');
  const [addCarbs, setAddCarbs] = useState('');
  const [addLinked, setAddLinked] = useState([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [m, g] = await Promise.all([
        base44.entities.MealPlan.filter({ user_email: u.email }),
        base44.entities.GroceryItem.filter({ user_email: u.email }),
      ]);
      if (m.length === 0) {
        const sampleMeals = [
          { user_email: u.email, week_start: toISO(weekStart), day: 'Monday', meal_type: 'Breakfast', meal_name: 'Oatmeal with Berries', notes: 'Add honey', grocery_items: '[]' },
          { user_email: u.email, week_start: toISO(weekStart), day: 'Monday', meal_type: 'Lunch', meal_name: 'Grilled Chicken Salad', notes: 'Olive oil dressing', grocery_items: '[]' },
          { user_email: u.email, week_start: toISO(weekStart), day: 'Monday', meal_type: 'Dinner', meal_name: 'Pasta Primavera', notes: '', grocery_items: '[]' },
          { user_email: u.email, week_start: toISO(weekStart), day: 'Wednesday', meal_type: 'Dinner', meal_name: 'Baked Salmon with Veggies', notes: 'Lemon herb', grocery_items: '[]' },
          { user_email: u.email, week_start: toISO(weekStart), day: 'Friday', meal_type: 'Dinner', meal_name: 'Tacos', notes: 'Keep it simple', grocery_items: '[]' },
        ];
        const created = await base44.entities.MealPlan.bulkCreate(sampleMeals);
        setMeals(created);
      } else {
        setMeals(m);
      }
      setGroceryItems(g);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const weekISO = toISO(weekStart);
  const weekMeals = meals.filter(m => m.week_start === weekISO);

  const dayMeals = (day) => weekMeals.filter(m => m.day === day);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  const openAdd = (day) => {
    setAddDay(day);
    setAddType('Dinner');
    setAddName('');
    setAddNotes('');
    setAddCalories('');
    setAddProtein('');
    setAddCarbs('');
    setAddLinked([]);
    setShowAdd(true);
  };

  const saveAdd = async () => {
    if (!addName.trim()) return;
    const meal = await base44.entities.MealPlan.create({
      user_email: user.email,
      week_start: weekISO,
      day: addDay,
      meal_type: addType,
      meal_name: addName.trim(),
      notes: addNotes.trim(),
      grocery_items: JSON.stringify(addLinked),
      calories: addCalories ? Number(addCalories) : null,
      protein: addProtein ? Number(addProtein) : null,
      carbs: addCarbs ? Number(addCarbs) : null,
    });
    setMeals(prev => [...prev, meal]);
    setShowAdd(false);
  };

  const deleteMeal = async (id) => {
    await base44.entities.MealPlan.delete(id);
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const toggleGrocery = (id) => {
    setAddLinked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const linkedNames = (meal) => {
    try {
      const ids = JSON.parse(meal.grocery_items || '[]');
      return groceryItems.filter(g => ids.includes(g.id)).map(g => g.name);
    } catch { return []; }
  };

  const uncheckedGrocery = groceryItems.filter(g => !g.is_checked);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const mealList = weekMeals.map(m => `${m.day} - ${m.meal_type}: ${m.meal_name}${m.notes ? ` (${m.notes})` : ''}`).join('\n');
    const groceryList = uncheckedGrocery.map(g => `• ${g.name}${g.quantity > 1 ? ` (x${g.quantity})` : ''}`).join('\n');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>My Weekly Meal Plan & Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #8b2d88; border-bottom: 3px solid #8b2d88; padding-bottom: 10px; }
            h2 { color: #6b21a8; margin-top: 30px; }
            .section { margin-bottom: 30px; }
            ul { line-height: 1.8; }
            .date { color: #666; font-size: 14px; margin-top: 5px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>🍽️ Weekly Meal Plan & Shopping List</h1>
          <p class="date">Week of ${formatWeek(weekStart)}</p>
          
          <div class="section">
            <h2>📅 Meal Plan</h2>
            <ul>
              ${weekMeals.map(m => `<li><strong>${m.day} - ${m.meal_type}:</strong> ${m.meal_name}${m.notes ? ` <em>(${m.notes})</em>` : ''}</li>`).join('\n              ')}
            </ul>
          </div>
          
          <div class="section">
            <h2>🛒 Shopping List</h2>
            <ul>
              ${uncheckedGrocery.length > 0 ? uncheckedGrocery.map(g => `<li>${g.name}${g.quantity > 1 ? ` <strong>(x${g.quantity})</strong>` : ''}</li>`).join('\n              ') : '<li>No items in shopping list</li>'}
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">🍽️ Meal Planner</h1>
            <p className="text-xs text-gray-400">Plan your week, shop smarter</p>
          </div>
          <button onClick={handlePrint} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
            <Printer size={18} />
          </button>
        </div>

        {/* Week navigator */}
        <div className="flex items-center justify-between mb-5 px-1">
          <button onClick={prevWeek} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-semibold">Week of</p>
            <p className="text-sm font-bold text-white">{formatWeek(weekStart)}</p>
          </div>
          <button onClick={nextWeek} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Nutrition Summary for Active Day */}
        {(() => {
          const dayMealsList = dayMeals(activeDay);
          const totalCalories = dayMealsList.reduce((sum, m) => sum + (m.calories || 0), 0);
          const totalProtein = dayMealsList.reduce((sum, m) => sum + (m.protein || 0), 0);
          const totalCarbs = dayMealsList.reduce((sum, m) => sum + (m.carbs || 0), 0);
          const hasNutrition = dayMealsList.some(m => m.calories || m.protein || m.carbs);

          return hasNutrition ? (
            <div className="mb-5 rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-bold text-white text-sm">{activeDay} Nutrition Summary</h3>
                  <p className="text-xs text-gray-400">Total for all meals</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-400 mb-1">Calories</p>
                  <p className="text-lg font-bold text-white">{totalCalories}</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-400 mb-1">Protein</p>
                  <p className="text-lg font-bold text-green-300">{totalProtein}g</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-400 mb-1">Carbs</p>
                  <p className="text-lg font-bold text-blue-300">{totalCarbs}g</p>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Day tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${activeDay === day ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={activeDay === day ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Active day meals */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">{activeDay}</h2>
            <button onClick={() => openAdd(activeDay)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              <Plus size={12} /> Add Meal
            </button>
          </div>

          {dayMeals(activeDay).length === 0 ? (
            <div className="flex flex-col items-center py-10 rounded-2xl border border-dashed border-white/15 text-center">
              <span className="text-4xl mb-2">🍽️</span>
              <p className="text-gray-400 text-sm">Nothing planned yet</p>
              <button onClick={() => openAdd(activeDay)} className="mt-3 text-pink-400 text-sm font-semibold">+ Plan a meal</button>
            </div>
          ) : (
            <div className="space-y-3">
              {MEAL_TYPES.map(type => {
                const typeMeals = dayMeals(activeDay).filter(m => m.meal_type === type);
                if (!typeMeals.length) return null;
                return (
                  <div key={type}>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5">{MEAL_EMOJIS[type]} {type}</p>
                    {typeMeals.map(meal => {
                      const linked = linkedNames(meal);
                      return (
                        <div key={meal.id} className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-white">{meal.meal_name}</p>
                            {meal.notes && <p className="text-xs text-gray-400 mt-0.5">{meal.notes}</p>}
                            {linked.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {linked.map(name => (
                                  <span key={name} className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-300 border border-green-700/50 flex items-center gap-1">
                                    <ShoppingCart size={8} /> {name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => deleteMeal(meal.id)} className="text-gray-600 hover:text-red-400 transition mt-0.5">
                            <X size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly overview */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold tracking-widest text-gray-500 px-4 pt-3 pb-2">WEEK OVERVIEW</p>
          {DAYS.map(day => {
            const count = dayMeals(day).length;
            const dinners = dayMeals(day).filter(m => m.meal_type === 'Dinner');
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition border-t border-white/5 text-left">
                <span className="text-xs font-bold text-gray-400 w-8">{day.slice(0, 3)}</span>
                <div className="flex-1">
                  {dinners.length > 0
                    ? <p className="text-xs text-white">{dinners.map(d => d.meal_name).join(', ')}</p>
                    : <p className="text-xs text-gray-600">Nothing planned</p>
                  }
                </div>
                {count > 0 && <span className="text-[10px] text-pink-400 font-bold">{count} meal{count > 1 ? 's' : ''}</span>}
              </button>
            );
          })}
        </div>

        {/* Grocery link shortcut */}
        <button onClick={() => navigate('/grocery-list')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <ShoppingCart size={18} className="text-green-400" />
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-green-300">View Grocery List</p>
            <p className="text-xs text-gray-500">{uncheckedGrocery.length} item{uncheckedGrocery.length !== 1 ? 's' : ''} still to buy</p>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Add Meal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 'calc(100vh - 80px)', height: '90vh' }} onClick={e => e.stopPropagation()}>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-6 pb-2 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">MEAL NAME</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="e.g., Grilled Chicken Salad"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">MEAL TYPE</label>
                  <select
                    value={addType}
                    onChange={e => setAddType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">DAY</label>
                  <select
                    value={addDay}
                    onChange={e => setAddDay(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">NOTES (OPTIONAL)</label>
                <textarea
                  value={addNotes}
                  onChange={e => setAddNotes(e.target.value)}
                  placeholder="Recipe notes, ingredients, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">CALORIES</label>
                  <input
                    type="number"
                    value={addCalories}
                    onChange={e => setAddCalories(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">PROTEIN (g)</label>
                  <input
                    type="number"
                    value={addProtein}
                    onChange={e => setAddProtein(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">CARBS (g)</label>
                  <input
                    type="number"
                    value={addCarbs}
                    onChange={e => setAddCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">LINK GROCERY ITEMS</label>
                <p className="text-xs text-gray-500 mb-2">Select items from your grocery list</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uncheckedGrocery.length === 0 ? (
                    <p className="text-xs text-gray-500">No items in grocery list</p>
                  ) : (
                    uncheckedGrocery.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleGrocery(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition ${
                          addLinked.includes(item.id) ? 'bg-green-900/50 border border-green-700/50' : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          addLinked.includes(item.id) ? 'bg-green-500 border-green-500' : 'border-gray-500'
                        }`}>
                          {addLinked.includes(item.id) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="flex-1">{item.name}</span>
                        {item.quantity > 1 && <span className="text-xs text-gray-400">×{item.quantity}</span>}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button onClick={saveAdd} disabled={!addName.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Save Meal 🍽️
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}