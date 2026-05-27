import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Copy, Users } from 'lucide-react';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GroupsTab() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ group_name: '', organization: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const g = await base44.entities.ClassGroup.list('-created_date');
      setGroups(g);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const create = async () => {
    if (!form.group_name.trim()) return;
    const code = generateCode();
    await base44.entities.ClassGroup.create({ ...form, join_code: code });
    setForm({ group_name: '', organization: '', description: '' });
    load();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2">🏫 Create New Group / Class</p>
        <input value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} placeholder="Group name (e.g. Lincoln Middle — Period 3)" className={inputCls} />
        <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="School or organization name" className={inputCls} />
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className={inputCls} />
        <button onClick={create} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
          <Plus size={16} /> Create Group &amp; Generate Code
        </button>
      </div>

      {loading ? <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        groups.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No groups yet. Create one above.</p> : (
          <div className="space-y-3">
            {groups.map(g => (
              <div key={g.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{g.group_name}</p>
                    {g.organization && <p className="text-xs text-gray-400">{g.organization}</p>}
                    {g.description && <p className="text-xs text-gray-500 mt-1">{g.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                      {g.join_code}
                    </span>
                    <button onClick={() => navigator.clipboard.writeText(g.join_code)} className="text-gray-400 hover:text-white">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Users size={11} /> {g.member_count || 0} members
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}