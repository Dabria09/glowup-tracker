import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function GlowBoardAdminTab() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const p = await base44.entities.GlowBoard.list('-created_date', 100);
      setPosts(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updatePost = async (id, status) => {
    await base44.entities.GlowBoard.update(id, { status });
    load();
  };

  const filtered = filter === 'All' ? posts : posts.filter(p => p.status?.toLowerCase() === filter.toLowerCase() || (!p.status && filter === 'Pending'));
  const total = posts.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white flex items-center gap-2">📸 Glow Board Submissions</p>
        <span className="text-xs text-gray-400">{total} total</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No {filter.toLowerCase()} submissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(post => (
              <div key={post.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-28 object-cover" />}
                <div className="p-3">
                  <p className="text-xs font-semibold text-white truncate">{post.title || 'Untitled'}</p>
                  <p className="text-[10px] text-gray-400">{post.category || 'Glow Style'}</p>
                  <p className="text-[10px] text-gray-500">{post.created_by?.split('@')[0] || 'User'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      (post.status || 'pending') === 'approved' ? 'bg-green-500/20 text-green-400' :
                      (post.status || 'pending') === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{post.status || 'pending'}</span>
                    {(!post.status || post.status === 'pending') && (
                      <div className="flex gap-1">
                        <button onClick={() => updatePost(post.id, 'approved')} className="text-green-400 hover:text-green-300"><CheckCircle size={14} /></button>
                        <button onClick={() => updatePost(post.id, 'rejected')} className="text-red-400 hover:text-red-300"><XCircle size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}