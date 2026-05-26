import { useState } from 'react';
import MentorApplicationModal from '@/components/mentorship/MentorApplicationModal';
import TeenMentorApplicationModal from '@/components/mentorship/TeenMentorApplicationModal';

export default function StepMentorChoice({ data, user, onNext }) {
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showTeenModal, setShowTeenModal] = useState(false);

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">✨</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Become a Mentor?</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Would you like to guide other girls on their glow journey? You can always apply later.
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => setShowMentorModal(true)}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          <span>👩‍🏫</span> Become a Mentor <span className="font-normal text-xs opacity-80">(Women 18+)</span>
        </button>

        <button
          onClick={() => setShowTeenModal(true)}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <span>🌟</span> Become a Teen Mentor <span className="font-normal text-xs opacity-80">(Ages 13–19)</span>
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
        onSubmitted={() => { setShowMentorModal(false); onNext(); }}
      />
      <TeenMentorApplicationModal
        isOpen={showTeenModal}
        onClose={() => setShowTeenModal(false)}
        user={user}
        onSubmitted={() => { setShowTeenModal(false); onNext(); }}
      />
    </div>
  );
}