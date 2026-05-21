import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { Phone, Mail, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_COLORS = {
  'Doctor': '🏥',
  'Dentist': '🦷',
  'Therapist': '🧠',
  'Teacher': '📚',
  'Coach': '🏃‍♀️',
  'Counselor': '💬',
  'Parent/Guardian': '👨‍👩‍👧',
  'Emergency Contact': '🆘',
  'Other': '👤'
};

export default function ImportantContacts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', role: 'Doctor', phone: '', email: '', notes: '' });
  const [appointmentForm, setAppointmentForm] = useState({ appointment_type: '', date_time: '', provider_name: '', location: '', notes: '' });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [contactsList, appointmentsList] = await Promise.all([
        base44.entities.Contact.filter({ user_email: u.email }),
        base44.entities.Appointment.filter({ user_email: u.email })
      ]);
      setContacts(contactsList);
      setAppointments(appointmentsList);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.role) {
      toast.error('Name and role are required');
      return;
    }
    try {
      if (editingContactId) {
        await base44.entities.Contact.update(editingContactId, contactForm);
        setContacts(contacts.map(c => c.id === editingContactId ? { ...c, ...contactForm } : c));
        toast.success('Contact updated!');
      } else {
        const newContact = await base44.entities.Contact.create({
          user_email: user.email,
          ...contactForm
        });
        setContacts([...contacts, newContact]);
        toast.success('Contact added!');
      }
      setContactForm({ name: '', role: 'Doctor', phone: '', email: '', notes: '' });
      setEditingContactId(null);
      setShowContactModal(false);
    } catch (e) {
      toast.error(editingContactId ? 'Failed to update contact' : 'Failed to add contact');
    }
  };

  const handleAddAppointment = async () => {
    if (!appointmentForm.appointment_type || !appointmentForm.date_time) {
      toast.error('Appointment type and date/time are required');
      return;
    }
    try {
      if (editingAppointmentId) {
        await base44.entities.Appointment.update(editingAppointmentId, appointmentForm);
        setAppointments(appointments.map(a => a.id === editingAppointmentId ? { ...a, ...appointmentForm } : a));
        toast.success('Appointment updated!');
      } else {
        const newAppointment = await base44.entities.Appointment.create({
          user_email: user.email,
          ...appointmentForm
        });
        setAppointments([...appointments, newAppointment]);
        toast.success('Appointment added!');
      }
      setAppointmentForm({ appointment_type: '', date_time: '', provider_name: '', location: '', notes: '' });
      setEditingAppointmentId(null);
      setShowAppointmentModal(false);
    } catch (e) {
      toast.error(editingAppointmentId ? 'Failed to update appointment' : 'Failed to add appointment');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await base44.entities.Contact.delete(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    } catch (e) {
      toast.error('Failed to delete contact');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await base44.entities.Appointment.delete(id);
      setAppointments(appointments.filter(a => a.id !== id));
      toast.success('Appointment deleted');
    } catch (e) {
      toast.error('Failed to delete appointment');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">My Contacts & Appointments</h1>
          <p className="text-xs text-gray-400">Keep your important people & dates organized</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 py-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 pb-2 border-b-2 transition ${
            activeTab === 'contacts'
              ? 'border-pink-500 text-white'
              : 'border-transparent text-gray-400'
          }`}
        >
          <Phone size={18} />
          <span className="font-semibold">Contacts</span>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 pb-2 border-b-2 transition ${
            activeTab === 'appointments'
              ? 'border-pink-500 text-white'
              : 'border-gray-400 text-gray-400'
          }`}
        >
          📅
          <span className="font-semibold">Appointments</span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest text-gray-500">IMPORTANT PEOPLE</p>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-4 py-1.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition"
              >
                + Add Contact
              </button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-gray-300 font-semibold">No contacts yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your important people here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="bg-gray-900/80 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{ROLE_COLORS[contact.role] || '👤'}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-white">{contact.name}</p>
                          <p className="text-xs text-pink-400">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingContactId(contact.id);
                            setContactForm(contact);
                            setShowContactModal(true);
                          }}
                          className="text-gray-500 hover:text-pink-400 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone size={14} className="text-gray-500" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail size={14} className="text-gray-500" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                    {contact.notes && <p className="text-xs text-gray-500 mt-2">{contact.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-widest text-gray-500">MY SCHEDULE</p>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="px-4 py-1.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition"
              >
                + Add Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-gray-300 font-semibold">No appointments yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your upcoming appointments here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-gray-900/80 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white">{apt.appointment_type}</p>
                        <p className="text-xs text-pink-400 mt-0.5">{apt.date_time}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingAppointmentId(apt.id);
                            setAppointmentForm(apt);
                            setShowAppointmentModal(true);
                          }}
                          className="text-gray-500 hover:text-pink-400 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      {apt.provider_name && <p className="text-gray-300">Provider: {apt.provider_name}</p>}
                      {apt.location && <p className="text-gray-300">📍 {apt.location}</p>}
                    </div>
                    {apt.notes && <p className="text-xs text-gray-500 mt-2">{apt.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl h-[90vh] max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add Contact</h2>
                <button onClick={() => setShowContactModal(false)} className="text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Johnson"
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Role *</label>
                  <select
                    value={contactForm.role}
                    onChange={e => setContactForm({...contactForm, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                  >
                    {Object.keys(ROLE_COLORS).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={contactForm.phone}
                    onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="doctor@clinic.com"
                    value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Notes</label>
                  <textarea
                    placeholder="Office hours, address, insurance info..."
                    value={contactForm.notes}
                    onChange={e => setContactForm({...contactForm, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-t from-gray-900 to-gray-900/80 border-t border-gray-700 p-4 flex gap-3 flex-shrink-0">
              <button
                onClick={handleAddContact}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition"
              >
                {editingContactId ? 'Update Contact' : 'Add Contact'}
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContactId(null);
                  setContactForm({ name: '', role: 'Doctor', phone: '', email: '', notes: '' });
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-gray-900 rounded-t-3xl h-[90vh] max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add Appointment</h2>
                <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Appointment Type *</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Physical, Dental Cleaning"
                    value={appointmentForm.appointment_type}
                    onChange={e => setAppointmentForm({...appointmentForm, appointment_type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={appointmentForm.date_time}
                    onChange={e => setAppointmentForm({...appointmentForm, date_time: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Provider Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Smith, Ms. Johnson..."
                    value={appointmentForm.provider_name}
                    onChange={e => setAppointmentForm({...appointmentForm, provider_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Location / Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, Suite 200"
                    value={appointmentForm.location}
                    onChange={e => setAppointmentForm({...appointmentForm, location: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 block mb-2">Notes</label>
                  <textarea
                    placeholder="Bring insurance card, fasting required, etc."
                    value={appointmentForm.notes}
                    onChange={e => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-t from-gray-900 to-gray-900/80 border-t border-gray-700 p-4 flex gap-3 flex-shrink-0">
              <button
                onClick={handleAddAppointment}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition"
              >
                {editingAppointmentId ? 'Update Appointment' : 'Add Appointment'}
              </button>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setEditingAppointmentId(null);
                  setAppointmentForm({ appointment_type: '', date_time: '', provider_name: '', location: '', notes: '' });
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}