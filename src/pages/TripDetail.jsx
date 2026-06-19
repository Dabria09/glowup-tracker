import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DOC_PRESETS = [
  'Government-issued ID or Passport',
  'Travel insurance card',
  'Hotel/Airbnb confirmation',
  'Flight/bus/train tickets',
  'Emergency contact list',
  'Health insurance card',
  'Vaccination records (if required)',
  'Visa (if international)',
  'Parent/guardian consent form (if under 18)',
];

const PACKING_PRESETS = {
  'Girls Trip': ['Outfits (day & night)','Swimsuit','Sunscreen','Makeup bag','Hair tools','Chargers','Snacks','Camera','Toiletries','Pajamas','Sunglasses','Comfortable shoes'],
  'Solo Adventure': ['Backpack','Water bottle','Maps/guidebook','Portable charger','First aid kit','Snacks','Comfortable shoes','Journal','Sunscreen','Rain jacket'],
  'Beach Getaway': ['Swimsuit','Beach towel','Sunscreen SPF 50','Flip flops','Sunglasses','Hat','Cover-up','Aloe vera gel','Beach bag','Snorkeling gear'],
  'Camping': ['Tent','Sleeping bag','Flashlight','Bug spray','Water bottle','Trail snacks','Hiking boots','First aid kit','Portable speaker','Rain gear'],
};

const EXPENSE_CATS = ['Transportation','Accommodation','Food & Drinks','Activities','Shopping','Other'];

const SAFETY_TIPS = [
  'Share your full itinerary with a trusted adult before you leave',
  'Save local emergency numbers for your destination',
  'Keep a physical copy of important documents',
  'Check in with family/guardian daily',
  'Trust your instincts — if something feels wrong, leave',
  'Never share your hotel room number with strangers',
];

const EMERGENCY_NUMS = [
  { label: 'US Emergency', number: '911' },
  { label: 'Poison Control', number: '1-800-222-1222' },
  { label: 'US Embassy (intl)', number: '1-888-407-4747' },
  { label: 'Crisis Text Line', number: 'Text HOME to 741741' },
];

const SAVINGS_TIPS = [
  { emoji: '🏦', text: 'Open a separate savings account just for this trip' },
  { emoji: '🎁', text: 'Save any birthday or holiday money you receive' },
  { emoji: '👜', text: 'Do odd jobs — babysitting, lawn care, selling crafts' },
  { emoji: '🍔', text: 'Cut back on fast food for 1 month — save $50-100' },
  { emoji: '👗', text: 'Sell clothes you no longer wear on Poshmark or Depop' },
  { emoji: '🎂', text: 'Ask for cash instead of gifts for your birthday' },
];

