import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { Plus, ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_TYPES = [
  { id: 'birthday', label: 'Birthday Party', emoji: '🎂' },
  { id: 'graduation', label: 'Graduation', emoji: '🎓' },
  { id: 'sweet16', label: 'Sweet 16', emoji: '✨' },
  { id: 'girls_trip', label: 'Girls Trip', emoji: '✈️' },
  { id: 'prom', label: 'Prom Night', emoji: '👗' },
  { id: 'vision_party', label: 'Vision Party', emoji: '🎯' },
  { id: 'glow_up', label: 'Glow-Up Party', emoji: '🔥' },
  { id: 'self_care', label: 'Self-Care Day', emoji: '🌸' },
  { id: 'study', label: 'Study Session', emoji: '📚' },
  { id: 'college', label: 'College Move-In', emoji: '🏠' },
];

const VIBES = [
  { id: 'glam', label: 'Glam Queen', emoji: '💅' },
  { id: 'soft_girl', label: 'Soft Girl', emoji: '🌸' },
  { id: 'outdoor', label: 'Outdoor Vibes', emoji: '🌿' },
  { id: 'sleepover', label: 'Sleepover', emoji: '🌙' },
  { id: 'spa', label: 'Spa Day', emoji: '👸' },
  { id: 'royal', label: 'Royal Affair', emoji: '👑' },
  { id: 'neon', label: 'Neon Party', emoji: '⚡' },
  { id: 'beach', label: 'Beach Vibes', emoji: '🏖️' },
];

export default function BirthdayPlanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedType, setSelectedType] = useState('birthday');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('glam');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.GlowEvent.filter({ user_email: u.email });
      setEvents(data.sort((a, b) => b.created_date?.localeCompare(a.created_date)));
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleCreate = async () => {
    if (!eventName.trim()) { toast.error('Please enter an event name'); return; }
    setCreating(true);
    const typeObj = EVENT_TYPES.find(t => t.id === selectedType);
    const created = await base44.entities.GlowEvent.create({
      user_email: user.email,
      name: eventName.trim(),
      event_type: typeObj.label,
      event_type_emoji: typeObj.emoji,
      event_date: eventDate,
      budget: budget ? Number(budget) : 0,
      vibe: VIBES.find(v => v.id === selectedVibe)?.label || '',
      notes,
    });
    setEvents(prev => [created, ...prev]);
    setShowCreate(false);
    setEventName(''); setEventDate(''); setBudget(''); setNotes('');
    setCreating(false);
    navigate(`/birthday-planner/${created.id}`);
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr + 'T00:00:00') - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0d0d' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Hero header */}
        <div className="px-4 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #ff1493 0%, #cc44ff 100%)' }}>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate('/discover')} className="text-white/80 flex items-center gap-1 text-sm">
              <ChevronLeft size={18} /> Home
            </button>
          </div>
          <p className="text-2xl mb-1">✦✦</p>
          <h1 className="text-3xl font-bold text-white">Glow Events™</h1>
          <p className="text-white/80 text-sm mt-1">Plan every moment that matters</p>
        </div>

        <div className="px-4 pt-5">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-4 rounded-full font-bold text-white text-base flex items-center justify-center gap-2 mb-6"
            style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}
          >
            <Plus size={20} /> Create New Glow Event
          </button>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🎉</span>
              <h2 className="text-xl font-bold text-white mb-2">No events planned yet</h2>
              <p className="text-gray-400 text-sm">Create your first Glow Event!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => {
                const days = getDaysUntil(ev.event_date);
                return (
                  <button
                    key={ev.id}
                    onClick={() => navigate(`/birthday-planner/${ev.id}`)}
                    className="w-full text-left rounded-2xl p-4 border border-white/10 overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg, rgba(255,20,147,0.2), rgba(204,68,255,0.2))' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{ev.event_type_emoji || '🎉'}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{ev.name}</p>
                        <p className="text-sm text-white/70">{ev.event_type}</p>
                        {ev.event_date && <p className="text-xs text-pink-300 mt-0.5">{ev.event_date}{days !== null && ` · ${days > 0 ? days + ' days away' : days === 0 ? 'Today!' : 'Past'}`}</p>}
                      </div>
                      {ev.budget > 0 && <span className="text-yellow-300 font-bold text-sm">${ev.budget.toLocaleString()}</span>}
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
            <div className="w-full max-w-lg bg-[#1a0a2e] rounded-3xl p-6 pb-16" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white text-center flex-1">✨ New Glow Event</h2>
                <button onClick={() => setShowCreate(false)}><X size={22} className="text-gray-400" /></button>
              </div>

              <p className="text-xs font-bold tracking-widest text-gray-400 mb-3">WHAT ARE YOU PLANNING?</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {EVENT_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition text-left ${
                      selectedType === t.id ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-white text-sm font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Event name (e.g. Jordyn's Sweet 16)"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3"
              />

              <p className="text-xs font-bold tracking-widest text-gray-400 mb-2">DATE</p>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-3"
              />

              <p className="text-xs font-bold tracking-widest text-gray-400 mb-2">TOTAL BUDGET (optional)</p>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-7 pr-4 py-3 text-white text-sm outline-none"
                />
              </div>

              <p className="text-xs font-bold tracking-widest text-gray-400 mb-2">VIBE / THEME</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {VIBES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVibe(v.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition ${
                      selectedVibe === v.id ? 'bg-pink-500 border-pink-500 text-white font-bold' : 'border-white/20 text-gray-300'
                    }`}
                  >
                    <span>{v.emoji}</span> {v.label}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Notes (optional)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-4 resize-none"
              />

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-4 rounded-full font-bold text-white text-base disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}
              >
                {creating ? 'Creating...' : '✨ Create Glow Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}