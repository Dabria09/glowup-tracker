import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Bookmark, BookmarkCheck, Heart } from 'lucide-react';
import { toast } from 'sonner';

const QUOTES = [
  { text: "She remembered who she was and the game changed.", author: "Lalah Delia" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "You are enough. A thousand times enough.", author: "Atticus" },
  { text: "She is water. Powerful enough to drown you, soft enough to cleanse you, deep enough to save you.", author: "Adrian Michael" },
  { text: "Be the woman who fixes another woman's crown without telling the world it was crooked.", author: "Unknown" },
  { text: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" },
  { text: "I am no longer accepting the things I cannot change. I am changing the things I cannot accept.", author: "Angela Davis" },
  { text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.", author: "Brené Brown" },
  { text: "A woman is like a tea bag — you never know how strong she is until she gets in hot water.", author: "Eleanor Roosevelt" },
  { text: "I was not built to be kept. I was built to bloom.", author: "Unknown" },
  { text: "Your dreams don't have an expiration date. Take a deep breath and try again.", author: "KT Witten" },
  { text: "She was unstoppable — not because she did not have failures or doubts, but because she continued on despite them.", author: "Beau Taplin" },
  { text: "Don't shrink yourself to fit in spaces you've outgrown.", author: "Unknown" },
  { text: "The most powerful thing you can do is exactly what you're afraid of.", author: "Unknown" },
  { text: "She made broken look beautiful and strong look invincible.", author: "Ariana Dancu" },
  { text: "You are the hero of your own story.", author: "Mary McCarthy" },
  { text: "Healing isn't linear. Some days you'll feel like yourself again. Other days you won't. Both are okay.", author: "Unknown" },
  { text: "A girl should be two things: classy and fabulous.", author: "Coco Chanel" },
  { text: "Confidence is not 'they will like me.' Confidence is 'I'll be fine if they don't.'", author: "Unknown" },
  { text: "You didn't come this far to only come this far.", author: "Unknown" },
  { text: "Growth is choosing discomfort over staying small.", author: "Unknown" },
  { text: "Know your worth. Then add tax.", author: "Unknown" },
  { text: "She believed she could, so she did.", author: "R.S. Grey" },
  { text: "Your crown has been bought and paid for. Put it on your head and wear it.", author: "Maya Angelou" },
  { text: "Success is not final, failure is not fatal — it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou" },
  { text: "Stop waiting for Friday, for summer, for someone to fall in love with you. Happiness is achieved when you stop waiting for it.", author: "Unknown" },
  { text: "Be yourself — everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Difficult roads often lead to beautiful destinations.", author: "Zig Ziglar" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "You were given this life because you are strong enough to live it.", author: "Unknown" },
  { text: "Your vibe attracts your tribe.", author: "Unknown" },
  { text: "She is not perfect. You are not perfect. The question is whether or not you are perfect for each other.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Fall in love with taking care of yourself — mind, body, and spirit.", author: "Unknown" },
  { text: "She stood in the storm, and when the wind did not blow her way, she adjusted her sails.", author: "Elizabeth Edwards" },
  { text: "A strong woman looks a challenge dead in the eye and gives it a wink.", author: "Gina Carey" },
  { text: "The most common way people give up their power is by thinking they don't have any.", author: "Alice Walker" },
  { text: "You become what you believe.", author: "Oprah Winfrey" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "Your life is your story. Write well. Edit often.", author: "Susan Statham" },
  { text: "The woman who follows the crowd will usually go no further than the crowd. The woman who walks alone is likely to find herself in places no one has ever been.", author: "Albert Einstein" },
  { text: "I'd rather regret the things I've done than regret the things I haven't done.", author: "Lucille Ball" },
  { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis" },
  { text: "One day you will tell your story of how you overcame what you went through, and it will be someone else's survival guide.", author: "Brené Brown" },
  { text: "Glow differently. Not for them — for you.", author: "Unknown" },
  { text: "She was a girl who knew how to be happy even when she was sad, and that's important.", author: "Marilyn Monroe" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "You are a diamond, dear. They can't break you.", author: "Unknown" },
  { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
  { text: "Be fearless in the pursuit of what sets your soul on fire.", author: "Jennifer Lee" },
  { text: "She was powerful not because she wasn't scared, but because she went on so strongly despite the fear.", author: "Atticus" },
  { text: "Don't let anyone dim your light simply because it's shining in their eyes.", author: "Unknown" },
  { text: "Real queens fix each other's crowns.", author: "Unknown" },
  { text: "Good things come to those who hustle.", author: "Anaïs Nin" },
  { text: "Every day may not be good, but there is something good in every day.", author: "Alice Morse Earle" },
  { text: "The comeback is always stronger than the setback.", author: "Unknown" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You are worthy of the love you keep trying to give everyone else.", author: "Unknown" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getQuoteForDate(dateStr) {
  const [y, m, day] = dateStr.split('-').map(Number);
  const idx = (y * 365 + m * 31 + day) % QUOTES.length;
  return QUOTES[idx];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DailyQuotes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [tab, setTab] = useState('today');
  const [loading, setLoading] = useState(true);

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const todayQuote = getQuoteForDate(todayKey);
  const yesterdayQuote = getQuoteForDate(yesterdayKey);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const saved = await base44.entities.SavedQuote.filter({ user_email: u.email });
      setSavedQuotes(saved.sort((a, b) => b.saved_date.localeCompare(a.saved_date)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isSaved = (text, date) => savedQuotes.some(q => q.quote_text === text && q.saved_date === date);

  const toggleSave = async (quote, date) => {
    const existing = savedQuotes.find(q => q.quote_text === quote.text && q.saved_date === date);
    if (existing) {
      await base44.entities.SavedQuote.delete(existing.id);
      setSavedQuotes(prev => prev.filter(q => q.id !== existing.id));
      toast.success('Quote removed');
    } else {
      const created = await base44.entities.SavedQuote.create({
        user_email: user.email,
        quote_text: quote.text,
        quote_author: quote.author,
        saved_date: date,
      });
      setSavedQuotes(prev => [created, ...prev]);
      toast.success('Quote saved! 🔖');
    }
  };

  const yesterdaySaved = isSaved(yesterdayQuote.text, yesterdayKey);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <h1 className="text-3xl font-bold text-white">Daily Quotes 💬</h1>
        </div>
        <p className="text-sm text-gray-400 mb-5 pl-7">A fresh quote every day — save it or lose it.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['today', 'saved'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition capitalize"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {t === 'today' ? "✨ Today's Quote" : `🔖 Saved (${savedQuotes.length})`}
            </button>
          ))}
        </div>

        {tab === 'today' && (
          <div className="space-y-4">
            {/* Today's Quote */}
            <div className="rounded-3xl p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div className="absolute top-3 right-3">
                <button onClick={() => toggleSave(todayQuote, todayKey)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition"
                  style={{ background: isSaved(todayQuote.text, todayKey) ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)' }}>
                  {isSaved(todayQuote.text, todayKey)
                    ? <BookmarkCheck size={18} className="text-purple-300" />
                    : <Bookmark size={18} className="text-gray-300" />}
                </button>
              </div>
              <p className="text-xs font-bold tracking-wider text-pink-400 mb-4">TODAY · {formatDate(todayKey)}</p>
              <p className="text-3xl font-bold text-purple-300 mb-4 leading-none opacity-60">"</p>
              <p className="text-xl font-bold text-white leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {todayQuote.text}
              </p>
              <p className="text-sm text-pink-300 font-semibold">— {todayQuote.author}</p>
              <p className="text-xs text-gray-500 mt-3">Save this quote before midnight or it's gone! ✨</p>
            </div>

            {/* Yesterday's quote — only if saved */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-500 mb-3">YESTERDAY · {formatDate(yesterdayKey)}</p>
              {yesterdaySaved ? (
                <div>
                  <p className="text-base text-white leading-relaxed mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{yesterdayQuote.text}"
                  </p>
                  <p className="text-xs text-pink-300">— {yesterdayQuote.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <BookmarkCheck size={12} className="text-purple-400" />
                    <span className="text-xs text-purple-400">Saved</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 gap-2">
                  <span className="text-3xl">🔒</span>
                  <p className="text-sm text-gray-400 text-center">Yesterday's quote is gone.</p>
                  <p className="text-xs text-gray-600 text-center">Save today's quote before midnight so you never miss it!</p>
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <span className="text-xl">💡</span>
              <p className="text-xs text-gray-300 leading-relaxed">
                A new quote drops every day. Tap the <strong className="text-white">bookmark icon</strong> to save it to your collection — once the day ends, it's gone unless saved.
              </p>
            </div>
          </div>
        )}

        {tab === 'saved' && (
          <div>
            {savedQuotes.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <span className="text-5xl">🔖</span>
                <p className="font-bold text-white">No saved quotes yet</p>
                <p className="text-sm text-gray-400 text-center">Go to Today's Quote and tap the bookmark to save it!</p>
                <button onClick={() => setTab('today')}
                  className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  See Today's Quote ✨
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQuotes.map((q) => (
                  <div key={q.id} className="rounded-2xl p-4 relative"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <button onClick={() => toggleSave({ text: q.quote_text, author: q.quote_author }, q.saved_date)}
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