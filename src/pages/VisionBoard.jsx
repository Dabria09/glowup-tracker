import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Check, X, Upload, Palette, Layout, Maximize2, Minimize2, Share2, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const THEMES = [
  { id: 'dark_glam',  name: 'Dark Glam',   emoji: '💜', bg: 'linear-gradient(135deg, #1a0a2e, #2d0a3e, #1a0a2e)', border: 'rgba(168,85,247,0.5)',  accent: '#a855f7', cardBg: 'rgba(168,85,247,0.1)',  text: '#e9d5ff', caption: '#c4b5fd', shadow: '0 4px 20px rgba(168,85,247,0.3)' },
  { id: 'soft_glam',  name: 'Soft Glam',   emoji: '🌸', bg: 'linear-gradient(135deg, #2d0a18, #3d1a2a, #2d0a18)', border: 'rgba(244,114,182,0.5)',  accent: '#f472b6', cardBg: 'rgba(244,114,182,0.1)',  text: '#fce7f3', caption: '#fbcfe8', shadow: '0 4px 20px rgba(244,114,182,0.3)' },
  { id: 'golden_girl',name: 'Golden Girl', emoji: '✨', bg: 'linear-gradient(135deg, #1a1200, #2a1e00, #1a1200)',  border: 'rgba(234,179,8,0.5)',   accent: '#eab308', cardBg: 'rgba(234,179,8,0.08)',   text: '#fef9c3', caption: '#fde047', shadow: '0 4px 20px rgba(234,179,8,0.25)' },
  { id: 'cosmic',     name: 'Cosmic',      emoji: '🌙', bg: 'linear-gradient(135deg, #030712, #0f0a2e, #030712)',  border: 'rgba(99,102,241,0.5)',  accent: '#818cf8', cardBg: 'rgba(99,102,241,0.1)',   text: '#e0e7ff', caption: '#a5b4fc', shadow: '0 4px 20px rgba(99,102,241,0.3)' },
  { id: 'rose_gold',  name: 'Rose Gold',   emoji: '🥂', bg: 'linear-gradient(135deg, #1f0f0a, #2d1510, #1f0f0a)',  border: 'rgba(251,146,60,0.4)',  accent: '#f97316', cardBg: 'rgba(251,146,60,0.08)',  text: '#fff7ed', caption: '#fed7aa', shadow: '0 4px 20px rgba(251,146,60,0.2)' },
  { id: 'y2k',        name: 'Y2K Vibes',   emoji: '💖', bg: 'linear-gradient(135deg, #0d001a, #1a003d, #0d001a)',  border: 'rgba(236,72,153,0.6)',  accent: '#ec4899', cardBg: 'rgba(236,72,153,0.12)', text: '#fdf2f8', caption: '#f9a8d4', shadow: '0 4px 20px rgba(236,72,153,0.35)' },
];

const LAYOUTS = [
  { id: 'grid',     name: 'Grid',     emoji: '⬜', desc: 'Clean equal squares' },
  { id: 'polaroid', name: 'Polaroid', emoji: '📷', desc: 'White border frames' },
  { id: 'masonry',  name: 'Masonry',  emoji: '🧱', desc: 'Varied heights' },
  { id: 'magazine', name: 'Magazine', emoji: '📰', desc: 'Bold editorial' },
];

const SIZES = ['small', 'medium', 'large'];

function CaptionInline({ item, theme, onSave }) {
  const [editing, setEditing] = useState(false);
  const [cap, setCap] = useState(item.caption || '');
  if (editing) return (
    <div className="flex items-center gap-1">
      <input autoFocus value={cap} onChange={e => setCap(e.target.value)}
        className="flex-1 text-xs bg-transparent border-b outline-none" style={{ color: theme.caption, borderColor: theme.accent }} />
      <button onClick={() => { onSave(cap); setEditing(false); }}><Check size={12} style={{ color: theme.accent }} /></button>
      <button onClick={() => setEditing(false)}><X size={12} className="text-red-400" /></button>
    </div>
  );
  return (
    <p onClick={() => setEditing(true)} className="text-xs cursor-pointer truncate" style={{ color: theme.caption, fontFamily: "'Dancing Script', cursive" }}>
      {item.caption || '✏️ add caption...'}
    </p>
  );
}

