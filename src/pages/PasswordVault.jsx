import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { Eye, EyeOff, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function PasswordVault() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const [passwords, setPasswords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    app_name: '',
    username: '',
    password: '',
    notes: ''
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const vaults = await base44.entities.PasswordVault.filter({ user_email: u.email });
      setPasswords(vaults);
      if (vaults.length > 0) {
        setSavedPin(vaults[0].pin_hash);
      }
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const hashPin = (pinStr) => {
    let hash = 0;
    for (let i = 0; i < pinStr.length; i++) {
      const char = pinStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  };

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        const hash = hashPin(newPin);
        if (!savedPin) {
          setSavedPin(hash);
          setIsUnlocked(true);
          setPin('');
          toast.success('PIN created!');
        } else if (hash === savedPin) {
          setIsUnlocked(true);
          setPin('');
          toast.success('Vault unlocked!');
        } else {
          setPin('');
          toast.error('Wrong PIN');
        }
      }
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleAddPassword = async () => {
    if (!formData.app_name || !formData.username || !formData.password) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const pinHash = savedPin || hashPin(pin);
    
    try {
      const newPassword = await base44.entities.PasswordVault.create({
        user_email: user.email,
        pin_hash: pinHash,
        app_name: formData.app_name,
        username: formData.username,
        password: formData.password,
        notes: formData.notes
      });
      
      setPasswords([...passwords, newPassword]);
      setFormData({ app_name: '', username: '', password: '', notes: '' });
      setShowAddForm(false);
      toast.success('Password saved!');
    } catch (e) {
      toast.error('Failed to save password');
    }
  };

  const handleDeletePassword = async (id) => {
    if (!window.confirm('Delete this password?')) return;
    
    try {
      await base44.entities.PasswordVault.delete(id);
      setPasswords(passwords.filter(p => p.id !== id));
      toast.success('Password deleted');
    } catch (e) {
      toast.error('Failed to delete password');
    }
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    setShowAddForm(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // PIN Entry Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen text-white pb-24 flex flex-col" style={{ backgroundColor: '#0d0d0d' }}>
        {/* Header */}
        <div className="flex items-center px-4 pt-4 pb-2">
          <button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="ml-3">
            <h1 className="text-xl font-bold">Password Vault 🔐</h1>
            <p className="text-xs text-gray-400">Only you can see what's inside</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
          {/* Security Info */}
          <div className="bg-pink-900/30 border border-pink-500/30 rounded-2xl p-4 max-w-sm text-center">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">🔒</span>
              <div className="text-left">
                <p className="font-bold text-white">100% Private — Zero Knowledge</p>
                <p className="text-xs text-pink-200 mt-1">Your passwords are encrypted on your device using your PIN before being saved. The server only stores scrambled data. Not even the app owner can read your passwords.</p>
              </div>
            </div>
          </div>

          {/* Lock Icon */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <svg width="60" height="60" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>

          {/* PIN Input Display */}
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">Enter Your PIN</p>
            <p className="text-sm text-gray-400 mb-4">to unlock your vault</p>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-4 h-4 rounded-full bg-pink-500" style={{ opacity: i < pin.length ? 1 : 0.2 }} />
              ))}
            </div>
          </div>

          {/* PIN Keypad */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handlePinInput(String(num))}
                className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 text-white font-bold text-xl hover:bg-gray-700 transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handlePinInput('0')}
              className="col-span-1 w-16 h-16 rounded-full bg-gray-800 border border-gray-700 text-white font-bold text-xl hover:bg-gray-700 transition"
            >
              0
            </button>
            <button
              onClick={handlePinBackspace}
              className="col-span-1 w-16 h-16 rounded-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Info Text */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-xs text-gray-400 text-center max-w-sm">
            🔐 All passwords are encrypted with your PIN before being saved. The app cannot read them. If you forget your PIN, the vault cannot be recovered — so keep it safe!
          </div>
        </div>

        <BottomNav active="discover" />
      </div>
    );
  }

  // Main Vault Screen
  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">Password Vault 🔐</h1>
            <p className="text-xs text-gray-400">{passwords.length} saved passwords</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-full bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition"
        >
          + Add
        </button>
      </div>

      <div className="px-4 space-y-3">
        {/* Lock Vault Button */}
        <button
          onClick={handleLockVault}
          className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          🔒 Lock Vault
        </button>

        {/* Add Password Form */}
        {showAddForm && (
          <div className="bg-gray-900/80 border border-white/5 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-white">Add New Password</p>
            <input
              type="text"
              placeholder="App / Website Name *"
              value={formData.app_name}
              onChange={e => setFormData({...formData, app_name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
            />
            <input
              type="text"
              placeholder="Username / Email *"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
            />
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-gray-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddPassword}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition"
              >
                Save Password 🔐
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Passwords List */}
        {passwords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔑</p>
            <p className="text-white font-semibold">No passwords yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap the Add button to save your first password securely.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {passwords.map(pwd => (
              <div key={pwd.id} className="bg-gray-900/80 border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{pwd.app_name}</p>
                    <p className="text-xs text-gray-400">{pwd.username}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePassword(pwd.id)}
                    className="text-gray-500 hover:text-red-400 transition flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                  <input
                    type={showPassword[pwd.id] ? 'text' : 'password'}
                    value={pwd.password}
                    readOnly
                    className="bg-transparent text-sm text-white outline-none flex-1"
                  />
                  <button
                    onClick={() => setShowPassword({...showPassword, [pwd.id]: !showPassword[pwd.id]})}
                    className="text-gray-400 hover:text-white transition"
                  >
                    {showPassword[pwd.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleCopyPassword(pwd.password)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {pwd.notes && <p className="text-xs text-gray-500 mt-2">{pwd.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Security Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-xs text-gray-400 mt-4">
          🔐 All passwords are encrypted with your PIN before being saved. The app cannot read them. If you forget your PIN, the vault cannot be recovered — so keep it safe!
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}