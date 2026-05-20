import { useRef } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CustomizeModal({
  bgColor, setBgColor,
  bgPattern, setBgPattern,
  bgImage, setBgImage,
  quickAccess, setQuickAccess,
  allApps, onClose,
  BG_COLORS, BG_PATTERNS,
}) {
  const fileRef = useRef();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBgImage(file_url);
  };

  const toggleQuickAccess = (id) => {
    setQuickAccess(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-gray-900 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Customize Home</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Background Color */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-300 mb-2">Background Color</p>
          <div className="flex gap-3 flex-wrap">
            {BG_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setBgColor(c); setBgImage(null); }}
                className="w-10 h-10 rounded-full border-2 transition"
                style={{ backgroundColor: c, borderColor: bgColor === c && !bgImage ? '#ec4899' : '#374151' }}
              />
            ))}
          </div>
        </div>

        {/* Background Pattern */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-300 mb-2">Pattern</p>
          <div className="flex gap-2 flex-wrap">
            {BG_PATTERNS.map(p => (
              <button
                key={p.id}
                onClick={() => setBgPattern(p.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${bgPattern === p.id ? 'border-pink-500 text-pink-400 bg-pink-500/10' : 'border-gray-700 text-gray-400'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Image */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-300 mb-2">Background Image</p>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => fileRef.current.click()}
              className="flex items-center gap-2 border border-gray-600 rounded-full px-4 py-2 text-sm text-gray-300 hover:border-pink-500 transition"
            >
              <Upload size={14} /> Upload Image
            </button>
            {bgImage && (
              <button onClick={() => setBgImage(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Quick Access Apps */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-300 mb-2">Quick Access Apps</p>
          <div className="grid grid-cols-2 gap-2">
            {allApps.map(app => (
              <button
                key={app.id}
                onClick={() => toggleQuickAccess(app.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${quickAccess.includes(app.id) ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-gray-700 text-gray-400'}`}
              >
                <span>{app.icon}</span>
                <span className="flex-1 text-left">{app.label}</span>
                {quickAccess.includes(app.id) && <Check size={14} className="text-pink-400" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}