import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const COUNTDOWN_IDEAS = [
  { title: 'Graduation Day', desc: 'Count down to walking across that stage', emoji: '👩‍🎓', category: 'Graduation' },
  { title: 'Dream Trip', desc: 'Paris, Cancun, NYC — your next adventure', emoji: '✈️', category: 'Trip/Vacation' },
  { title: 'Savings Goal', desc: 'Count down to hitting your money milestone', emoji: '💰', category: 'Savings Goal' },
  { title: 'Glow-Up Era', desc: '90 days to your best self', emoji: '✨', category: 'Glow-Up Goal' },
  { title: 'Competition Day', desc: 'Train hard, show up, win', emoji: '🏆', category: 'Competition' },
  { title: 'Test Day', desc: 'SAT, ACT, finals — you\'ve got this', emoji: '📚', category: 'SAT/ACT' },
];

const CATEGORIES = [
  { label: 'Graduation', emoji: '👩‍🎓', color: 'from-purple-900 to-purple-700' },
  { label: 'Trip / Vacation', emoji: '✈️', color: 'from-blue-900 to-blue-700' },
  { label: 'Birthday', emoji: '🎂', color: 'from-pink-900 to-pink-700' },
  { label: 'Savings Goal', emoji: '💰', color: 'from-green-900 to-green-700' },
  { label: 'Competition', emoji: '🏆', color: 'from-yellow-900 to-yellow-700' },
  { label: 'SAT / ACT', emoji: '📚', color: 'from-indigo-900 to-indigo-700' },
  { label: 'Self-Care Goal', emoji: '🧘‍♀️', color: 'from-teal-900 to-teal-700' },
  { label: 'Glow-Up Goal', emoji: '✨', color: 'from-fuchsia-900 to-fuchsia-700' },
  { label: 'Other', emoji: '🎯', color: 'from-gray-800 to-gray-600' },
];

export default function Countdown() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [countdowns, setCountdowns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Graduation');
  const [customTitle, setCustomTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const cdList = await base44.entities.Countdown.filter({ user_email: u.email });
      setCountdowns(cdList);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleStartCountdown = async () => {
    if (!customTitle.trim() || !targetDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const categoryObj = CATEGORIES.find(c => c.label === selectedCategory);

    try {
      const newCountdown = await base44.entities.Countdown.create({
        user_email: user.email,
        title: customTitle,
        category: selectedCategory,
        description: customTitle,
        target_date: targetDate,
        emoji: categoryObj?.emoji || '🎯'
      });

      setCountdowns([...countdowns, newCountdown]);
      setShowModal(false);
      setCustomTitle('');
      setTargetDate('');
      setSelectedCategory('Graduation');
      toast.success('Countdown created!');
    } catch (e) {
      toast.error('Failed to create countdown');
    }
  };

  const handleDeleteCountdown = async (id) => {
    if (!window.confirm('Delete this countdown?')) return;

    try {
      await base44.entities.Countdown.delete(id);
      setCountdowns(countdowns.filter(c => c.id !== id));
      toast.success('Countdown deleted');
    } catch (e) {
      toast.error('Failed to delete countdown');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Countdown Goals 🏆</h1>
            <p className="text-xs text-gray-400">Count down to your biggest moments</p>
          </div>
        </div>
        <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
        </div>
      </div>

      {/* Add Button */}
      {countdowns.length > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className="mx-4 w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition mb-4"
        >
          + Add Countdown
        </button>
      )}

      <div className="px-4 space-y-6">
        {/* Empty State or Countdowns List */}
        {countdowns.length === 0 ? (
          <div>
            <div className="text-center py-12">
              <p className="text-5xl mb-3">⏳</p>
              <p className="text-white font-semibold mb-1">No countdowns yet.</p>
              <p className="text-gray-400 text-sm">Add your first one!</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-base hover:opacity-90 transition mb-6"
            >
              + Add Countdown
            </button>

            {/* Glow Journey Ideas */}
            <div>
              <p className="text-sm font-bold tracking-widest text-gray-500 mb-4">✨ Glow Journey Countdown Ideas</p>
              <div className="grid grid-cols-2 gap-3">
                {COUNTDOWN_IDEAS.map((idea, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition"
                  >
                    <p className="text-3xl mb-2">{idea.emoji}</p>
                    <p className="font-bold text-white text-sm">{idea.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{idea.desc}</p>
                    <button
                      onClick={() => {
                        setSelectedCategory(idea.category);
                        setCustomTitle(idea.title);
                        setShowModal(true);
                      }}
                      className="mt-3 text-xs text-pink-400 font-semibold hover:text-pink-300"
                    >
                      Start countdown →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {countdowns.map(cd => {
              const daysLeft = calculateDaysRemaining(cd.target_date);
              const categoryObj = CATEGORIES.find(c => c.label === cd.category);

              return (
                <div
                  key={cd.id}
                  className={`bg-gradient-to-br ${categoryObj?.color || 'from-gray-800 to-gray-600'} rounded-2xl p-4 border border-white/10 relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-repeat" style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='2' y='15' font-size='16'%3E💜%3C/text%3E%3C/svg%3E\")"
                    }} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-2xl font-bold text-white">{cd.emoji} {cd.title}</p>
                        <p className="text-xs text-white/70 mt-1">{cd.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCountdown(cd.id)}
                        className="text-white/50 hover:text-red-400 transition flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20">
                      <p className="text-4xl font-bold text-white">{Math.max(0, daysLeft)}</p>
                      <p className="text-xs text-white/70">days to go</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Countdown Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">New Countdown</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">What are you counting down to?</p>

            {/* Category Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`p-3 rounded-2xl border-2 transition text-center ${
                    selectedCategory === cat.label
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-2xl mb-1">{cat.emoji}</p>
                  <p className="text-xs font-semibold text-white">{cat.label}</p>
                </button>
              ))}
            </div>

            {/* Custom Title */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Custom Name</label>
              <input
                type="text"
                placeholder="e.g. Custom countdown"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
              />
            </div>

            {/* Target Date */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartCountdown}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:opacity-90 transition mb-3"
            >
              Start Countdown 💖
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-full border border-gray-700 text-white font-semibold hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}