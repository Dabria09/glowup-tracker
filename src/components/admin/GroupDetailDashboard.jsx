import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Copy, Check, RefreshCw, Users, Star, Activity, UserCheck, UserX, Pencil, Archive, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GroupDetailDashboard({ group, onBack, onGroupUpdated }) {
  const [members, setMembers] = useState([]);
  const [pointsMap, setPointsMap] = useState({}); // email -> total_points
  const [checkInMap, setCheckInMap] = useState({}); // email -> check-in count (last 30 days)
  const [allGroups, setAllGroups] = useState([]);
  const [groupChartData, setGroupChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ group_name: group.group_name, organization: group.organization || '', description: group.description || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, [group.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [memberList, groupList] = await Promise.all([
        base44.entities.GroupMember.filter({ group_id: group.id }, '-joined_date'),
        base44.entities.ClassGroup.filter({ is_active: true }),
      ]);
      setMembers(memberList);
      setAllGroups(groupList);

      const emails = memberList.map(m => m.user_email).filter(Boolean);

      if (emails.length) {
        // Load points & check-ins for all members in parallel
        const [allPoints, allDiaries] = await Promise.all([
          base44.entities.UserPoints.list('-total_points', 500),
          base44.entities.DiaryEntry.list('-created_date', 500),
        ]);

        const pm = {};
        allPoints.forEach(p => { if (emails.includes(p.user_email)) pm[p.user_email] = p.total_points || 0; });
        setPointsMap(pm);

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cm = {};
        emails.forEach(e => cm[e] = 0);
        allDiaries.forEach(d => {
          if (emails.includes(d.user_email) && new Date(d.created_date) >= cutoff) cm[d.user_email] = (cm[d.user_email] || 0) + 1;
        });
        setCheckInMap(cm);
      }

      // Build per-group chart: for each active group, sum points of its members
      const allGroupMembers = await base44.entities.GroupMember.list('-joined_date', 500);
      const allPts = await base44.entities.UserPoints.list('-total_points', 500);
      const ptsByEmail = {};
      allPts.forEach(p => { ptsByEmail[p.user_email] = p.total_points || 0; });

      const chartData = groupList.map(g => {
        const gMembers = allGroupMembers.filter(m => m.group_id === g.id);
        const total = gMembers.reduce((sum, m) => sum + (ptsByEmail[m.user_email] || 0), 0);
        return { name: g.group_name.length > 18 ? g.group_name.slice(0, 16) + '…' : g.group_name, points: total, isThis: g.id === group.id };
      }).sort((a, b) => b.points - a.points);
      setGroupChartData(chartData);

    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const regenerateCode = async () => {
    if (!confirm('Regenerate the join code? The old code will stop working immediately.')) return;
    setRegenerating(true);
    const newCode = generateCode();
    await base44.entities.ClassGroup.update(group.id, { join_code: newCode });
    onGroupUpdated({ ...group, join_code: newCode });
    setRegenerating(false);
  };

  const saveEdit = async () => {
    if (!editForm.group_name.trim()) return;
    setSaving(true);
    await base44.entities.ClassGroup.update(group.id, editForm);
    onGroupUpdated({ ...group, ...editForm });
    setEditing(false);
    setSaving(false);
  };

  const archiveGroup = async () => {
    if (!confirm(`Archive "${group.group_name}"? It will be hidden from the active list but all data is preserved.`)) return;
    await base44.entities.ClassGroup.update(group.id, { is_active: false });
    onBack();
  };

  const totalPoints = Object.values(pointsMap).reduce((s, v) => s + v, 0);
  const activeMembers = members.filter(m => (checkInMap[m.user_email] || 0) > 0).length;
  const inactiveMembers = members.length - activeMembers;
  const avgPoints = members.length ? Math.round(totalPoints / members.length) : 0;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 outline-none text-sm";

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(20,10,40,0.95)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <p className="text-white font-semibold mb-0.5">{label}</p>
        <p className="text-purple-300">✨ {payload[0].value} pts</p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition"><ArrowLeft size={20} /></button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input value={editForm.group_name} onChange={e => setEditForm({ ...editForm, group_name: e.target.value })} className={inputCls} placeholder="Group name" />
              <div className="grid grid-cols-2 gap-2">
                <input value={editForm.organization} onChange={e => setEditForm({ ...editForm, organization: e.target.value })} className={inputCls} placeholder="Organization" />
                <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className={inputCls} placeholder="Description" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                  {saving ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-400 bg-white/5">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white truncate">{group.group_name}</h2>
              {group.organization && <p className="text-xs text-gray-400">{group.organization}</p>}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="text-blue-400 hover:text-blue-300" title="Edit"><Pencil size={15} /></button>
            <button onClick={archiveGroup} className="text-yellow-400 hover:text-yellow-300" title="Archive"><Archive size={15} /></button>
          </div>
        )}
      </div>

      {/* Join code card */}
      <div className="p-4 rounded-2xl flex items-center justify-between gap-3" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
        <div>
          <p className="text-[10px] font-bold text-blue-400 tracking-wider mb-1">JOIN CODE</p>
          <span className="text-2xl font-black tracking-widest text-white" style={{ fontFamily: 'monospace' }}>{group.join_code}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(group.join_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition"
            style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: copied ? '#34d399' : '#fff' }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={regenerateCode} disabled={regenerating} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 disabled:opacity-60" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} /> New Code
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Users size={16} />, label: 'Total Members', value: members.length, color: '#60a5fa' },
              { icon: <Star size={16} />, label: 'Total Glow Pts', value: totalPoints.toLocaleString(), color: '#fbbf24' },
              { icon: <UserCheck size={16} />, label: 'Active (30d)', value: activeMembers, color: '#34d399' },
              { icon: <Activity size={16} />, label: 'Avg Pts / Student', value: avgPoints, color: '#a78bfa' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-1.5 mb-1" style={{ color }}>{icon}<span className="text-[10px] font-bold tracking-wider uppercase">{label}</span></div>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Cross-group engagement chart */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold text-white">📊 Total Engagement Points by Group</p>
            {groupChartData.length === 0 || groupChartData.every(d => d.points === 0) ? (
              <p className="text-xs text-gray-500 text-center py-4">No engagement data yet — points will appear once students join and start activities.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={groupChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                    {groupChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isThis ? '#a855f7' : 'rgba(168,85,247,0.35)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="text-[10px] text-gray-600">This group is highlighted in purple. Based on all active groups.</p>
          </div>

          {/* Roster */}
          <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-white">👩‍🎓 Student Roster</p>
              <span className="text-[10px] text-gray-500">{members.length} student{members.length !== 1 ? 's' : ''}</span>
            </div>
            {members.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No students have joined yet — share the code above with their teacher.</p>
            ) : (
              <div className="space-y-1">
                {members.map(m => {
                  const pts = pointsMap[m.user_email] || 0;
                  const checkins = checkInMap[m.user_email] || 0;
                  const isActive = checkins > 0;
                  return (
                    <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isActive ? '#34d399' : '#6b7280' }} />
                        <div>
                          <p className="text-xs font-semibold text-white">{m.display_name || m.username || m.user_email}</p>
                          {(m.display_name || m.username) && <p className="text-[10px] text-gray-500">{m.user_email}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs font-bold text-yellow-400">{pts.toLocaleString()} pts</p>
                          <p className="text-[10px] text-gray-500">{checkins} check-in{checkins !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}