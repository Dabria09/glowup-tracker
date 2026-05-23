import { useState, useEffect } from 'react';
import { X, Users, Plus, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Skill Building'];

export default function PeerCircleCreator({ isOpen, onClose, user, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    max_members: 5,
    meeting_schedule: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await base44.entities.PeerMentoringCircle.create({
        circle_id: `circle_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        mentor_email: user.email,
        member_emails: '[]',
        max_members: formData.max_members,
        category: formData.category,
        meeting_schedule: formData.meeting_schedule,
        status: 'forming',
        created_date: new Date().toISOString(),
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating circle:', error);
      alert('Error creating circle');
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
            <Users size={20} className="text-purple-400" />
            Create Peer Mentoring Circle
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="text-xs text-gray-300">Peer circles are small groups (3-5 teens) mentored by an older teen or adult mentor. Perfect for collaborative learning!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Circle Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Tech Girls Circle"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What's the focus of your circle?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={2}
            />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Max Members</label>
              <input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value) || 5})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Meeting Schedule</label>
              <input
                value={formData.meeting_schedule}
                onChange={(e) => setFormData({...formData, meeting_schedule: e.target.value})}
                placeholder="e.g., Saturdays 2pm"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.category}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}
          >
            {loading ? 'Creating...' : 'Create Circle'}
          </button>
        </div>
      </div>
    </div>
  );
}