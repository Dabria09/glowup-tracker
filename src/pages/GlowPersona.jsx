import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Upload, Sparkles, Camera, Download, Share2, Heart } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const STYLES = [
  { id: 'glam', name: 'Glam Avatar', emoji: '✨', prompt: 'stunning glamorous portrait, soft glam makeup, glossy lips, glowing skin, professional beauty photography, warm lighting, feminine, confident, Instagram-worthy, high quality, detailed eyes, perfect skin', bg: 'linear-gradient(135deg,#ec4899,#a855f7)' },
  { id: 'anime', name: 'Anime Glow', emoji: '🌸', prompt: 'beautiful anime girl portrait, large expressive eyes, soft blush, glossy lips, detailed hair, kawaii aesthetic, soft pastel colors, anime illustration, high quality, feminine, cute, glowing', bg: 'linear-gradient(135deg,#f472b6,#c084fc)' },
  { id: 'soft', name: 'Soft Girl', emoji: '💕', prompt: 'soft feminine illustration, dreamy aesthetic, pastel colors, gentle expression, blush cheeks, glossy lips, ethereal glow, watercolor style, romantic, delicate, pretty, angelic', bg: 'linear-gradient(135deg,#f9a8d4,#f0abfc)' },
  { id: 'cartoon', name: '3D Cartoon', emoji: '🎀', prompt: 'cute 3D cartoon character, Pixar-style rendering, large eyes, expressive face, soft shading, colorful, playful, feminine, adorable, high quality 3D render, smooth, polished', bg: 'linear-gradient(135deg,#fb7185,#f472b6)' },
  { id: 'futuristic', name: 'Futuristic', emoji: '🔮', prompt: 'futuristic cyberpunk girl, neon glow, holographic elements, sci-fi aesthetic, glowing eyes, metallic accents, edgy, confident, bold, high tech, digital art, vibrant colors', bg: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'ethereal', name: 'Ethereal', emoji: '🦋', prompt: 'ethereal goddess portrait, fantasy aesthetic, glowing skin, magical atmosphere, soft focus, dreamy, otherworldly beauty, flowing hair, celestial, angelic, enchanting, high fantasy art', bg: 'linear-gradient(135deg,#a78bfa,#e879f9)' },
];

