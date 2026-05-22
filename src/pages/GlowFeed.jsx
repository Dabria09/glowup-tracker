import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Heart, MessageCircle, Share2, Plus, X } from 'lucide-react';

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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedFilter, setSelectedFilter] = useState('Everyone');
  const [search, setSearch] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    // TODO: Save to backend
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
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Glow Up Feed 🔥</h1>
              <p className="text-xs text-gray-400">Real wins. Real girls. Real growth</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Everyone', 'Following'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${selectedFilter === filter ? 'text-white bg-pink-500' : 'text-gray-400 bg-white/10'}`}
              >
                {filter === 'Following' ? '⭐ Following' : '👥 Everyone'}
              </button>
            ))}
          </div>

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

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Post Button */}
              <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
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

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12">
                <span className="text-5xl mb-4">✨</span>
                <p className="font-bold text-lg text-white mb-2">Your following feed is empty</p>
                <p className="text-gray-400 text-sm text-center max-w-xs">Follow other glow girls to see their wins here in real time.</p>
              </div>
            </div>
          )}

          {/* Ask Community Tab */}
          {activeTab === 'askCommunity' && (
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
                {COMMUNITY_QUESTIONS.map(q => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="rounded-2xl p-4 cursor-pointer transition hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{q.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white font-semibold">{q.question}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">💬 {q.answers} answers</span>
                          {q.isPinned && <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-400">📌 Pinned</span>}
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-pink-400 transition">→</button>
                    </div>
                  </div>
                ))}
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
                  <span className="text-3xl">{selectedQuestion.emoji}</span>
                  <div>
                    <p className="text-sm text-white font-semibold">{selectedQuestion.question}</p>
                    <p className="text-xs text-gray-400 mt-2">💬 {selectedQuestion.answers} community answers</p>
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