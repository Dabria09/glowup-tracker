import { useState, useEffect } from 'react';
import { Plus, X, Download, Save, Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const EMPTY_EXP = { company: '', title: '', start: '', end: '', bullets: '' };
const EMPTY_EDU = { school: '', degree: '', year: '' };
const STORAGE_KEY = 'ggu_resume_v1';
const FILES_KEY = 'ggu_resume_files';

function loadFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY) || '[]'); } catch { return []; }
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

export default function ResumeBuilder() {
  const [info, setInfo] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', website: '' });
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState([{ ...EMPTY_EXP }]);
  const [education, setEducation] = useState([{ ...EMPTY_EDU }]);
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = load();
    if (stored) {
      setInfo(stored.info || { name: '', email: '', phone: '', location: '', linkedin: '', website: '' });
      setSummary(stored.summary || '');
      setExperiences(stored.experiences?.length ? stored.experiences : [{ ...EMPTY_EXP }]);
      setEducation(stored.education?.length ? stored.education : [{ ...EMPTY_EDU }]);
      setSkills(stored.skills || '');
      setCertifications(stored.certifications || '');
    }
    setUploadedFiles(loadFiles());
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newFile = { name: file.name, url: file_url, date: new Date().toLocaleDateString() };
    const updated = [...uploadedFiles, newFile];
    setUploadedFiles(updated);
    localStorage.setItem(FILES_KEY, JSON.stringify(updated));
    setUploading(false);
    toast.success('Resume uploaded! 📄');
    e.target.value = '';
  };

  const removeFile = (idx) => {
    const updated = uploadedFiles.filter((_, i) => i !== idx);
    setUploadedFiles(updated);
    localStorage.setItem(FILES_KEY, JSON.stringify(updated));
    toast.success('Removed');
  };

  const saveResume = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ info, summary, experiences, education, skills, certifications }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success('Resume saved!');
  };

  const exportText = () => {
    const lines = [];
    if (info.name) lines.push(info.name.toUpperCase(), '');
    const contact = [info.email, info.phone, info.location, info.linkedin, info.website].filter(Boolean).join(' | ');
    if (contact) lines.push(contact, '');
    if (summary) { lines.push('PROFESSIONAL SUMMARY', '─'.repeat(40), summary, ''); }
    if (experiences.some(e => e.company || e.title)) {
      lines.push('EXPERIENCE', '─'.repeat(40));
      experiences.forEach(e => {
        if (!e.company && !e.title) return;
        lines.push(`${e.title} — ${e.company}`, `${e.start}${e.end ? ' – ' + e.end : ' – Present'}`);
        if (e.bullets) e.bullets.split('\n').forEach(b => b.trim() && lines.push(`• ${b.trim()}`));
        lines.push('');
      });
    }
    if (education.some(e => e.school || e.degree)) {
      lines.push('EDUCATION', '─'.repeat(40));
      education.forEach(e => {
        if (!e.school) return;
        lines.push(`${e.degree}${e.school ? ' — ' + e.school : ''}${e.year ? ' (' + e.year + ')' : ''}`);
      });
      lines.push('');
    }
    if (skills) { lines.push('SKILLS', '─'.repeat(40), skills, ''); }
    if (certifications) { lines.push('CERTIFICATIONS', '─'.repeat(40), certifications, ''); }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${info.name || 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  const updateExp = (i, key, val) => setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  const addExp = () => setExperiences(prev => [...prev, { ...EMPTY_EXP }]);
  const removeExp = (i) => setExperiences(prev => prev.filter((_, idx) => idx !== i));
  const updateEdu = (i, key, val) => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  const addEdu = () => setEducation(prev => [...prev, { ...EMPTY_EDU }]);
  const removeEdu = (i) => setEducation(prev => prev.filter((_, idx) => idx !== i));

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none";

  return (
    <div className="pb-4">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={saveResume}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: saved ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
          <Save size={14} /> {saved ? 'Saved!' : 'Save Draft'}
        </button>
        <button onClick={exportText}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          <Download size={14} /> Export .txt
        </button>
      </div>

      {/* Personal Info */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-white mb-3">👤 Personal Info</p>
        <div className="space-y-2">
          <input value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className={inputCls} />
          <input value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} placeholder="Email *" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className={inputCls} />
            <input value={info.location} onChange={e => setInfo(p => ({ ...p, location: e.target.value }))} placeholder="City, State" className={inputCls} />
            <input value={info.linkedin} onChange={e => setInfo(p => ({ ...p, linkedin: e.target.value }))} placeholder="LinkedIn URL" className={inputCls} />
            <input value={info.website} onChange={e => setInfo(p => ({ ...p, website: e.target.value }))} placeholder="Portfolio" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-white mb-3">📝 Professional Summary</p>
        <textarea value={summary} onChange={e => setSummary(e.target.value)}
          placeholder="2–3 sentences about your background, skills, and career goals..."
          className={`${inputCls} resize-none`} rows={3} />
      </div>

      {/* Experience */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">💼 Work Experience</p>
          <button onClick={addExp} className="flex items-center gap-1 text-xs text-purple-400 font-semibold"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <div key={i} className="relative">
              {experiences.length > 1 && (
                <button onClick={() => removeExp(i)} className="absolute -top-1 right-0 text-gray-500 hover:text-red-400"><X size={14} /></button>
              )}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Job Title" className={inputCls} />
                <input value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Company" className={inputCls} />
                <input value={exp.start} onChange={e => updateExp(i, 'start', e.target.value)} placeholder="Start (e.g. Jan 2023)" className={inputCls} />
                <input value={exp.end} onChange={e => updateExp(i, 'end', e.target.value)} placeholder="End (blank = Present)" className={inputCls} />
              </div>
              <textarea value={exp.bullets} onChange={e => updateExp(i, 'bullets', e.target.value)}
                placeholder={"Achievements (one per line):\nManaged team of 5\nIncreased sales by 20%"}
                className={`${inputCls} resize-none`} rows={3} />
              {i < experiences.length - 1 && <div className="border-t border-white/10 mt-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">🎓 Education</p>
          <button onClick={addEdu} className="flex items-center gap-1 text-xs text-purple-400 font-semibold"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-3">
          {education.map((edu, i) => (
            <div key={i} className="relative">
              {education.length > 1 && (
                <button onClick={() => removeEdu(i)} className="absolute -top-1 right-0 text-gray-500 hover:text-red-400"><X size={14} /></button>
              )}
              <div className="space-y-2">
                <input value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} placeholder="School / University" className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="Degree / Major" className={inputCls} />
                  <input value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} placeholder="Grad Year" className={inputCls} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-white mb-3">⚡ Skills</p>
        <textarea value={skills} onChange={e => setSkills(e.target.value)}
          placeholder="List your skills, separated by commas or new lines..."
          className={`${inputCls} resize-none`} rows={3} />
      </div>

      {/* Certifications */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-white mb-3">🏅 Certifications</p>
        <textarea value={certifications} onChange={e => setCertifications(e.target.value)}
          placeholder="e.g. Google Analytics Certified, Dean's List 2024..."
          className={`${inputCls} resize-none`} rows={2} />
      </div>

      {/* Upload Resume File */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-white mb-1">📎 Upload Resume Files</p>
        <p className="text-xs text-gray-500 mb-3">Upload your existing resume (PDF or DOC) — accessible from your Job Tracker</p>
        <label className="flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition hover:opacity-80 mb-3"
          style={{ background: 'rgba(168,85,247,0.08)', border: '2px dashed rgba(168,85,247,0.3)' }}>
          <Upload size={20} className="text-purple-400 mb-1" />
          <span className="text-xs text-purple-300 font-semibold">{uploading ? 'Uploading...' : 'Click to upload PDF or DOC'}</span>
          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} />
        </label>
        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <FileText size={14} className="text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-semibold truncate">{f.name}</p>
                  <p className="text-[10px] text-gray-500">Uploaded {f.date}</p>
                </div>
                <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                  <ExternalLink size={13} />
                </a>
                <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 text-center">No files uploaded yet</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-600 mt-2">Resume data is saved on this device 🔒</p>
    </div>
  );
}