export default function GlowPersona() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length) {
          setProfile(profiles[0]);
          if (profiles[0].glow_persona_images) {
            try {
              const saved = JSON.parse(profiles[0].glow_persona_images);
              setGeneratedImages(saved);
              if (Object.keys(saved).length > 0) setShowGenerated(true);
            } catch {}
          }
        }
      } catch { navigate('/'); }
      setLoading(false);
    };
    init();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5 MB.');
      return;
    }
    setGenerating('upload');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedPhoto(file_url);
    setGenerating(null);
  };

  const generatePersona = async (style) => {
    if (!uploadedPhoto) return;
    setGenerating(style.id);
    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `${style.prompt}, based on uploaded reference photo, maintain facial features, transform into ${style.name.toLowerCase()} style, ultra detailed, masterpiece`,
        existing_image_urls: [uploadedPhoto],
      });
      setGeneratedImages(prev => ({ ...prev, [style.id]: url }));
      const allImages = { ...generatedImages, [style.id]: url };
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, { glow_persona_images: JSON.stringify(allImages) });
      } else if (user) {
        const np = await base44.entities.UserProfile.create({ user_email: user.email, glow_persona_images: JSON.stringify(allImages) });
        setProfile(np);
      }
    } catch (err) {
      alert('Generation failed. Please try again.');
      console.error(err);
    }
    setGenerating(null);
  };

  const handleDownload = async (url, styleName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `glow-persona-${styleName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleShare = async (url, styleName) => {
    if (navigator.share) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `glow-persona-${styleName}.png`, { type: 'image/png' });
        await navigator.share({
          title: 'My Glow Persona',
          text: `Check out my ${styleName} Glow Persona from Girls Glowing Up!`,
          files: [file],
        });
      } catch {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove all your Glow Personas?')) {
      setGeneratedImages({});
      setUploadedPhoto(null);
      setShowGenerated(false);
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, { glow_persona_images: null });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#130a10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-pink-300 font-semibold">Loading your glow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#130a10] text-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-bold">Glow Persona</h1>
        <div className="w-20"/>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-2 mb-6 rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7,#8b5cf6)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0%, transparent 50%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)' }}/>
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-widest text-white/70 uppercase mb-2">AI-Powered Transformation</p>
          <h2 className="text-2xl font-black mb-2">Upload Your Selfie, Get 6 Personas</h2>
          <p className="text-sm text-white/80">Transform into glam, anime, soft girl, cartoon, futuristic, and ethereal versions</p>
        </div>
      </div>

      {!showGenerated ? (
        <>
          {/* Upload Section */}
          {!uploadedPhoto ? (
            <div className="flex flex-col items-center px-4">
              <div className="w-56 h-56 rounded-3xl border-2 border-dashed border-pink-500/40 bg-pink-500/5 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Camera size={48} className="text-pink-400 mx-auto mb-3"/>
                  <p className="text-sm text-gray-400">Upload your selfie</p>
                  <p className="text-xs text-gray-500 mt-1">to start transforming</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="persona-upload"
              />
              <label
                htmlFor="persona-upload"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition mb-3"
              >
                <Upload size={18} />
                {generating === 'upload' ? 'Uploading...' : 'Upload Selfie'}
              </label>
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Max 5MB - JPG, PNG, WEBP - Your photo is used only for AI transformation
              </p>
            </div>
          ) : (
            <>
              {/* Uploaded Photo Preview */}
              <div className="flex flex-col items-center px-4 mb-6">
                <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Your Photo</p>
                <div className="relative">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-xl">
                    <img src={uploadedPhoto} alt="Your selfie" className="w-full h-full object-cover"/>
                  </div>
                  <button
                    onClick={() => setUploadedPhoto(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-red-400 transition"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Choose a style below to transform</p>
              </div>

              {/* Style Selection Grid */}
              <div className="px-4">
                <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Choose Your Style</p>
                <div className="grid grid-cols-2 gap-3">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => generatePersona(style)}
                      disabled={generating}
                      className="relative rounded-2xl p-4 text-left transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        minHeight: 110,
                      }}
                    >
                      {generating === style.id && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-8 h-8 border-3 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-2"/>
                            <p className="text-xs text-pink-300 font-semibold">Creating...</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{style.emoji}</span>
                        <span className="font-bold text-sm">{style.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-tight">
                        {style.id === 'glam' && 'Glamorous beauty portrait'}
                        {style.id === 'anime' && 'Kawaii anime aesthetic'}
                        {style.id === 'soft' && 'Dreamy soft girl vibes'}
                        {style.id === 'cartoon' && 'Cute 3D cartoon style'}
                        {style.id === 'futuristic' && 'Cyberpunk futuristic look'}
                        {style.id === 'ethereal' && 'Magical goddess energy'}
                      </p>
                      <div className="absolute bottom-3 right-3">
                        <Sparkles size={14} className="text-pink-400"/>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Generated Personas Gallery */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Your Glow Personas</p>
              <button
                onClick={() => { setShowGenerated(false); setUploadedPhoto(null); }}
                className="text-xs text-pink-400 font-semibold flex items-center gap-1"
              >
                <Upload size={12} /> Create More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map(style => {
                const imgUrl = generatedImages[style.id];
                if (!imgUrl) return null;
                return (
                  <div key={style.id} className="rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img src={imgUrl} alt={style.name} className="w-full aspect-square object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                        {style.emoji} {style.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(imgUrl, style.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-semibold hover:bg-white/30 transition"
                        >
                          <Download size={12} /> Save
                        </button>
                        <button
                          onClick={() => handleShare(imgUrl, style.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-pink-500/80 backdrop-blur-sm text-xs font-semibold hover:bg-pink-500 transition"
                        >
                          <Share2 size={12} /> Share
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-bold">
                      {style.emoji}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleRemove}
              className="w-full mt-4 py-3 rounded-xl border border-red-900/40 text-red-400 text-xs font-semibold hover:bg-red-900/10 transition"
            >
              Remove All Personas
            </button>
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="px-4 mt-6 mb-4">
        <div className="rounded-2xl p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-700/20">
          <p className="text-xs text-pink-200 leading-relaxed">
            <span className="font-bold">How it works:</span> Upload a clear selfie, then tap any style to AI-transform yourself. Each persona captures your unique features in a different aesthetic. Save and share your favorites!
          </p>
        </div>
      </div>

      <BottomNav active="me"/>
    </div>
  );
}