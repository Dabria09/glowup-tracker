import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, ExternalLink, Upload, FileText, ChevronRight, Briefcase, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['Wishlist', 'Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Rejected', 'Withdrawn'];

const STATUS_STYLE = {
  Wishlist:      { bg: 'rgba(107,114,128,0.2)',  border: 'rgba(107,114,128,0.4)',  color: '#9ca3af',  emoji: '⭐' },
  Applied:       { bg: 'rgba(59,130,246,0.2)',   border: 'rgba(59,130,246,0.4)',   color: '#60a5fa',  emoji: '📤' },
  'Phone Screen':{ bg: 'rgba(168,85,247,0.2)',   border: 'rgba(168,85,247,0.4)',   color: '#c084fc',  emoji: '📞' },
  Interview:     { bg: 'rgba(234,179,8,0.2)',    border: 'rgba(234,179,8,0.4)',    color: '#fde047',  emoji: '🎤' },
  'Final Round': { bg: 'rgba(249,115,22,0.2)',   border: 'rgba(249,115,22,0.4)',   color: '#fb923c',  emoji: '🏆' },
  Offer:         { bg: 'rgba(34,197,94,0.2)',    border: 'rgba(34,197,94,0.4)',    color: '#4ade80',  emoji: '🎉' },
  Rejected:      { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',    color: '#f87171',  emoji: '❌' },
  Withdrawn:     { bg: 'rgba(75,85,99,0.2)',     border: 'rgba(75,85,99,0.4)',     color: '#6b7280',  emoji: '🚪' },
};

const EMPTY_FORM = {
  company: '', role: '', status: 'Wishlist', applied_date: '', deadline: '',
  job_url: '', notes: '', resume_text: '', salary_range: '', contact_name: '', contact_email: '',
};

export default function JobTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // board | resume
  const [resumeTab, setResumeTab] = useState('paste'); // paste | upload
  const [uploading, setUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingResume, setEditingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [savedFiles, setSavedFiles] = useState([]);

  // Load globally saved resume files from ResumeBuilder
  useEffect(() => {
    try {
      const files = JSON.parse(localStorage.getItem('ggu_resume_files') || '[]');
      setSavedFiles(files);
    } catch {}
  }, []);

  const attachSavedFile = async (app, fileUrl) => {
    const updated = await base44.entities.JobApplication.update(app.id, { resume_url: fileUrl });
    setApplications(prev => prev.map(a => a.id === app.id ? updated : a));
    if (selected?.id === app.id) setSelected(updated);
    toast.success('Resume attached!');
  };

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const apps = await base44.entities.JobApplication.filter({ user_email: u.email }, '-created_date');
      setApplications(apps);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const save = async () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);
    const data = { ...form, user_email: user.email };
    if (selected) {
      const updated = await base44.entities.JobApplication.update(selected.id, data);
      setApplications(prev => prev.map(a => a.id === selected.id ? updated : a));
      setSelected(updated);
      toast.success('Application updated!');
    } else {
      const created = await base44.entities.JobApplication.create(data);
      setApplications(prev => [created, ...prev]);
      toast.success('Application added! 🎯');
    }
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  const deleteApp = async (id) => {
    await base44.entities.JobApplication.delete(id);
    setApplications(prev => prev.filter(a => a.id !== id));
    setSelected(null);
    toast.success('Removed');
  };

  const updateStatus = async (app, status) => {
    const updated = await base44.entities.JobApplication.update(app.id, { status });
    setApplications(prev => prev.map(a => a.id === app.id ? updated : a));
    if (selected?.id === app.id) setSelected(updated);
  };

  const saveResume = async (appId, text) => {
    const updated = await base44.entities.JobApplication.update(appId, { resume_text: text });
    setApplications(prev => prev.map(a => a.id === appId ? updated : a));
    setSelected(updated);
    setEditingResume(false);
    toast.success('Resume saved!');
  };

  const handleFileUpload = async (e, appId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updated = await base44.entities.JobApplication.update(appId, { resume_url: file_url });
    setApplications(prev => prev.map(a => a.id === appId ? updated : a));
    setSelected(updated);
    setUploading(false);
    toast.success('Resume uploaded!');
  };

  const openEdit = (app) => {
    setForm({ ...EMPTY_FORM, ...app });
    setSelected(app);
    setShowForm(true);
  };

  const filtered = filterStatus === 'All' ? applications : applications.filter(a => a.status === filterStatus);

  // Stats
  const stats = STATUSES.reduce((acc, s) => { acc[s] = applications.filter(a => a.status === s).length; return acc; }, {});
  const activeCount = applications.filter(a => !['Rejected', 'Withdrawn', 'Offer'].includes(a.status)).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/careers')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">💼 Job Tracker</h1>
            <p className="text-xs text-gray-400">{applications.length} applications · {activeCount} active</p>
          </div>
          <button onClick={() => { setForm(EMPTY_FORM); setSelected(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['board', 'resume'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition capitalize"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.07)', color: '#9ca3af' }}>
              {tab === 'board' ? '📋 Application Board' : '📄 My Resume'}
            </button>
          ))}
        </div>

        {/* ── BOARD TAB ── */}
        {activeTab === 'board' && (
          <div>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Active', count: activeCount, color: '#a855f7' },
                { label: 'Interviews', count: (stats['Phone Screen'] || 0) + (stats['Interview'] || 0) + (stats['Final Round'] || 0), color: '#fde047' },
                { label: 'Offers', count: stats['Offer'] || 0, color: '#4ade80' },
                { label: 'Total', count: applications.length, color: '#60a5fa' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Status Pipeline */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {['All', ...STATUSES].map(s => {
                const count = s === 'All' ? applications.length : (stats[s] || 0);
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                    style={filterStatus === s
                      ? { background: 'rgba(168,85,247,0.35)', border: '1px solid rgba(168,85,247,0.6)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    {s !== 'All' && STATUS_STYLE[s]?.emoji} {s} {count > 0 && <span className="opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Application Cards */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">💼</p>
                <p className="text-gray-400 text-sm mb-1">No applications yet</p>
                <p className="text-gray-600 text-xs">Tap + Add to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(app => {
                  const s = STATUS_STYLE[app.status] || STATUS_STYLE.Wishlist;
                  return (
                    <button key={app.id} onClick={() => setSelected(app)}
                      className="w-full text-left rounded-2xl px-4 py-4 transition hover:opacity-90"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white">{app.role}</p>
                          <p className="text-xs text-gray-400 mb-2">{app.company}{app.salary_range ? ` · ${app.salary_range}` : ''}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                              {s.emoji} {app.status}
                            </span>
                            {app.applied_date && <span className="text-[10px] text-gray-500">Applied {app.applied_date}</span>}
                            {app.deadline && <span className="text-[10px] text-gray-500">Due {app.deadline}</span>}
                            {app.resume_text || app.resume_url ? <span className="text-[10px] text-green-400">📄 Resume attached</span> : null}
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-gray-500 mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RESUME TAB ── */}
        {activeTab === 'resume' && (
          <div>
            <p className="text-sm text-gray-400 mb-4">Upload or paste your resume — then attach it to any application.</p>

            {/* Saved resume files from Resume Builder */}
            {savedFiles.length > 0 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">📎 Saved from Resume Builder</p>
                <div className="space-y-2">
                  {savedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <FileText size={13} className="text-purple-400 flex-shrink-0" />
                      <p className="text-xs text-white flex-1 truncate">{f.name}</p>
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-400"><ExternalLink size={12} /></a>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Attach these to individual applications below ↓</p>
              </div>
            )}

            {applications.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                <p className="text-3xl mb-2">📄</p>
                <p className="text-sm text-gray-400">Add an application first to attach a resume</p>
                <button onClick={() => { setForm(EMPTY_FORM); setSelected(null); setShowForm(true); setActiveTab('board'); }}
                  className="mt-3 px-4 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  + Add Application
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm text-white">{app.role}</p>
                        <p className="text-xs text-gray-400">{app.company}</p>
                      </div>
                      {(app.resume_text || app.resume_url) && (
                        <span className="text-xs text-green-400 font-semibold">✅ Resume on file</span>
                      )}
                    </div>

                    {/* Tabs: Paste or Upload */}
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setResumeTab('paste')}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold transition"
                        style={resumeTab === 'paste' ? { background: 'rgba(168,85,247,0.3)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                        📋 Paste Resume
                      </button>
                      <button onClick={() => setResumeTab('upload')}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold transition"
                        style={resumeTab === 'upload' ? { background: 'rgba(168,85,247,0.3)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                        ☁️ Upload File
                      </button>
                    </div>

                    {resumeTab === 'paste' && (
                      <div>
                        <textarea
                          defaultValue={app.resume_text || ''}
                          id={`resume-text-${app.id}`}
                          placeholder="Paste your resume content here..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none resize-none"
                          rows={6}
                        />
                        <button onClick={() => {
                          const text = document.getElementById(`resume-text-${app.id}`)?.value || '';
                          saveResume(app.id, text);
                        }}
                          className="mt-2 w-full py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                          Save Resume
                        </button>
                      </div>
                    )}

                    {resumeTab === 'upload' && (
                      <div>
                        {savedFiles.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Attach from Resume Builder</p>
                            <div className="space-y-1.5">
                              {savedFiles.map((f, i) => (
                                <button key={i} onClick={() => attachSavedFile(app, f.url)}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition hover:opacity-80"
                                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
                                  <Paperclip size={12} className="text-purple-400 flex-shrink-0" />
                                  <span className="text-xs text-white truncate flex-1">{f.name}</span>
                                  <span className="text-[10px] text-purple-400 font-semibold">Attach</span>
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-white/10 my-3" />
                          </div>
                        )}
                        {app.resume_url ? (
                          <div className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <FileText size={16} className="text-green-400" />
                            <p className="text-xs text-green-300 flex-1">Resume uploaded</p>
                            <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 flex items-center gap-1">
                              View <ExternalLink size={10} />
                            </a>
                          </div>
                        ) : null}
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition hover:opacity-80"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.15)' }}>
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">{uploading ? 'Uploading...' : 'Click to upload PDF or DOC'}</span>
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx"
                            onChange={e => handleFileUpload(e, app.id)} disabled={uploading} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selected && !showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <button onClick={() => setSelected(null)} className="text-gray-400"><X size={20} /></button>
              <div className="flex gap-2">
                <button onClick={() => openEdit(selected)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
                  Edit
                </button>
                <button onClick={() => deleteApp(selected.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-red-400"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  Delete
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8">
              {/* Title */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">{selected.role}</h2>
                <p className="text-gray-400 text-sm">{selected.company}{selected.salary_range ? ` · ${selected.salary_range}` : ''}</p>
                {selected.job_url && (
                  <a href={selected.job_url} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                    View Job Posting <ExternalLink size={10} />
                  </a>
                )}
              </div>

              {/* Status updater */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => {
                    const style = STATUS_STYLE[s];
                    return (
                      <button key={s} onClick={() => updateStatus(selected, s)}
                        className="text-xs px-3 py-1.5 rounded-full font-semibold transition"
                        style={selected.status === s
                          ? { background: style.bg, border: `2px solid ${style.color}`, color: style.color }
                          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}>
                        {style.emoji} {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {selected.applied_date && <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}><p className="text-[10px] text-gray-500 mb-0.5">Applied</p><p className="text-xs text-white font-semibold">{selected.applied_date}</p></div>}
                {selected.deadline && <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}><p className="text-[10px] text-gray-500 mb-0.5">Deadline</p><p className="text-xs text-white font-semibold">{selected.deadline}</p></div>}
                {selected.contact_name && <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}><p className="text-[10px] text-gray-500 mb-0.5">Contact</p><p className="text-xs text-white font-semibold">{selected.contact_name}</p></div>}
                {selected.contact_email && <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}><p className="text-[10px] text-gray-500 mb-0.5">Contact Email</p><p className="text-xs text-white font-semibold">{selected.contact_email}</p></div>}
              </div>

              {selected.notes && (
                <div className="mb-5 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-gray-500 mb-1">Notes</p>
                  <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* Resume preview */}
              {selected.resume_text && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resume</p>
                  <div className="rounded-xl p-3 max-h-40 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">{selected.resume_text}</p>
                  </div>
                </div>
              )}
              {selected.resume_url && (
                <a href={selected.resume_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-300 mb-4"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <FileText size={15} /> View Uploaded Resume <ExternalLink size={12} className="ml-auto" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="text-base font-bold text-white">{selected ? 'Edit Application' : '➕ New Application'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-3">
              {[
                { label: 'Company Name *', key: 'company', placeholder: 'e.g., Google' },
                { label: 'Job Title / Role *', key: 'role', placeholder: 'e.g., Software Engineer Intern' },
                { label: 'Job Posting URL', key: 'job_url', placeholder: 'https://...' },
                { label: 'Salary Range', key: 'salary_range', placeholder: 'e.g., $60K – $80K' },
                { label: 'Date Applied', key: 'applied_date', placeholder: 'e.g., 2026-05-01', type: 'date' },
                { label: 'Deadline', key: 'deadline', placeholder: 'e.g., 2026-06-01', type: 'date' },
                { label: 'Recruiter / Contact', key: 'contact_name', placeholder: 'Name' },
                { label: 'Contact Email', key: 'contact_email', placeholder: 'recruiter@company.com' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{field.label}</label>
                  <input type={field.type || 'text'} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none" />
                </div>
              ))}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold transition"
                      style={form.status === s
                        ? { background: STATUS_STYLE[s].bg, border: `1.5px solid ${STATUS_STYLE[s].color}`, color: STATUS_STYLE[s].color }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}>
                      {STATUS_STYLE[s].emoji} {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Interview prep, next steps, anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none resize-none min-h-20" />
              </div>
            </div>
            <div className="px-4 pt-4 border-t border-white/10 flex-shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }}>
              <button onClick={save} disabled={!form.company.trim() || !form.role.trim() || saving}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {saving ? 'Saving...' : selected ? 'Save Changes ✓' : 'Save Application 💼'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}