function ItemControls({ item, theme, onDelete, onCycleSize }) {
  const sizeIdx = SIZES.indexOf(item.size || 'medium');
  const canGrow = sizeIdx < SIZES.length - 1;
  const canShrink = sizeIdx > 0;
  return (
    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
      {canShrink && (
        <button onClick={(e) => { e.stopPropagation(); onCycleSize(-1); }}
          className="w-6 h-6 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/80">
          <Minimize2 size={10} />
        </button>
      )}
      {canGrow && (
        <button onClick={(e) => { e.stopPropagation(); onCycleSize(1); }}
          className="w-6 h-6 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/80">
          <Maximize2 size={10} />
        </button>
      )}
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600">
        <X size={10} />
      </button>
    </div>
  );
}

export default function VisionBoard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [board, setBoard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [activeLayout, setActiveLayout] = useState(LAYOUTS[0]);
  const [showWordInput, setShowWordInput] = useState(false);
  const [wordText, setWordText] = useState('');
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();
  const boardRef = useRef();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const boards = await base44.entities.VisionBoard.filter({ user_email: u.email });
      let b = boards[0];
      if (!b) {
        b = await base44.entities.VisionBoard.create({ user_email: u.email, title: 'My Vision Board', theme: 'dark_glam', layout: 'grid' });
      }
      setBoard(b);
      setActiveTheme(THEMES.find(t => t.id === b.theme) || THEMES[0]);
      setActiveLayout(LAYOUTS.find(l => l.id === b.layout) || LAYOUTS[0]);
      const boardItems = await base44.entities.VisionBoardItem.filter({ board_id: b.id });
      setItems(boardItems.sort((a, b) => (a.position || 0) - (b.position || 0)));
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const item = await base44.entities.VisionBoardItem.create({
        board_id: board.id, user_email: user.email, image_url: file_url,
        caption: '', position: items.length, size: 'medium',
      });
      setItems(prev => [...prev, item]);
    }
    setUploading(false);
    toast.success('Photo added! ✨');
  };

  const deleteItem = async (item) => {
    await base44.entities.VisionBoardItem.delete(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const updateCaption = async (item, caption) => {
    await base44.entities.VisionBoardItem.update(item.id, { caption });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, caption } : i));
  };

  const changeSize = async (item, delta) => {
    const idx = SIZES.indexOf(item.size || 'medium');
    const next = SIZES[Math.max(0, Math.min(SIZES.length - 1, idx + delta))];
    if (next === item.size) return;
    await base44.entities.VisionBoardItem.update(item.id, { size: next });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, size: next } : i));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, position: i }));
    setItems(updated);
    // Persist positions
    for (const item of updated) {
      await base44.entities.VisionBoardItem.update(item.id, { position: item.position });
    }
  };

  const saveTheme = async (th) => {
    setActiveTheme(th);
    setShowThemes(false);
    await base44.entities.VisionBoard.update(board.id, { theme: th.id });
    setBoard(prev => ({ ...prev, theme: th.id }));
  };

  const saveLayout = async (ly) => {
    setActiveLayout(ly);
    setShowLayouts(false);
    await base44.entities.VisionBoard.update(board.id, { layout: ly.id });
    setBoard(prev => ({ ...prev, layout: ly.id }));
  };

  const handleShare = async () => {
    if (!boardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(boardRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'vision-board.png', { type: 'image/png' })] })) {
          await navigator.share({ files: [new File([blob], 'vision-board.png', { type: 'image/png' })], title: 'My Vision Board', text: 'My Girls Glowing Up Vision Board ✨' });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'vision-board.png';
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Vision board saved! ✨');
        }
      }, 'image/png');
    } catch {}
    setExporting(false);
  };

  const handlePrint = async () => {
    if (!boardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(boardRef.current, { useCORS: true, backgroundColor: '#000', scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>My Vision Board</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;}img{max-width:100%;max-height:100vh;object-fit:contain;}@media print{body{background:#fff;}}</style></head><body><img src="${dataUrl}" onload="window.print();window.close();"/></body></html>`);
      win.document.close();
    } catch {}
    setExporting(false);
  };

  const addWord = async () => {
    const w = wordText.trim();
    if (!w) return;
    const item = await base44.entities.VisionBoardItem.create({
      board_id: board.id, user_email: user.email,
      image_url: '', caption: w, position: items.length, size: 'medium',
    });
    setItems(prev => [...prev, item]);
    setWordText('');
    setShowWordInput(false);
    toast.success('Word added! ✨');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const renderItem = (item, provided) => {
    const isWord = !item.image_url && item.caption;
    const size = item.size || 'medium';
    const colSpan = size === 'large' ? 'col-span-2' : size === 'small' ? 'col-span-1' : 'col-span-1';
    const aspectRatio = size === 'large' ? '16/9' : '1/1';

    if (activeLayout.id === 'polaroid') {
      return (
        <div ref={provided?.innerRef} {...provided?.draggableProps} {...provided?.dragHandleProps}
          className="relative group flex flex-col items-center"
          style={{ background: 'white', padding: '8px 8px 32px 8px', borderRadius: '4px', boxShadow: activeTheme.shadow }}>
          {item.image_url ? (
            <img src={item.image_url} alt="" className="w-full object-cover rounded-sm" style={{ aspectRatio: '1/1' }} />
          ) : isWord ? (
            <div className="w-full flex items-center justify-center rounded-sm px-2" style={{ aspectRatio: '1/1', background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)' }}>
              <p className="text-center font-bold break-words" style={{ color: '#7c3aed', fontSize: 'clamp(12px,5vw,22px)', fontFamily: "'Dancing Script', cursive", lineHeight: 1.2 }}>{item.caption}</p>
            </div>
          ) : (
            <div className="w-full bg-gray-100 flex items-center justify-center rounded-sm" style={{ aspectRatio: '1/1' }}>
              <span className="text-gray-300 text-3xl">🖼️</span>
            </div>
          )}
          {!isWord && (
            <p className="absolute bottom-1 text-xs text-gray-500 text-center w-full cursor-pointer px-1 truncate"
              style={{ fontFamily: 'Dancing Script, cursive' }}>
              {item.caption || 'tap to edit'}
            </p>
          )}
          <ItemControls item={item} theme={activeTheme} onDelete={() => deleteItem(item)} onCycleSize={(d) => changeSize(item, d)} />
        </div>
      );
    }

    if (activeLayout.id === 'magazine') {
      const isHero = items.indexOf(item) === 0;
      return (
        <div ref={provided?.innerRef} {...provided?.draggableProps} {...provided?.dragHandleProps}
          className="relative group rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${activeTheme.border}`, boxShadow: activeTheme.shadow }}>
          {item.image_url ? (
            <img src={item.image_url} alt="" className="w-full object-cover"
              style={{ aspectRatio: isHero ? '16/9' : '3/1', maxHeight: isHero ? 220 : 110 }} />
          ) : isWord ? (
            <div className="w-full flex items-center justify-center px-4" style={{ minHeight: isHero ? 120 : 70, background: activeTheme.cardBg }}>
              <p className="text-center font-bold break-words" style={{ color: activeTheme.accent, fontSize: isHero ? 'clamp(20px,6vw,36px)' : 'clamp(16px,4vw,24px)', fontFamily: "'Dancing Script', cursive", textShadow: `0 0 20px ${activeTheme.accent}60` }}>{item.caption}</p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: isHero ? '16/9' : '3/1', background: activeTheme.cardBg, minHeight: isHero ? 120 : 60 }}>
              <span className="text-4xl opacity-20">🖼️</span>
            </div>
          )}
          {!isWord && (
            <div className="px-3 py-2" style={{ background: activeTheme.cardBg }}>
              <CaptionInline item={item} theme={activeTheme} onSave={(cap) => updateCaption(item, cap)} />
            </div>
          )}
          <ItemControls item={item} theme={activeTheme} onDelete={() => deleteItem(item)} onCycleSize={(d) => changeSize(item, d)} />
        </div>
      );
    }

    if (activeLayout.id === 'masonry') {
      return (
        <div ref={provided?.innerRef} {...provided?.draggableProps} {...provided?.dragHandleProps}
          className="relative group rounded-2xl overflow-hidden mb-3"
          style={{ border: `1px solid ${activeTheme.border}`, boxShadow: activeTheme.shadow }}>
          {item.image_url ? (
            <img src={item.image_url} alt="" className="w-full object-cover"
              style={{ maxHeight: size === 'large' ? 220 : size === 'small' ? 90 : 140, minHeight: 70 }} />
          ) : isWord ? (
            <div className="w-full flex items-center justify-center px-3" style={{ height: 100, background: activeTheme.cardBg }}>
              <p className="text-center font-bold break-words" style={{ color: activeTheme.accent, fontSize: 'clamp(14px,5vw,24px)', fontFamily: "'Dancing Script', cursive", textShadow: `0 0 16px ${activeTheme.accent}60` }}>{item.caption}</p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center" style={{ height: 100, background: activeTheme.cardBg }}>
              <span className="text-3xl opacity-20">🖼️</span>
            </div>
          )}
          {!isWord && (
            <div className="px-2 py-1.5" style={{ background: activeTheme.cardBg }}>
              <CaptionInline item={item} theme={activeTheme} onSave={(cap) => updateCaption(item, cap)} />
            </div>
          )}
          <ItemControls item={item} theme={activeTheme} onDelete={() => deleteItem(item)} onCycleSize={(d) => changeSize(item, d)} />
        </div>
      );
    }

    // Default grid
    return (
      <div ref={provided?.innerRef} {...provided?.draggableProps} {...provided?.dragHandleProps}
        className={`relative group rounded-2xl overflow-hidden ${colSpan}`}
        style={{ border: `1px solid ${activeTheme.border}`, boxShadow: activeTheme.shadow, background: activeTheme.cardBg }}>
        {item.image_url ? (
          <img src={item.image_url} alt="" className="w-full object-cover" style={{ aspectRatio }} />
        ) : isWord ? (
          <div className="w-full flex items-center justify-center px-3" style={{ aspectRatio, background: activeTheme.cardBg }}>
            <p className="text-center font-bold break-words" style={{ color: activeTheme.accent, fontSize: 'clamp(14px,5vw,26px)', fontFamily: "'Dancing Script', cursive", lineHeight: 1.2, textShadow: `0 0 20px ${activeTheme.accent}60` }}>{item.caption}</p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center" style={{ aspectRatio, background: activeTheme.cardBg }}>
            <span className="text-4xl opacity-30">🖼️</span>
          </div>
        )}
        {!isWord && (
          <div className="px-2 py-1.5" style={{ background: activeTheme.cardBg }}>
            <CaptionInline item={item} theme={activeTheme} onSave={(cap) => updateCaption(item, cap)} />
          </div>
        )}
        <ItemControls item={item} theme={activeTheme} onDelete={() => deleteItem(item)} onCycleSize={(d) => changeSize(item, d)} />
      </div>
    );
  };

  const renderCollage = () => {
    if (items.length === 0) return (
      <div className="flex flex-col items-center py-16">
        <span className="text-6xl mb-4">🖼️</span>
        <p className="font-bold text-lg mb-1" style={{ color: activeTheme.text }}>Your board is empty</p>
        <p className="text-sm mb-5" style={{ color: activeTheme.caption }}>Upload photos or add words to start building your vision</p>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
          style={{ background: `linear-gradient(135deg, ${activeTheme.accent}, #ec4899)` }}>
          <Upload size={16} /> Upload Photos
        </button>
      </div>
    );

    // Masonry: two droppable columns
    if (activeLayout.id === 'masonry') {
      const col1 = items.filter((_, i) => i % 2 === 0);
      const col2 = items.filter((_, i) => i % 2 === 1);
      return (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-2 gap-3 p-1">
            <Droppable droppableId="col1">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {col1.map((item, i) => (
                    <Draggable key={item.id} draggableId={item.id} index={i * 2}>
                      {(provided) => renderItem(item, provided)}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <Droppable droppableId="col2">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {col2.map((item, i) => (
                    <Draggable key={item.id} draggableId={item.id} index={i * 2 + 1}>
                      {(provided) => renderItem(item, provided)}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      );
    }

    // Grid: draggable with col-span support
    if (activeLayout.id === 'grid') {
      return (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="grid" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 gap-3 p-1">
                {items.map((item, i) => (
                  <Draggable key={item.id} draggableId={item.id} index={i}>
                    {(provided) => renderItem(item, provided)}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }

    // Polaroid & Magazine: vertical list droppable
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              className={activeLayout.id === 'polaroid' ? 'grid grid-cols-2 gap-4 p-2' : 'space-y-3 p-1'}>
              {items.map((item, i) => (
                <Draggable key={item.id} draggableId={item.id} index={i}>
                  {(provided) => renderItem(item, provided)}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div className="min-h-screen pb-24 relative text-white" style={{ background: activeTheme.bg }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}` }}>
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} style={{ color: activeTheme.caption }}><ChevronLeft size={22} /></button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: activeTheme.text }}>Vision Board</h1>
              <p className="text-xs" style={{ color: activeTheme.caption }}>{items.length} item{items.length !== 1 ? 's' : ''} · {activeTheme.name} · {activeLayout.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} disabled={exporting || items.length === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg disabled:opacity-40"
              style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, color: activeTheme.text }}>
              <Printer size={16} />
            </button>
            <button onClick={handleShare} disabled={exporting || items.length === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg disabled:opacity-40"
              style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, color: activeTheme.text }}>
              <Share2 size={16} />
            </button>
            <button onClick={() => setShowWordInput(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold text-sm"
              style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, color: activeTheme.text }}>
              Aa
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg font-bold disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${activeTheme.accent}, #ec4899)` }}>
              {uploading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </div>

        {/* Word Input Modal */}
        {showWordInput && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowWordInput(false)}>
            <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: activeTheme.bg, border: `1px solid ${activeTheme.border}`, paddingBottom: 'calc(1.5rem + var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))' }} onClick={e => e.stopPropagation()}>
              <p className="font-bold text-lg mb-1" style={{ color: activeTheme.text }}>Add a Word or Phrase</p>
              <p className="text-xs mb-4" style={{ color: activeTheme.caption }}>A word, mantra, or short phrase displayed as a styled tile</p>
              <input autoFocus value={wordText} onChange={e => setWordText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWord()}
                placeholder="e.g. BLESSED, abundance, glow up..."
                className="w-full px-4 py-3 rounded-2xl text-center text-lg font-bold outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${activeTheme.border}`, color: activeTheme.text }} />
              <div className="flex gap-2">
                <button onClick={() => setShowWordInput(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', color: activeTheme.caption }}>Cancel</button>
                <button onClick={addWord} disabled={!wordText.trim()}
                  className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${activeTheme.accent}, #ec4899)` }}>Add to Board</button>
              </div>
            </div>
          </div>
        )}

        {/* Customize Bar */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => { setShowThemes(!showThemes); setShowLayouts(false); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold transition"
            style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, color: activeTheme.text }}>
            <Palette size={15} /> {activeTheme.emoji} Theme
          </button>
          <button onClick={() => { setShowLayouts(!showLayouts); setShowThemes(false); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-semibold transition"
            style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, color: activeTheme.text }}>
            <Layout size={15} /> {activeLayout.emoji} Layout
          </button>
        </div>

        {/* Theme Picker */}
        {showThemes && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}` }}>
            <p className="text-xs font-bold tracking-wider mb-3" style={{ color: activeTheme.caption }}>CHOOSE YOUR VIBE</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => saveTheme(th)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl transition"
                  style={{ background: activeTheme.id === th.id ? th.accent + '30' : 'rgba(255,255,255,0.04)', border: `2px solid ${activeTheme.id === th.id ? th.accent : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="text-2xl">{th.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: activeTheme.text }}>{th.name}</span>
                  <div className="w-full h-1.5 rounded-full" style={{ background: th.accent }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layout Picker */}
        {showLayouts && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}` }}>
            <p className="text-xs font-bold tracking-wider mb-3" style={{ color: activeTheme.caption }}>COLLAGE STYLE</p>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(ly => (
                <button key={ly.id} onClick={() => saveLayout(ly)}
                  className="flex items-center gap-3 p-3 rounded-xl transition text-left"
                  style={{ background: activeLayout.id === ly.id ? activeTheme.accent + '25' : 'rgba(255,255,255,0.04)', border: `2px solid ${activeLayout.id === ly.id ? activeTheme.accent : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="text-xl">{ly.emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: activeTheme.text }}>{ly.name}</p>
                    <p className="text-xs" style={{ color: activeTheme.caption }}>{ly.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collage */}
        <div ref={boardRef} className="rounded-3xl overflow-hidden p-3 mb-4" style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}`, minHeight: 200 }}>
          {renderCollage()}
        </div>

        {/* Tips */}
        {items.length > 0 && (
          <div className="rounded-2xl p-4 mb-4 text-sm" style={{ background: activeTheme.cardBg, border: `1px solid ${activeTheme.border}` }}>
            <p className="font-bold mb-2" style={{ color: activeTheme.text }}>💡 Vision Board Tips</p>
            <p style={{ color: activeTheme.caption }}>• Drag items to reorder them on the board</p>
            <p style={{ color: activeTheme.caption }}>• Hover/tap an item to resize or delete it</p>
            <p style={{ color: activeTheme.caption }}>• Tap "Aa" to add words, mantras, or affirmations</p>
            <p style={{ color: activeTheme.caption }}>• Look at your vision board daily to stay motivated 🌟</p>
          </div>
        )}

        {/* Affirmation */}
        <div className="rounded-2xl p-4 text-center mb-4" style={{ background: activeTheme.accent + '15', border: `1px solid ${activeTheme.accent}40` }}>
          <p className="text-sm font-semibold italic" style={{ color: activeTheme.text }}>
            "Everything you dream of is on its way to you. Keep going. 💜"
          </p>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}