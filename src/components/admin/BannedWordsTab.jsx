import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Plus, Search, AlertTriangle, CheckCircle, ShieldAlert, Ban, Eye } from 'lucide-react';

const CATEGORIES = [
  { value: 'profanity',     label: 'Profanity',      color: 'bg-red-900/30 border-red-700/50 text-red-300' },
  { value: 'hate_speech',   label: 'Hate Speech',    color: 'bg-purple-900/30 border-purple-700/50 text-purple-300' },
  { value: 'bullying',      label: 'Bullying',       color: 'bg-orange-900/30 border-orange-700/50 text-orange-300' },
  { value: 'personal_info', label: 'Personal Info',  color: 'bg-blue-900/30 border-blue-700/50 text-blue-300' },
  { value: 'spam',          label: 'Spam',           color: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' },
  { value: 'other',         label: 'Other',          color: 'bg-gray-900/30 border-gray-700/50 text-gray-300' },
];

const ACTIONS = [
  {
    value: 'block',
    label: 'Block Post',
    description: 'Prevent the message from being sent entirely',
    icon: Ban,
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-700/30',
    selectedBg: 'bg-red-900/40 border-red-500',
  },
  {
    value: 'replace',
    label: 'Replace with ***',
    description: 'Allow the post but replace the word with asterisks',
    icon: Eye,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20 border-amber-700/30',
    selectedBg: 'bg-amber-900/40 border-amber-500',
  },
  {
    value: 'flag',
    label: 'Auto-Flag for Review',
    description: 'Allow the post but flag it for admin review',
    icon: AlertTriangle,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-700/30',
    selectedBg: 'bg-blue-900/40 border-blue-500',
  },
];

const categoryColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || CATEGORIES[5].color;
const categoryLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || 'Other';

export default function BannedWordsTab() {
  const [bannedWords, setBannedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [newAction, setNewAction] = useState('block');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadBannedWords();
  }, []);

  const loadBannedWords = async () => {
    setLoading(true);
    const words = await base44.entities.BannedWord.list();
    setBannedWords(words);
    setLoading(false);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setSaving(true);
    await base44.entities.BannedWord.create({
      word: newWord.toLowerCase().trim(),
      category: selectedCategory,
      is_active: true,
      auto_flag: newAction === 'flag',
    });
    setNewWord('');
    setSaving(false);
    showSuccess('Word added!');
    loadBannedWords();
  };

  const handleRemoveWord = async (id) => {
    await base44.entities.BannedWord.delete(id);
    showSuccess('Word removed.');
    loadBannedWords();
  };

  const handleToggleActive = async (word) => {
    await base44.entities.BannedWord.update(word.id, { is_active: !word.is_active });
    loadBannedWords();
  };

  const filteredWords = bannedWords.filter(w => {
    const matchSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || w.category === filterCategory;
    return matchSearch && matchCat;
  });

  const activeCount = bannedWords.filter(w => w.is_active).length;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          <ShieldAlert size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Banned Words</h2>
          <p className="text-xs text-gray-400">{activeCount} active • {bannedWords.length} total</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-green-900/30 border border-green-700/40 text-green-300 text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* What happens when a word is used */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-sm font-bold text-white mb-1">When a banned word is used…</h3>
        <p className="text-xs text-gray-500 mb-4">Choose what happens when a user submits content containing a banned word. This setting applies per-word when you add it.</p>
        <div className="grid gap-3">
          {ACTIONS.map(action => {
            const Icon = action.icon;
            const isSelected = newAction === action.value;
            return (
              <button
                key={action.value}
                onClick={() => setNewAction(action.value)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${isSelected ? action.selectedBg : action.bg}`}
              >
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${action.color}`} />
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{action.label}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${isSelected ? 'border-white bg-white' : 'border-gray-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Word */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 className="text-sm font-bold text-white mb-3">Add Banned Word</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Enter word or phrase..."
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button
            onClick={handleAddWord}
            disabled={saving || !newWord.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Action on use: <span className="text-pink-400 font-semibold">{ACTIONS.find(a => a.value === newAction)?.label}</span>
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Word List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-12">
          <ShieldAlert size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-gray-500 text-sm">No banned words found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWords.map(word => {
            const actionInfo = ACTIONS.find(a => a.value === (word.auto_flag ? 'flag' : 'block')) || ACTIONS[0];
            const ActionIcon = actionInfo.icon;
            return (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${categoryColor(word.category)}`}>
                    {categoryLabel(word.category)}
                  </span>
                  <span className={`text-sm font-mono font-semibold ${word.is_active ? 'text-white' : 'text-gray-600 line-through'}`}>
                    {word.word}
                  </span>
                  <span className={`text-[10px] flex items-center gap-1 ${actionInfo.color}`}>
                    <ActionIcon size={11} />
                    {actionInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleToggleActive(word)}
                    title={word.is_active ? 'Disable' : 'Enable'}
                    className={`p-2 rounded-lg transition ${word.is_active ? 'text-green-400 hover:bg-green-900/20' : 'text-gray-600 hover:bg-gray-900/20'}`}
                  >
                    <CheckCircle size={15} />
                  </button>
                  <button
                    onClick={() => handleRemoveWord(word.id)}
                    title="Delete"
                    className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 transition"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-gray-600 mt-6">
        {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} shown • {activeCount} active
      </p>
    </div>
  );
}