import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, ShoppingCart, ChevronLeft as PrevIcon, ChevronRight } from 'lucide-react';

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
  const [addLinked, setAddLinked] = useState([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [m, g] = await Promise.all([
        base44.entities.MealPlan.filter({ user_email: u.email }),
        base44.entities.GroceryItem.filter({ user_email: u.email }),
      ]);
      setMeals(m);
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
          <div>
            <h1 className="text-xl font-bold">🍽️ Meal Planner</h1>
            <p className="text-xs text-gray-400">Plan your week, shop smarter</p>
          </div>
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
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 pb-10" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">🍽️ Add Meal — {addDay}</p>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X size={16} /></button>
            </div>

            {/* Meal type */}
            <div className="flex gap-2 mb-4">
              {MEAL_TYPES.map(t => (
                <button key={t} onClick={() => setAddType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${addType === t ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                  style={addType === t ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
                  {MEAL_EMOJIS[t]} {t}
                </button>
              ))}
            </div>

            <label className="block text-sm text-gray-400 mb-1">Meal Name *</label>
            <input autoFocus value={addName} onChange={e => setAddName(e.target.value)}
              placeholder="e.g. Grilled Chicken, Pasta, Stir Fry..."
              className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none mb-3"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />

            <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
            <input value={addNotes} onChange={e => setAddNotes(e.target.value)}
              placeholder="Recipe link, prep notes..."
              className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />

            {/* Link grocery items */}
            {groceryItems.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-1.5"><ShoppingCart size={13} /> Link grocery items</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {groceryItems.map(g => (
                    <button key={g.id} onClick={() => toggleGrocery(g.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition ${addLinked.includes(g.id) ? 'bg-green-900/40 border border-green-600/50' : 'bg-white/5 border border-white/10'}`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${addLinked.includes(g.id) ? 'bg-green-500 text-white' : 'border border-gray-600'}`}>
                        {addLinked.includes(g.id) && '✓'}
                      </span>
                      <span className={addLinked.includes(g.id) ? 'text-green-300' : 'text-gray-300'}>{g.name}</span>
                      {g.quantity > 1 && <span className="text-gray-500 text-xs">×{g.quantity}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={saveAdd} disabled={!addName.trim()}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              Save Meal 🍽️
            </button>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}