const TABS = ['Overview','Budget','Packing','Itinerary','Save for It'];

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [docs, setDocs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [packItems, setPackItems] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  // Forms
  const [expCat, setExpCat] = useState('Transportation');
  const [expItem, setExpItem] = useState('');
  const [expCost, setExpCost] = useState('');
  const [packInput, setPackInput] = useState('');
  const [actDay, setActDay] = useState('1');
  const [actTime, setActTime] = useState('');
  const [actName, setActName] = useState('');
  const [actLoc, setActLoc] = useState('');
  const [savePerWeek, setSavePerWeek] = useState('');

  useEffect(() => {
    // Track page view - detail page
    base44.analytics.track({ eventName: 'page_view', metadata: { page: 'Trip Detail', path: '/trip-planner/:id', category: 'detail_page' } });
    
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [t, d, e, p, a] = await Promise.all([
        base44.entities.Trip.get(id),
        base44.entities.TripDocument.filter({ trip_id: id }),
        base44.entities.TripExpense.filter({ trip_id: id }),
        base44.entities.TripPackItem.filter({ trip_id: id }),
        base44.entities.TripActivity.filter({ trip_id: id }),
      ]);
      setTrip(t); setDocs(d); setExpenses(e); setPackItems(p); setActivities(a);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, [id]);

  // Auto-create doc checklist if empty
  useEffect(() => {
    if (!loading && docs.length === 0 && user && trip) {
      base44.entities.TripDocument.bulkCreate(
        DOC_PRESETS.map(label => ({ trip_id: id, user_email: user.email, label, is_checked: false }))
      ).then(created => setDocs(created));
    }
  }, [loading, docs.length, user, trip, id]);

  const toggleDoc = async (doc) => {
    await base44.entities.TripDocument.update(doc.id, { is_checked: !doc.is_checked });
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, is_checked: !d.is_checked } : d));
  };

  const addExpense = async () => {
    if (!expItem.trim() || !expCost) return;
    const e = await base44.entities.TripExpense.create({ trip_id: id, user_email: user.email, category: expCat, item: expItem.trim(), cost: Number(expCost) });
    setExpenses(prev => [...prev, e]);
    setExpItem(''); setExpCost('');
  };

  const deleteExpense = async (e) => {
    await base44.entities.TripExpense.delete(e.id);
    setExpenses(prev => prev.filter(x => x.id !== e.id));
  };

  const addPackItem = async () => {
    if (!packInput.trim()) return;
    const p = await base44.entities.TripPackItem.create({ trip_id: id, user_email: user.email, label: packInput.trim(), is_packed: false });
    setPackItems(prev => [...prev, p]);
    setPackInput('');
  };

  const togglePack = async (item) => {
    await base44.entities.TripPackItem.update(item.id, { is_packed: !item.is_packed });
    setPackItems(prev => prev.map(p => p.id === item.id ? { ...p, is_packed: !p.is_packed } : p));
  };

  const deletePack = async (item) => {
    await base44.entities.TripPackItem.delete(item.id);
    setPackItems(prev => prev.filter(p => p.id !== item.id));
  };

  const loadPreset = async () => {
    const preset = PACKING_PRESETS[trip.trip_type] || PACKING_PRESETS['Girls Trip'];
    const items = preset.map(label => ({ trip_id: id, user_email: user.email, label, is_packed: false }));
    const created = await base44.entities.TripPackItem.bulkCreate(items);
    setPackItems(prev => [...prev, ...created]);
    toast.success('Packing list loaded! ✨');
  };

  const addActivity = async () => {
    if (!actName.trim()) return;
    const a = await base44.entities.TripActivity.create({ trip_id: id, user_email: user.email, day_number: Number(actDay), time: actTime, activity: actName.trim(), location: actLoc });
    setActivities(prev => [...prev, a]);
    setActName(''); setActLoc(''); setActTime('');
  };

  const deleteActivity = async (a) => {
    await base44.entities.TripActivity.delete(a.id);
    setActivities(prev => prev.filter(x => x.id !== a.id));
  };

  const deleteTrip = async () => {
    if (!window.confirm('Delete this trip?')) return;
    await base44.entities.Trip.delete(id);
    toast.success('Trip deleted');
    navigate('/trip-planner');
  };

  if (loading || !trip) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const dayCount = (() => {
    if (!trip.start_date || !trip.end_date) return 0;
    return Math.max(1, Math.ceil((new Date(trip.end_date + 'T00:00:00') - new Date(trip.start_date + 'T00:00:00')) / (1000*60*60*24)) + 1);
  })();

  const packedCount = packItems.filter(p => p.is_packed).length;
  const totalSpend = expenses.reduce((s, e) => s + (e.cost || 0), 0);
  const remaining = (trip.budget || 0) - totalSpend;
  const docsChecked = docs.filter(d => d.is_checked).length;
  const weeksToSave = savePerWeek && Number(savePerWeek) > 0 ? Math.ceil((trip.budget || 0) / Number(savePerWeek)) : null;

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Hero */}
        <div className="relative pt-6 pb-6 px-4 text-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='white'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
          <button onClick={() => navigate('/trip-planner')} className="absolute top-6 left-4 text-white/80 flex items-center gap-1 text-sm z-20">
            <ChevronLeft size={18} /> All Trips
          </button>
          <div className="relative z-10">
            <p className="text-4xl mb-1">{trip.trip_type_emoji || '🌎'}</p>
            <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
            <p className="text-white/80 text-sm">{trip.trip_type_emoji} {trip.trip_type}</p>
            {trip.start_date && <p className="text-white/60 text-xs mt-1">{trip.start_date} – {trip.end_date || trip.start_date} · {dayCount} days</p>}
            <div className="flex justify-center gap-3 mt-3">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold">${(trip.budget || 0).toLocaleString()}</p>
                <p className="text-xs text-white/80">Budget</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold">{packedCount}/{packItems.length}</p>
                <p className="text-xs text-white/80">Packed</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold">{dayCount}</p>
                <p className="text-xs text-white/80">Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 bg-black/20 scrollbar-none">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === t ? 'text-white border-b-2 border-blue-400' : 'text-gray-500'}`}>
              {t === 'Overview' && '🗂️ '}{t === 'Budget' && '💰 '}{t === 'Packing' && '🧳 '}{t === 'Itinerary' && '📅 '}{t === 'Save for It' && '🐷 '}{t}
            </button>
          ))}
        </div>

        <div className="px-4 pt-5 pb-4">

          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div>
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-white">📋 Documents Checklist</p>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">{docsChecked}/{docs.length}</span>
                </div>
                <div className="space-y-2">
                  {docs.map(doc => (
                    <button key={doc.id} onClick={() => toggleDoc(doc)} className="flex items-center gap-3 w-full text-left py-2 border-b border-white/5 last:border-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${doc.is_checked ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                        {doc.is_checked && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`text-sm ${doc.is_checked ? 'line-through text-gray-500' : 'text-white'}`}>{doc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))', border: '1px solid rgba(251,191,36,0.3)' }}>
                <p className="font-bold text-yellow-300 mb-2">🛡️ Safety First 🧯</p>
                {SAFETY_TIPS.map((tip, i) => (
                  <p key={i} className="text-sm text-yellow-200/80 mb-1">• {tip}</p>
                ))}
              </div>

              {/* Emergency */}
              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-bold text-white mb-3">Emergency Numbers</p>
                <div className="grid grid-cols-2 gap-2">
                  {EMERGENCY_NUMS.map(n => (
                    <div key={n.label} className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs font-bold text-blue-400">{n.label}</p>
                      <p className="text-sm text-white">{n.number}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={deleteTrip} className="w-full py-3 rounded-full border border-red-900/40 text-red-400 text-sm font-semibold">Delete Trip</button>
            </div>
          )}

          {/* BUDGET */}
          {activeTab === 'Budget' && (
            <div>
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white/80">Total Budget</span>
                  <span className="text-sm text-white/80">Planned Spend</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold text-white">${(trip.budget || 0).toFixed(2)}</span>
                  <span className="text-2xl font-bold text-white">${totalSpend.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.min(100, trip.budget ? (totalSpend / trip.budget) * 100 : 0)}%` }} />
                </div>
                <p className="text-xs text-white/70 mt-1">${remaining.toFixed(2)} remaining</p>
              </div>

              {expenses.length > 0 && (
                <div className="space-y-2 mb-4">
                  {expenses.map(e => (
                    <div key={e.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">{e.category}</p>
                        <p className="text-sm text-white">{e.item}</p>
                      </div>
                      <span className="text-white font-bold text-sm">${e.cost}</span>
                      <button onClick={() => deleteExpense(e)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass rounded-2xl p-4">
                <p className="font-semibold text-white mb-2">Add Expense</p>
                <select value={expCat} onChange={e => setExpCat(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-2 appearance-none">
                  {EXPENSE_CATS.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
                <input type="text" placeholder="Item (e.g. Round-trip flight)" value={expItem} onChange={e => setExpItem(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-2" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Cost ($)" value={expCost} onChange={e => setExpCost(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500" />
                  <button onClick={addExpense} className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PACKING */}
          {activeTab === 'Packing' && (
            <div>
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-white">Packing Progress</p>
                  <span className="text-blue-400 font-bold text-sm">{packItems.length > 0 ? Math.round((packedCount / packItems.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${packItems.length > 0 ? (packedCount / packItems.length) * 100 : 0}%` }} />
                </div>
              </div>

              {packItems.length === 0 && (
                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-sm text-blue-400 mb-2">Load packing preset for {trip.trip_type_emoji} {trip.trip_type}</p>
                  <button onClick={loadPreset} className="px-4 py-2 rounded-full border border-blue-500/40 text-blue-400 text-sm font-semibold">
                    ✨ Load {trip.trip_type_emoji} {trip.trip_type} Packing List
                  </button>
                </div>
              )}

              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-semibold text-white mb-2">Add Item</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Item to pack" value={packInput} onChange={e => setPackInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addPackItem()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500" />
                  <button onClick={addPackItem} className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {packItems.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <span className="text-5xl mb-2">🧳</span>
                  <p className="text-gray-400 text-sm">No items yet — load a preset or add your own!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {packItems.map(item => (
                    <div key={item.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                      <button onClick={() => togglePack(item)}
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${item.is_packed ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                        {item.is_packed && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_packed ? 'line-through text-gray-500' : 'text-white'}`}>{item.label}</span>
                      <button onClick={() => deletePack(item)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ITINERARY */}
          {activeTab === 'Itinerary' && (
            <div>
              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-semibold text-white mb-3">Add Activity</p>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Day</p>
                    <select value={actDay} onChange={e => setActDay(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white text-sm outline-none appearance-none">
                      {Array.from({ length: Math.max(dayCount, 1) }, (_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-gray-900">Day {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <input type="time" value={actTime} onChange={e => setActTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white text-sm outline-none" />
                  </div>
                </div>
                <input type="text" placeholder="Activity (e.g. Visit the National Museum)" value={actName} onChange={e => setActName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-2" />
                <input type="text" placeholder="Location (optional)" value={actLoc} onChange={e => setActLoc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3" />
                <button onClick={addActivity} className="w-full py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  <Plus size={16} className="inline mr-1" /> Add to Day {actDay}
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <span className="text-5xl mb-2">📅</span>
                  <p className="text-gray-400 text-sm">No activities yet — start planning your days!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: Math.max(dayCount, 1) }, (_, i) => {
                    const dayActs = activities.filter(a => a.day_number === i + 1).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
                    if (dayActs.length === 0) return null;
                    return (
                      <div key={i}>
                        <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">DAY {i + 1}</p>
                        <div className="space-y-2">
                          {dayActs.map(a => (
                            <div key={a.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                              <div className="flex-1">
                                {a.time && <span className="text-xs text-blue-400 mr-2">{a.time}</span>}
                                <span className="text-sm text-white">{a.activity}</span>
                                {a.location && <p className="text-xs text-gray-400">📍 {a.location}</p>}
                              </div>
                              <button onClick={() => deleteActivity(a)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SAVE FOR IT */}
          {activeTab === 'Save for It' && (
            <div>
              <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                <p className="text-3xl mb-1">📈</p>
                <h2 className="text-xl font-bold text-white">How to Save for This Trip</h2>
                <p className="text-white/80 text-sm">Trip cost: ${(trip.budget || 0).toFixed(2)}</p>
              </div>

              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-bold text-white mb-1">Savings Calculator</p>
                <p className="text-xs text-gray-400 mb-2">How much can you save per week? ($)</p>
                <input type="number" placeholder="e.g. 25" value={savePerWeek} onChange={e => setSavePerWeek(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500" />
                {weeksToSave && (
                  <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 font-bold text-sm">At ${savePerWeek}/week, you'll reach your goal in ~{weeksToSave} weeks ({Math.ceil(weeksToSave / 4)} months)! 🎉</p>
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-bold text-white mb-3">💡 Savings Tips for Girls</p>
                {SAVINGS_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <span className="text-lg">{tip.emoji}</span>
                    <p className="text-sm text-gray-300">{tip.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
                <p className="font-bold text-purple-300 mb-2">🧠 Life Lesson: Delayed Gratification</p>
                <p className="text-sm text-purple-200/80">
                  Saving for a trip teaches one of the most powerful financial skills: <strong>delayed gratification</strong> — choosing a bigger reward later over a smaller reward now. This same skill is used by entrepreneurs, investors, and anyone who builds real wealth. You're not just planning a trip. You're building a mindset. 🙏
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}