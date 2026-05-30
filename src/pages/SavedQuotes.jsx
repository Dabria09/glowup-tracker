import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Quote, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AppBackground from '@/components/AppBackground';

export default function SavedQuotes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const quotes = await base44.entities.SavedQuote.filter({ user_email: u.email }, '-created_date', 100);
      setSavedQuotes(quotes);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const deleteQuote = async (id) => {
    await base44.entities.SavedQuote.delete(id);
    setSavedQuotes(prev => prev.filter(q => q.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0608' }}>
      <div className="w-8 h-8 border-4 border-red-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28 relative" style={{ backgroundColor: '#0d0608' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Quote size={20} className="text-pink-400" />
            <div>
              <h1 className="text-xl font-bold">My Saved Quotes</h1>
              <p className="text-xs text-gray-400">{savedQuotes.length} quote{savedQuotes.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
        </div>

        {savedQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-lg font-bold text-white mb-2">No Saved Quotes Yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              When you find a quote that speaks to your soul, save it and it'll appear here.
            </p>
            <button
              onClick={() => navigate('/daily-quotes')}
              className="px-6 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              Browse Daily Quotes ✨
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedQuotes.map(q => (
              <div key={q.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">✨</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-relaxed italic mb-2">"{q.quote_text}"</p>
                    {q.quote_author && <p className="text-xs text-gray-400">— {q.quote_author}</p>}
                    {q.saved_date && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', color: '#f9a8d4' }}>
                        📅 {q.saved_date}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteQuote(q.id)}
                    className="p-2 rounded-full flex-shrink-0 hover:bg-red-500/20 transition"
                  >
                    <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="me" />
    </div>
  );
}