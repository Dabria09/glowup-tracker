import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'reported', label: 'Reported Posts' },
  { id: 'shoutouts', label: 'Shout Outs' },
  { id: 'community', label: 'Community Posts' },
];

export default function ContentModeration() {
  const [activeTab, setActiveTab] = useState('reported');
  const [reported, setReported] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [so, cp] = await Promise.all([
        base44.entities.ShoutOut.list('-created_date', 50),
        base44.entities.CommunityPost.list('-created_date', 50),
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
      setLoading(false);
    };
    load();
  }, []);

  const deleteShoutout = async (id) => {
    await base44.entities.ShoutOut.delete(id);
    setShoutouts(prev => prev.filter(p => p.id !== id));
    toast.success('Shout-out removed');
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
    </div>
  );
}