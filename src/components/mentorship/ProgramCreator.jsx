import { useState } from 'react';
import { X, Plus, BookOpen, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Skill Building'];

export default function ProgramCreator({ isOpen, onClose, user, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_weeks: 6,
    category: '',
    max_mentees: 5,
    curriculum: [],
  });
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState('');

  const addModule = () => {
    if (currentModule.trim()) {
      setFormData(prev => ({
        ...prev,
        curriculum: [...prev.curriculum, currentModule.trim()]
      }));
      setCurrentModule('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (formData.duration_weeks * 7));

      await base44.entities.MentorshipProgram.create({
        title: formData.title,
        description: formData.description,
        duration_weeks: formData.duration_weeks,
        category: formData.category,
        mentor_email: user.email,
        max_mentees: formData.max_mentees,
        curriculum: JSON.stringify(formData.curriculum),
        enrolled_mentees: '[]',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Error creating program');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-purple-400" />
            Create Mentorship Program
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Program Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Duration (Weeks)</label>
              <input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value) || 6})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Max Mentees</label>
              <input
                type="number"
                value={formData.max_mentees}
                onChange={(e) => setFormData({...formData, max_mentees: parseInt(e.target.value) || 5})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Curriculum Modules</label>
            <div className="flex gap-2 mb-3">
              <input
                value={currentModule}
                onChange={(e) => setCurrentModule(e.target.value)}
                placeholder="Add a module (e.g., Week 1: Goal Setting)"
                className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={addModule}
                className="px-4 py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}
              >
                <Plus size={18} />
              </button>
            </div>

            {formData.curriculum.length > 0 && (
              <div className="space-y-2">
                {formData.curriculum.map((module, idx) => (
                  <div key={idx} className="rounded-lg px-3 py-2 text-sm" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <span className="text-purple-400 font-bold">Module {idx + 1}:</span> {module}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.description || !formData.category}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}
          >
            {loading ? 'Creating...' : 'Launch Program'}
          </button>
        </div>
      </div>
    </div>
  );
}