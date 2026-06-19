import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { Plus, ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';

const TRIP_TYPES = [
  { id: 'girls_trip', label: 'Girls Trip', emoji: '👯' },
  { id: 'solo', label: 'Solo Adventure', emoji: '🧳' },
  { id: 'family', label: 'Family Vacation', emoji: '👨‍👩‍👧' },
  { id: 'road_trip', label: 'Road Trip', emoji: '🚗' },
  { id: 'beach', label: 'Beach Getaway', emoji: '🏖️' },
  { id: 'camping', label: 'Camping', emoji: '⛺' },
  { id: 'city', label: 'City Break', emoji: '🏙️' },
  { id: 'abroad', label: 'International', emoji: '✈️' },
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [showCreate, setShowCreate] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [tripType, setTripType] = useState('girls_trip');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [isDream, setIsDream] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Track page view with metadata
    base44.analytics.track({ eventName: 'page_view', metadata: { page: 'Trip Planner', path: '/trip-planner' } });
    
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.Trip.filter({ user_email: u.email });
      setTrips(data.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || '')));
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Enter a trip name'); return; }
    setCreating(true);
    const typeObj = TRIP_TYPES.find(t => t.id === tripType);
    const t = await base44.entities.Trip.create({
      user_email: user.email,
      name: name.trim(),
      trip_type: typeObj.label,
      trip_type_emoji: typeObj.emoji,
      start_date: startDate,
      end_date: endDate,
      budget: budget ? Number(budget) : 0,
      is_dream: isDream,
    });
    setTrips(prev => [t, ...prev]);
    setShowCreate(false);
    setName(''); setStartDate(''); setEndDate(''); setBudget('');
    setCreating(false);
    navigate(`/trip-planner/${t.id}`);
  };

  const getDaysAway = (d) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filtered = trips.filter(t => tab === 'my' ? !t.is_dream : t.is_dream);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-6 pb-8 text-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}>
          <p className="text-4xl mb-2">🌍</p>
          <h1 className="text-3xl font-bold text-white">Trip Planner</h1>
          <p className="text-white/80 text-sm">Plan your next adventure 🌎</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button onClick={() => setTab('my')} className={`flex-1 py-3 text-sm font-semibold ${tab === 'my' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>
            My Trips
          </button>
          <button onClick={() => setTab('dream')} className={`flex-1 py-3 text-sm font-semibold ${tab === 'dream' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>
            ✨ Dream Trips
          </button>
        </div>

        <div className="px-4 pt-4">
          <button onClick={() => { setIsDream(tab === 'dream'); setShowCreate(true); }}
            className="w-full py-3.5 rounded-full font-bold text-white text-sm flex items-center justify-center gap-2 mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            <Plus size={18} /> Plan a New Trip
          </button>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <span className="text-6xl mb-3">{tab === 'dream' ? '✨' : '🌎'}</span>
              <p className="text-white font-semibold">No trips yet</p>
              <p className="text-gray-500 text-sm">Plan your next adventure!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(trip => {
                const days = getDaysAway(trip.start_date);
                return (
                  <button key={trip.id} onClick={() => navigate(`/trip-planner/${trip.id}`)}
                    className="w-full text-left glass rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{trip.trip_type_emoji || '🌎'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white">{trip.name}</p>
                        <p className="text-xs text-gray-400">{trip.trip_type_emoji} {trip.trip_type} · {trip.start_date}</p>
                      </div>
                      <div className="text-right">
                        {days !== null && (
                          <p className={`text-sm font-bold ${days <= 0 ? 'text-gray-400' : days <= 1 ? 'text-green-400' : 'text-blue-400'}`}>
                            {days < 0 ? 'Completed' : days === 0 ? '🎉 Today!' : `${days}`}
                          </p>
                        )}
                        {days > 0 && <p className="text-xs text-gray-500">days away</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto" onClick={() => setShowCreate(false)}>
          <div className="min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
            <div className="w-full max-w-lg glass-strong rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">✈️ New Trip</h2>
                <button onClick={() => setShowCreate(false)}><X size={22} className="text-gray-400" /></button>
              </div>

              <input type="text" placeholder="Trip name" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3" />

              <p className="text-xs font-bold tracking-widest text-gray-400 mb-2">TYPE</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {TRIP_TYPES.map(t => (
                  <button key={t.id} onClick={() => setTripType(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left text-sm ${
                      tripType === t.id ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-300'
                    }`}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Start Date</p>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white text-sm outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">End Date</p>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 text-white text-sm outline-none" />
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-1">Budget ($)</p>
              <input type="number" placeholder="500" value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-4" />

              <button onClick={handleCreate} disabled={creating}
                className="w-full py-4 rounded-full font-bold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                {creating ? 'Creating...' : '✈️ Create Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="discover" />
    </div>
  );
}