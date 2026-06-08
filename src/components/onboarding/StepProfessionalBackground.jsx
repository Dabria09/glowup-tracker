import { useState } from 'react';

const EXPERTISE_AREAS = ['Career Development', 'Financial Literacy', 'College Prep', 'Mental Wellness', 'Entrepreneurship', 'STEM', 'Arts & Creative', 'Athletics', 'Life Skills', 'Other'];
const AGE_GROUPS = ['Glow Girls 5–12', 'Glow Teens 13–18', 'Glow Women 19–26'];
const MENTEE_COUNTS = ['1', '2', '3', '4', '5+'];
const HOURS_PER_MONTH = ['2–4 hrs', '5–8 hrs', '9–12 hrs', '12+ hrs'];

const fieldStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' };

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

export default function StepProfessionalBackground({ data, update, onNext, onBack, setError }) {
  const [occupation, setOccupation] = useState(data.occupation || "");
  const [education, setEducation] = useState(data.education || "");
  const [expertiseAreas, setExpertiseAreas] = useState(data.expertiseAreas || []);
  const [ageGroups, setAgeGroups] = useState(data.ageGroups || []);
  const [menteeCount, setMenteeCount] = useState(data.menteeCount || "");
  const [hoursPerMonth, setHoursPerMonth] = useState(data.hoursPerMonth || "");

  const toggleMulti = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleContinue = () => {
    if (!occupation || !education || !expertiseAreas.length || !ageGroups.length) {
      setError("Please complete all required fields");
      return;
    }
    // Save data
    update({ occupation, education, expertiseAreas, ageGroups, menteeCount, hoursPerMonth });
    setError("");
    onNext();
  };

  return (
    <div className="mt-5 space-y-5">
      <Field label="Current Occupation *">
        <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
          className="field-input" style={fieldStyle} />
      </Field>
      <Field label="Highest Level of Education *">
        <select value={education} onChange={e => setEducation(e.target.value)} className="field-input" style={fieldStyle}>
          <option value="">Select...</option>
          {['High School Diploma', 'Some College', "Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctoral Degree", 'Trade/Vocational Certificate', 'Other'].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Areas of Expertise (select all that apply) *">
        <div className="flex flex-wrap gap-2 mt-1">
          {EXPERTISE_AREAS.map(area => (
            <button key={area} type="button" onClick={() => toggleMulti(area, expertiseAreas, setExpertiseAreas)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={expertiseAreas.includes(area) ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              {area}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Age Group You Want to Mentor *">
        <div className="flex flex-wrap gap-2 mt-1">
          {AGE_GROUPS.map(ag => (
            <button key={ag} type="button" onClick={() => toggleMulti(ag, ageGroups, setAgeGroups)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={ageGroups.includes(ag) ? { background: 'linear-gradient(135deg, #a855f7, #e8526d)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              {ag}
            </button>
          ))}
        </div>
      </Field>
      <Field label="How many mentees can you commit to at one time?">
        <div className="flex gap-2 mt-1">
          {MENTEE_COUNTS.map(c => (
            <button key={c} type="button" onClick={() => setMenteeCount(c)}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition"
              style={menteeCount === c ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Hours per month you can commit?">
        <div className="flex flex-wrap gap-2 mt-1">
          {HOURS_PER_MONTH.map(h => (
            <button key={h} type="button" onClick={() => setHoursPerMonth(h)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition"
              style={hoursPerMonth === h ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
              {h}
            </button>
          ))}
        </div>
      </Field>
      <div className="flex gap-3 pt-2">
        {onBack && (
          <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 transition hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ← Back
          </button>
        )}
        <button onClick={handleContinue} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
          Continue
        </button>
      </div>
    </div>
  );
}