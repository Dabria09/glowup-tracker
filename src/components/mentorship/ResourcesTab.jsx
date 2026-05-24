import { useState, useEffect } from 'react';
import { Link2, FileText, Video, BookOpen, Upload, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPE_ICONS = { link: Link2, file: Upload, video: Video, document: FileText, assignment: BookOpen };
const TYPE_COLORS = {
  link: 'rgba(59,130,246,0.2)',
  file: 'rgba(245,158,11,0.2)',
  video: 'rgba(239,68,68,0.2)',
  document: 'rgba(168,85,247,0.2)',
  assignment: 'rgba(34,197,94,0.2)',
};

export default function ResourcesTab({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', resource_type: 'link', url: '', category: '', mentee_email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const mentorData = await base44.entities.Mentor.filter({ user_email: user.email, is_approved: true });
      const isM = mentorData.length > 0;
      setIsMentor(isM);

      let res;
      if (isM) {
        res = await base44.entities.MentorshipResource.filter({ mentor_email: user.email });
      } else {
        res = await base44.entities.MentorshipResource.filter({ mentee_email: user.email });
      }
      setResources(res.sort((a, b) => new Date(b.shared_date) - new Date(a.shared_date)));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.url) return;
    setSaving(true);
    await base44.entities.MentorshipResource.create({
      ...form,
      mentor_email: user.email,
      shared_date: new Date().toISOString(),
    });
    setShowForm(false);
    setForm({ title: '', description: '', resource_type: 'link', url: '', category: '', mentee_email: '' });
    setSaving(false);
    loadData();
  };

  if (loading) return (
    <div className="text-center py-10">
      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg flex items-center gap-2">
          <BookOpen size={20} className="text-purple-400" />
          Resources
        </h2>
        {isMentor && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={14} /> Share
          </button>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <BookOpen size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No resources shared yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map(resource => {
            const Icon = TYPE_ICONS[resource.resource_type] || Link2;
            return (
              <div key={resource.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: TYPE_COLORS[resource.resource_type] || 'rgba(255,255,255,0.1)' }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{resource.title}</h3>
                    {resource.description && <p className="text-xs text-gray-400 mt-1">{resource.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {resource.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                          {resource.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{new Date(resource.shared_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.4)' }}>
                      Open
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowForm(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Share a Resource</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Type</label>
                <select value={form.resource_type} onChange={e => setForm({...form, resource_type: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {['link', 'file', 'video', 'document', 'assignment'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">URL *</label>
                <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  placeholder="https://"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={2} className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Mentee Email (leave blank to share with all)</label>
                <input value={form.mentee_email} onChange={e => setForm({...form, mentee_email: e.target.value})}
                  placeholder="mentee@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={handleSubmit} disabled={saving || !form.title || !form.url}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {saving ? 'Sharing...' : 'Share Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}