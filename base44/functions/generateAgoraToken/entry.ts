import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Agora token generation using RtcTokenBuilder
// Reference: https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey

const ROLE_PUBLISHER = 1;
const ROLE_SUBSCRIBER = 2;

function intToBytes(n) {
  const bytes = new Uint8Array(4);
  bytes[0] = (n >> 24) & 0xff;
  bytes[1] = (n >> 16) & 0xff;
  bytes[2] = (n >> 8) & 0xff;
  bytes[3] = n & 0xff;
  return bytes;
}

function shortToBytes(n) {
  const bytes = new Uint8Array(2);
  bytes[0] = (n >> 8) & 0xff;
  bytes[1] = n & 0xff;
  return bytes;
}

function packString(str) {
  const encoded = new TextEncoder().encode(str);
  const len = shortToBytes(encoded.length);
  return new Uint8Array([...len, ...encoded]);
}

function packUint32(n) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, n, true);
  return bytes;
}

async function hmac256(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(sig);
}

async function generateToken(appId, appCertificate, channelName, uid, role, privilegeExpiredTs) {
  const version = '006';
  const salt = Math.floor(Math.random() * 0xffffffff);
  const ts = Math.floor(Date.now() / 1000) + 100;

  // Privileges
  const privileges = new Map();
  privileges.set(1, privilegeExpiredTs); // join channel
  if (role === ROLE_PUBLISHER) {
    privileges.set(2, privilegeExpiredTs); // publish audio
    privileges.set(3, privilegeExpiredTs); // publish video
    privileges.set(4, privilegeExpiredTs); // publish data stream
  }

  // Pack message
  const packPrivileges = () => {
    const parts = [];
    parts.push(...shortToBytes(privileges.size));
    for (const [k, v] of privileges) {
      parts.push(...shortToBytes(k));
      parts.push(...packUint32(v));
    }
    return new Uint8Array(parts);
  };

  const msg = new Uint8Array([
    ...packUint32(salt),
    ...packUint32(ts),
    ...packPrivileges(),
  ]);

  // Sign
  const uidStr = uid === 0 ? '' : String(uid);
  const sigContent = new TextEncoder().encode(appId + channelName + uidStr);
  const sigWithTs = new Uint8Array([...new TextEncoder().encode(appId), ...intToBytes(ts), ...intToBytes(salt), ...sigContent]);
  
  // Build signing content
  const toSign = new Uint8Array([
    ...new TextEncoder().encode(appId),
    ...new TextEncoder().encode(channelName),
    ...new TextEncoder().encode(uidStr),
    ...msg,
  ]);

  const certBytes = new TextEncoder().encode(appCertificate);
  const signature = await hmac256(certBytes, toSign);

  // Pack token
  const content = new Uint8Array([
    ...packString(String.fromCharCode(...signature)),
    ...packUint32(salt),
    ...packUint32(ts),
    ...packPrivileges(),
  ]);

  const base64Content = btoa(String.fromCharCode(...content));
  const channelNamePacked = packString(channelName);
  const uidPacked = packString(uidStr);

  const fullContent = new Uint8Array([
    ...channelNamePacked,
    ...uidPacked,
    ...new TextEncoder().encode(base64Content),
  ]);

  const token = version + btoa(String.fromCharCode(...fullContent));
  return token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelName, uid = 0, role = 'publisher' } = await req.json();

    if (!channelName) {
      return Response.json({ error: 'channelName is required' }, { status: 400 });
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      return Response.json({ error: 'Agora credentials not configured' }, { status: 500 });
    }

    const expirationInSeconds = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTime + expirationInSeconds;

    const agoraRole = role === 'publisher' ? ROLE_PUBLISHER : ROLE_SUBSCRIBER;
    const token = await generateToken(appId, appCertificate, channelName, uid, agoraRole, privilegeExpiredTs);

    return Response.json({
      token,
      appId,
      channelName,
      uid,
      expiresAt: privilegeExpiredTs,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});