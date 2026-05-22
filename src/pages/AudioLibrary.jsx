import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Play, Pause, Heart } from 'lucide-react';

const TRACKS = [
  { id: 1, emoji: '⭐', bg: '#ec4899', title: 'You Are Enough', desc: 'A gentle reminder that you are worthy exactly as you are', duration: '3 min', category: 'Calm Affirmations',
    script: 'Close your eyes and take a deep breath. You are enough. Not because of what you do, or what you look like, or what you have achieved. You are enough simply because you exist. Your presence in this world matters. You are worthy of love, of kindness, of good things. You are enough, exactly as you are, right now, in this moment.' },
  { id: 2, emoji: '🌸', bg: '#a855f7', title: 'Peace Over Pressure', desc: 'Release the weight of expectations and find your calm', duration: '3 min', category: 'Calm Affirmations',
    script: 'Breathe in slowly. Breathe out. You do not have to carry the weight of everyone\'s expectations. You are allowed to put down what is not yours to carry. Peace is your birthright. Let go of what is draining you. Choose yourself. Choose your peace. You are doing better than you think.' },
  { id: 3, emoji: '⚡', bg: '#8b5cf6', title: 'I Am Powerful', desc: 'Awaken the strength that lives inside you', duration: '2 min', category: 'Calm Affirmations',
    script: 'You are more powerful than you know. There is a strength inside you that has carried you through every hard moment. Every challenge you have faced has made you stronger. You are capable. You are resilient. You are powerful. Nothing can dim the light that shines from within you.' },
  { id: 4, emoji: '☁️', bg: '#6366f1', title: 'Releasing Anxiety', desc: 'A calming guide to let go of anxious thoughts', duration: '4 min', category: 'Anxiety Relief',
    script: 'Take a slow, deep breath in through your nose. Hold it gently. Now release it through your mouth. Your anxious thoughts are like clouds passing through the sky. You are the sky, vast and clear. The clouds will pass. You are safe. You are grounded. With each breath, anxiety loosens its grip. You are okay.' },
  { id: 5, emoji: '☀️', bg: '#f97316', title: 'Morning Queen Energy', desc: 'Start your day with confidence and intention', duration: '2 min', category: 'Pep Talks',
    script: 'Good morning, queen. Today is a new day full of new possibilities. Set your intention now. I choose to show up fully today. I choose confidence over doubt. I choose progress over perfection. I am ready for today. Today, I will be kind to myself and others. Today, I will glow.' },
  { id: 6, emoji: '🌙', bg: '#3b82f6', title: 'Drift Into Peace', desc: 'Gentle sleep affirmations to quiet your mind at night', duration: '5 min', category: 'Sleep',
    script: 'It is time to rest now. Let your body sink into softness. Release the events of today. You did enough. You are enough. Let your thoughts slow down like a river becoming still. With every breath, you are becoming more relaxed. You are safe. You are loved. Allow yourself to drift peacefully into sleep.' },
  { id: 7, emoji: '✨', bg: '#06b6d4', title: 'You Did Good Today', desc: 'End your day with self-compassion and gratitude', duration: '4 min', category: 'Sleep',
    script: 'Before you close your eyes, I want you to know something. You did good today. Maybe not perfectly, but you showed up. That matters. Think of one thing you did well today. Hold that with you. You are growing every single day. Be proud of yourself. Rest now, knowing tomorrow is a fresh start.' },
  { id: 8, emoji: '🌃', bg: '#4f46e5', title: 'Let It All Go', desc: 'Release the stress of the day before sleep', duration: '5 min', category: 'Sleep',
    script: 'Take a deep breath. As you exhale, imagine releasing everything from your day — the worries, the mistakes, the tension. Let it all go. Your body deserves rest. Your mind deserves quiet. Nothing needs to be solved tonight. Everything can wait until tomorrow. Let go, and let yourself rest.' },
  { id: 9, emoji: '💫', bg: '#7c3aed', title: 'Dream Big Tonight', desc: 'Affirmations to inspire your dreams and your future', duration: '4 min', category: 'Sleep',
    script: 'As you drift off to sleep tonight, let yourself dream boldly. Your dreams are not too big. Your goals are not too ambitious. While you sleep, your mind will process and plan. You are moving toward your destiny. Dream big. Dream freely. Your future is brighter than you can imagine.' },
  { id: 10, emoji: '👑', bg: '#b45309', title: 'Unshakeable Confidence', desc: 'A meditation to build deep, lasting self-confidence', duration: '6 min', category: 'Confidence',
    script: 'Confidence is not something you are born with. It is something you build. Every time you try something new. Every time you speak up. Every time you choose yourself. Repeat after me. I believe in myself. I trust my instincts. I am capable of handling whatever comes my way. My confidence grows every single day.' },
  { id: 11, emoji: '❤️', bg: '#dc2626', title: 'Body Confidence', desc: 'Learn to love and appreciate your beautiful body', duration: '5 min', category: 'Confidence',
    script: 'Your body is not an ornament. It is the vehicle for your incredible life. It carried you through every experience. It heals itself. It breathes for you. It does so much for you every single day. Your body is worthy of love and care exactly as it is. Treat it with kindness. You are beautiful.' },
  { id: 12, emoji: '🎤', bg: '#0891b2', title: 'Speak Up With Power', desc: 'Find your voice and use it with confidence', duration: '4 min', category: 'Confidence',
    script: 'Your voice matters. Your opinion matters. You have every right to take up space in this world. The next time you want to speak up, take a breath first. Then speak. Your words have value. You have something important to say. Practice using your voice today, even in small ways. You are heard.' },
  { id: 13, emoji: '👥', bg: '#059669', title: 'Social Confidence', desc: 'Feel comfortable and confident in social situations', duration: '5 min', category: 'Confidence',
    script: 'Social situations can feel scary, but you have everything you need. People genuinely want to connect. They want to feel seen, just like you do. When you walk into a room, remember: you belong here. You are interesting. You are worth knowing. Breathe, smile, and be yourself. That is always enough.' },
  { id: 14, emoji: '🤗', bg: '#9333ea', title: 'Big Sis Talk: Your Value', desc: 'A heart-to-heart about knowing your worth in relationships', duration: '7 min', category: 'Big Sis Talks',
    script: 'Sis, I need you to hear this. Your value does not decrease based on someone\'s inability to see your worth. In any relationship, you deserve to be chosen fully. Not halfway. Not when it\'s convenient. You deserve consistency, respect, and genuine love. Never dim your light to make someone else comfortable. Know your worth. And then add tax.' },
  { id: 15, emoji: '🛡️', bg: '#dc2626', title: 'Big Sis Talk: Handling Haters', desc: 'Real talk on dealing with jealousy, gossip, and mean girls', duration: '6 min', category: 'Big Sis Talks',
    script: 'When people try to dim your light, it is usually because your light is too bright for them to handle. People who are fulfilled and happy do not have time to tear others down. Haters are just people who have given up on their own dreams and cannot stand to see you chase yours. Keep going. Their opinion is not your reality.' },
  { id: 16, emoji: '📱', bg: '#0f766e', title: 'Big Sis Talk: Social Media & Your Mind', desc: 'How to protect your mental health in the age of social media', duration: '7 min', category: 'Big Sis Talks',
    script: 'Social media shows you highlights, not reality. Nobody posts their bad days, their doubts, their struggles. When you compare your behind-the-scenes to someone else\'s highlight reel, you will always feel like you are losing. You are not. Put the phone down. Look at your real life. It is beautiful. You are enough, offline too.' },
  { id: 17, emoji: '🚀', bg: '#7c3aed', title: 'Big Sis Talk: Your Future Is Bright', desc: 'Encouragement for when you cannot see the path ahead', duration: '6 min', category: 'Big Sis Talks',
    script: 'Not knowing what the future holds is terrifying. But it is also exciting. Every successful person you admire had a moment where they could not see the path ahead. They moved forward anyway. Your story is still being written. The best chapters have not been written yet. Your future is so much brighter than you can imagine right now.' },
  { id: 18, emoji: '⚓', bg: '#1d4ed8', title: 'Five Senses Grounding', desc: 'A powerful technique to stop anxiety in its tracks', duration: '5 min', category: 'Anxiety Relief',
    script: 'When anxiety hits, come back to your senses. Name five things you can see right now. Four things you can touch. Three things you can hear. Two things you can smell. One thing you can taste. You are here. You are safe. You are present. This moment is manageable. Breathe. You are okay.' },
  { id: 19, emoji: '💨', bg: '#0369a1', title: 'Breathing Through a Panic Attack', desc: 'Emergency breathing techniques for moments of high anxiety', duration: '4 min', category: 'Anxiety Relief',
    script: 'If you are panicking right now, I need you to breathe with me. In through your nose for four counts. One, two, three, four. Hold for four. One, two, three, four. Out through your mouth for four. One, two, three, four. You are not in danger. This will pass. Your body is trying to protect you. Keep breathing with me.' },
  { id: 20, emoji: '🦋', bg: '#6d28d9', title: 'Worry Less, Live More', desc: 'Techniques to break the cycle of overthinking and worry', duration: '6 min', category: 'Anxiety Relief',
    script: 'Overthinking is a habit, and habits can be changed. When a worry thought comes, ask yourself: is this something I can control right now? If yes, take one small action. If no, practice letting it go. You cannot think your way out of every problem. Sometimes you just have to breathe through it and trust the process.' },
  { id: 21, emoji: '✏️', bg: '#b45309', title: 'Test Anxiety Relief', desc: 'Calm your nerves before exams and big moments', duration: '4 min', category: 'Anxiety Relief',
    script: 'Before you begin, take three deep breaths. You have prepared for this. Your brain has absorbed more than you realize. Anxiety is just excitement in disguise. Channel it. Read each question slowly. Answer what you know first. You are capable. You are prepared. Trust yourself. You have got this.' },
  { id: 22, emoji: '🔥', bg: '#dc2626', title: 'Get Up and Go', desc: 'The push you need when you want to give up', duration: '5 min', category: 'Pep Talks',
    script: 'You woke up today. That means your story is not over. Whatever knocked you down does not get to keep you down. You are too important, too needed, too destined for greatness to stay on the floor. Get up. Not because it is easy. But because you are strong enough. And because your future self is counting on you.' },
  { id: 23, emoji: '🏆', bg: '#9333ea', title: 'You Were Made For This', desc: 'A reminder that you are exactly where you need to be', duration: '5 min', category: 'Pep Talks',
    script: 'You were not placed in this time, in this body, in this life by accident. Every experience you have had has been shaping you for what is coming. The hard seasons were preparing you. The losses were redirecting you. You were made for exactly this moment. Trust the process. Trust yourself. You were made for this.' },
  { id: 24, emoji: '🦅', bg: '#c2410c', title: 'Bounce Back Queen', desc: 'How to rise after failure, rejection, or a hard season', duration: '6 min', category: 'Pep Talks',
    script: 'Every queen has a comeback story. Failure is not the opposite of success — it is part of it. Every no is getting you closer to your yes. Every setback is setting you up for a greater comeback. You are not defined by what happened to you. You are defined by how you choose to rise. And girl, you are rising.' },
  { id: 25, emoji: '🌟', bg: '#854d0e', title: 'Chase Your Dreams Fearlessly', desc: 'Fuel for the girl with big dreams and a brave heart', duration: '6 min', category: 'Pep Talks',
    script: 'Your dreams are not too big. They are not unrealistic. They are yours for a reason. The fact that you can dream it means you have the capacity to achieve it. Fear is just excitement that has not been given direction yet. Redirect it. Use it as fuel. Chase your dreams with everything you have. The world needs what you have to offer.' },
  { id: 26, emoji: '✨', bg: '#7e22ce', title: 'Glow Up Season', desc: 'You are in your era of transformation and growth', duration: '4 min', category: 'Pep Talks',
    script: 'You are glowing up. Maybe you cannot see it yet, but it is happening. Every good habit you are building. Every boundary you are setting. Every time you choose yourself. That is your glow up. It is not about how you look — it is about who you are becoming. And who you are becoming is extraordinary. This is your season.' },
];

