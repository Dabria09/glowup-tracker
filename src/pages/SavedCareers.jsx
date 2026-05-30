import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Briefcase, BookmarkCheck, ExternalLink } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AppBackground from '@/components/AppBackground';
import { toast } from 'sonner';
import { CAREERS, CATEGORY_COLORS, EXP_COLORS } from '@/components/career/careerData';

export default function SavedCareers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const saved = JSON.parse(localStorage.getItem(`ggu_careers_saved_${u.email}`) || '[]');
      setSavedIds(saved);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const unsave = (career) => {
    const updated = savedIds.filter(id => id !== career.id);
    setSavedIds(updated);
    if (user) localStorage.setItem(`ggu_careers_saved_${user.email}`, JSON.stringify(updated));
    toast.success('Removed from saved');
  };

  const saved = CAREERS.filter(c => savedIds.includes(c.id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #1a0a2e, #0d0618)' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28 relative" style={{ background: 'linear-gradient(to bottom, #1a0a2e, #0d0618, #000)' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Briefcase size={20} className="text-purple-400" />
            <div>
              <h1 className="text-xl font-bold">My Career Bookmarks</h1>
              <p className="text-xs text-gray-400">{saved.length} career{saved.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-lg font-bold text-white mb-2">No Saved Careers Yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Browse Career Explorer and tap the bookmark icon to save careers here.
            </p>
            <button
              onClick={() => navigate('/careers')}
              className="px-6 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              Browse Careers 👑
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(career => {
              const color = CATEGORY_COLORS[career.category] || '#a855f7';
              const expColor = EXP_COLORS[career.exp] || '#a855f7';
              return (
                <div key={career.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                      {career.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color }}>{career.category}</p>
                      <p className="font-bold text-sm text-white">{career.title}</p>
                      <p className="text-xs font-semibold text-emerald-400 mb-1">{career.salary}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{career.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${expColor}20`, color: expColor, border: `1px solid ${expColor}30` }}>{career.exp}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => unsave(career)}>
                        <BookmarkCheck size={18} className="text-purple-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => navigate('/careers')}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="me" />
    </div>
  );
}