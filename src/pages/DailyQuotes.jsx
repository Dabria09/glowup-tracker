import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

const CAT_LABELS = {
  general: 'General', wellness: '💆 Wellness', financial_literacy: '💰 Financial Literacy',
  mentorship: '🤝 Mentorship', career_exploration: '🚀 Career Exploration',
  civic_education: '🗳️ Civic Education', confidence: '✨ Confidence',
  spiritual: '🙏 Spiritual', relationships: '💞 Relationships',
  leadership: '👑 Leadership', self_image: '🪞 Self-Image',
};

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministically pick a quote for a given date from the pool
// Featured quotes get priority — they're always candidates for today
function pickForDate(quotes, dateStr) {
  if (!quotes.length) return null;
  const featured = quotes.filter(q => q.is_featured);
  const pool = featured.length ? featured : quotes;
  const [y, m, day] = dateStr.split('-').map(Number);
  return pool[(y * 365 + m * 31 + day) % pool.length];
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DailyQuotes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allQuotes, setAllQuotes] = useState([]);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [tab, setTab] = useState('today');
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [adminQuotes, saved] = await Promise.all([
        base44.entities.AdminQuote.list('-created_date', 500),
        base44.entities.SavedQuote.filter({ user_email: u.email }),
      ]);
      // Only show active quotes in-app (is_active undefined treated as active)
      setAllQuotes(adminQuotes.filter(q => q.is_active !== false));
      setSavedQuotes(saved.sort((a, b) => (b.saved_date || '').localeCompare(a.saved_date || '')));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todayQuote = pickForDate(allQuotes, todayKey);
  const yesterdayQuote = pickForDate(allQuotes, yesterdayKey);
  const filteredQuotes = catFilter === 'all' ? allQuotes : allQuotes.filter(q => q.category === catFilter);
  const availableCats = ['all', ...new Set(allQuotes.map(q => q.category).filter(Boolean))];

  const isSaved = (text, date) => savedQuotes.some(q => q.quote_text === text && q.saved_date === date);

  const toggleSave = async (quote, date) => {
    const qText = quote.quote_text || quote.text;
    const existing = savedQuotes.find(q => q.quote_text === qText && q.saved_date === date);
    if (existing) {
      await base44.entities.SavedQuote.delete(existing.id);
      setSavedQuotes(prev => prev.filter(q => q.id !== existing.id));
      toast.success('Quote removed');
    } else {
      const created = await base44.entities.SavedQuote.create({
        user_email: user.email,
        quote_text: qText,
        quote_author: quote.author || quote.quote_author || '',
        saved_date: date,
        category: quote.category || '',
      });
      setSavedQuotes(prev => [created, ...prev]);
      toast.success('Quote saved! 🔖');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const yesterdaySaved = yesterdayQuote ? isSaved(yesterdayQuote.quote_text, yesterdayKey) : false;

  return (
    <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <h1 className="text-3xl font-bold text-white">Daily Quotes 💬</h1>
        </div>
        <p className="text-sm text-gray-400 mb-5 pl-7">A fresh quote every day — save it or lose it.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'today', label: "✨ Today's Quote" },
            { id: 'browse', label: `📚 Browse (${allQuotes.length})` },
            { id: 'saved', label: `🔖 Saved (${savedQuotes.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition"
              style={tab === t.id
                ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY tab */}
        {tab === 'today' && (
          <div className="space-y-4">
            {!todayQuote ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-gray-400 text-sm">No quotes added yet. Check back once the admin adds quotes!</p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl p-6 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.4)' }}>
                  <div className="absolute top-3 right-3">
                    <button onClick={() => toggleSave(todayQuote, todayKey)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition"
                      style={{ background: isSaved(todayQuote.quote_text, todayKey) ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)' }}>
                      {isSaved(todayQuote.quote_text, todayKey)
                        ? <BookmarkCheck size={18} className="text-purple-300" />
                        : <Bookmark size={18} className="text-gray-300" />}
                    </button>
                  </div>
                  <p className="text-xs font-bold tracking-wider text-pink-400 mb-2">TODAY · {formatDate(todayKey)}</p>
                  {todayQuote.category && <span className="text-[10px] text-purple-300 mb-3 block">{CAT_LABELS[todayQuote.category] || todayQuote.category}</span>}
                  <p className="text-3xl font-bold text-purple-300 mb-4 leading-none opacity-60">"</p>
                  <p className="text-xl font-bold text-white leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {todayQuote.quote_text}
                  </p>
                  {todayQuote.author && <p className="text-sm text-pink-300 font-semibold">— {todayQuote.author}</p>}
                  <p className="text-xs text-gray-500 mt-3">Save this quote before midnight or it's gone! ✨</p>
                </div>

                {yesterdayQuote && (
                  <div className="rounded-2xl p-4 relative" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-500">YESTERDAY · {formatDate(yesterdayKey)}</p>
                      <button onClick={() => toggleSave(yesterdayQuote, yesterdayKey)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition"
                        style={{ background: yesterdaySaved ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)' }}>
                        {yesterdaySaved
                          ? <BookmarkCheck size={14} className="text-purple-300" />
                          : <Bookmark size={14} className="text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-base text-white leading-relaxed mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "{yesterdayQuote.quote_text}"
                    </p>
                    {yesterdayQuote.author && <p className="text-xs text-pink-300">— {yesterdayQuote.author}</p>}
                  </div>
                )}
              </>
            )}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <span className="text-xl">💡</span>
              <p className="text-xs text-gray-300 leading-relaxed">
                A new quote drops every day. Tap the <strong className="text-white">bookmark icon</strong> to save it to your collection — once the day ends, it's gone unless saved.
              </p>
            </div>
          </div>
        )}

        {/* BROWSE tab — filterable by category */}
        {tab === 'browse' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableCats.map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                  style={catFilter === cat
                    ? { background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                  {cat === 'all' ? 'All' : (CAT_LABELS[cat] || cat)}
                </button>
              ))}
            </div>
            {filteredQuotes.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">No quotes in this category yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredQuotes.map(q => (
                  <div key={q.id} className="rounded-2xl p-4 relative" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <button onClick={() => toggleSave(q, todayKey)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: isSaved(q.quote_text, todayKey) ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)' }}>
                      {isSaved(q.quote_text, todayKey)
                        ? <BookmarkCheck size={14} className="text-purple-300" />
                        : <Bookmark size={14} className="text-gray-400" />}
                    </button>
                    {q.category && <span className="text-[10px] text-purple-400 mb-1 block">{CAT_LABELS[q.category] || q.category}</span>}
                    {q.is_featured && <span className="text-[10px] text-yellow-400 mb-1 block">⭐ Featured</span>}
                    <p className="text-base text-white leading-relaxed mb-2 pr-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "{q.quote_text}"
                    </p>
                    {q.author && <p className="text-xs text-pink-300 font-semibold">— {q.author}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SAVED tab */}
        {tab === 'saved' && (
          <div>
            {savedQuotes.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <span className="text-5xl">🔖</span>
                <p className="font-bold text-white">No saved quotes yet</p>
                <p className="text-sm text-gray-400 text-center">Go to Today's Quote and tap the bookmark to save it!</p>
                <button onClick={() => setTab('today')} className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  See Today's Quote ✨
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQuotes.map((q) => (
                  <div key={q.id} className="rounded-2xl p-4 relative" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <button onClick={() => toggleSave({ quote_text: q.quote_text, author: q.quote_author }, q.saved_date)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(168,85,247,0.3)' }}>
                      <BookmarkCheck size={14} className="text-purple-300" />
                    </button>
                    <p className="text-xs text-purple-400 mb-2">{formatDate(q.saved_date)}</p>
                    <p className="text-base text-white leading-relaxed mb-2 pr-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                      "{q.quote_text}"
                    </p>
                    <p className="text-xs text-pink-300 font-semibold">— {q.quote_author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav active="discover" />
    </div>
  );
}