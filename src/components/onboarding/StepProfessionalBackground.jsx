import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const EXPERTISE_AREAS = [
  'Career Development',
  'Financial Literacy',
  'College Prep and Applications',
  'Entrepreneurship and Business',
  'Mental Wellness and Confidence',
  'STEM and Technology',
  'Arts and Creative Industries',
  'Athletics and Sports',
  'Social Media and Content Creation',
  'Fashion and Beauty Industry',
  'Health and Fitness',
  'Community Leadership and Civic Engagement',
  'Relationships and Communication',
  'Life Skills and Independence',
  'Faith and Spirituality (optional)',
  'Other'
];
const AGE_GROUPS = ['Glow Girls 5–12', 'Glow Teens 13–18', 'Glow Women 19–26'];
const MENTEE_COUNTS = ['1', '2', '3', '4', '5+'];
const HOURS_PER_MONTH = ['2–4 hrs', '5–8 hrs', '9–12 hrs', '12+ hrs'];
const EDUCATION_LEVELS = ['Some high school', 'High school diploma or GED', 'Some college', "Associate degree", "Bachelor's degree", "Master's degree", 'Doctoral or professional degree'];

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
  const [employer, setEmployer] = useState(data.employer || "");
  const [education, setEducation] = useState(data.education || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(data.fieldOfStudy || "");
  const [experienceYears, setExperienceYears] = useState(data.experienceYears || "");
  const [workedWithYouth, setWorkedWithYouth] = useState(data.workedWithYouth || "");
  const [youthExperienceDesc, setYouthExperienceDesc] = useState(data.youthExperienceDesc || "");
  const [expertiseAreas, setExpertiseAreas] = useState(data.expertiseAreas || []);
  const [otherExpertise, setOtherExpertise] = useState(data.otherExpertise || "");
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
    update({ occupation, employer, education, fieldOfStudy, experienceYears, workedWithYouth, youthExperienceDesc, expertiseAreas, otherExpertise, ageGroups, menteeCount, hoursPerMonth });
    setError("");
    onNext();
  };

  return (
    <div className="mt-5 space-y-5">
      <Field label="Current Occupation *">
        <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
          className="field-input" style={fieldStyle} />
      </Field>
      
      <Field label="Employer or School Name (optional)">
        <input value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g., Google, Lincoln High School"
          className="field-input" style={fieldStyle} />
      </Field>
      
      <Field label="Highest Level of Education Completed *">
        <select value={education} onChange={e => setEducation(e.target.value)} className="field-input" style={fieldStyle}>
          <option value="">Select...</option>
          {EDUCATION_LEVELS.map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      
      <Field label="Field of Study or Industry">
        <input value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="e.g., Computer Science, Education, Healthcare"
          className="field-input" style={fieldStyle} />
      </Field>
      
      <Field label="Years of Experience in Your Field">
        <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g., 5" min="0" max="50"
          className="field-input" style={fieldStyle} />
      </Field>
      
      <Field label="Have You Worked with Youth Before? *">
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => setWorkedWithYouth('yes')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${workedWithYouth === 'yes' ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWorkedWithYouth('no')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${workedWithYouth === 'no' ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
          >
            No
          </button>
        </div>
      </Field>
      
      {workedWithYouth === 'yes' && (
        <Field label="Briefly Describe Your Youth Experience">
          <textarea 
            value={youthExperienceDesc} 
            onChange={e => setYouthExperienceDesc(e.target.value)} 
            placeholder="e.g., I volunteered as a high school tutor for 3 years, working with students ages 14-18 in math and science..."
            rows={3}
            className="field-input resize-none" 
            style={fieldStyle} 
          />
        </Field>
      )}
      
      <Field label="Areas of Expertise (select all that apply) *">
        <div className="flex flex-wrap gap-2 mt-1">
          {EXPERTISE_AREAS.map(area => (
            <button 
              key={area} 
              type="button" 
              onClick={() => toggleMulti(area, expertiseAreas, setExpertiseAreas)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${expertiseAreas.includes(area) ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
            >
              {area}
            </button>
          ))}
        </div>
        {expertiseAreas.includes('Other') && (
          <input
            value={otherExpertise}
            onChange={e => setOtherExpertise(e.target.value)}
            placeholder="Please describe your expertise..."
            className="field-input mt-2"
            style={fieldStyle}
          />
        )}
      </Field>
      
      <Field label="Age Groups You Want to Mentor (select all that apply) *">
        <div className="flex flex-wrap gap-2 mt-1">
          {AGE_GROUPS.map(group => (
            <button 
              key={group} 
              type="button" 
              onClick={() => toggleMulti(group, ageGroups, setAgeGroups)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${ageGroups.includes(group) ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
            >
              {group}
            </button>
          ))}
        </div>
      </Field>
      
      <div className="grid grid-cols-2 gap-3">
        <Field label="Max Mentees">
          <select value={menteeCount} onChange={e => setMenteeCount(e.target.value)} className="field-input" style={fieldStyle}>
            <option value="">Select...</option>
            {MENTEE_COUNTS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        
        <Field label="Hours/Month">
          <select value={hoursPerMonth} onChange={e => setHoursPerMonth(e.target.value)} className="field-input" style={fieldStyle}>
            <option value="">Select...</option>
            {HOURS_PER_MONTH.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 transition hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ← Back
          </button>
        )}
        <button onClick={handleContinue} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}