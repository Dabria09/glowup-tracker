import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Vote } from 'lucide-react';

const TOPICS = [
  { id: 1, question: 'Should voting be mandatory for all citizens?', emoji: '📋', votesFor: 0, votesAgainst: 0 },
  { id: 2, question: 'Should the voting age be lowered to 16?', emoji: '🗳️', votesFor: 0, votesAgainst: 0 },
  { id: 3, question: 'Should term limits be enforced for all elected officials?', emoji: '⏰', votesFor: 0, votesAgainst: 0 },
  { id: 4, question: 'Should voting happen on weekends instead of weekdays?', emoji: '📅', votesFor: 0, votesAgainst: 0 },
  { id: 5, question: 'Should all elections be done by mail-in ballot?', emoji: '📮', votesFor: 0, votesAgainst: 0 },
];

export default function MockVote() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState(TOPICS);
  const [voted, setVoted] = useState({});

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        // Load any previously saved votes from user data
      }
    }).catch(() => {});
  }, []);

  function handleVote(topicId, choice) {
    setVoted(prev => ({ ...prev, [topicId]: choice }));
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        if (choice === 'for') {
          return { ...t, votesFor: t.votesFor + 1 };
        } else {
          return { ...t, votesAgainst: t.votesAgainst + 1 };
        }
      }
      return t;
    }));
  }

  const totalTopics = topics.length;
  const votedTopics = Object.keys(voted).length;

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1.5">
              <Vote size={18} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest text-purple-400">MOCK VOTE</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Practice Voting 🗳️</h1>
          <p className="text-sm text-gray-400">See where you stand on real civic issues</p>
        </div>

        {/* Progress */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Your Progress</span>
            <span className="text-sm font-bold text-purple-400">{votedTopics}/{totalTopics}</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${(votedTopics/totalTopics)*100}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
          </div>
        </div>

        {/* Topics */}
        <div className="px-4 space-y-4 pb-6">
          {topics.map((topic, i) => {
            const userChoice = voted[topic.id];
            const totalVotes = topic.votesFor + topic.votesAgainst;
            const forPercentage = totalVotes > 0 ? Math.round((topic.votesFor / totalVotes) * 100) : 50;
            const againstPercentage = totalVotes > 0 ? Math.round((topic.votesAgainst / totalVotes) * 100) : 50;

            return (
              <div key={topic.id} className="rounded-2xl p-4" style={{ background: 'rgba(25,15,45,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl mt-1">{topic.emoji}</span>
                  <div className="flex-1">
                    <div className="text-xs text-purple-400 font-bold mb-1">Question {i + 1}</div>
                    <p className="font-bold text-white text-sm leading-snug">{topic.question}</p>
                  </div>
                </div>

                {/* Vote Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => handleVote(topic.id, 'for')}
                    className={`py-3 rounded-xl text-sm font-bold transition ${
                      userChoice === 'for'
                        ? 'bg-green-500/30 border-2 border-green-500 text-green-300'
                        : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => handleVote(topic.id, 'against')}
                    className={`py-3 rounded-xl text-sm font-bold transition ${
                      userChoice === 'against'
                        ? 'bg-red-500/30 border-2 border-red-500 text-red-300'
                        : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    👎 No
                  </button>
                </div>

                {/* Results */}
                {totalVotes > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Group Results</span>
                      <span className="text-xs text-gray-500">{totalVotes} votes</span>
                    </div>
                    <div className="flex gap-2 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="flex-1 bg-green-500" style={{ width: `${forPercentage}%` }} />
                      <div className="flex-1 bg-red-500" style={{ width: `${againstPercentage}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400">{forPercentage}% Yes</span>
                      <span className="text-red-400">{againstPercentage}% No</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="px-4 pb-6">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(20,10,40,0.9)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="text-xs text-purple-300 mb-2">✨ Did You Know?</p>
            <p className="text-xs text-gray-300 leading-relaxed">This mock vote is a practice exercise to help you think through real civic issues. Your votes here don't count toward anything official — they're just to help you explore your values and compare your views with others.</p>
          </div>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}