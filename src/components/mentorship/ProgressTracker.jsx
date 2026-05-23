import { useState, useEffect } from 'react';
import { Target, CheckCircle, TrendingUp, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProgressTracker({ user, mentorEmail }) {
  const [progress, setProgress] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newMilestones, setNewMilestones] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await base44.entities.MentorshipProgress.filter({
        mentee_email: user.email
      });
      if (progressData.length > 0) {
        setProgress(progressData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  };

  const createProgress = async () => {
    if (!newGoal.trim()) return;

    try {
      const milestones = newMilestones.split('\n').filter(m => m.trim());
      await base44.entities.MentorshipProgress.create({
        mentee_email: user.email,
        mentor_email: mentorEmail || '',
        goal: newGoal,
        milestones: JSON.stringify(milestones.map(m => ({ title: m, completed: false }))),
        current_milestone: 0,
        progress_percentage: 0,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      });

      loadProgress();
      setShowAddGoal(false);
      setNewGoal('');
      setNewMilestones('');
    } catch (error) {
      console.error('Error creating progress:', error);
    }
  };

  const updateMilestone = async (milestoneIndex, completed) => {
    if (!progress) return;

    try {
      const milestones = JSON.parse(progress.milestones || '[]');
      milestones[milestoneIndex] = { ...milestones[milestoneIndex], completed };
      
      const completedCount = milestones.filter(m => m.completed).length;
      const newPercentage = Math.round((completedCount / milestones.length) * 100);

      await base44.entities.MentorshipProgress.update(progress.id, {
        milestones: JSON.stringify(milestones),
        current_milestone: milestoneIndex + 1,
        progress_percentage: newPercentage,
        updated_date: new Date().toISOString(),
      });

      loadProgress();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Target size={18} className="text-pink-400" />
          Progress Tracking
        </h3>
        {!progress && (
          <button onClick={() => setShowAddGoal(true)} className="text-pink-400">
            <Plus size={18} />
          </button>
        )}
      </div>

      {!progress ? (
        <div className="text-center py-8">
          <Target size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No goals set yet</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="mt-3 px-4 py-2 rounded-xl font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Goal</p>
            <p className="text-white font-semibold">{progress.goal}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Overall Progress</p>
              <p className="text-xs font-bold text-pink-400">{progress.progress_percentage}%</p>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${progress.progress_percentage}%`,
                  background: 'linear-gradient(90deg, #ec4899, #a855f7)'
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-2">Milestones</p>
            {JSON.parse(progress.milestones || '[]').map((milestone, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 flex items-center gap-3 transition ${
                  milestone.completed ? 'opacity-60' : ''
                }`}
                style={{
                  background: milestone.completed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${milestone.completed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`
                }}
              >
                <button
                  onClick={() => updateMilestone(idx, !milestone.completed)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    milestone.completed ? 'bg-green-500' : 'border-2 border-gray-500'
                  }`}
                >
                  {milestone.completed && <CheckCircle size={12} className="text-white" />}
                </button>
                <p className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {milestone.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddGoal && (
        <div className="fixed inset-0 z-[101] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowAddGoal(false)}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Set a Goal</h3>
              <button onClick={() => setShowAddGoal(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">What do you want to achieve?</label>
                <input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g., Land my first tech job"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Key Milestones (one per line)</label>
                <textarea
                  value={newMilestones}
                  onChange={(e) => setNewMilestones(e.target.value)}
                  placeholder="Update resume&#10;Build portfolio&#10;Apply to 10 jobs&#10;Practice interviews"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  rows={5}
                />
              </div>

              <button
                onClick={createProgress}
                disabled={!newGoal.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}