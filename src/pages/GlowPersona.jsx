import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Upload, Sparkles, Camera, Download, Share2, Heart, Star, Crown, Zap, Flame, Gem, TrendingUp, Layers, Wallpaper, Award, ChevronRight, X, Image } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

const PERSONA_TYPES = [
  { id: 'soft_girl', name: 'Soft Girl', emoji: '🌸', prompt: 'soft feminine aesthetic, dreamy pastel colors, gentle expression, blush cheeks, glossy lips, ethereal glow, romantic delicate beauty, angelic peaceful energy, high quality portrait', bg: 'linear-gradient(135deg,#f9a8d4,#f0abfc)', accent: '#f472b6', caption: 'Your Soft Girl persona radiates peace, confidence, and feminine energy ✨', mood: 'gentle & dreamy' },
  { id: 'luxury_glow', name: 'Luxury Glow', emoji: '✨', prompt: 'luxury fashion editorial, golden hour lighting, flawless skin, sophisticated makeup, designer aesthetic, confident powerful woman, high fashion photography, expensive glow, elegant posture', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', accent: '#fbbf24', caption: 'Your Luxury Glow embodies success, elegance, and that expensive energy 💛', mood: 'elegant & powerful' },
  { id: 'future_ceo', name: 'Future CEO', emoji: '👑', prompt: 'boss babe energy, professional power portrait, sharp confident gaze, modern business fashion, leadership presence, ambitious successful woman, clean sophisticated aesthetic, goal getter vibes', bg: 'linear-gradient(135deg,#7c3aed,#a855f7)', accent: '#8b5cf6', caption: 'Your Future CEO persona is built different — ambitious, unstoppable, legendary 👑', mood: 'confident & ambitious' },
  { id: 'anime_muse', name: 'Anime Muse', emoji: '🎀', prompt: 'beautiful anime girl, large expressive eyes, soft blush, glossy lips, detailed flowing hair, kawaii aesthetic, soft pastel colors, anime illustration style, feminine cute glowing', bg: 'linear-gradient(135deg,#fb7185,#ec4899)', accent: '#ec4899', caption: 'Your Anime Muse is kawaii perfection with main character energy 🎀', mood: 'cute & expressive' },
  { id: 'y2k_princess', name: 'Y2K Princess', emoji: '🦋', prompt: 'Y2K aesthetic, early 2000s fashion, butterfly clips, glossy lips, playful confident expression, nostalgic trendy vibes, colorful fun energy, pop princess aesthetic', bg: 'linear-gradient(135deg,#a855f7,#ec4899)', accent: '#c084fc', caption: 'Your Y2K Princess is serving nostalgic trendy baddie energy 🦋', mood: 'playful & trendy' },
  { id: 'ethereal_goddess', name: 'Ethereal Goddess', emoji: '🌙', prompt: 'ethereal divine goddess, fantasy aesthetic, glowing luminous skin, magical atmosphere, celestial beauty, otherworldly enchanting, flowing hair, mystical energy, high fantasy art', bg: 'linear-gradient(135deg,#c084fc,#7c3aed)', accent: '#a855f7', caption: 'Your Ethereal Goddess is literally divine — magical, mysterious, mesmerizing 🌙', mood: 'mystical & enchanting' },
  { id: 'fitness_glow', name: 'Fitness Glow', emoji: '💪', prompt: 'athletic fitness portrait, healthy glowing skin, confident strong woman, activewear aesthetic, energetic vibrant, wellness lifestyle, powerful physique, motivation embodied', bg: 'linear-gradient(135deg,#f97316,#ef4444)', accent: '#f97316', caption: 'Your Fitness Glow is strong, healthy, and absolutely unstoppable 💪', mood: 'strong & energized' },
  { id: 'baddie_scholar', name: 'Baddie Scholar', emoji: '📚', prompt: 'smart confident baddie, intellectual chic, academic aesthetic with edge, glasses optional, powerful gaze, dark academia meets modern baddie, ambitious studious fierce', bg: 'linear-gradient(135deg,#1e293b,#475569)', accent: '#64748b', caption: 'Your Baddie Scholar is smart, fierce, and running the game 📚', mood: 'smart & fierce' },
  { id: 'cozy_feminine', name: 'Cozy Feminine', emoji: '🧸', prompt: 'cozy comfortable aesthetic, soft warm lighting, gentle peaceful expression, cottagecore vibes, natural beauty, homebody energy, warm inviting presence, soft girl autumn', bg: 'linear-gradient(135deg,#d4a574,#a67c52)', accent: '#d4a574', caption: 'Your Cozy Feminine is warm, comforting, and beautifully peaceful 🧸', mood: 'warm & comforting' },
  { id: 'main_character', name: 'Main Character', emoji: '🎬', prompt: 'main character energy, cinematic portrait, dramatic lighting, confident captivating gaze, movie star quality, unforgettable presence, leading lady vibes, camera loves you', bg: 'linear-gradient(135deg,#dc2626,#991b1b)', accent: '#ef4444', caption: 'Your Main Character persona? Everyone is watching. You are the story 🎬', mood: 'captivating & bold' },
  { id: 'boss_babe', name: 'Boss Babe', emoji: '💼', prompt: 'boss babe energy, powerful confident woman, luxury fashion, success mindset, ambitious go-getter, fierce determined gaze, unstoppable force, empire builder', bg: 'linear-gradient(135deg,#0891b2,#0e7490)', accent: '#06b6d4', caption: 'Your Boss Babe is building empires and breaking ceilings 💼', mood: 'powerful & determined' },
  { id: 'dream_life', name: 'Dream Life', emoji: '💫', prompt: 'living your best life, dreamy aspirational aesthetic, luxurious peaceful, manifestation energy, abundance vibes, ideal life embodied, serene confident beautiful', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', accent: '#6366f1', caption: 'Your Dream Life persona is what manifestation looks like 💫', mood: 'aspirational & serene' },
];

const TRENDING_IDS = ['luxury_glow', 'main_character', 'soft_girl', 'future_ceo'];

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
  const [favorites, setFavorites] = useState([]);
  const [viewingPersona, setViewingPersona] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

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
              setGeneratedImages(saved.images || {});
              setFavorites(saved.favorites || []);
              if (Object.keys(saved.images || {}).length > 0) setShowGenerated(true);
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

  const generatePersona = async (persona) => {
    if (!uploadedPhoto) return;
    setGenerating(persona.id);
    setGenerationStep('Analyzing features...');
    await new Promise(r => setTimeout(r, 800));
    setGenerationStep('Enhancing lighting...');
    await new Promise(r => setTimeout(r, 800));
    setGenerationStep('Applying aesthetic...');
    await new Promise(r => setTimeout(r, 800));
    setGenerationStep('Final touches...');
    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `${persona.prompt}, ultra detailed masterpiece, professional photography, 8k, sharp focus, perfect lighting, fashion editorial quality, based on reference photo, maintain facial structure and features, enhance natural beauty, confident energy, social media worthy`,
        existing_image_urls: [uploadedPhoto],
      });
      const newImages = { ...generatedImages, [persona.id]: url };
      setGeneratedImages(newImages);
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, { glow_persona_images: JSON.stringify({ images: newImages, favorites }) });
      } else if (user) {
        const np = await base44.entities.UserProfile.create({ user_email: user.email, glow_persona_images: JSON.stringify({ images: newImages, favorites }) });
        setProfile(np);
      }
      setViewingPersona({ ...persona, url });
    } catch (err) {
      alert('Generation failed. Please try again.');
      console.error(err);
    }
    setGenerating(null);
    setGenerationStep('');
  };

  const toggleFavorite = async (personaId) => {
    const newFavs = favorites.includes(personaId) ? favorites.filter(id => id !== personaId) : [...favorites, personaId];
    setFavorites(newFavs);
    const allImages = { ...generatedImages };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { glow_persona_images: JSON.stringify({ images: allImages, favorites: newFavs }) });
    }
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

  const handleShare = async (url, persona) => {
    if (navigator.share) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `glow-persona-${persona.id}.png`, { type: 'image/png' });
        await navigator.share({
          title: `My ${persona.name} Glow Persona`,
          text: `${persona.caption}\n\nCreated with Girls Glowing Up ✨`,
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
      setFavorites([]);
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full mx-auto mb-4"
          />
          <p className="text-pink-300 font-semibold text-lg">Loading your glow...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#130a10] text-white pb-40 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-400/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm hover:text-white transition">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Glow Persona</h1>
        <div className="w-20"/>
      </div>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-2 mb-6 rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7,#8b5cf6)' }}
      >
        <div className="absolute inset-0 opacity-30">
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              backgroundSize: '200% 200%'
            }}
          />
        </div>
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-yellow-300"/>
            <p className="text-xs font-bold tracking-widest text-white/80 uppercase">AI-Powered Transformation</p>
          </div>
          <h2 className="text-3xl font-black mb-3 leading-tight">Transform Into Your<br/><span className="text-yellow-300">Dream Self</span></h2>
          <p className="text-sm text-white/90">12 premium aesthetics. Infinite possibilities. Your glow, elevated.</p>
        </motion.div>
      </motion.div>

      {!showGenerated ? (
        <>
          {/* Upload Section */}
          {!uploadedPhoto ? (
            <div className="flex flex-col items-center px-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-64 h-64 rounded-3xl border-2 border-dashed border-pink-500/40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center mb-6 relative overflow-hidden"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20"
                />
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Camera size={56} className="text-pink-400 mx-auto mb-4"/>
                  </motion.div>
                  <p className="text-base font-semibold text-gray-300">Upload your selfie</p>
                  <p className="text-sm text-gray-500 mt-1">to start transforming</p>
                </div>
              </motion.div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="persona-upload"
              />
              <label
                htmlFor="persona-upload"
                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition mb-3 shadow-lg shadow-pink-500/30"
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center px-4 mb-6"
              >
                <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Your Photo</p>
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-xl shadow-pink-500/20"
                  >
                    <img src={uploadedPhoto} alt="Your selfie" className="w-full h-full object-cover"/>
                  </motion.div>
                  <button
                    onClick={() => setUploadedPhoto(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-red-400 transition hover:scale-110"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Choose a persona style below</p>
              </motion.div>

              {/* Trending Styles */}
              <div className="px-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-pink-400"/>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Trending This Week</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {TRENDING_IDS.map(id => {
                    const persona = PERSONA_TYPES.find(p => p.id === id);
                    if (!persona) return null;
                    return (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => generatePersona(persona)}
                        className="flex-shrink-0 rounded-2xl p-3 text-left transition-all min-w-[140px]"
                        style={{
                          background: persona.bg,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{persona.emoji}</span>
                          <span className="font-bold text-xs">{persona.name}</span>
                        </div>
                        <p className="text-xs text-white/80 leading-tight">{persona.mood}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* All Persona Styles */}
              <div className="px-4">
                <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">All Personas</p>
                <div className="grid grid-cols-2 gap-3">
                  {PERSONA_TYPES.map((persona, index) => (
                    <motion.button
                      key={persona.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => generatePersona(persona)}
                      disabled={generating}
                      className="relative rounded-2xl p-4 text-left transition-all overflow-hidden group"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        minHeight: 130,
                      }}
                    >
                      {/* Animated gradient border on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: persona.bg, filter: 'blur(20px)' }}/>
                      
                      {generating === persona.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center z-20 backdrop-blur-sm"
                        >
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 border-3 border-pink-500/30 border-t-pink-400 rounded-full mb-3"
                          />
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-pink-300 font-semibold"
                          >
                            {generationStep}
                          </motion.p>
                        </motion.div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{persona.emoji}</span>
                          <span className="font-bold text-sm">{persona.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-tight mb-2">{persona.mood}</p>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-full" style={{ background: persona.bg }}/>
                          <Sparkles size={14} className="text-pink-400"/>
                        </div>
                      </div>
                    </motion.button>
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
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400"/>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Your Personas ({Object.keys(generatedImages).length})</p>
              </div>
              <button
                onClick={() => { setShowGenerated(false); setUploadedPhoto(null); }}
                className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300 transition"
              >
                <Upload size={12} /> Create More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(generatedImages).map(([personaId, imgUrl], index) => {
                const persona = PERSONA_TYPES.find(p => p.id === personaId);
                if (!persona) return null;
                return (
                  <motion.div
                    key={personaId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl overflow-hidden border border-white/10 relative group cursor-pointer"
                    onClick={() => setViewingPersona({ ...persona, url: imgUrl })}
                  >
                    <img src={imgUrl} alt={persona.name} className="w-full aspect-square object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                        {persona.emoji} {persona.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(personaId); }}
                          className="flex items-center justify-center gap-1 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition"
                        >
                          <Heart size={14} className={favorites.includes(personaId) ? 'fill-red-500 text-red-500' : 'text-white'}/>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(imgUrl, persona.id); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-semibold hover:bg-white/30 transition"
                        >
                          <Download size={12} /> Save
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(imgUrl, persona); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-pink-500/80 backdrop-blur-sm text-xs font-semibold hover:bg-pink-500 transition"
                        >
                          <Share2 size={12} /> Share
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-bold">
                      {persona.emoji}
                    </div>
                    {favorites.includes(personaId) && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center">
                        <Heart size={12} className="fill-white text-white"/>
                      </div>
                    )}
                  </motion.div>
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

      {/* Persona Detail Modal */}
      <AnimatePresence>
        {viewingPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setViewingPersona(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl overflow-hidden bg-[#1a0f14] border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img src={viewingPersona.url} alt={viewingPersona.name} className="w-full aspect-square object-cover"/>
                <button
                  onClick={() => setViewingPersona(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition"
                >
                  <X size={20}/>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{viewingPersona.emoji}</span>
                    <h3 className="text-2xl font-bold">{viewingPersona.name}</h3>
                  </div>
                  <p className="text-sm text-white/80 mb-3">{viewingPersona.mood}</p>
                  <p className="text-sm text-pink-200 italic">{viewingPersona.caption}</p>
                </div>
              </div>
              <div className="p-4 flex items-center gap-2">
                <button
                  onClick={() => { setShowCompare(true); setViewingPersona(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold text-sm"
                >
                  <Image size={18}/>
                  Compare
                </button>
                <button
                  onClick={() => toggleFavorite(viewingPersona.id)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                >
                  <Heart size={20} className={favorites.includes(viewingPersona.id) ? 'fill-red-500 text-red-500' : 'text-white'}/>
                </button>
                <button
                  onClick={() => handleDownload(viewingPersona.url, viewingPersona.id)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                >
                  <Download size={20}/>
                </button>
                <button
                  onClick={() => handleShare(viewingPersona.url, viewingPersona)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500/80 hover:bg-pink-500 transition"
                >
                  <Share2 size={20}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && uploadedPhoto && viewingPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-2xl rounded-3xl overflow-hidden bg-[#1a0f14] border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Image size={20} className="text-pink-400"/>
                  Before & After
                </h3>
                <button onClick={() => setShowCompare(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <X size={18}/>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase">Original</p>
                  <img src={uploadedPhoto} alt="Original" className="w-full rounded-2xl object-cover"/>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2 uppercase">{viewingPersona.name}</p>
                  <img src={viewingPersona.url} alt={viewingPersona.name} className="w-full rounded-2xl object-cover"/>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <div className="px-4 mt-6 mb-4">
        <div className="rounded-2xl p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-700/20">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-pink-400 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-pink-200 leading-relaxed">
              <span className="font-bold">Pro tip:</span> Upload a clear, well-lit selfie for best results. Each persona enhances your natural beauty with premium AI styling — perfect for social media, wallpapers, or just feeling yourself! ✨
            </p>
          </div>
        </div>
      </div>

      <BottomNav active="me"/>
    </div>
  );
}