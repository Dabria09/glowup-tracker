import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import LibraryQuiz from '@/components/LibraryQuiz';
import BookClub from '@/components/BookClub';
import QUIZZES from '@/lib/libraryQuizzes';
import { CAT_META, RESOURCES_ALL as RESOURCES } from '@/lib/libraryResources';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const SECTION_TABS = [
  { id: 'resources', label: 'Resources', emoji: '📚' },
  { id: 'book_club', label: 'Book Club', emoji: '📖' },
  { id: 'your_voice', label: 'Your Voice', emoji: '🗳️' },
];

export default function GirlsLibrary() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('resources');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const ALL_CATS = Object.keys(CAT_META);
  const filtered = (() => {
    let list = activeCategory === 'all' ? RESOURCES : RESOURCES.filter(r => r.cat === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        CAT_META[r.cat]?.label.toLowerCase().includes(q)
      );
    }
    return list;
  })();

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest text-purple-400">GIRLS LIBRARY</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-0.5">Girls Library 📚</h1>
          <p className="text-sm text-gray-400 mb-3">Knowledge, guides, and curated books to help you thrive.</p>
          <div className="rounded-2xl px-4 py-3 mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.4), rgba(139,10,120,0.3))', border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="text-xs font-bold text-yellow-300 mb-0.5">✨ Recommended For You</p>
            <p className="text-xs text-gray-300">Resources handpicked based on your interests and growth stage</p>
          </div>
          {/* Search — only for resources */}
          {activeSection === 'resources' && (
            <div className="relative mt-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-2xl px-4 py-3 pl-10 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
              )}
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {SECTION_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap"
              style={activeSection === tab.id
                ? { background: 'rgba(139,92,246,0.35)', border: '1px solid rgba(168,85,247,0.5)', color: '#fff' }
                : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Category filter chips — only for resources tab */}
        {activeSection === 'resources' && (
          <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-3 scrollbar-none">
            <button onClick={() => setActiveCategory('all')}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
              style={activeCategory === 'all'
                ? { background: 'rgba(139,92,246,0.4)', border: '1px solid rgba(168,85,247,0.6)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              All
            </button>
            {ALL_CATS.map(id => {
              const m = CAT_META[id];
              return (
                <button key={id} onClick={() => setActiveCategory(id)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap"
                  style={activeCategory === id
                    ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                  <span>{m.emoji}</span>{m.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Book Club Section */}
        {activeSection === 'book_club' && user && <BookClub user={user} />}
        {activeSection === 'book_club' && !user && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Your Voice Section */}
        {activeSection === 'your_voice' && (
          <div className="px-4 pb-6 pt-2">
            <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(139,10,120,0.4))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <span className="text-3xl">🗳️</span>
              <div>
                <p className="font-bold text-white text-base">Your Voice</p>
                <p className="text-xs text-gray-300">Civic education for future leaders — voting, government, laws &amp; rights, and more.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/your-voice')}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              Open Your Voice 🗳️
            </button>
          </div>
        )}

        {/* Resource List */}
        {activeSection === 'resources' && (() => {
          if (activeCategory === 'all' && !search.trim()) {
            return (
              <div className="px-4 pb-6 space-y-7">
                {ALL_CATS.filter(catId => RESOURCES.some(r => r.cat === catId)).map(catId => {
                  const meta = CAT_META[catId];
                  const catResources = RESOURCES.filter(r => r.cat === catId);
                  return (
                    <div key={catId}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="text-lg">{meta.emoji}</span>
                        <h3 className="text-sm font-bold tracking-wide" style={{ color: meta.labelColor }}>{meta.label}</h3>
                        <span className="text-xs text-gray-600 ml-auto">{catResources.length} articles</span>
                      </div>
                      <div className="space-y-2">
                        {catResources.map(r => (
                          <button key={r.id} onClick={() => setSelectedResource(r)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition active:opacity-80"
                            style={{ background: meta.cardBg, border: '1px solid rgba(255,255,255,0.07)' }}>
                            <span className="text-xl flex-shrink-0">{r.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-white leading-snug">{r.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.desc}</p>
                            </div>
                            <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          return (
            <div className="space-y-2 px-4 pb-6">
              {search.trim() && <p className="text-xs text-gray-500 mb-3">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;</p>}
              {filtered.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">No resources found</div>}
              {filtered.map(r => {
                const meta = CAT_META[r.cat];
                return (
                  <button key={r.id} onClick={() => setSelectedResource(r)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
                    style={{ background: meta.cardBg, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: meta.labelColor }}>{meta.label}</p>
                      <p className="font-bold text-sm text-white leading-snug">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Resource Detail */}
      {activeSection === 'resources' && selectedResource && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0d0010' }}>
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 sticky top-0 z-10" style={{ backgroundColor: '#0d0010' }}>
            <button onClick={() => setSelectedResource(null)} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition">
              <ChevronLeft size={18} /> Back to Girls Library
            </button>
          </div>

          <div className="px-4 pb-32">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: CAT_META[selectedResource.cat].cardBg, border: '1px solid rgba(255,255,255,0.1)' }}>
                {selectedResource.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1" style={{ color: CAT_META[selectedResource.cat].labelColor }}>
                  {CAT_META[selectedResource.cat].label.toUpperCase()}
                </p>
                <h1 className="text-2xl font-bold italic text-white leading-tight">{selectedResource.title}</h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-5">{selectedResource.desc}</p>

            {selectedResource.tips && selectedResource.tips.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 text-lg">💡</span>
                  <p className="font-bold text-white text-base">Key Tips</p>
                </div>
                <div className="space-y-2">
                  {selectedResource.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(60,15,90,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: '2px solid #ec4899' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedResource.quick_facts && selectedResource.quick_facts.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-400 text-lg">📊</span>
                  <p className="font-bold text-white text-base">Quick Facts</p>
                </div>
                <div className="space-y-2">
                  {selectedResource.quick_facts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(15,40,80,0.6)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
                      <p className="text-sm text-gray-200 leading-relaxed">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedResource.actions && selectedResource.actions.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="font-bold text-white text-base">Action Steps</p>
                </div>
                <div className="space-y-2">
                  {selectedResource.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(15,60,35,0.5)', border: '1px solid rgba(74,222,128,0.15)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: 'rgba(34,197,94,0.5)', minWidth: 24 }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <LibraryQuiz key={selectedResource.id} quiz={QUIZZES[selectedResource.id]} />
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}