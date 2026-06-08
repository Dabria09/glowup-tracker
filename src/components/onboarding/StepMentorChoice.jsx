import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorApplicationModal from '@/components/mentorship/MentorApplicationModal';
import TeenMentorApplicationModal from '@/components/mentorship/TeenMentorApplicationModal';

export default function StepMentorChoice({ data, user, isMentorFlow, onNext }) {
  const navigate = useNavigate();
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showTeenModal, setShowTeenModal] = useState(false);

  const age = data.age;
  const isTeen = age !== null && age < 18;

  // Auto-skip mentor choice if user is already in mentor flow
  useEffect(() => {
    if (isMentorFlow) {
      onNext(true);
    }
  }, [isMentorFlow]);

  const handleMentorClick = () => {
    if (isTeen) {
      setShowTeenModal(true);
    } else {
      setShowMentorModal(true);
    }
  };

  const handleMentorSubmitted = () => {
    setShowMentorModal(false);
    setShowTeenModal(false);
    // Signal to parent component that this is a mentor - it will handle redirect after profile creation
    onNext(true);
  };

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">✨</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Become a Mentor?</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Would you like to guide other girls on their glow journey? You can always apply later.
        </p>
        {age !== null && (
          <p className="text-xs text-muted-foreground mt-2">
            Based on your age ({age}), you'll be registered as {isTeen ? 'a Teen Mentor' : 'an Adult Mentor'}.
          </p>
        )}
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={handleMentorClick}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          <span>👩‍🏫</span> {isTeen ? 'Become a Teen Mentor (13-17)' : 'Become a Mentor (18+)'}
        </button>

        <button
          onClick={onNext}
          className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground border border-border hover:bg-muted transition"
        >
          Not now, skip
        </button>
      </div>

      <MentorApplicationModal
        isOpen={showMentorModal}
        onClose={() => setShowMentorModal(false)}
        user={user}
        onSubmitted={handleMentorSubmitted}
      />
      <TeenMentorApplicationModal
        isOpen={showTeenModal}
        onClose={() => setShowTeenModal(false)}
        user={user}
        onSubmitted={handleMentorSubmitted}
      />
    </div>
  );
}