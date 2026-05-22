import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const WRITING_STYLES = [
  { id: 'soft_girl', label: 'Soft Girl', emoji: '✨' },
  { id: 'journal', label: 'Journal', emoji: '📓' },
  { id: 'romantic', label: 'Romantic', emoji: '💌' },
  { id: 'ceo', label: 'CEO', emoji: '👑' },
  { id: 'clean_girl', label: 'Clean Girl', emoji: '🌸' },
  { id: 'cute_notes', label: 'Cute Notes', emoji: '🎀' },
  { id: 'dark_feminine', label: 'Dark Feminine', emoji: '🖤' },
  { id: 'dreamy', label: 'Dreamy', emoji: '☁️' },
  { id: 'modern', label: 'Modern', emoji: '🗒️' },
];

const MOODS = [
  { id: 'Amazing', label: 'Amazing', emoji: '🌟' },
  { id: 'Happy', label: 'Happy', emoji: '🙂' },
  { id: 'Grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'Excited', label: 'Excited', emoji: '⚡' },
  { id: 'Okay', label: 'Okay', emoji: '😐' },
  { id: 'Sad', label: 'Sad', emoji: '😢' },
  { id: 'Stressed', label: 'Stressed', emoji: '😤' },
  { id: 'Angry', label: 'Angry', emoji: '😠' },
];

const TEMPLATES = [
  { label: 'Gratitude', text: 'Today I am grateful for...\n\n1. \n2. \n3. \n\nOne thing that made me smile today:\n' },
  { label: 'Daily Check-in', text: 'How I\'m feeling today:\n\nWhat happened today:\n\nWhat I learned:\n\nTomorrow I want to:\n' },
  { label: 'Goal Setting', text: 'My goal for today:\n\nSteps I\'ll take:\n1. \n2. \n3. \n\nHow I\'ll celebrate when I achieve it:\n' },
  { label: 'Self-Love', text: 'Something I love about myself:\n\nA challenge I overcame:\n\nHow I took care of myself today:\n' },
];

const STICKERS = ['💖', '✨', '🌸', '🦋', '🌙', '⭐', '💫', '🌺', '🎀', '💜', '🌟', '🦄', '💅', '🍓', '🌈'];

const HeartBg = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10 z-0">
    {Array.from({ length: 80 }).map((_, i) => (
      <span key={i} className="absolute text-pink-300 select-none"
        style={{ left: `${(i % 10) * 11 + 2}%`, top: `${Math.floor(i / 10) * 13 + 2}%`, fontSize: `${16 + (i % 3) * 6}px` }}>♥</span>
    ))}
  </div>
);

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export default function DiaryEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [writingStyle, setWritingStyle] = useState('soft_girl');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [existingEntry, setExistingEntry] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (!isNew) {
        const entry = await base44.entities.DiaryEntry.get(id);
        setExistingEntry(entry);
        setTitle(entry.title || '');
        setContent(entry.content || '');
        setMood(entry.mood || null);
        setWritingStyle(entry.writing_style || 'soft_girl');
        setTags(entry.tags || '');
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, [id, isNew]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const data = {
      user_email: user.email,
      title,
      content,
      mood,
      writing_style: writingStyle,
      tags,
      entry_date: isNew ? todayISO() : existingEntry?.entry_date,
    };
    try {
      if (isNew) {
        await base44.entities.DiaryEntry.create(data);
      } else {
        await base44.entities.DiaryEntry.update(id, data);
      }
      toast.success('Entry saved 💖');
      navigate('/diary');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry?')) return;
    await base44.entities.DiaryEntry.delete(id);
    toast.success('Entry deleted');
    navigate('/diary');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-10 relative" style={{ backgroundColor: '#1a0a2e' }}>
      <HeartBg />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/diary')} className="text-gray-400">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">{isNew ? 'New Entry' : 'Edit Entry'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={handleDelete} className="text-red-400 text-xs px-3 py-1.5 rounded-full border border-red-900/50">
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-1.5 rounded-full bg-pink-500 text-white font-bold text-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Writing Style */}
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 mb-2">WRITING STYLE</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {WRITING_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setWritingStyle(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                  writingStyle === s.id
                    ? 'bg-pink-500/30 border-pink-500 text-white'
                    : 'bg-white/5 border-white/15 text-gray-300'
                }`}
              >
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="px-4 mb-3 flex items-center gap-2">
          <p className="text-sm text-gray-400">{isNew ? todayStr() : (existingEntry ? new Date(existingEntry.entry_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : todayStr())}</p>
          <span className="text-pink-400">♥</span>
        </div>

        {/* Title */}
        <div className="px-4 mb-4">
          <input
            type="text"
            placeholder="Give your entry a title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
          />
        </div>

        {/* Mood */}
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 mb-3">HOW ARE YOU FEELING?</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMood(mood === m.id ? null : m.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition ${
                  mood === m.id
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[11px] text-gray-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template / Stickers */}
        <div className="px-4 flex items-center justify-between mb-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
          >
            <span>⊞</span> Template <span className="text-gray-500">▾</span>
          </button>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2"
          >
            <span>◎</span> Stickers
          </button>
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="mx-4 mb-3 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            {TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => { setContent(t.text); setShowTemplates(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 border-b border-white/5 last:border-0"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Stickers */}
        {showStickers && (
          <div className="mx-4 mb-3 bg-gray-900 border border-white/10 rounded-2xl p-3">
            <div className="flex flex-wrap gap-2">
              {STICKERS.map(s => (
                <button
                  key={s}
                  onClick={() => { setContent(c => c + s); setShowStickers(false); }}
                  className="text-2xl p-1 hover:scale-125 transition-transform"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 mb-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write freely. This is your safe space... 💜"
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-sm outline-none resize-none placeholder-gray-600 leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div className="px-4 mb-6">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 mb-2">🏷 TAGS (COMMA-SEPARATED)</p>
          <input
            type="text"
            placeholder="e.g. school, goals, family"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
          />
        </div>

        <p className="text-center text-xs text-gray-600 mb-6">🔒 Your diary is private — only you can see it.</p>
      </div>
    </div>
  );
}