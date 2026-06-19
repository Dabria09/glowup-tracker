import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'autoflagged', label: '🚨 Auto-Flagged' },
  { id: 'reported', label: 'Reported' },
  { id: 'shoutouts', label: 'Shout Outs' },
  { id: 'community', label: 'Community' },
  { id: 'bannedwords', label: 'Banned Words' },
];

const WORD_CATEGORIES = ['profanity', 'hate_speech', 'bullying', 'personal_info', 'spam', 'other'];
const CAT_LABELS = { profanity: 'Profanity', hate_speech: 'Hate Speech', bullying: 'Bullying', personal_info: 'Personal Info', spam: 'Spam', other: 'Sexual / Other' };
const CAT_COLORS = { profanity: '#ef4444', hate_speech: '#dc2626', bullying: '#f97316', personal_info: '#3b82f6', spam: '#a855f7', other: '#ec4899' };

export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState('reported');
  const [reported, setReported] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newWordCategory, setNewWordCategory] = useState('profanity');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [wordFilter, setWordFilter] = useState('all');
  const [addingWord, setAddingWord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flaggedPosts, setFlaggedPosts] = useState([]);

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

      // Auto-flag: find posts containing any active banned word
      const activeWords = bw.filter(w => w.is_active !== false).map(w => w.word.toLowerCase());
      const checkContent = (text) => {
        if (!text) return null;
        const lower = text.toLowerCase();
        return activeWords.find(w => lower.includes(w)) || null;
      };
      const flagged = [];
      so.forEach(p => {
        const hit = checkContent(p.content);
        if (hit) flagged.push({ ...p, _source: 'shoutout', _hit: hit });
      });
      cp.forEach(p => {
        const hit = checkContent(p.content);
        if (hit) flagged.push({ ...p, _source: 'community', _hit: hit });
      });
      flagged.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setFlaggedPosts(flagged);
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
    setSaveSuccess(`"${created.word}" added to ${CAT_LABELS[created.category] || created.category}`);
    setTimeout(() => setSaveSuccess(''), 3000);
    setAddingWord(false);
    toast.success('Word added to blocklist');
  };

  const deleteBannedWord = async (id) => {
    await base44.entities.BannedWord.delete(id);
    setBannedWords(prev => prev.filter(w => w.id !== id));
    toast.success('Word removed');
  };

  const deleteFlagged = async (post) => {
    if (post._source === 'shoutout') {
      await base44.entities.ShoutOut.delete(post.id);
      setShoutouts(prev => prev.filter(p => p.id !== post.id));
    } else {
      await base44.entities.CommunityPost.delete(post.id);
      setCommunityPosts(prev => prev.filter(p => p.id !== post.id));
    }
    setFlaggedPosts(prev => prev.filter(p => p.id !== post.id || p._source !== post._source));
    toast.success('Post removed');
  };

  const dismissFlagged = (post) => {
    setFlaggedPosts(prev => prev.filter(p => !(p.id === post.id && p._source === post._source)));
    toast.success('Dismissed from review queue');
  };

  const deleteCommunityPost = async (id) => {
    await base44.entities.CommunityPost.delete(id);
    setCommunityPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post removed');
  };

  const banUser = async (email, username) => {
    if (!email || !confirm(`Ban user "${username}"? They will be logged out and unable to access the app.`)) return;
    const me = await base44.auth.me();
    try {
      await base44.entities.BannedUser.create({
        user_email: email,
        username: username || '',
        banned_by: me.email,
        banned_date: new Date().toISOString(),
        reason: 'Content moderation',
        is_active: true,
      });
      toast.success(`User ${username} banned`);
    } catch (e) {
      toast.error('Failed to ban: ' + e.message);
    }
  };

  const resolveReport = async (report, removeContent = false) => {
    if (!report.id) return;
    const me = await base44.auth.me();
    try {
      if (removeContent && report.reported_content_id) {
        if (report.content_type === 'shoutout') {
          await base44.entities.ShoutOut.delete(report.reported_content_id);
        } else if (report.content_type === 'community_post') {
          await base44.entities.CommunityPost.delete(report.reported_content_id);
        }
      }
      await base44.entities.ContentReport.update(report.id, {
        status: 'resolved',
        reviewed_by: me.email,
        reviewed_date: new Date().toISOString(),
        resolution_notes: removeContent ? 'Content removed' : 'Resolved by admin',
      });
      setReported(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved', reviewed_by: me.email } : r));
      toast.success(removeContent ? 'Content removed & report resolved' : 'Report resolved');
    } catch (e) {
      toast.error('Failed: ' + e.message);
    }
  };

  const dismissReport = async (report) => {
    if (!report.id) return;
    const me = await base44.auth.me();
    try {
      await base44.entities.ContentReport.update(report.id, {
        status: 'dismissed',
        reviewed_by: me.email,
        reviewed_date: new Date().toISOString(),
      });
      setReported(prev => prev.map(r => r.id === report.id ? { ...r, status: 'dismissed', reviewed_by: me.email } : r));
      toast.success('Report dismissed');
    } catch (e) {
      toast.error('Failed: ' + e.message);
    }
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
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
            {tab.id === 'autoflagged' && flaggedPosts.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#ef4444', color: '#fff' }}>{flaggedPosts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Auto-Flagged */}
      {activeTab === 'autoflagged' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl text-sm text-amber-300 flex items-start gap-2" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>These posts were automatically detected as containing banned words. Review and remove or dismiss.</span>
          </div>
          {flaggedPosts.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No flagged content found.</p>
            </div>
          )}
          {flaggedPosts.map((post, i) => (
            <div key={`${post._source}-${post.id}-${i}`} className="rounded-2xl p-4" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                      {post._source === 'shoutout' ? '📢 Shout Out' : '💬 Community'}
                    </span>
                    <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
                      ⚠️ contains "{post._hit}"
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{post.user_email || post.username} · {timeAgo(post.created_date)}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => deleteFlagged(post)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-red-400 hover:text-red-300 transition"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <Trash2 size={11} /> Remove
                  </button>
                  <button onClick={() => dismissFlagged(post)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <CheckCircle size={11} /> Dismiss
                  </button>
                  <button onClick={() => banUser(post.user_email || '', post.username || post.user_email?.split('@')[0] || 'User')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <AlertTriangle size={11} /> Ban
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reported Posts */}
      {activeTab === 'reported' && (
        <div className="space-y-3">
          {reported.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No reported posts.</p>
            </div>
          )}
          {reported.map((report, i) => (
            <div key={report.id || i} className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-400">REPORTED</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>{report.reason.replace('_', ' ')}</span>
                    <span className="text-[10px] text-gray-500">{report.content_type === 'shoutout' ? '📢 Shout Out' : '💬 Community'}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{report.content_text}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Reported by {report.reported_by?.split('@')[0]} · {timeAgo(report.created_date)}</p>
                  {report.description && <p className="text-[10px] text-gray-400 mt-1 italic">"{report.description}"</p>}
                  {report.status !== 'pending' && (
                    <p className="text-[10px] text-gray-500 mt-1">Status: <span className="capitalize">{report.status}</span>{report.reviewed_by ? ` · Reviewed by ${report.reviewed_by.split('@')[0]}` : ''}</p>
                  )}
                  {report.reported_content_id && (
                    <p className="text-[10px] text-gray-600 mt-0.5">Content ID: {report.reported_content_id}</p>
                  )}
                </div>
                {report.status === 'pending' && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => resolveReport(report, false)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle size={11} /> Resolve
                    </button>
                    <button onClick={() => dismissReport(report)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <X size={11} /> Dismiss
                    </button>
                    {report.reported_content_id && (
                      <>
                        <button onClick={() => resolveReport(report, true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-red-400 hover:text-red-300 transition"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                          <Trash2 size={11} /> Remove + Resolve
                        </button>
                        <button onClick={() => banUser(report.reported_by || '', report.reported_by?.split('@')[0] || 'User')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
                          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                          <AlertTriangle size={11} /> Ban User
                        </button>
                      </>
                    )}
                  </div>
                )}
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
            <div className="flex flex-col gap-2">
              <input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBannedWord()}
                placeholder="Type word or phrase…"
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={newWordCategory}
                  onChange={e => setNewWordCategory(e.target.value)}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none"
                >
                  {WORD_CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{CAT_LABELS[c]}</option>)}
                </select>
                <button
                  onClick={addBannedWord}
                  disabled={!newWord.trim() || addingWord}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-40 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Category filter */}
          {saveSuccess && (
            <div className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
              ✅ {saveSuccess}
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', ...WORD_CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setWordFilter(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${wordFilter === cat ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                style={wordFilter === cat ? { background: CAT_COLORS[cat] || 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                {cat === 'all' ? `All (${bannedWords.length})` : `${CAT_LABELS[cat]} (${bannedWords.filter(w => w.category === cat).length})`}
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