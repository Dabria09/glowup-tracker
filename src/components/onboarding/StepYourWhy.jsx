import { useState } from 'react';

export default function StepYourWhy({ data, update, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!data.why_mentor?.trim() || data.why_mentor.length < 10) {
      newErrors.why_mentor = 'Please share your motivation (at least 10 characters)';
    }
    if (!data.wish_told_younger?.trim() || data.wish_told_younger.length < 10) {
      newErrors.wish_told_younger = 'Please share your insight (at least 10 characters)';
    }
    if (!data.empowerment_meaning?.trim() || data.empowerment_meaning.length < 10) {
      newErrors.empowerment_meaning = 'Please share your perspective (at least 10 characters)';
    }
    if (!data.challenge_overcome?.trim() || data.challenge_overcome.length < 10) {
      newErrors.challenge_overcome = 'Please share your experience (at least 10 characters)';
    }
    if (!data.mentoring_style?.trim()) {
      newErrors.mentoring_style = 'Please describe your mentoring style';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const QuestionField = ({ name, label, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-2">
        {label} <span className="text-pink-400">*</span>
      </label>
      <textarea
        value={data[name] || ''}
        onChange={(e) => update({ [name]: e.target.value })}
        placeholder={placeholder}
        rows={3}
        className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
          errors[name] ? 'border-red-500' : 'border-white/20'
        } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition text-sm`}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
      )}
      <p className="text-gray-500 text-xs mt-1">1-3 sentences</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">💡</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Why</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Share your story and mentoring philosophy (1-3 sentences each)
        </p>
      </div>

      <div className="w-full text-left">
        <QuestionField
          name="why_mentor"
          label="Why do you want to be a GGU mentor?"
          placeholder="I want to mentor because..."
        />
        
        <QuestionField
          name="wish_told_younger"
          label="What is one thing you wish someone had told you at a younger age?"
          placeholder="I wish I had known..."
        />
        
        <QuestionField
          name="empowerment_meaning"
          label="What does empowerment mean to you?"
          placeholder="Empowerment means..."
        />
        
        <QuestionField
          name="challenge_overcome"
          label="Describe a challenge you overcame that could help a girl going through something similar"
          placeholder="I faced a challenge where..."
        />
        
        <QuestionField
          name="mentoring_style"
          label="What is your mentoring style? (coach, cheerleader, teacher, or something else?)"
          placeholder="I would describe my mentoring style as..."
        />
      </div>

      <div className="w-full flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm text-muted-foreground border border-border hover:bg-muted transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}