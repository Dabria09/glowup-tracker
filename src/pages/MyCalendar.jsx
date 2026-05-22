import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import AppBackground from '@/components/AppBackground';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EVENT_COLORS = ['#e91e8c','#9c27b0','#ffc107','#009688','#f44336','#2196f3'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export default function MyCalendar() {
  const today = new Date();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', event_time: '', description: '', color: EVENT_COLORS[0] });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.CalendarEvent.filter({ user_email: u.email });
      setEvents(data);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthEvents = events.filter(e => {
    const d = e.event_date || '';
    const [ey, em] = d.split('-').map(Number);
    return ey === year && em === month + 1;
  });

  const eventDates = new Set(monthEvents.map(e => e.event_date));

  const handleDayClick = (day) => {
    setSelectedDate(toISO(year, month, day));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const ev = await base44.entities.CalendarEvent.create({
      user_email: user.email,
      title: form.title.trim(),
      event_date: selectedDate,
      event_time: form.event_time,
      description: form.description,
      color: form.color,
    });
    setEvents(prev => [...prev, ev]);
    setShowForm(false);
    setForm({ title: '', event_time: '', description: '', color: EVENT_COLORS[0] });
    toast.success('Event added!');
  };

  const handleDelete = async (id) => {
    await base44.entities.CalendarEvent.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Event removed');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#1a0a2e' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Points */}
        <div className="flex justify-end px-4 pt-4 pb-1">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => window.history.back()} className="text-gray-400"><ChevronLeft size={22} /></button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">My Calendar 📅</h1>
              <p className="text-gray-500 text-xs">Plan your glow journey</p>
            </div>
          </div>
          <button onClick={() => { setSelectedDate(toISO(today.getFullYear(), today.getMonth(), today.getDate())); setShowForm(true); }}
            className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center">
            <Plus size={18} />
          </button>
        </div>

        {/* Month Nav */}
        <div className="mx-4 mb-3 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
          <button onClick={prevMonth} className="text-gray-400 hover:text-white"><ChevronLeft size={20} /></button>
          <span className="text-white font-bold">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-white"><ChevronRight size={20} /></button>
        </div>

        {/* Calendar Grid */}
        <div className="mx-4 bg-white/5 border border-white/10 rounded-2xl p-3 mb-4">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-gray-500 font-semibold py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = toISO(year, month, day);
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
              const hasEvent = eventDates.has(iso);
              return (
                <button key={day} onClick={() => handleDayClick(day)}
                  className={`relative flex flex-col items-center justify-center h-10 rounded-full text-sm transition ${isToday ? 'bg-pink-500 text-white font-bold' : 'text-gray-200 hover:bg-white/10'}`}>
                  {day}
                  {hasEvent && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-pink-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* This Month's Events */}
        <div className="px-4">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 mb-3">THIS MONTH'S EVENTS</p>
          {monthEvents.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="text-5xl mb-3">📅</span>
              <p className="text-gray-500 text-sm">No events yet. Tap + to add one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {monthEvents.sort((a,b) => a.event_date?.localeCompare(b.event_date)).map(ev => (
                <div key={ev.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#e91e8c' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{ev.title}</p>
                    <p className="text-gray-500 text-xs">{ev.event_date}{ev.event_time ? ` · ${ev.event_time}` : ''}</p>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-lg">New Event</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-1.5 rounded-full border border-white/20 text-gray-400 text-sm font-semibold">Cancel</button>
                <button onClick={handleSave} className="px-5 py-1.5 rounded-full bg-pink-500 text-white text-sm font-bold">Save</button>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-3">{selectedDate}</p>
            <input
              type="text"
              placeholder="Event title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600 mb-3"
            />
            <input
              type="time"
              value={form.event_time}
              onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none mb-3"
            />
            <textarea
              placeholder="Notes (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-gray-600 mb-4"
            />
            {/* Color picker */}
            <div className="flex gap-2 mb-5">
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: form.color === c ? '#fff' : 'transparent' }} />
              ))}
            </div>

          </div>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}