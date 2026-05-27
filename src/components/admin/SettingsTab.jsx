import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'X / Twitter', 'Facebook', 'Snapchat'];
const SOCIAL_KEYS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'snapchat'];
const SOCIAL_PLACEHOLDERS = [
  'https://instagram.com/yourhandle',
  'https://tiktok.com/@yourhandle',
  'https://youtube.com/@yourchannel',
  'https://x.com/yourhandle',
  'https://facebook.com/yourpage',
  'https://snapchat.com/add/yourhandle',
];

export default function SettingsTab() {
  const [teamApproval, setTeamApproval] = useState(false);
  const [glowBoardMod, setGlowBoardMod] = useState(false);
  const [social, setSocial] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ta = localStorage.getItem('ggu_admin_team_approval') === 'true';
    const gm = localStorage.getItem('ggu_admin_glowboard_mod') === 'true';
    setTeamApproval(ta);
    setGlowBoardMod(gm);
    const s = {};
    SOCIAL_KEYS.forEach(k => { s[k] = localStorage.getItem(`ggu_social_${k}`) || ''; });
    setSocial(s);
  }, []);

  const saveLinks = async () => {
    setSaving(true);
    SOCIAL_KEYS.forEach(k => {
      if (social[k]) localStorage.setItem(`ggu_social_${k}`, social[k]);
      else localStorage.removeItem(`ggu_social_${k}`);
    });
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    alert('Links saved! ✨');
  };

  const ToggleRow = ({ label, desc, offLabel, value, onChange }) => (
    <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{label}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
          <p className="text-xs mt-2" style={{ color: value ? '#10b981' : '#ef4444' }}>Current: {value ? 'ON' : `Auto-${offLabel} (OFF)`}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => { onChange(true); localStorage.setItem(label === 'Team Approval Required' ? 'ggu_admin_team_approval' : 'ggu_admin_glowboard_mod', 'true'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${value ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={value ? { background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.5)' } : {}}>ON</button>
          <button onClick={() => { onChange(false); localStorage.setItem(label === 'Team Approval Required' ? 'ggu_admin_team_approval' : 'ggu_admin_glowboard_mod', 'false'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${!value ? 'text-white bg-red-500' : 'text-gray-400 bg-white/5'}`}>OFF</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-base font-bold text-white mb-1">Moderation Settings</p>
        <p className="text-xs text-gray-400 mb-4">Control how content is reviewed before going live.</p>
        <div className="space-y-3">
          <ToggleRow
            label="👑 Team Approval Required"
            desc={'When ON — new teams go into "Pending Review" and must be approved by you before going live.\nWhen OFF — teams are automatically approved the moment they are created.'}
            offLabel="Approve"
            value={teamApproval}
            onChange={setTeamApproval}
          />
          <ToggleRow
            label="📸 Glow Board Moderation"
            desc={'When ON — Glow Board posts go into a review queue and must be approved before appearing publicly.\nWhen OFF — posts are published immediately without review.'}
            offLabel="Publish"
            value={glowBoardMod}
            onChange={setGlowBoardMod}
          />
        </div>
        <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="text-xs text-yellow-300 leading-relaxed">⚠️ Safety note: Keeping moderation ON is recommended while your audience includes minors. You can review pending items in the Teams and Glow Board tabs.</p>
        </div>
      </div>

      <div>
        <p className="text-base font-bold text-white mb-1">Glow Everywhere 🌎</p>
        <p className="text-xs text-gray-400 mb-4">Update the social media links shown in the Glow Everywhere section on the Home screen. Leave blank to hide a platform.</p>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform, i) => (
            <div key={platform} className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs font-semibold text-gray-300 mb-2">{platform}</p>
              <input
                value={social[SOCIAL_KEYS[i]] || ''}
                onChange={e => setSocial({ ...social, [SOCIAL_KEYS[i]]: e.target.value })}
                placeholder={SOCIAL_PLACEHOLDERS[i]}
                className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>
          ))}
          <button onClick={saveLinks} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            {saving ? 'Saving...' : 'Save Links ✨'}
          </button>
        </div>
      </div>
    </div>
  );
}