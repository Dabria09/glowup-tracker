import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { Plus, X, Check } from 'lucide-react';

const COLORS = [
  { id: 'pink',   bg: '#7c1f4e', dot: '#e91e8c' },
  { id: 'purple', bg: '#4a1070', dot: '#9c27b0' },
  { id: 'gold',   bg: '#5c4000', dot: '#ffc107' },
  { id: 'teal',   bg: '#004d40', dot: '#009688' },
  { id: 'red',    bg: '#5c1010', dot: '#f44336' },
  { id: 'orange', bg: '#5c2c00', dot: '#ff9800' },
  { id: 'gray',   bg: '#2a2a2a', dot: '#9e9e9e' },
];

const HeartBg = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ opacity: 0.12 }}>
    {Array.from({ length: 80 }).map((_, i) => (
      <span key={i} className="absolute text-gray-400 select-none"
        style={{ left: `${(i % 10) * 11}%`, top: `${Math.floor(i / 10) * 13}%`, fontSize: '22px' }}>♥</span>
    ))}
  </div>
);

export default function StickyNotes() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.StickyNote.filter({ user_email: u.email });
      setNotes(data.sort((a, b) => b.created_date?.localeCompare(a.created_date)));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const note = await base44.entities.StickyNote.create({
      user_email: user.email,
      content: newText.trim(),
      color: selectedColor.id,
    });
    setNotes(prev => [note, ...prev]);
    setNewText('');
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.StickyNote.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getColor = (id) => COLORS.find(c => c.id === id) || COLORS[0];

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0d0d' }}>
      <HeartBg />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1 ml-auto bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        <div className="px-4 mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>✨</span> Sticky Notes
          </h1>
          <p className="text-gray-500 text-sm">{notes.length} notes</p>
        </div>

        {/* New Note Button */}
        {!showForm && (
          <div className="px-4 mb-5">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-500/60 text-pink-400 font-semibold text-sm bg-pink-500/10 hover:bg-pink-500/20 transition"
            >
              <Plus size={16} /> New note
            </button>
          </div>
        )}

        {/* New Note Form */}
        {showForm && (
          <div className="mx-4 mb-5 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: selectedColor.bg }}>
            {/* Color Picker */}
            <div className="flex gap-2 mb-3">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.dot,
                    borderColor: selectedColor.id === c.id ? '#fff' : 'transparent',
                  }}
                />
              ))}
            </div>
            <textarea
              autoFocus
              value={newText}
              onChange={e => setNewText(e.target.value.slice(0, 1000))}
              placeholder="What's on your mind? ✨"
              rows={4}
              className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder-white/40 leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-white/40">{newText.length}/1000</span>
              <div className="flex gap-2">
                <button onClick={() => { setShowForm(false); setNewText(''); }} className="text-white/50 hover:text-white">
                  <X size={18} />
                </button>
                <button onClick={handleAdd} className="text-green-400 hover:text-green-300">
                  <Check size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <span className="text-6xl mb-4">📓</span>
            <h2 className="text-lg font-bold text-white mb-2">No notes yet</h2>
            <p className="text-gray-500 text-sm">Tap "New note" above to get started ✨</p>
          </div>
        ) : (
          <div className="px-4 grid grid-cols-2 gap-3">
            {notes.map(note => {
              const col = getColor(note.color);
              return (
                <div key={note.id} className="relative rounded-2xl p-4 border border-white/10 min-h-[110px]"
                  style={{ backgroundColor: col.bg }}>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">{note.content}</p>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="absolute top-2 right-2 text-white/30 hover:text-white/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="home" />
    </div>
  );
}