const CATEGORIES = ['All', 'Calm Affirmations', 'Sleep', 'Confidence', 'Big Sis Talks', 'Anxiety Relief', 'Pep Talks'];

export default function AudioLibrary() {
  const navigate = useNavigate();
  const [browseTab, setBrowseTab] = useState('browse');
  const [category, setCategory] = useState('All');
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ggu_saved_audio') || '[]'); } catch { return []; }
  });
  const [playing, setPlaying] = useState(null);
  const speechRef = useRef(null);

  const filtered = TRACKS.filter(t => {
    if (browseTab === 'saved') return saved.includes(t.id);
    if (category !== 'All') return t.category === category;
    return true;
  });

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('ggu_saved_audio', JSON.stringify(next));
      return next;
    });
  };

  const togglePlay = (track) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (playing === track.id) {
      setPlaying(null);
      return;
    }
    setPlaying(track.id);
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(track.script);
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.onend = () => setPlaying(null);
      window.speechSynthesis.speak(utter);
      speechRef.current = utter;
    }
  };

  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='rgba(180,50,120,0.1)'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
      <AppBackground />

      <div className="relative z-10 px-4 pt-4">
        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            <span className="text-lg">🎧</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Audio Library</h1>
            <p className="text-xs text-gray-400">Affirmations, meditations &amp; more</p>
          </div>
        </div>

        {/* Browse / Saved */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setBrowseTab('browse')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${browseTab === 'browse' ? 'text-white' : 'text-gray-400'}`}
            style={browseTab === 'browse' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Browse
          </button>
          <button onClick={() => setBrowseTab('saved')}
            className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition ${browseTab === 'saved' ? 'text-white' : 'text-gray-400'}`}
            style={browseTab === 'saved' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Heart size={14} /> Saved
          </button>
        </div>

        {/* Category filters */}
        {browseTab === 'browse' && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${category === cat ? 'text-white' : 'text-gray-400'}`}
                style={category === cat ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {cat === 'All' ? '🎵 All' : cat === 'Calm Affirmations' ? '✨ Calm Affirmations' : cat === 'Sleep' ? '🌙 Sleep' : cat === 'Confidence' ? '⭐ Confidence' : cat === 'Big Sis Talks' ? '🤗 Big Sis Talks' : cat === 'Anxiety Relief' ? '☁️ Anxiety Relief' : '🔥 Pep Talks'}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">{filtered.length} tracks</p>

        {/* Track list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">🎧</p>
              <p className="text-white font-semibold">No saved tracks yet</p>
              <p className="text-gray-500 text-sm mt-1">Tap the ♡ on any track to save it.</p>
            </div>
          )}
          {filtered.map(track => {
            const isPlaying = playing === track.id;
            const isSaved = saved.includes(track.id);
            return (
              <div key={track.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: isPlaying ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: track.bg }}>
                  {track.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isPlaying ? 'text-pink-300' : 'text-white'}`}>{track.title}</p>
                  <p className="text-xs text-gray-400 truncate">{track.desc}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{track.duration}</p>
                </div>
                <button onClick={() => toggleSave(track.id)} className="flex-shrink-0 mr-1">
                  <Heart size={16} fill={isSaved ? '#ec4899' : 'none'} className={isSaved ? 'text-pink-400' : 'text-gray-600'} />
                </button>
                <button onClick={() => togglePlay(track)}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isPlaying ? 'linear-gradient(135deg, #ec4899, #a855f7)' : 'linear-gradient(135deg, rgba(236,72,153,0.6), rgba(168,85,247,0.6))' }}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}