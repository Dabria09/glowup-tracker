import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const STATUS_COLORS = {
  open: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  resolved: { bg: 'bg-green-500/20', text: 'text-green-400' },
  closed: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const PRIORITY_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const t = await base44.entities.SupportTicket.list('-created_date');
      setTickets(t);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.SupportTicket.update(id, { status, resolved_date: status === 'resolved' ? new Date().toISOString() : undefined });
    load();
  };

  const filterKey = filter === 'All' ? null : filter.toLowerCase().replace(' ', '_');
  const filtered = filterKey ? tickets.filter(t => t.status === filterKey) : tickets;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ticket => {
              const sc = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;
              return (
                <div key={ticket.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{ticket.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sc.bg} ${sc.text}`}>{ticket.status?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{ticket.user_email ? `User: ${ticket.user_email}` : `User #${ticket.id?.slice(0, 7)}`}</p>
                  <div className="flex items-center gap-2 text-[10px] mb-3">
                    <span className={PRIORITY_COLORS[ticket.priority] || 'text-gray-400'}>{ticket.priority}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">{ticket.category}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">{ticket.created_date ? new Date(ticket.created_date).toLocaleDateString() : ''}</span>
                  </div>
                  {ticket.description && <p className="text-xs text-gray-400 mb-3">{ticket.description}</p>}
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <button onClick={() => updateStatus(ticket.id, 'in_progress')} className="flex-1 py-1.5 rounded-xl text-xs font-bold text-yellow-400" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                          Start
                        </button>
                      )}
                      <button onClick={() => updateStatus(ticket.id, 'resolved')} className="flex-1 py-1.5 rounded-xl text-xs font-bold text-green-400" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        Resolve
                      </button>
                      <button onClick={() => updateStatus(ticket.id, 'closed')} className="flex-1 py-1.5 rounded-xl text-xs font-bold text-gray-400" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Close
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}