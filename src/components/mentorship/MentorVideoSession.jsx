import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, VideoOff, PhoneOff, Users, MonitorPlay } from 'lucide-react';

AgoraRTC.setLogLevel(4);

export default function MentorVideoSession({ session, user, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [isAdminObserver, setIsAdminObserver] = useState(false);

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let client;
    let isMounted = true;

    const join = async () => {
      try {
        // Get session token with identity verification
        const res = await base44.functions.invoke('createVideoSession', {
          session_id: session.id,
          participant_email: user.email,
        });

        const { token, appId, channelName, role, session: sessionInfo } = res.data;

        setIsAdminObserver(user.role === 'admin');

        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Track remote users
        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play();
          }
          if (mediaType === 'video') {
            remoteUser.videoTrack?.play(document.getElementById(`remote-${remoteUser.uid}`));
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

        await client.join(appId, channelName, token, null);

        // Publish audio (all users can speak)
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
        await client.publish([audioTrack]);

        // Publish video (except admin observers who are audio-only)
        if (!user.role || user.role !== 'admin') {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          localVideoTrackRef.current = videoTrack;
          videoTrack.play(document.getElementById('local-video'));
          await client.publish([videoTrack]);
        }

        if (isMounted) {
          setJoined(true);
          setConnecting(false);
        }
      } catch (err) {
        console.error('Video session join error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to connect to video session');
          setConnecting(false);
        }
      }
    };

    join();

    return () => {
      isMounted = false;
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      client?.leave();
    };
  }, []);

  const toggleMute = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setMuted(!muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      if (videoEnabled) {
        await localVideoTrackRef.current.stop();
      } else {
        await localVideoTrackRef.current.play(document.getElementById('local-video'));
      }
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleLeave = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    onLeave();
  };

  if (error) return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
      <div className="rounded-3xl p-6 text-center max-w-md w-full" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-white font-semibold mb-2">Couldn't connect</p>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button onClick={onLeave} className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-sm">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {!connecting && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
              </span>
            )}
            {isAdminObserver && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full px-2.5 py-1">
                <MonitorPlay size={10} /> Admin Observer
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{session.topic || 'Mentorship Session'}</h2>
          <p className="text-sm text-gray-400">{session.mentor_email} ↔ {session.mentee_email}</p>
        </div>
        <button onClick={handleLeave} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {connecting ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-4 border-purple-800 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Connecting to session...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Local Video */}
            {(!isAdminObserver) && (
              <div className="rounded-2xl overflow-hidden bg-gray-800 aspect-video relative">
                <div id="local-video" className="w-full h-full" />
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-xs text-white">
                  You {muted ? '(Muted)' : ''}
                </div>
              </div>
            )}
            
            {/* Remote Participants */}
            {participants.map((p, i) => (
              <div key={p.uid} className="rounded-2xl overflow-hidden bg-gray-800 aspect-video relative">
                <div id={`remote-${p.uid}`} className="w-full h-full" />
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-xs text-white">
                  Participant {i + 1}
                </div>
              </div>
            ))}

            {participants.length === 0 && !isAdminObserver && (
              <div className="rounded-2xl bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center aspect-video">
                <div className="text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-2" />
                  <p>Waiting for others to join...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 pb-8 pt-4">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              muted ? 'bg-gray-700 text-gray-400' : 'bg-white/15 text-white'
            }`}
          >
            {muted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          {!isAdminObserver && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                !videoEnabled ? 'bg-gray-700 text-gray-400' : 'bg-white/15 text-white'
              }`}
            >
              {videoEnabled ? <VideoOff size={22} /> : <VideoOff size={22} />}
            </button>
          )}
          <button
            onClick={handleLeave}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          {isAdminObserver ? '👁️ You are observing silently' : muted ? 'Your mic is off' : 'Your mic is on'}
        </p>
      </div>
    </div>
  );
}