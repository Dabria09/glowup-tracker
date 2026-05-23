import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, PhoneOff, Users, Camera } from 'lucide-react';

AgoraRTC.setLogLevel(4); // suppress logs

function Avatar({ name, photoUrl, size = 16, speaking = false }) {
  return (
    <div className={`relative rounded-full flex-shrink-0 ${speaking ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent' : ''}`}
      style={{ width: size, height: size }}>
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold"
          style={{ fontSize: size * 0.35 }}>
          {name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}

export default function AgoraRoom({ room, user, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [myPhoto, setMyPhoto] = useState(null);

  const clientRef = useRef(null);
  const localTrackRef = useRef(null);

  // Load profiles for all room listeners
  useEffect(() => {
    const loadProfiles = async () => {
      const emails = JSON.parse(room.listeners || '[]');
      if (!emails.length) return;
      const allProfiles = await base44.entities.UserProfile.list();
      const map = {};
      allProfiles.forEach(p => { map[p.user_email] = p; });
      setProfiles(map);
      if (map[user.email]?.avatar_url) setMyPhoto(map[user.email].avatar_url);
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    let client;

    const join = async () => {
      try {
        // Get token from backend
        const res = await base44.functions.invoke('generateAgoraToken', {
          channelName: room.id,
          uid: 0,
          role: room.host_email === user.email ? 'publisher' : 'subscriber',
        });

        const { token, appId } = res.data;

        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Track remote users
        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play();
          }
          setParticipants(prev => {
            if (prev.find(p => p.uid === remoteUser.uid)) return prev;
            return [...prev, { uid: remoteUser.uid, muted: false }];
          });
        });

        client.on('user-unpublished', (remoteUser) => {
          setParticipants(prev => prev.filter(p => p.uid !== remoteUser.uid));
        });

        client.on('user-left', (remoteUser) => {
          setParticipants(prev => prev.filter(p => p.uid !== remoteUser.uid));
        });

        await client.join(appId, room.id, token, null);

        // All users can publish audio (host or listener can speak)
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTrackRef.current = audioTrack;
        await client.publish([audioTrack]);

        setJoined(true);
        setConnecting(false);
      } catch (err) {
        console.error('Agora join error:', err);
        setError(err.message || 'Failed to connect to audio room');
        setConnecting(false);
      }
    };

    join();

    return () => {
      localTrackRef.current?.close();
      client?.leave();
    };
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Save to UserProfile
    const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (existing.length > 0) {
      await base44.entities.UserProfile.update(existing[0].id, { avatar_url: file_url });
    } else {
      await base44.entities.UserProfile.create({ user_email: user.email, avatar_url: file_url });
    }
    setMyPhoto(file_url);
    setUploadingPhoto(false);
  };

  const toggleMute = async () => {
    if (localTrackRef.current) {
      await localTrackRef.current.setMuted(!muted);
      setMuted(!muted);
    }
  };

  const handleLeave = async () => {
    localTrackRef.current?.close();
    await clientRef.current?.leave();
    onLeave();
  };

  if (error) return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
      <div className="rounded-3xl p-6 text-center max-w-sm w-full" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-white font-semibold mb-2">Couldn't connect</p>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button onClick={onLeave} className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-sm">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #1a0540 0%, #0d0020 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          {!connecting && (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{room.title}</h2>
        <p className="text-sm text-purple-300 mt-1">Hosted by {room.host_name}</p>
      </div>

      {/* Participants area */}
      <div className="flex-1 px-5 overflow-y-auto">
        {connecting ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <div className="w-10 h-10 border-4 border-purple-800 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Connecting to room...</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <Users size={12} /> {participants.length + 1} in room
            </p>

            {/* Self */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="relative">
                <Avatar name={user.full_name} photoUrl={myPhoto} size={64} speaking={!muted} />
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center cursor-pointer hover:bg-pink-600 transition">
                  {uploadingPhoto ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={12} className="text-white" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>
              <span className="text-xs text-white font-semibold">You</span>
            </div>

            {/* Remote participants */}
            <div className="grid grid-cols-3 gap-4">
              {JSON.parse(room.listeners || '[]').filter(e => e !== user.email).map(email => {
                const profile = profiles[email];
                return (
                  <div key={email} className="flex flex-col items-center gap-2">
                    <Avatar name={email} photoUrl={profile?.avatar_url} size={56} />
                    <span className="text-xs text-gray-300 truncate max-w-[60px]">
                      {profile?.username || email.split('@')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 pb-12 pt-6">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              muted ? 'bg-gray-700 text-gray-400' : 'bg-white/15 text-white'
            }`}
          >
            {muted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          <button
            onClick={handleLeave}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          {muted ? 'You are muted' : 'Your mic is on'}
        </p>
      </div>
    </div>
  );
}