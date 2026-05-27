import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'reported', label: 'Reported Posts' },
  { id: 'shoutouts', label: 'Shout Outs' },
  { id: 'community', label: 'Community Posts' },
  { id: 'bannedwords', label: 'Banned Words' },
];

const WORD_CATEGORIES = ['profanity', 'hate_speech', 'harassment', 'spam', 'other'];
const CAT_COLORS = { profanity: '#ef4444', hate_speech: '#dc2626', harassment: '#f97316', spam: '#a855f7', other: '#6b7280' };

export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState('reported');
  const [reported, setReported] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newWordCategory, setNewWordCategory] = useState('profanity');
  const [wordFilter, setWordFilter] = useState('all');
  const [addingWord, setAddingWord] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [so, cp, bw] = await Promise.all([
        base44.entities.ShoutOut.list('-created_date', 50),
        base44.entities.CommunityPost.list('-created_date', 50),
        base44.entities.BannedWord.list('-created_date', 200),
      ]);

      // Fetch reported posts via backend function
      let rep = [];
      try {
        const res = await base44.functions.invoke('getReportedPosts', {});
        rep = res.data?.posts || [];
      } catch {}

      setShoutouts(so);
      setCommunityPosts(cp);
      setReported(rep);
      setBannedWords(bw);
      setLoading(false);
    };
    load();
  }, []);

  const deleteShoutout = async (id) => {
    await base44.entities.ShoutOut.delete(id);
    setShoutouts(prev => prev.filter(p => p.id !== id));
    toast.success('Shout-out removed');
  };

  const addBannedWord = async () => {
    if (!newWord.trim()) return;
    setAddingWord(true);
    const me = await base44.auth.me();
    const created = await base44.entities.BannedWord.create({
      word: newWord.trim().toLowerCase(),
      category: newWordCategory,
      added_by: me.email,
      is_active: true,
    });
    setBannedWords(prev => [created, ...prev]);
    setNewWord('');
    setAddingWord(false);
    toast.success('Word added to blocklist');
  };

  const deleteBannedWord = async (id) => {
    await base44.entities.BannedWord.delete(id);
    setBannedWords(prev => prev.filter(w => w.id !== id));
    toast.success('Word removed');
  };

  const deleteCommunityPost = async (id) => {
    await base44.entities.CommunityPost.delete(id);
    setCommunityPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post removed');
  };

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reported Posts */}
      {activeTab === 'reported' && (
        <div className="space-y-3">
          {reported.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No reported posts.</p>
            </div>
          )}
          {reported.map((post, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-400">REPORTED</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{post.content || post.message || 'No content'}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{post.user_email} · {timeAgo(post.created_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shout Outs */}
      {activeTab === 'shoutouts' && (
        <div className="space-y-2">
          {shoutouts.length === 0 && <p className="text-center py-10 text-gray-500 text-sm">No shout-outs yet.</p>}
          {shoutouts.map(post => (
            <div key={post.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-semibold text-white">{post.username || 'Anonymous'}</p>
                    <p className="text-[10px] text-gray-500">· {timeAgo(post.created_date)}</p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{post.content}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">❤️ {post.likes || 0} · {post.user_email}</p>
                </div>
                <button onClick={() => deleteShoutout(post.id)}
                  className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Posts */}
      {activeTab === 'community' && (
        <div className="space-y-2">
          {communityPosts.length === 0 && <p className="text-center py-10 text-gray-500 text-sm">No community posts yet.</p>}
          {communityPosts.map(post => (
            <div key={post.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-semibold text-white">{post.author_name || post.user_email?.split('@')[0] || 'User'}</p>
                    <p className="text-[10px] text-gray-500">· {timeAgo(post.created_date)}</p>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{post.content}</p>
                </div>
                <button onClick={() => deleteCommunityPost(post.id)}
                  className="p-1.5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banned Words */}
      {activeTab === 'bannedwords' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Words', value: bannedWords.length },
              { label: 'Profanity', value: bannedWords.filter(w => w.category === 'profanity').length },
              { label: 'Hate Speech', value: bannedWords.filter(w => w.category === 'hate_speech').length },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="font-bold text-white text-base">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Add word */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <p className="text-sm font-bold text-white">Add Banned Word / Phrase</p>
            <div className="flex gap-2">
              <input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBannedWord()}
                placeholder="Type word or phrase…"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
              />
              <select
                value={newWordCategory}
                onChange={e => setNewWordCategory(e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none"
              >
                {WORD_CATEGORIES.map(c => <option key={c} value={c} className="capitalize bg-gray-900">{c.replace('_', ' ')}</option>)}
              </select>
              <button
                onClick={addBannedWord}
                disabled={!newWord.trim() || addingWord}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', ...WORD_CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setWordFilter(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${wordFilter === cat ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                style={wordFilter === cat ? { background: CAT_COLORS[cat] || 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                {cat === 'all' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Word list */}
          {bannedWords.filter(w => wordFilter === 'all' || w.category === wordFilter).length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No banned words in this category.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bannedWords
                .filter(w => wordFilter === 'all' || w.category === wordFilter)
                .map(w => (
                  <div key={w.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono"
                    style={{ background: (CAT_COLORS[w.category] || '#6b7280') + '18', border: `1px solid ${(CAT_COLORS[w.category] || '#6b7280')}40`, color: CAT_COLORS[w.category] || '#9ca3af' }}>
                    <span>{w.word}</span>
                    <button onClick={() => deleteBannedWord(w.id)} className="ml-0.5 hover:opacity-70 transition">
                      <X size={11} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}