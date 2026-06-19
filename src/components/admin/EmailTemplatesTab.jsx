import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Eye, Save, X, Copy, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = {
  streak: '🔥 Streak Reminders',
  welcome: '👋 Welcome Emails',
  moderation: '🚨 Moderation Alerts',
  newsletter: '📰 Newsletter',
  achievement: '🏆 Achievements',
  reminder: '⏰ General Reminders',
  other: '📧 Other',
};

export default function EmailTemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    template_key: '',
    name: '',
    description: '',
    subject: '',
    from_name: 'Girls Glowing Up',
    body_template: '',
    category: 'other',
    variables: '[]',
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await base44.entities.EmailTemplate.list('-updated_date');
      setTemplates(data);
    } catch (e) {
      console.error('Failed to load templates:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!formData.template_key || !formData.name || !formData.subject || !formData.body_template) {
      toast.error('Please fill in all required fields');
      return;
    }

    const me = await base44.auth.me();
    const now = new Date().toISOString();

    try {
      if (editing) {
        await base44.entities.EmailTemplate.update(editing.id, {
          ...formData,
          updated_by: me.email,
          updated_date: now,
        });
        toast.success('Template updated!');
      } else {
        await base44.entities.EmailTemplate.create({
          ...formData,
          created_by: me.email,
          updated_by: me.email,
          updated_date: now,
        });
        toast.success('Template created!');
      }
      setShowForm(false);
      setEditing(null);
      loadTemplates();
    } catch (e) {
      toast.error('Failed to save: ' + e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this email template? This cannot be undone.')) return;
    try {
      await base44.entities.EmailTemplate.delete(id);
      toast.success('Template deleted');
      loadTemplates();
    } catch (e) {
      toast.error('Failed to delete: ' + e.message);
    }
  }

  function handleEdit(template) {
    setEditing(template);
    setFormData({
      template_key: template.template_key,
      name: template.name,
      description: template.description || '',
      subject: template.subject,
      from_name: template.from_name || 'Girls Glowing Up',
      body_template: template.body_template,
      category: template.category,
      variables: template.variables || '[]',
      is_active: template.is_active !== false,
    });
    setShowForm(true);
    setPreviewMode(false);
  }

  function renderPreview() {
    let rendered = formData.body_template;
    const variables = JSON.parse(formData.variables || '[]');
    
    const sampleData = {
      user_name: 'Bria',
      total_points: '25',
      content_type: 'ShoutOut',
      reason: 'hate speech',
      reported_by: 'testuser@ggu.app',
      priority: 'URGENT',
      content_preview: 'Test urgent content',
      review_link: 'https://girlsglowingup.com/admin?tab=moderation',
      unsubscribe_link: '#',
    };

    variables.forEach(v => {
      const regex = new RegExp(`{{${v}}}`, 'g');
      rendered = rendered.replace(regex, sampleData[v] || `{{${v}}}`);
    });

    return rendered;
  }

  async function handleCopyVariable(varName) {
    await navigator.clipboard.writeText(`{{${varName}}}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Email Templates</h2>
          <p className="text-xs text-gray-400">Manage automated email templates for streaks, alerts, newsletters & more</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditing(null); setFormData({ template_key: '', name: '', description: '', subject: '', from_name: 'Girls Glowing Up', body_template: '', category: 'other', variables: '[]', is_active: true }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <Mail size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white font-semibold">Template Variables</p>
          <p className="text-xs text-gray-400 mt-1">Use {'{{variable_name}}'} in your templates. Variables are replaced with real data when emails are sent.</p>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="rounded-2xl p-4"
            style={{ 
              background: template.is_active === false ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
              border: template.is_active === false ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.08)',
              opacity: template.is_active === false ? 0.6 : 1,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{CATEGORIES[template.category]?.split(' ')[0] || '📧'}</span>
                  <h3 className="text-sm font-bold text-white">{template.name}</h3>
                  {template.is_active === false && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Subject: <span className="text-gray-300">{template.subject}</span></span>
                  {template.times_sent > 0 && (
                    <span>Sent: <span className="text-purple-400">{template.times_sent.toLocaleString()}</span> times</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(template)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                  <Edit size={14} />
                </button>
                <button onClick={() => { handleEdit(template); setPreviewMode(true); }} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                  <Eye size={14} />
                </button>
                <button onClick={() => handleDelete(template.id)} className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Template' : 'New Template'}</h3>
              <div className="flex items-center gap-2">
                {previewMode && (
                  <button 
                    onClick={() => setPreviewMode(false)}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <X size={12} /> Close Preview
                  </button>
                )}
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewMode ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white">Preview</h4>
                    <p className="text-xs text-gray-400">Sample data shown</p>
                  </div>
                  <div 
                    className="rounded-xl p-6 text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-1.5 block">Template Key *</label>
                      <input
                        value={formData.template_key}
                        onChange={e => setFormData(f => ({ ...f, template_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                        placeholder="streak_reminder"
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                        disabled={!!editing}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Unique identifier (e.g., streak_reminder, welcome_email)</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-1.5 block">Category *</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                      >
                        {Object.entries(CATEGORIES).map(([key, label]) => (
                          <option key={key} value={key} className="bg-gray-900">{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block">Template Name *</label>
                    <input
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="Streak Reminder Email"
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block">Description</label>
                    <input
                      value={formData.description}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      placeholder="When this template is used"
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-1.5 block">Subject *</label>
                      <input
                        value={formData.subject}
                        onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Email subject line"
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 mb-1.5 block">From Name</label>
                      <input
                        value={formData.from_name}
                        onChange={e => setFormData(f => ({ ...f, from_name: e.target.value }))}
                        placeholder="Girls Glowing Up"
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-1.5 block">Variables (JSON array)</label>
                    <input
                      value={formData.variables}
                      onChange={e => setFormData(f => ({ ...f, variables: e.target.value }))}
                      placeholder='["user_name", "total_points"]'
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none bg-white/5 border border-white/10 font-mono"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">List variable names that can be used in the template</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-400">Email Body (HTML supported) *</label>
                      <button 
                        onClick={() => setPreviewMode(true)}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <Eye size={12} /> Preview
                      </button>
                    </div>
                    <textarea
                      value={formData.body_template}
                      onChange={e => setFormData(f => ({ ...f, body_template: e.target.value }))}
                      placeholder="Email content with {{variables}}"
                      rows={12}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none bg-white/5 border border-white/10 resize-none font-mono"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {JSON.parse(formData.variables || '[]').map(v => (
                        <button 
                          key={v} 
                          onClick={() => handleCopyVariable(v)}
                          className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition flex items-center gap-1"
                        >
                          {copied ? <Check size={10} /> : <Copy size={10} />} {'{{'}{v}{'}}'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={e => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-300">Template is active and can be used</label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!previewMode && (
              <div className="p-4 border-t flex items-center justify-end gap-3 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 rounded-full text-sm font-semibold text-gray-400 hover:text-white transition">
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  <Save size={16} /> {editing ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}