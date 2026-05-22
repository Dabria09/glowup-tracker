import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Send, Heart } from 'lucide-react';
import { toast } from 'sonner';

const REACTIONS = ['❤️', '🔥', '💡', '😭', '⭐'];
const TABS = ['Discussion', 'Chapters', 'Quotes', 'Learned'];

export default function BookDetail({ book, user, onBack }) {
  const [discussions, setDiscussions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('Discussion');
  const [input, setInput] = useState('');
  const [quoteRef, setQuoteRef] = useState('');
  const [activeChapter, setActiveChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.BookClubDiscussion.filter({ book_id: book.id }),
      base44.entities.BookClubProgress.filter({ user_email: user.email, book_id: book.id }),
    ]).then(([discs, progs]) => {
      setDiscussions(discs);
      setProgress(progs[0] || null);
      setLoading(false);
    });
  }, [book.id, user.email]);

  const currentChapter = progress?.current_chapter || 0;

  const updateProgress = async (ch) => {
    if (progress) {
      const updated = await base44.entities.BookClubProgress.update(progress.id, { current_chapter: ch });
      setProgress(updated);
    } else {
      const created = await base44.entities.BookClubProgress.create({ user_email: user.email, book_id: book.id, current_chapter: ch });
      setProgress(created);
    }
    toast.success(`Progress updated to chapter ${ch}! 📖`);
  };

  const postDiscussion = async (type) => {
    if (!input.trim()) return;
    const username = user.full_name?.split(' ')[0] || user.email.split('@')[0];
    const disc = await base44.entities.BookClubDiscussion.create({
      user_email: user.email, username, book_id: book.id,
      content: input.trim(), type,
      chapter: type === 'chapter' ? activeChapter : 0,
      quote_reference: type === 'quote' ? quoteRef.trim() : '',
      likes: 0,
    });
    setDiscussions(prev => [disc, ...prev]);
    setInput(''); setQuoteRef('');
    toast.success('Posted! 💬');
  };

  const likePost = async (disc) => {
    await base44.entities.BookClubDiscussion.update(disc.id, { likes: (disc.likes || 0) + 1 });
    setDiscussions(prev => prev.map(d => d.id === disc.id ? { ...d, likes: (d.likes || 0) + 1 } : d));
  };

  const filteredDiscs = discussions.filter(d => {
    if (activeTab === 'Discussion') return d.type === 'discussion' || !d.type;
    if (activeTab === 'Chapters') return d.type === 'chapter' && d.chapter === activeChapter;
    if (activeTab === 'Quotes') return d.type === 'quote';
    if (activeTab === 'Learned') return d.type === 'learned';
    return true;
  });

  const pct = book.chapters ? Math.round((currentChapter / book.chapters) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0d0010' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2" style={{ backgroundColor: '#0d0010' }}>
        <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition">
          <ChevronLeft size={16} /> Back to Book Club
        </button>
      </div>

      <div className="px-4 pb-32">
        {/* Book Header Card */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(109,40,217,0.3)', border: '1px solid rgba(168,85,247,0.3)' }}>
          {book.featured && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400 text-xs font-bold">⭐ Featured Pick</span>
            </div>
          )}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-16 h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              📖
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{book.title}</h2>
              <p className="text-purple-300 text-sm mb-2">by {book.author}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.3)', color: '#c084fc' }}>{book.genre}</span>
                {book.featured && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047' }}>👑 Glow Woman</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span>💬 {discussions.filter(d => d.type === 'discussion' || !d.type).length}</span>
            <span>❤️ {discussions.reduce((s, d) => s + (d.likes || 0), 0)}</span>
            <span>👤 {discussions.filter(d => d.current_chapter >= book.chapters).length} finished</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{book.desc}</p>
          <div className="flex gap-2">
            {REACTIONS.map(r => (
              <button key={r} className="text-xl hover:scale-125 transition-transform">{r}</button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(50,15,80,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-white flex items-center gap-2">🏆 My Progress</p>
            <span className="text-xs text-gray-400">Ch. {currentChapter} / {book.chapters || 24}</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
          </div>
          <p className="text-xs text-gray-500 mb-2">{pct}% — tap a chapter to update progress</p>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: book.chapters || 24 }, (_, i) => i + 1).map(ch => (
              <button key={ch} onClick={() => updateProgress(ch)}
                className="w-7 h-7 rounded-full text-xs font-bold transition"
                style={ch <= currentChapter
                  ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}>
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition"
              style={activeTab === tab
                ? { background: 'rgba(168,85,247,0.5)', border: '1px solid rgba(168,85,247,0.7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {tab === 'Discussion' ? '💬' : tab === 'Chapters' ? '📄' : tab === 'Quotes' ? '💬' : '💡'} {tab}
            </button>
          ))}
        </div>

        {/* Chapter selector for Chapters tab */}
        {activeTab === 'Chapters' && (
          <div className="mb-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {Array.from({ length: book.chapters || 24 }, (_, i) => i + 1).map(ch => (
                <button key={ch} onClick={() => setActiveChapter(ch)}
                  className="flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition"
                  style={activeChapter === ch
                    ? { background: 'rgba(168,85,247,0.6)', border: '1px solid #a855f7', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}>
                  {ch}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Chapter {activeChapter} Discussion — read it first, then come back to discuss.</p>
          </div>
        )}

        {/* Quotes input */}
        {activeTab === 'Quotes' && (
          <div className="mb-4 rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-bold text-white mb-3">📌 Save a Quote</p>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type your favorite quote from this book..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none resize-none mb-2" rows={3} />
            <input value={quoteRef} onChange={e => setQuoteRef(e.target.value)}
              placeholder="Page / Chapter (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none mb-2" />
            <button onClick={() => postDiscussion('quote')} disabled={!input.trim()}
              className="w-full py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Save</button>
          </div>
        )}

        {/* Learned input */}
        {activeTab === 'Learned' && (
          <div className="mb-4 rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-bold text-white mb-2">💡 What did you learn?</p>
            <p className="text-xs text-gray-500 mb-3">Share a lesson, insight, or takeaway from this book...</p>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Share a lesson, insight, or takeaway..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none resize-none mb-2" rows={3} />
            <button onClick={() => postDiscussion('learned')} disabled={!input.trim()}
              className="w-full py-2 rounded-xl text-sm font-bold text-yellow-400 disabled:opacity-50"
              style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.3)' }}>
              Share My Learning ✨
            </button>
          </div>
        )}

        {/* Discussion / Chapter input */}
        {(activeTab === 'Discussion' || activeTab === 'Chapters') && (
          <div className="flex items-center gap-2 mb-4">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && postDiscussion(activeTab === 'Chapters' ? 'chapter' : 'discussion')}
              placeholder={activeTab === 'Chapters' ? `Thoughts on Chapter ${activeChapter}...` : 'Share your thoughts on this book... 📖'}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none" />
            <button onClick={() => postDiscussion(activeTab === 'Chapters' ? 'chapter' : 'discussion')}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              <Send size={16} />
            </button>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredDiscs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">{activeTab === 'Quotes' ? '📌' : activeTab === 'Learned' ? '💡' : '💬'}</p>
            <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDiscs.map(d => (
              <div key={d.id} className="rounded-2xl p-4" style={{ background: 'rgba(50,15,80,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {d.type === 'quote' && <p className="text-purple-400 text-xs font-bold mb-1">📌 Quote{d.quote_reference ? ` — ${d.quote_reference}` : ''}</p>}
                {d.type === 'learned' && <p className="text-yellow-400 text-xs font-bold mb-1">💡 Lesson</p>}
                {d.type === 'chapter' && <p className="text-blue-400 text-xs font-bold mb-1">📄 Chapter {d.chapter}</p>}
                <p className="text-sm text-gray-200 leading-relaxed mb-2">{d.type === 'quote' ? `"${d.content}"` : d.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">@{d.username || 'anonymous'}</span>
                  <button onClick={() => likePost(d)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-400 transition">
                    <Heart size={12} /> {d.likes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}