import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, ShoppingCart } from 'lucide-react';
import useGlowPoints from '@/hooks/useGlowPoints';

const CATEGORIES = [
  { id: 'Produce', emoji: '🥦' },
  { id: 'Dairy', emoji: '🥛' },
  { id: 'Meat & Seafood', emoji: '🍗' },
  { id: 'Bread & Bakery', emoji: '🍞' },
  { id: 'Frozen', emoji: '🧊' },
  { id: 'Snacks', emoji: '🍿' },
  { id: 'Beverages', emoji: '🧃' },
  { id: 'Pantry', emoji: '🥫' },
  { id: 'Personal Care', emoji: '🧴' },
  { id: 'Cleaning', emoji: '🧹' },
  { id: 'Other', emoji: '🛒' },
];

export default function GroceryList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const totalPoints = useGlowPoints(user?.email);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newCat, setNewCat] = useState('Other');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.GroceryItem.filter({ user_email: u.email });
      if (data.length === 0) {
        const sampleItems = [
          { user_email: u.email, name: 'Spinach', quantity: 1, category: 'Produce', is_checked: false },
          { user_email: u.email, name: 'Chicken Breast', quantity: 2, category: 'Meat & Seafood', is_checked: false },
          { user_email: u.email, name: 'Milk', quantity: 1, category: 'Dairy', is_checked: false },
          { user_email: u.email, name: 'Whole Wheat Bread', quantity: 1, category: 'Bread & Bakery', is_checked: false },
          { user_email: u.email, name: 'Greek Yogurt', quantity: 1, category: 'Dairy', is_checked: false },
        ];
        const created = await base44.entities.GroceryItem.bulkCreate(sampleItems);
        setItems(created);
      } else {
        setItems(data);
      }
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const checkedCount = items.filter(i => i.is_checked).length;

  const addItem = async () => {
    if (!newName.trim()) return;
    const item = await base44.entities.GroceryItem.create({
      user_email: user.email,
      name: newName.trim(),
      quantity: newQty,
      category: newCat,
      is_checked: false,
    });
    setItems(prev => [...prev, item]);
    setNewName('');
    setNewQty(1);
    setNewCat('Other');
    setShowAdd(false);
  };

  const toggleItem = async (item) => {
    const updated = { ...item, is_checked: !item.is_checked };
    await base44.entities.GroceryItem.update(item.id, { is_checked: updated.is_checked });
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const deleteItem = async (id) => {
    await base44.entities.GroceryItem.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.id),
  })).filter(g => g.items.length > 0);

  const catEmoji = (catId) => CATEGORIES.find(c => c.id === catId)?.emoji || '🛒';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            <span>🏅</span><span className="text-yellow-400">{totalPoints !== null ? totalPoints.toLocaleString() : '...'} pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-1.5"><ShoppingCart size={18} /> Grocery List</h1>
              <p className="text-xs text-gray-400">{checkedCount}/{items.length} items checked</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="h-1 rounded-full bg-white/10 mb-5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
              style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }} />
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="text-6xl mb-4">🛒</span>
            <p className="font-bold text-lg mb-1">Your list is empty</p>
            <p className="text-gray-400 text-sm mb-6">Tap + Add to start your grocery list</p>
            <button onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              + Add Item
            </button>
          </div>
        )}

        {/* Meal Planner link */}
        <button onClick={() => navigate('/meal-planner')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <span className="text-2xl">🍽️</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-green-300">Meal Planner</p>
            <p className="text-xs text-gray-500">Plan your week &amp; link these items to meals</p>
          </div>
          <span className="text-gray-500 text-lg">›</span>
        </button>

        {/* Grouped items */}
        {grouped.map(group => (
          <div key={group.id} className="mb-5">
            <p className="text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase flex items-center gap-1.5">
              <span>{group.emoji}</span> {group.id} <span className="text-gray-600">({group.items.length})</span>
            </p>
            <div className="space-y-2">
              {group.items.map(item => (
                <div key={item.id}
                  onClick={() => toggleItem(item)}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ background: item.is_checked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)' }}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.is_checked ? 'border-pink-500 bg-pink-500' : 'border-gray-500'}`}>
                    {item.is_checked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className={`flex-1 text-sm font-medium ${item.is_checked ? 'line-through text-gray-500' : 'text-white'}`}>
                    {item.name}
                    {item.quantity > 1 && <span className="text-gray-400 text-xs ml-1">×{item.quantity}</span>}
                  </span>
                  <button onClick={e => { e.stopPropagation(); deleteItem(item.id); }} className="p-1 text-gray-600 hover:text-red-400 transition">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => { setShowAdd(false); setShowCatPicker(false); }}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 'calc(100vh - 80px)', height: '90vh' }} onClick={e => e.stopPropagation()}>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-6 pb-2">
              <h3 className="text-lg font-bold mb-4">Add Item</h3>

              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 mb-2 block">ITEM NAME</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g., Apples"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">QUANTITY</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={e => setNewQty(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">CATEGORY</label>
                  <button
                    onClick={() => setShowCatPicker(!showCatPicker)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-left flex items-center justify-between"
                  >
                    <span>{catEmoji(newCat)} {newCat}</span>
                    <span className="text-gray-500">↓</span>
                  </button>
                </div>
              </div>

              {showCatPicker && (
                <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setNewCat(cat.id); setShowCatPicker(false); }}
                      className={`p-2 rounded-lg text-center text-xs font-semibold transition ${
                        newCat === cat.id ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{cat.emoji}</div>
                      <div className="truncate">{cat.id}</div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={addItem}
                disabled={!newName.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Add to List 🛒
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}