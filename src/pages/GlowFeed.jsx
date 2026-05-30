import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Heart, MessageCircle, Share2, Plus, X } from 'lucide-react';
import useAgeGroup from '@/lib/useAgeGroup';

const COMMUNITY_QUESTIONS = [
  {
    id: 1,
    question: 'What\'s one thing you do to protect your peace? 🕊️',
    answers: 12,
    emoji: '🕊️',
    category: 'wellness',
    isPinned: true,
  },
  {
    id: 2,
    question: 'How do you stay motivated when things get tough? 💪',
    answers: 8,
    emoji: '💪',
    category: 'motivation',
    isPinned: false,
  },
  {
    id: 3,
    question: 'What\'s your go-to self-care activity? 💆',
    answers: 15,
    emoji: '💆',
    category: 'wellness',
    isPinned: false,
  },
];

export default function GlowFeed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterMode = searchParams.get('filter'); // my_posts | my_reactions | my_comments
  const { worldInfo, ageGroup } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedFilter, setSelectedFilter] = useState('Everyone');
  const [search, setSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [reactedPostIds, setReactedPostIds] = useState(new Set());
  const [myReactionPosts, setMyReactionPosts] = useState([]);
  const [myCommentPosts, setMyCommentPosts] = useState([]);
  const [communityQuestions, setCommunityQuestions] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const allPosts = await base44.entities.GlowUpPost.list('-created_date', 100);
      const feedPosts = allPosts.filter(p =>
        (p.visibility === 'public' || p.visibility === 'followers') &&
        p.post_type !== 'Community Question'
      );
      setTimelinePosts(feedPosts);
      setCommunityQuestions(allPosts.filter(p => p.post_type === 'Community Question'));
      const reactions = await base44.entities.PostReaction.filter({ user_email: u.email });
      const reactionIds = new Set(reactions.map(r => r.post_id));
      setReactedPostIds(reactionIds);
      if (filterMode === 'my_posts') {
        setMyPosts(allPosts.filter(p => p.user_email === u.email));
      }
      if (filterMode === 'my_reactions') {
        setMyReactionPosts(allPosts.filter(p => reactionIds.has(p.id)));
      }
      if (filterMode === 'my_comments') {
        const comments = await base44.entities.PostComment.filter({ user_email: u.email });
        const commentPostIds = new Set(comments.map(c => c.post_id));
        setMyCommentPosts(allPosts.filter(p => commentPostIds.has(p.id)));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filterMode]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const toggleReaction = async (post) => {
    if (!user) return;
    const isReacted = reactedPostIds.has(post.id);
    if (isReacted) {
      const existing = await base44.entities.PostReaction.filter({ user_email: user.email, post_id: post.id });
      if (existing.length) await base44.entities.PostReaction.delete(existing[0].id);
      setReactedPostIds(prev => { const n = new Set(prev); n.delete(post.id); return n; });
      setMyReactionPosts(prev => prev.filter(p => p.id !== post.id));
    } else {
      await base44.entities.PostReaction.create({ user_email: user.email, post_id: post.id, reaction_type: 'heart' });
      setReactedPostIds(prev => new Set([...prev, post.id]));
      if (filterMode === 'my_reactions') setMyReactionPosts(prev => [post, ...prev]);
    }
  };

  const renderPostCard = (post) => (
    <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(`/glowlink/${post.user_email?.split('@')[0]}`)} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>{(post.user_email?.[0] || '?').toUpperCase()}</div>
          <span className="text-xs text-gray-400">{post.user_email?.split('@')[0]}</span>
        </button>
        <span className="text-xs text-gray-500">{new Date(post.created_date).toLocaleDateString()}</span>
      </div>
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2" style={{ background: 'rgba(236,72,153,0.2)', color: '#f9a8d4' }}>{post.post_type || 'Thought'}</span>
      <p className="text-sm text-white mb-3">{post.content}</p>
      {(() => { try { const urls = JSON.parse(post.media_urls || '[]'); return urls.length > 0 ? <div className="grid grid-cols-2 gap-2 mb-3">{urls.map((url, i) => url.match(/\.(mp4|webm|mov)/i) ? <video key={i} src={url} controls className="rounded-xl w-full" /> : <img key={i} src={url} alt="" className="rounded-xl object-cover" style={{ aspectRatio: '1/1' }} />)}</div> : null; } catch { return null; } })()}
      <div className="flex items-center gap-4">
        <button onClick={() => toggleReaction(post)} className="flex items-center gap-1.5 text-sm transition" style={{ color: reactedPostIds.has(post.id) ? '#f43f5e' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Heart size={16} fill={reactedPostIds.has(post.id) ? '#f43f5e' : 'none'} />
          <span className="text-xs">{post.likes || 0}</span>
        </button>
        <div className="flex items-center gap-1.5" style={{ color: '#6b7280' }}>
          <MessageCircle size={16} />
          <span className="text-xs">{post.comments || 0}</span>
        </div>
      </div>
    </div>
  );

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    const question = await base44.entities.GlowUpPost.create({
      user_email: user.email,
      content: newQuestion.trim(),
      post_type: 'Community Question',
      visibility: 'public',
      likes: 0,
      comments: 0,
    });
    setCommunityQuestions(prev => [question, ...prev]);
    setNewQuestion('');
    setShowAskModal(false);
  };

  const handleAnswerQuestion = async () => {
    if (!answerText.trim() || !selectedQuestion) return;
    // TODO: Save answer to backend
    setAnswerText('');
    setSelectedQuestion(null);
  };

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => filterMode ? navigate('/me') : navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {filterMode === 'my_posts' ? 'My Posts' : filterMode === 'my_reactions' ? 'My Reactions' : filterMode === 'my_comments' ? 'My Comments' : 'Glow Up Feed 🔥'}
              </h1>
              {worldInfo ? (
                <p className="text-xs font-semibold" style={{ color: worldInfo.color }}>{worldInfo.emoji} {worldInfo.label}</p>
              ) : (
                <p className="text-xs text-gray-400">Real wins. Real girls. Real growth</p>
              )}
            </div>
          </div>

          {/* Filter Buttons — hide in filter mode */}
          {!filterMode && <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Everyone', 'Following'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${selectedFilter === filter ? 'text-white bg-pink-500' : 'text-gray-400 bg-white/10'}`}
              >
                {filter === 'Following' ? '⭐ Following' : '👥 Everyone'}
              </button>
            ))}
          </div>}

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-gray-500">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts, names, hashtags..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">

          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 px-2 font-semibold text-sm transition border-b-2 ${activeTab === 'timeline' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('askCommunity')}
              className={`pb-3 px-2 font-semibold text-sm transition border-b-2 ${activeTab === 'askCommunity' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent'}`}
            >
              Ask Community
            </button>
          </div>

          {/* Filtered Mode — My Posts / Reactions / Comments */}
          {filterMode && (
            <div className="space-y-4">
              {filterMode === 'my_posts' && (
                myPosts.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="text-5xl mb-4">✨</span>
                    <p className="font-bold text-lg text-white mb-2">You haven't posted yet</p>
                    <p className="text-gray-400 text-sm mb-6">Share your first win!</p>
                    <button onClick={() => navigate('/me')} className="px-6 py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>Create a Post</button>
                  </div>
                ) : (
                  myPosts.map(post => (
                    <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.2)', color: '#f9a8d4' }}>{post.post_type || 'Thought'}</span>
                        <span className="text-xs text-gray-500">{new Date(post.created_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white">{post.content}</p>
                    </div>
                  ))
                )
              )}
              {filterMode === 'my_reactions' && (
                myReactionPosts.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="text-5xl mb-4">💜</span>
                    <p className="font-bold text-lg text-white mb-2">No Reactions Yet</p>
                    <p className="text-gray-400 text-sm max-w-xs mb-4">Tap the ❤️ on any post in the feed to react. It'll show up here.</p>
                    <button onClick={() => navigate('/glow-feed')} className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>Browse Feed</button>
                  </div>
                ) : (
                  <div className="space-y-4">{myReactionPosts.map(post => renderPostCard(post))}</div>
                )
              )}
              {filterMode === 'my_comments' && (
                myCommentPosts.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="text-5xl mb-4">💬</span>
                    <p className="font-bold text-lg text-white mb-2">No Comments Yet</p>
                    <p className="text-gray-400 text-sm max-w-xs mb-4">Posts you comment on in the feed will appear here.</p>
                    <button onClick={() => navigate('/glow-feed')} className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>Browse Feed</button>
                  </div>
                ) : (
                  <div className="space-y-4">{myCommentPosts.map(post => renderPostCard(post))}</div>
                )
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {!filterMode && activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Post Button */}
              <button onClick={() => navigate('/me')} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
                <Plus size={18} className="text-pink-400" />
                <span className="text-sm font-semibold text-pink-400">Create a post</span>
              </button>

              {/* Today's Prompt */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">TODAY'S PROMPT</p>
                    <p className="text-sm text-white font-semibold mt-1">What's one thing you do to protect your peace? 🕊️</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition">
                  Answer This
                </button>
              </div>

              {timelinePosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="text-5xl mb-4">✨</span>
                  <p className="font-bold text-lg text-white mb-2">No posts yet</p>
                  <p className="text-gray-400 text-sm text-center max-w-xs">Be the first to share your glow! Post from the Me tab.</p>
                </div>
              ) : (
                timelinePosts.map(post => renderPostCard(post))
              )}
            </div>
          )}

          {/* Ask Community Tab */}
          {!filterMode && activeTab === 'askCommunity' && (
            <div className="space-y-4">
              {/* Ask Button */}
              <button
                onClick={() => setShowAskModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}
              >
                <Plus size={18} className="text-pink-400" />
                <span className="text-sm font-semibold text-pink-400">Ask the Community</span>
              </button>

              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Wellness', 'Motivation', 'Growth'].map(cat => (
                  <button key={cat} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-gray-400 hover:bg-white/20 transition">
                    {cat}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {communityQuestions
                  .filter(q => !search || q.content?.toLowerCase().includes(search.toLowerCase()))
                  .map(q => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="rounded-2xl p-4 cursor-pointer transition hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💬</span>
                      <div className="flex-1">
                        <p className="text-sm text-white font-semibold">{q.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">by @{q.user_email?.split('@')[0]}</span>
                          <span className="text-xs text-gray-500">{new Date(q.created_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button className="text-gray-500 hover:text-pink-400 transition">→</button>
                        {(q.user_email === user?.email || user?.role === 'admin') && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!window.confirm('Delete this question?')) return;
                              await base44.entities.GlowUpPost.delete(q.id);
                              setCommunityQuestions(prev => prev.filter(x => x.id !== q.id));
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {communityQuestions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="text-gray-400 text-sm">No questions yet. Be the first to ask!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowAskModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Ask the Community</h3>
              <button onClick={() => setShowAskModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Your Question</label>
                <textarea
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Ask something you're curious about... 💭"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-28"
                />
                <p className="text-xs text-gray-400 mt-2">{newQuestion.length}/500</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Wellness', 'Motivation', 'Growth', 'Other'].map(cat => (
                    <button key={cat} className="px-3 py-2 rounded-full text-xs font-semibold bg-white/5 text-gray-400 hover:bg-white/10 transition border border-white/10">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAskQuestion}
                disabled={!newQuestion.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelectedQuestion(null)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Answers</h3>
              <button onClick={() => setSelectedQuestion(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{selectedQuestion.emoji || '💬'}</span>
                  <div>
                    <p className="text-sm text-white font-semibold">{selectedQuestion.content || selectedQuestion.question}</p>
                    <p className="text-xs text-gray-400 mt-2">by @{selectedQuestion.user_email?.split('@')[0] || 'Community'}  {selectedQuestion.answers ? `· ${selectedQuestion.answers} answers` : ''}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Your Answer</label>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="Share your thoughts... 💭"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-24"
                />
              </div>

              <button
                onClick={handleAnswerQuestion}
                disabled={!answerText.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Post Answer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}