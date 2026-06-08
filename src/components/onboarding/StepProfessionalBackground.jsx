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
const MENTORING_TYPES = ['One-on-One Mentoring', 'Group Mentoring', 'Peer Mentoring', 'Career Shadowing'];
const AVAILABILITY_TIMES = ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings'];
const SESSION_TYPES = ['Virtual (Video Call)', 'In-Person', 'Both Virtual and In-Person'];

const fieldStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' };

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

export default function StepProfessionalBackground({ data, update, onNext, onBack, setError = () => {} }) {
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
  const [mentoringType, setMentoringType] = useState(data.mentoringType || "");
  const [menteeCount, setMenteeCount] = useState(data.menteeCount || "");
  const [hoursPerMonth, setHoursPerMonth] = useState(data.hoursPerMonth || "");
  const [availability, setAvailability] = useState(data.availability || []);
  const [sessionType, setSessionType] = useState(data.sessionType || "");

  const toggleMulti = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleContinue = () => {
    if (!occupation || !education || !expertiseAreas.length || !ageGroups.length || !mentoringType || !menteeCount || !hoursPerMonth || !availability.length || !sessionType) {
      alert("Please complete all required fields");
      return;
    }
    // Save data
    update({ 
      occupation, 
      employer, 
      education, 
      fieldOfStudy, 
      experienceYears, 
      workedWithYouth, 
      youthExperienceDesc, 
      expertiseAreas, 
      otherExpertise, 
      ageGroups, 
      mentoringType,
      menteeCount, 
      hoursPerMonth,
      availability,
      sessionType
    });
    setError("");
    onNext();
  };

  return (
    <div className="mt-5 space-y-5">
      {/* Professional Background Section */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-3">Professional Background</h3>
        
        <Field label="Current Occupation *">
          <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
            className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none" style={fieldStyle} />
        </Field>
        
        <Field label="Employer or School Name (optional)">
          <input value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g., Google, Lincoln High School"
            className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2" style={fieldStyle} />
        </Field>
        
        <Field label="Highest Level of Education Completed *">
          <select value={education} onChange={e => setEducation(e.target.value)} className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2" style={fieldStyle}>
            <option value="">Select...</option>
            {['Some high school', 'High school diploma or GED', 'Some college', 'Associate degree', "Bachelor's degree", "Master's degree", 'Doctoral or professional degree'].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        
        <Field label="Field of Study or Industry">
          <input value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="e.g., Computer Science, Education, Healthcare"
            className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2" style={fieldStyle} />
        </Field>
        
        <Field label="Years of Experience in Your Field">
          <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="e.g., 5" min="0" max="50"
            className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2" style={fieldStyle} />
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
              className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2 resize-none" 
              style={fieldStyle} 
            />
          </Field>
        )}
      </div>

      {/* Expertise Section */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-3">Your Expertise</h3>
        
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
              className="field-input w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none mt-2"
              style={fieldStyle}
            />
          )}
        </Field>
      </div>

      {/* Mentoring Preferences Section */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-3">Mentoring Preferences</h3>

        <Field label="Which age group do you want to mentor? (select all that apply) *">
          <div className="flex flex-wrap gap-2 mt-1">
            {AGE_GROUPS.map(group => (
              <button 
                key={group} 
                type="button" 
                onClick={() => toggleMulti(group, ageGroups, setAgeGroups)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${ageGroups.includes(group) ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {group}
              </button>
            ))}
          </div>
        </Field>

        <Field label="What type of mentoring do you prefer? *">
          <div className="flex flex-wrap gap-2 mt-1">
            {MENTORING_TYPES.map(type => (
              <button 
                key={type} 
                type="button" 
                onClick={() => setMentoringType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${mentoringType === type ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </Field>

        <Field label="How many active mentees can you commit to at one time? *">
          <div className="flex gap-2 mt-1">
            {MENTEE_COUNTS.map(count => (
              <button 
                key={count} 
                type="button" 
                onClick={() => setMenteeCount(count)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${menteeCount === count ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {count}
              </button>
            ))}
          </div>
        </Field>

        <Field label="How many hours per month can you commit? *">
          <div className="flex flex-wrap gap-2 mt-1">
            {HOURS_PER_MONTH.map(hours => (
              <button 
                key={hours} 
                type="button" 
                onClick={() => setHoursPerMonth(hours)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${hoursPerMonth === hours ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {hours}
              </button>
            ))}
          </div>
        </Field>

        <Field label="What days and times are you generally available? (select all that apply) *">
          <div className="grid grid-cols-2 gap-2 mt-1">
            {AVAILABILITY_TIMES.map(time => (
              <button 
                key={time} 
                type="button" 
                onClick={() => toggleMulti(time, availability, setAvailability)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition ${availability.includes(time) ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Do you prefer virtual sessions, in-person, or both? *">
          <div className="flex gap-3 mt-1">
            {SESSION_TYPES.map(type => (
              <button 
                key={type} 
                type="button" 
                onClick={() => setSessionType(type)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${sessionType === type ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'}`}
              >
                {type}
              </button>
            ))}
          </div>
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