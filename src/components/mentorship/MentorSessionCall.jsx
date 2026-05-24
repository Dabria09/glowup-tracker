import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, PhoneOff, Users, Video, VideoOff } from 'lucide-react';

AgoraRTC.setLogLevel(4);

export default function MentorSessionCall({ session, user, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const localVideoEl = useRef(null);
  const remoteVideoEls = useRef({});

  const isMentor = user.email === session.mentor_email;
  const otherName = isMentor ? session.mentee_email.split('@')[0] : session.mentor_email.split('@')[0];
  const channelName = `mentorship_${session.id}`;

  useEffect(() => {
    let client;

    const join = async () => {
      try {
        const res = await base44.functions.invoke('generateAgoraToken', {
          channelName,
          uid: 0,
          role: 'publisher',
        });

        const { token, appId } = res.data;

        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play();
          }
          if (mediaType === 'video') {
            setRemoteUsers(prev => {
              const exists = prev.find(u => u.uid === remoteUser.uid);
              if (exists) return prev;
              return [...prev, { uid: remoteUser.uid, videoTrack: remoteUser.videoTrack }];
            });
            setTimeout(() => {
              const el = remoteVideoEls.current[remoteUser.uid];
              if (el) remoteUser.videoTrack?.play(el);
            }, 100);
          }
        });

        client.on('user-unpublished', (remoteUser, mediaType) => {
          if (mediaType === 'video') {
            setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
          }
        });

        client.on('user-left', (remoteUser) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
        });

        await client.join(appId, channelName, token, null);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localAudioRef.current = audioTrack;
        localVideoRef.current = videoTrack;

        await client.publish([audioTrack, videoTrack]);

        if (localVideoEl.current) {
          videoTrack.play(localVideoEl.current);
        }

        setJoined(true);
        setConnecting(false);
      } catch (err) {
        console.error('Agora join error:', err);
        setError(err.message || 'Failed to connect');
        setConnecting(false);
      }
    };

    join();

    return () => {
      localAudioRef.current?.close();
      localVideoRef.current?.close();
      client?.leave();
    };
  }, []);

  const toggleMute = async () => {
    if (localAudioRef.current) {
      await localAudioRef.current.setMuted(!muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoRef.current) {
      await localVideoRef.current.setMuted(!videoOff);
      setVideoOff(!videoOff);
    }
  };

  const handleLeave = async () => {
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    await clientRef.current?.leave();
    onLeave();
  };

  if (error) return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
      <div className="rounded-3xl p-6 text-center max-w-sm w-full" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-white font-semibold mb-2">Couldn't connect</p>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button onClick={onLeave} className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-sm">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <div>
          <p className="text-white font-bold text-lg">{session.topic || 'Mentorship Session'}</p>
          <p className="text-gray-400 text-sm">with {otherName}</p>
        </div>
        {!connecting && (
          <span className="flex items-center gap-1.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
          </span>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 relative px-4 pb-4">
        {connecting ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 border-4 border-purple-800 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Connecting to session...</p>
          </div>
        ) : (
          <>
            {/* Remote video (main) */}
            {remoteUsers.length > 0 ? (
              <div
                ref={el => { if (el) remoteVideoEls.current[remoteUsers[0].uid] = el; }}
                className="w-full h-full rounded-2xl overflow-hidden bg-gray-900"
                style={{ minHeight: '60vh' }}
              />
            ) : (
              <div className="w-full rounded-2xl bg-gray-900 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <p className="text-gray-400 text-sm">Waiting for {otherName} to join...</p>
              </div>
            )}

            {/* Local video (PIP) */}
            <div className="absolute top-4 right-8 w-28 h-40 rounded-xl overflow-hidden bg-gray-800 border-2 border-white/20">
              {videoOff ? (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoOff size={20} className="text-gray-500" />
                </div>
              ) : (
                <div ref={localVideoEl} className="w-full h-full" />
              )}
              <div className="absolute bottom-1 left-0 right-0 text-center">
                <span className="text-white text-xs font-semibold bg-black/50 px-2 py-0.5 rounded-full">You</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="pb-12 pt-4 flex items-center justify-center gap-8">
        <button
          onClick={toggleMute}
          className="w-14 h-14 rounded-full flex items-center justify-center transition"
          style={{ background: muted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)' }}
        >
          {muted ? <MicOff size={22} className="text-red-400" /> : <Mic size={22} className="text-white" />}
        </button>
        <button
          onClick={handleLeave}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition"
        >
          <PhoneOff size={24} className="text-white" />
        </button>
        <button
          onClick={toggleVideo}
          className="w-14 h-14 rounded-full flex items-center justify-center transition"
          style={{ background: videoOff ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)' }}
        >
          {videoOff ? <VideoOff size={22} className="text-red-400" /> : <Video size={22} className="text-white" />}
        </button>
      </div>
    </div>
  );
}