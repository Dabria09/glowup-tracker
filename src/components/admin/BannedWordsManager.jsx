import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BannedWordsManager({ isOpen, onClose }) {
  const [bannedWords, setBannedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBannedWords();
    }
  }, [isOpen]);

  const loadBannedWords = async () => {
    try {
      const words = await base44.entities.BannedWord.list();
      setBannedWords(words);
    } catch (error) {
      console.error('Error loading banned words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    try {
      await base44.entities.BannedWord.create({
        word: newWord.toLowerCase().trim(),
        category: selectedCategory,
        is_active: true,
        auto_flag: true,
      });
      setNewWord('');
      loadBannedWords();
    } catch (error) {
      console.error('Error adding banned word:', error);
    }
  };

  const handleRemoveWord = async (id) => {
    try {
      await base44.entities.BannedWord.delete(id);
      loadBannedWords();
    } catch (error) {
      console.error('Error removing banned word:', error);
    }
  };

  const handleToggleActive = async (word) => {
    try {
      await base44.entities.BannedWord.update(word.id, {
        is_active: !word.is_active,
      });
      loadBannedWords();
    } catch (error) {
      console.error('Error toggling word:', error);
    }
  };

  const filteredWords = bannedWords.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors = {
    profanity: 'bg-red-900/30 border-red-700/50 text-red-300',
    hate_speech: 'bg-purple-900/30 border-purple-700/50 text-purple-300',
    bullying: 'bg-orange-900/30 border-orange-700/50 text-orange-300',
    personal_info: 'bg-blue-900/30 border-blue-700/50 text-blue-300',
    spam: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300',
    other: 'bg-gray-900/30 border-gray-700/50 text-gray-300',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            Banned Words Management
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Add New Word */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-sm font-bold text-white mb-3">Add Banned Word</h3>
          <div className="flex gap-2 mb-3">
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter word..."
              className="flex-1 px-4 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="other">Other</option>
              <option value="profanity">Profanity</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="bullying">Bullying</option>
              <option value="personal_info">Personal Info</option>
              <option value="spam">Spam</option>
            </select>
            <button
              onClick={handleAddWord}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400">Words are automatically filtered from all user-generated content</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search banned words..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-10">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWords.map(word => (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold border ${categoryColors[word.category] || categoryColors.other}`}>
                    {word.category.replace('_', ' ')}
                  </div>
                  <span className={`text-sm font-semibold ${word.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>
                    {word.word}
                  </span>
                  {word.auto_flag && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> Auto-flag
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(word)}
                    className={`p-2 rounded-lg transition ${word.is_active ? 'text-green-400 hover:bg-green-900/20' : 'text-gray-500 hover:bg-gray-900/20'}`}
                  >
                    {word.is_active ? <CheckCircle size={16} /> : <X size={16} />}
                  </button>
                  <button
                    onClick={() => handleRemoveWord(word.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {filteredWords.length} banned word{filteredWords.length !== 1 ? 's' : ''} • {filteredWords.filter(w => w.is_active).length} active
          </p>
        </div>
      </div>
    </div>
  );
}