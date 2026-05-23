import { useState } from 'react';
import { X, Upload, Link as LinkIcon, FileText, Video, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const RESOURCE_TYPES = [
  { id: 'link', label: 'Link', icon: LinkIcon },
  { id: 'file', label: 'File', icon: FileText },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'document', label: 'Document', icon: BookOpen },
  { id: 'assignment', label: 'Assignment', icon: FileText },
];

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Skill Building'];

export default function ResourceSharer({ isOpen, onClose, user, menteeEmail, onShared }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'link',
    url: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    if (!file) return null;
    
    try {
      setUploading(true);
      const response = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);
      return response.file_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.url) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      let url = formData.url;
      
      if (file && formData.resource_type === 'file') {
        url = await uploadFile();
        if (!url) {
          alert('File upload failed');
          setLoading(false);
          return;
        }
      }

      await base44.entities.MentorshipResource.create({
        mentor_email: user.email,
        mentee_email: menteeEmail,
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        url: url,
        category: formData.category,
        shared_date: new Date().toISOString(),
      });

      onShared();
      onClose();
    } catch (error) {
      console.error('Error sharing resource:', error);
      alert('Error sharing resource');
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
            <BookOpen size={20} className="text-blue-400" />
            Share Resource
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Resource Type</label>
            <div className="grid grid-cols-3 gap-2">
              {RESOURCE_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setFormData({...formData, resource_type: type.id})}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition ${
                      formData.resource_type === type.id
                        ? 'text-white'
                        : 'text-gray-400 bg-gray-800'
                    }`}
                    style={formData.resource_type === type.id ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' } : {}}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={2}
            />
          </div>

          {formData.resource_type === 'file' ? (
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Upload File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              {uploading && <p className="text-xs text-blue-400 mt-2">Uploading...</p>}
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">URL *</label>
              <input
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Category</label>
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

          <button
            onClick={handleSubmit}
            disabled={loading || uploading || !formData.title || (!formData.url && formData.resource_type !== 'file')}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            {loading ? 'Sharing...' : 'Share Resource'}
          </button>
        </div>
      </div>
    </div>
  );
}