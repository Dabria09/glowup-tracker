import { useState, useRef } from 'react';
import { Upload, Camera } from 'lucide-react';

const fieldStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' };

export default function StepWhoYouAre({ data, update, onNext, onBack }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    if (!data.preferredName || !data.bio || !data.schoolOrWorkplace || !data.languages) {
      alert('Please complete all required fields');
      return;
    }
    onNext({ photoFile });
  };

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">👋</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Who You Are</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Help mentees get to know the real you
        </p>
      </div>

      {/* Profile Photo Upload */}
      <div className="w-full">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Profile Photo *</label>
        <div className="flex items-center gap-4">
          {photoPreview && (
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-500/50">
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="profile-photo-upload"
            />
            <label
              htmlFor="profile-photo-upload"
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px dashed ${photoFile ? '#e8526d' : 'rgba(255,255,255,0.2)'}` }}
            >
              <Camera size={18} className="text-gray-400" />
              <span className="text-sm text-gray-300">{photoFile ? photoFile.name : 'Upload a friendly photo'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="w-full space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferred Name *</label>
          <input
            value={data.preferredName || ''}
            onChange={e => update({ preferredName: e.target.value })}
            placeholder="What should mentees call you?"
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
            style={fieldStyle}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pronouns</label>
          <input
            value={data.pronouns || ''}
            onChange={e => update({ pronouns: e.target.value })}
            placeholder="e.g., she/her, they/them, he/him (optional)"
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
            style={fieldStyle}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Short Bio *</label>
          <textarea
            value={data.bio || ''}
            onChange={e => update({ bio: e.target.value })}
            placeholder="Tell us about yourself, your passions, and why you want to mentor..."
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ ...fieldStyle, minHeight: 100 }}
            rows={4}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">School or Workplace *</label>
          <input
            value={data.schoolOrWorkplace || ''}
            onChange={e => update({ schoolOrWorkplace: e.target.value })}
            placeholder="e.g., Lincoln High School, Google, Self-employed"
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
            style={fieldStyle}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Languages You Speak *</label>
          <input
            value={data.languages || ''}
            onChange={e => update({ languages: e.target.value })}
            placeholder="e.g., English, Spanish, ASL"
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
            style={fieldStyle}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={e => update({ phone: e.target.value })}
            placeholder="For verification and urgent contact"
            className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
            style={fieldStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">City</label>
            <input
              value={data.city || ''}
              onChange={e => update({ city: e.target.value })}
              placeholder="Your city"
              className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={fieldStyle}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">State</label>
            <input
              value={data.state || ''}
              onChange={e => update({ state: e.target.value })}
              placeholder="Your state"
              className="w-full mt-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={fieldStyle}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 w-full pt-2">
        {onBack && (
          <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 transition hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ← Back
          </button>
        )}
        <button onClick={handleContinue} className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
          Continue
        </button>
      </div>
    </div>
  );
}