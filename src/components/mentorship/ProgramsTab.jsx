import { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, Calendar, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProgramCreator from './ProgramCreator';

export default function ProgramsTab({ user }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const all = await base44.entities.MentorshipProgram.filter({ status: 'active' });
      setPrograms(all);

      const mentorData = await base44.entities.Mentor.filter({ user_email: user.email, is_approved: true });
      setIsMentor(mentorData.length > 0);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleEnroll = async (program) => {
    const enrolled = JSON.parse(program.enrolled_mentees || '[]');
    if (enrolled.includes(user.email)) {
      alert('You are already enrolled in this program.');
      return;
    }
    if (program.max_mentees && enrolled.length >= program.max_mentees) {
      alert('This program is full.');
      return;
    }
    await base44.entities.MentorshipProgram.update(program.id, {
      enrolled_mentees: JSON.stringify([...enrolled, user.email]),
    });
    loadPrograms();
  };

  if (loading) return (
    <div className="text-center py-10">
      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg flex items-center gap-2">
          <BookOpen size={20} className="text-blue-400" />
          Mentorship Programs
        </h2>
        {isMentor && (
          <button
            onClick={() => setShowCreator(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={14} /> Create
          </button>
        )}
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <BookOpen size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No active programs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map(program => {
            const enrolled = JSON.parse(program.enrolled_mentees || '[]');
            const isEnrolled = enrolled.includes(user.email);
            const curriculum = JSON.parse(program.curriculum || '[]');

            return (
              <div key={program.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{program.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{program.description}</p>
                  </div>
                  {program.category && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                      {program.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                  {program.duration_weeks && (
                    <span className="flex items-center gap-1"><Calendar size={12} />{program.duration_weeks}w</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={12} />{enrolled.length}{program.max_mentees ? `/${program.max_mentees}` : ''} enrolled
                  </span>
                  {curriculum.length > 0 && (
                    <span className="flex items-center gap-1"><BookOpen size={12} />{curriculum.length} modules</span>
                  )}
                </div>

                <button
                  onClick={() => handleEnroll(program)}
                  disabled={isEnrolled}
                  className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                  style={{ background: isEnrolled ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #ec4899, #a855f7)', border: isEnrolled ? '1px solid rgba(34,197,94,0.4)' : 'none' }}
                >
                  {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ProgramCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        user={user}
        onCreated={() => { setShowCreator(false); loadPrograms(); }}
      />
    </div>
  );
}