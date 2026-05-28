import { SKIN_TONES, HAIR_COLORS, EYE_COLORS, CLOTHING_COLORS, BG_COLORS } from './avatarData';

// ─── Color helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}
function shade(hex, amount) {
  if (!hex || hex.startsWith('url') || hex === 'none') return hex;
  try {
    const {r,g,b} = hexToRgb(hex);
    const clamp = v => Math.max(0,Math.min(255,v));
    return `rgb(${clamp(r+amount)},${clamp(g+amount)},${clamp(b+amount)})`;
  } catch { return hex; }
}

// ─── Premium SVG Avatar (300×300 viewBox) ────────────────────────────────────
export default function AvatarPreview({ config = {}, size = 200 }) {
  const get = (arr, id, fallback) => arr.find(x => x.id === id) || fallback;
  const skin   = get(SKIN_TONES,     config.skinTone,  SKIN_TONES[2]).color;
  const hair   = get(HAIR_COLORS,    config.hairColor, HAIR_COLORS[0]).color;
  const irisC  = get(EYE_COLORS,     config.eyeColor,  EYE_COLORS[0]).color;
  const topC   = get(CLOTHING_COLORS, config.topColor, CLOTHING_COLORS[5]).color;
  const botC   = get(CLOTHING_COLORS, config.bottomColor, CLOTHING_COLORS[3]).color;
  const shoeC  = get(CLOTHING_COLORS, config.shoeColor, CLOTHING_COLORS[1]).color;
  const bgData = get(BG_COLORS,       config.bg,       BG_COLORS[0]);

  const hairStyle  = config.hairStyle  || 'afro_full';
  const eyeStyle   = config.eyeStyle   || 'almond';
  const browStyle  = config.eyebrowStyle || 'thick_natural';
  const topStyle   = config.topStyle   || 'hoodie_classic';
  const botStyle   = config.bottomStyle || 'jeans_skinny';
  const shoeStyle  = config.shoeStyle  || 'sneakers_classic';
  const accessory  = config.accessory  || 'none';
  const blush      = config.blush      || false;
  const lipColor   = config.lipColor   || '#e07a8a';
  const lashes     = config.lashes !== false;

  const skinShad  = shade(skin, -28);
  const skinHi    = shade(skin, 22);
  const hairShad  = shade(hair === '#0a0a0a' ? '#1a1a1a' : hair, -35);
  const hairHi    = shade(hair, 38);
  const uid = Math.random().toString(36).slice(2,7); // unique gradient IDs

  // ── Background ──────────────────────────────────────────────────────────────
  const renderBG = () => {
    const bg = bgData.color;
    if (bg === 'transparent') return null;
    const gradMap = {
      gradient_soft:   ['#f9eaf6','#e8d5f5','#d5e5f8'],
      gradient_sunset: ['#ff9a9e','#ff6b6b','#ffa040'],
      gradient_ocean:  ['#74b9ff','#0984e3','#6c5ce7'],
    };
    if (gradMap[bg]) {
      return (
        <>
          <defs>
            <linearGradient id={`bg${uid}`} x1="0%" y1="0%" x2="50%" y2="100%">
              {gradMap[bg].map((c,i)=><stop key={i} offset={`${i*50}%`} stopColor={c}/>)}
            </linearGradient>
          </defs>
          <rect width={300} height={300} fill={`url(#bg${uid})`}/>
        </>
      );
    }
    return <rect width={300} height={300} fill={bg}/>;
  };

  // ── Skin gradients ───────────────────────────────────────────────────────────
  const SkinDefs = () => (
    <defs>
      <radialGradient id={`faceG${uid}`} cx="42%" cy="35%" r="62%">
        <stop offset="0%" stopColor={skinHi}/>
        <stop offset="65%" stopColor={skin}/>
        <stop offset="100%" stopColor={skinShad}/>
      </radialGradient>
      <radialGradient id={`bodyG${uid}`} cx="50%" cy="30%" r="65%">
        <stop offset="0%" stopColor={skin}/>
        <stop offset="100%" stopColor={skinShad}/>
      </radialGradient>
      <filter id={`blur${uid}`}><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>
  );

  // ── Hair gradients ───────────────────────────────────────────────────────────
  const HairDefs = () => (
    <defs>
      <linearGradient id={`hairG${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor={hairHi}/>
        <stop offset="40%" stopColor={hair}/>
        <stop offset="100%" stopColor={hairShad}/>
      </linearGradient>
      <radialGradient id={`hairR${uid}`} cx="40%" cy="20%" r="70%">
        <stop offset="0%" stopColor={hairHi} stopOpacity="0.9"/>
        <stop offset="100%" stopColor={hairShad}/>
      </radialGradient>
    </defs>
  );

  // ── Face (organic oval with pointed chin) ────────────────────────────────────
  // Head center: ~(150, 78), face spans y:36-126
  const Face = () => (
    <path
      d="M 150,38 C 197,38 206,66 206,88 C 206,116 190,125 172,130 C 165,132 158,134 150,134 C 142,134 135,132 128,130 C 110,125 94,116 94,88 C 94,66 103,38 150,38 Z"
      fill={`url(#faceG${uid})`}
    />
  );

  // ── Ear ──────────────────────────────────────────────────────────────────────
  const Ears = () => (
    <>
      <ellipse cx={93} cy={88} rx={8} ry={11} fill={skin}/>
      <ellipse cx={93} cy={88} rx={5} ry={7} fill={skinShad} opacity="0.35"/>
      <ellipse cx={207} cy={88} rx={8} ry={11} fill={skin}/>
      <ellipse cx={207} cy={88} rx={5} ry={7} fill={skinShad} opacity="0.35"/>
    </>
  );

  // ── Eyebrows ─────────────────────────────────────────────────────────────────
  const browColor = hair === '#f5e6d3' || hair === '#f5d67c' || hair === '#d4b46a' ? '#8a6040' : hairShad;
  const Eyebrows = () => {
    const bw = browStyle === 'bushy' ? 3.5 : browStyle === 'thin_arched' ? 1.8 : browStyle === 'bold' ? 4 : 2.5;
    const yL = browStyle === 'thin_arched' ? 62 : 64;
    const yR = browStyle === 'thin_arched' ? 62 : 64;
    const arcL = browStyle === 'thin_arched' ? 56 : browStyle === 'straight' ? 64 : 60;
    const arcR = browStyle === 'thin_arched' ? 56 : browStyle === 'straight' ? 64 : 60;
    return (
      <>
        <path d={`M 115,${yL} Q 126,${arcL} 140,${yL}`} fill="none" stroke={browColor} strokeWidth={bw} strokeLinecap="round"/>
        <path d={`M 160,${yR} Q 174,${arcR} 185,${yR}`} fill="none" stroke={browColor} strokeWidth={bw} strokeLinecap="round"/>
      </>
    );
  };

  // ── Eyes ─────────────────────────────────────────────────────────────────────
  const EyeDefs = () => (
    <defs>
      <radialGradient id={`irisG${uid}`} cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor={shade(irisC, 40)}/>
        <stop offset="60%" stopColor={irisC}/>
        <stop offset="100%" stopColor={shade(irisC, -30)}/>
      </radialGradient>
    </defs>
  );

  const SingleEye = ({ cx, cy, flip = false }) => {
    const type = eyeStyle;
    const ew = 15, eh = type === 'round' || type === 'wide' ? 13 : type === 'cat_eye' ? 9 : 11;
    const lashFlip = flip ? `scale(-1,1) translate(-${cx*2},0)` : '';
    // Eye white
    const eyePath = type === 'cat_eye'
      ? `M ${cx-ew},${cy} C ${cx-ew+4},${cy-eh} ${cx+ew-6},${cy-eh} ${cx+ew},${cy-3} C ${cx+ew+4},${cy+2} ${cx+ew-2},${cy+5} ${cx-ew},${cy} Z`
      : type === 'monolid'
      ? `M ${cx-ew},${cy} C ${cx-ew},${cy-eh*0.5} ${cx+ew},${cy-eh*0.5} ${cx+ew},${cy} C ${cx+ew},${cy+eh*0.8} ${cx-ew},${cy+eh*0.8} ${cx-ew},${cy} Z`
      : `M ${cx-ew},${cy} C ${cx-ew},${cy-eh} ${cx+ew},${cy-eh} ${cx+ew},${cy} C ${cx+ew},${cy+eh*0.6} ${cx-ew},${cy+eh*0.6} ${cx-ew},${cy} Z`;

    const upperLidPath = type === 'cat_eye'
      ? `M ${cx-ew},${cy} C ${cx-ew+3},${cy-eh-3} ${cx+ew-4},${cy-eh-2} ${cx+ew+2},${cy-5}`
      : `M ${cx-ew},${cy} C ${cx-ew+2},${cy-eh-2} ${cx+ew-2},${cy-eh-2} ${cx+ew},${cy}`;

    return (
      <g>
        {/* Sclera */}
        <path d={eyePath} fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth={0.5}/>
        {/* Iris */}
        <clipPath id={`eyeClip${uid}${flip?'r':'l'}`}><path d={eyePath}/></clipPath>
        <circle cx={cx} cy={cy+1} r={9} fill={`url(#irisG${uid})`} clipPath={`url(#eyeClip${uid}${flip?'r':'l'})`}/>
        {/* Pupil */}
        <circle cx={cx} cy={cy+1} r={4.5} fill="#0a0a0a" clipPath={`url(#eyeClip${uid}${flip?'r':'l'})`}/>
        {/* Shine */}
        <circle cx={cx+3} cy={cy-2} r={2.5} fill="white" opacity="0.95" clipPath={`url(#eyeClip${uid}${flip?'r':'l'})`}/>
        <circle cx={cx-3} cy={cy+2} r={1} fill="white" opacity="0.5" clipPath={`url(#eyeClip${uid}${flip?'r':'l'})`}/>
        {/* Upper lid */}
        <path d={upperLidPath} fill="none" stroke="#1a0a0a" strokeWidth={lashes ? 2.8 : 1.8} strokeLinecap="round"/>
        {/* Upper lashes */}
        {lashes && <>
          {[-10,-6,-2,2,6,10].map((dx,i)=>{
            const lx = cx+dx, ly1 = cy - eh - 1;
            const angle = (dx/ew)*0.35;
            const lx2 = lx + Math.sin(angle)*5;
            const ly2 = ly1 - Math.cos(angle)*6;
            return <line key={i} x1={lx} y1={ly1} x2={lx2} y2={ly2} stroke="#0a0a0a" strokeWidth={1.4} strokeLinecap="round" transform={lashFlip}/>;
          })}
          {type === 'cat_eye' && !flip &&
            <line x1={cx+ew} y1={cy-3} x2={cx+ew+6} y2={cy-10} stroke="#0a0a0a" strokeWidth={1.6} strokeLinecap="round"/>
          }
          {type === 'cat_eye' && flip &&
            <line x1={cx-ew} y1={cy-3} x2={cx-ew-6} y2={cy-10} stroke="#0a0a0a" strokeWidth={1.6} strokeLinecap="round"/>
          }
        </>}
        {/* Lower lid */}
        <path d={`M ${cx-ew},${cy} C ${cx-ew},${cy+eh*0.5} ${cx+ew},${cy+eh*0.5} ${cx+ew},${cy}`} fill="none" stroke="#1a0a0a" strokeWidth={0.8} strokeLinecap="round" opacity="0.5"/>
      </g>
    );
  };

  const Eyes = () => (
    <>
      <EyeDefs/>
      <SingleEye cx={126} cy={82} flip={false}/>
      <SingleEye cx={174} cy={82} flip={true}/>
    </>
  );

  // ── Nose ──────────────────────────────────────────────────────────────────────
  const Nose = () => (
    <>
      <path d="M 150,92 C 148,97 144,102 143,104 Q 150,106 157,104 C 156,102 152,97 150,92 Z" fill={skinShad} opacity="0.3"/>
      <ellipse cx={144} cy={104} rx={3.5} ry={2.2} fill={skinShad} opacity="0.35"/>
      <ellipse cx={156} cy={104} rx={3.5} ry={2.2} fill={skinShad} opacity="0.35"/>
    </>
  );

  // ── Lips ──────────────────────────────────────────────────────────────────────
  const Lips = () => {
    const lip = lipColor || '#d4758a';
    const lipDark = shade(lip, -20);
    const lipHi = shade(lip, 30);
    return (
      <>
        {/* Upper lip - cupid's bow */}
        <path d="M 134,113 C 136,110 141,109 146,111 C 148,112 150,111 152,112 C 157,110 162,110 166,113 C 162,115 156,116 150,116 C 144,116 138,115 134,113 Z" fill={lipDark}/>
        {/* Lower lip */}
        <path d="M 134,113 C 136,117 141,121 150,122 C 159,121 164,117 166,113 C 161,116 156,116 150,116 C 144,116 139,115 134,113 Z" fill={lip}/>
        {/* Gloss highlight */}
        <ellipse cx={150} cy={118} rx={9} ry={3} fill={lipHi} opacity="0.35"/>
        {/* Lip line */}
        <path d="M 134,113 C 138,114 144,116 150,116 C 156,116 162,114 166,113" fill="none" stroke={lipDark} strokeWidth={0.6} opacity="0.5"/>
      </>
    );
  };

  // ── Neck ──────────────────────────────────────────────────────────────────────
  const Neck = () => (
    <>
      <path d="M 140,130 L 138,158 L 162,158 L 160,130 Q 155,127 150,127 Q 145,127 140,130 Z" fill={skin}/>
      <path d="M 140,130 L 138,158" fill="none" stroke={skinShad} strokeWidth={1} opacity="0.25"/>
      <path d="M 160,130 L 162,158" fill="none" stroke={skinShad} strokeWidth={1} opacity="0.25"/>
    </>
  );

  // ── Body ──────────────────────────────────────────────────────────────────────
  const Body = () => (
    <>
      {/* Shoulders */}
      <path d="M 78,158 C 62,165 56,180 58,198 L 80,198 C 78,186 82,174 88,168 Z" fill={`url(#bodyG${uid})`}/>
      <path d="M 222,158 C 238,165 244,180 242,198 L 220,198 C 222,186 218,174 212,168 Z" fill={`url(#bodyG${uid})`}/>
      {/* Torso – hourglass */}
      <path d="M 88,165 C 82,178 80,195 82,210 C 84,222 92,232 100,236 L 200,236 C 208,232 216,222 218,210 C 220,195 218,178 212,165 C 198,160 178,158 162,158 L 138,158 C 122,158 102,160 88,165 Z" fill={`url(#bodyG${uid})`}/>
      {/* Waist shadow */}
      <ellipse cx={150} cy={232} rx={52} ry={6} fill={skinShad} opacity="0.18"/>
    </>
  );

  // ── Hands/wrists ─────────────────────────────────────────────────────────────
  const Hands = () => (
    <>
      <ellipse cx={62} cy={200} rx={9} ry={7} fill={skin}/>
      <ellipse cx={238} cy={200} rx={9} ry={7} fill={skin}/>
    </>
  );

  // ── Legs ──────────────────────────────────────────────────────────────────────
  const Legs = () => (
    <>
      <path d="M 100,234 C 98,246 96,262 98,278 L 128,278 C 130,262 130,246 130,234 Z" fill={skin}/>
      <path d="M 170,234 C 170,246 170,262 172,278 L 202,278 C 204,262 202,246 200,234 Z" fill={skin}/>
    </>
  );

  // ── Hair ──────────────────────────────────────────────────────────────────────
  const renderHair = () => {
    const hProps = { fill: `url(#hairG${uid})` };
    const hR = { fill: `url(#hairR${uid})` };

    switch (hairStyle) {
      case 'twa':
        return <ellipse cx={150} cy={60} rx={46} ry={28} {...hProps}/>;

      case 'afro_full':
        return (
          <>
            <ellipse cx={150} cy={52} rx={72} ry={60} {...hProps}/>
            {/* Volume bumps */}
            <ellipse cx={90} cy={62} rx={22} ry={20} fill={hairHi} opacity="0.25"/>
            <ellipse cx={210} cy={62} rx={22} ry={20} fill={hairHi} opacity="0.18"/>
            <ellipse cx={150} cy={36} rx={30} ry={18} fill={hairHi} opacity="0.22"/>
          </>
        );

      case 'afro_puffs_one':
        return (
          <>
            <ellipse cx={150} cy={60} rx={52} ry={44} {...hProps}/>
            <ellipse cx={150} cy={46} rx={24} ry={20} fill={hairHi} opacity="0.3"/>
          </>
        );

      case 'afro_puffs_two':
        return (
          <>
            {/* Base */}
            <ellipse cx={150} cy={68} rx={60} ry={32} {...hProps}/>
            {/* Left puff */}
            <ellipse cx={118} cy={52} rx={26} ry={26} {...hProps}/>
            <ellipse cx={112} cy={44} rx={10} ry={10} fill={hairHi} opacity="0.3"/>
            {/* Right puff */}
            <ellipse cx={182} cy={52} rx={26} ry={26} {...hProps}/>
            <ellipse cx={188} cy={44} rx={10} ry={10} fill={hairHi} opacity="0.3"/>
          </>
        );

      case 'bantu_knots':
        return (
          <>
            <ellipse cx={150} cy={66} rx={56} ry={30} {...hProps}/>
            {[[122,46],[150,42],[178,46],[136,60],[164,60]].map(([cx,cy],i)=>(
              <g key={i}>
                <circle cx={cx} cy={cy} r={9} fill={hair}/>
                <path d={`M ${cx-6},${cy} C ${cx-3},${cy-8} ${cx+3},${cy-8} ${cx+6},${cy} C ${cx+3},${cy+6} ${cx-3},${cy+6} Z`} fill={hairHi} opacity="0.35"/>
              </g>
            ))}
          </>
        );

      case 'locs_short':
        return (
          <>
            <ellipse cx={150} cy={62} rx={58} ry={32} {...hProps}/>
            {[116,126,136,146,156,166,176,186].map((x,i)=>(
              <path key={i} d={`M ${x},${68+i%2*3} C ${x-1},${80+i%2*5} ${x+1},${90+i%2*5} ${x},${100+i%2*4}`}
                fill="none" stroke={hair} strokeWidth={5} strokeLinecap="round" opacity="0.9"/>
            ))}
          </>
        );

      case 'locs_long':
        return (
          <>
            <ellipse cx={150} cy={62} rx={58} ry={32} {...hProps}/>
            {[108,118,128,138,148,158,168,178,188].map((x,i)=>(
              <path key={i} d={`M ${x},${68+i%2*3} C ${x-2},${100} ${x+2},${140} ${x},${180+i%3*10}`}
                fill="none" stroke={hair} strokeWidth={5} strokeLinecap="round" opacity="0.85"/>
            ))}
          </>
        );

      case 'coils':
        return (
          <>
            <ellipse cx={150} cy={62} rx={56} ry={32} {...hProps}/>
            {[120,132,144,156,168,180].map((x,i)=>(
              <path key={i} d={`M ${x},${70} C ${x+5},${76} ${x-4},${82} ${x+3},${88} C ${x-3},${94} ${x+4},${100} ${x},${106}`}
                fill="none" stroke={hair} strokeWidth={3.5} strokeLinecap="round"/>
            ))}
          </>
        );

      case 'box_braids_short':
      case 'box_braids_medium':
      case 'box_braids_long': {
        const len = hairStyle === 'box_braids_long' ? 155 : hairStyle === 'box_braids_medium' ? 125 : 95;
        return (
          <>
            <ellipse cx={150} cy={60} rx={60} ry={34} {...hProps}/>
            {[108,118,128,138,148,158,168,178,188].map((x,i)=>(
              <g key={i}>
                <rect x={x-5} y={68} width={9} height={len-68} rx={4} fill={hair} opacity="0.9"/>
                {[0,1,2,3,4].map(j=>(
                  <rect key={j} x={x-5} y={68+j*(len-68)/5} width={9} height={(len-68)/10} rx={2} fill={hairHi} opacity="0.2"/>
                ))}
              </g>
            ))}
          </>
        );
      }

      case 'cornrows':
        return (
          <>
            <ellipse cx={150} cy={60} rx={58} ry={30} {...hProps}/>
            {[116,126,136,146,156,166,176].map((x,i)=>(
              <path key={i}
                d={`M ${x},${46} C ${x-1},${62} ${x+1},${78} ${x},${110}`}
                fill="none" stroke={hair} strokeWidth={6} strokeLinecap="round" opacity={0.88+i*0.01}/>
            ))}
            {/* sheen */}
            {[116,136,156,176].map((x,i)=>(
              <path key={i} d={`M ${x},${50} C ${x},${65} ${x},${80} ${x},${95}`}
                fill="none" stroke={hairHi} strokeWidth={1.5} strokeLinecap="round" opacity="0.35"/>
            ))}
          </>
        );

      case 'fulani_braids':
        return (
          <>
            <ellipse cx={150} cy={60} rx={58} ry={30} {...hProps}/>
            {/* Center braid */}
            <rect x={146} y={42} width={8} height={120} rx={4} fill={hair}/>
            {/* Side braids */}
            {[110,122,134,158,170,182].map((x,i)=>(
              <rect key={i} x={x-4} y={65} width={7} height={110} rx={3.5} fill={hair} opacity="0.85"/>
            ))}
            {/* Gold beads */}
            {[88,110,122].map((y,i)=>(
              <circle key={i} cx={i%2===0?116:150} cy={y} r={4} fill="#f5c842" stroke="#e0a800" strokeWidth={0.8}/>
            ))}
          </>
        );

      case 'knotless_braids':
        return (
          <>
            <ellipse cx={150} cy={58} rx={60} ry={32} {...hProps}/>
            {[108,118,128,138,148,158,168,178,188].map((x,i)=>(
              <path key={i} d={`M ${x},${66} Q ${x+(i%3-1)*3},${110} ${x+(i%3-1)*4},${160}`}
                fill="none" stroke={hair} strokeWidth={7} strokeLinecap="round" opacity="0.9"/>
            ))}
            {[108,128,148,168,188].map((x,i)=>(
              <path key={i} d={`M ${x},${66} Q ${x},${110} ${x},${160}`}
                fill="none" stroke={hairHi} strokeWidth={1.5} strokeLinecap="round" opacity="0.25"/>
            ))}
          </>
        );

      case 'goddess_braids':
        return (
          <>
            <path d="M 88,60 Q 150,38 212,60 L 212,75 Q 150,54 88,75 Z" fill={`url(#hairG${uid})`}/>
            <path d="M 88,60 C 82,80 80,105 84,130 C 88,155 100,170 120,175 L 120,158 C 106,154 98,140 96,118 C 94,98 96,76 100,64 Z" fill={hair}/>
            <path d="M 212,60 C 218,80 220,105 216,130 C 212,155 200,170 180,175 L 180,158 C 194,154 202,140 204,118 C 206,98 204,76 200,64 Z" fill={hair}/>
            {[0,1,2].map(i=>(
              <path key={i} d={`M ${108+i*21},${66} L ${108+i*21},${130}`} fill="none" stroke={hairHi} strokeWidth={2} opacity="0.25"/>
            ))}
          </>
        );

      case 'bone_straight':
        return (
          <>
            {/* Top */}
            <ellipse cx={150} cy={58} rx={60} ry={30} {...hProps}/>
            {/* Left panel */}
            <path d="M 92,62 C 88,80 86,110 88,140 C 90,162 100,175 114,178 L 118,140 C 108,138 104,122 106,104 C 108,86 112,70 114,62 Z" fill={`url(#hairG${uid})`}/>
            {/* Right panel */}
            <path d="M 208,62 C 212,80 214,110 212,140 C 210,162 200,175 186,178 L 182,140 C 192,138 196,122 194,104 C 192,86 188,70 186,62 Z" fill={`url(#hairG${uid})`}/>
            {/* Sheen */}
            <path d="M 108,52 C 112,70 112,100 110,130" fill="none" stroke={hairHi} strokeWidth={3} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'sleek_ponytail':
        return (
          <>
            <ellipse cx={150} cy={58} rx={60} ry={30} {...hProps}/>
            {/* Ponytail */}
            <path d="M 138,48 C 142,55 145,65 148,80 C 152,100 160,130 168,165 C 172,182 174,195 170,205 C 162,210 150,208 146,200 C 142,190 146,172 148,158 C 142,135 136,108 134,82 C 132,65 134,52 138,48 Z" fill={`url(#hairG${uid})`}/>
            {/* Band */}
            <ellipse cx={145} cy={55} rx={8} ry={5} fill={hairShad} opacity="0.6" transform="rotate(-15,145,55)"/>
            <ellipse cx={145} cy={55} rx={8} ry={5} fill="none" stroke={shade(hair,-50)} strokeWidth={2} transform="rotate(-15,145,55)"/>
          </>
        );

      case 'side_part':
        return (
          <>
            <ellipse cx={155} cy={58} rx={62} ry={30} {...hProps}/>
            <path d="M 88,60 C 92,78 94,100 98,122 C 100,136 104,148 108,155 L 108,138 C 102,128 98,112 98,92 C 98,76 100,64 102,58 Z" fill={hair}/>
            <path d="M 88,56 C 95,50 120,44 150,44 C 178,44 198,50 208,58" fill="none" stroke={hair} strokeWidth={22} strokeLinecap="round"/>
            <path d="M 112,44 C 116,46 118,50 116,56" fill="none" stroke={hairHi} strokeWidth={3} strokeLinecap="round" opacity="0.35"/>
          </>
        );

      case 'curtain_bangs':
        return (
          <>
            <ellipse cx={150} cy={58} rx={62} ry={30} {...hProps}/>
            {/* Left curtain bang */}
            <path d="M 88,54 C 90,66 92,80 96,95 C 100,108 108,118 118,122 L 118,105 C 110,100 104,88 102,74 C 100,62 100,52 102,46 Z" fill={`url(#hairG${uid})`}/>
            {/* Right curtain bang */}
            <path d="M 212,54 C 210,66 208,80 204,95 C 200,108 192,118 182,122 L 182,105 C 190,100 196,88 198,74 C 200,62 200,52 198,46 Z" fill={`url(#hairG${uid})`}/>
            <path d="M 104,50 C 106,60 108,72 108,84" fill="none" stroke={hairHi} strokeWidth={2.5} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'beach_waves':
        return (
          <>
            <ellipse cx={150} cy={58} rx={62} ry={30} {...hProps}/>
            {/* Left waves */}
            <path d="M 90,60 C 86,75 88,90 92,100 C 88,112 86,128 90,142 C 86,155 90,168 98,174 L 100,156 C 96,148 96,136 100,124 C 96,110 96,94 100,82 C 100,70 96,60 90,60 Z" fill={`url(#hairG${uid})`}/>
            {/* Right waves */}
            <path d="M 210,60 C 214,75 212,90 208,100 C 212,112 214,128 210,142 C 214,155 210,168 202,174 L 200,156 C 204,148 204,136 200,124 C 204,110 204,94 200,82 C 200,70 204,60 210,60 Z" fill={`url(#hairG${uid})`}/>
            <path d="M 98,66 C 94,80 96,96 98,108 C 94,122 94,136 98,148" fill="none" stroke={hairHi} strokeWidth={3} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'ringlet_curls':
        return (
          <>
            <ellipse cx={150} cy={58} rx={62} ry={32} {...hProps}/>
            {[92,104,116,130,170,184,196,208].map((x,i)=>{
              const side = x < 150 ? -1 : 1;
              const startY = 68;
              return (
                <path key={i}
                  d={`M ${x},${startY} C ${x+side*10},${startY+12} ${x-side*8},${startY+24} ${x+side*6},${startY+36} C ${x-side*10},${startY+48} ${x+side*8},${startY+60} ${x},${startY+70}`}
                  fill="none" stroke={hair} strokeWidth={5} strokeLinecap="round"/>
              );
            })}
          </>
        );

      case 'loose_curls':
        return (
          <>
            <ellipse cx={150} cy={58} rx={66} ry={34} {...hProps}/>
            {[90,106,122,140,160,178,194,210].map((x,i)=>{
              const side = x < 150 ? -1 : 1;
              return (
                <path key={i}
                  d={`M ${x},${66} C ${x+side*14},${80} ${x-side*10},${94} ${x+side*12},${110} C ${x-side*14},${124} ${x+side*8},${138} ${x},${148}`}
                  fill="none" stroke={hair} strokeWidth={7} strokeLinecap="round" opacity="0.88"/>
              );
            })}
          </>
        );

      case 'curly_high_ponytail':
        return (
          <>
            <ellipse cx={150} cy={64} rx={60} ry={28} {...hProps}/>
            {/* High ponytail puff */}
            <ellipse cx={150} cy={38} rx={36} ry={28} {...hProps}/>
            <ellipse cx={140} cy={30} rx={14} ry={10} fill={hairHi} opacity="0.28"/>
            {/* Curls hanging */}
            {[132,142,152,162].map((x,i)=>(
              <path key={i} d={`M ${x},${62} C ${x+5},${72} ${x-4},${82} ${x+3},${92}`}
                fill="none" stroke={hair} strokeWidth={4} strokeLinecap="round"/>
            ))}
          </>
        );

      case 'bun_low':
        return (
          <>
            <ellipse cx={150} cy={62} rx={58} ry={28} {...hProps}/>
            {/* Bun at back/bottom */}
            <ellipse cx={150} cy={110} rx={24} ry={20} fill={`url(#hairG${uid})`}/>
            <ellipse cx={144} cy={104} rx={8} ry={6} fill={hairHi} opacity="0.28"/>
            <ellipse cx={150} cy={108} rx={24} ry={20} fill="none" stroke={hairShad} strokeWidth={1.5} opacity="0.3"/>
          </>
        );

      case 'bun_high':
        return (
          <>
            <ellipse cx={150} cy={66} rx={58} ry={26} {...hProps}/>
            {/* Top bun */}
            <ellipse cx={150} cy={40} rx={26} ry={22} fill={`url(#hairG${uid})`}/>
            <ellipse cx={143} cy={33} rx={9} ry={7} fill={hairHi} opacity="0.3"/>
          </>
        );

      case 'space_buns':
        return (
          <>
            <ellipse cx={150} cy={66} rx={60} ry={26} {...hProps}/>
            {/* Left bun */}
            <ellipse cx={116} cy={44} rx={22} ry={20} fill={`url(#hairG${uid})`}/>
            <ellipse cx={110} cy={36} rx={8} ry={6} fill={hairHi} opacity="0.3"/>
            {/* Right bun */}
            <ellipse cx={184} cy={44} rx={22} ry={20} fill={`url(#hairG${uid})`}/>
            <ellipse cx={190} cy={36} rx={8} ry={6} fill={hairHi} opacity="0.3"/>
          </>
        );

      case 'half_up_half_down':
        return (
          <>
            <ellipse cx={150} cy={64} rx={62} ry={30} {...hProps}/>
            {/* Down portion left */}
            <path d="M 90,68 C 86,85 86,110 90,130 C 94,148 104,160 116,164 L 116,148 C 108,144 102,130 100,112 C 98,96 100,76 104,64 Z" fill={hair}/>
            {/* Down portion right */}
            <path d="M 210,68 C 214,85 214,110 210,130 C 206,148 196,160 184,164 L 184,148 C 192,144 198,130 200,112 C 202,96 200,76 196,64 Z" fill={hair}/>
            {/* Top half-up bun/puff */}
            <ellipse cx={150} cy={44} rx={28} ry={20} fill={`url(#hairG${uid})`}/>
            <ellipse cx={143} cy={36} rx={10} ry={7} fill={hairHi} opacity="0.28"/>
          </>
        );

      default:
        return <ellipse cx={150} cy={62} rx={60} ry={30} fill={`url(#hairG${uid})`}/>;
    }
  };

  // ── Top / Outfit ─────────────────────────────────────────────────────────────
  const renderTop = () => {
    const tc = topC;
    const tcD = shade(tc, -30);
    const tcH = shade(tc, 25);

    switch (topStyle) {
      case 'hoodie_classic':
        return (
          <>
            <path d="M 78,162 C 60,170 54,188 56,204 L 244,204 C 246,188 240,170 222,162 C 205,157 180,155 162,156 L 138,156 C 120,155 95,157 78,162 Z" fill={tc}/>
            <path d="M 56,204 L 56,245 L 244,245 L 244,204 Z" fill={tc}/>
            {/* Hood */}
            <path d="M 116,156 C 114,148 118,142 126,140 C 134,138 144,138 150,140 C 156,138 166,138 174,140 C 182,142 186,148 184,156" fill={tcD} opacity="0.5"/>
            {/* Zipper/center line */}
            <line x1={150} y1={160} x2={150} y2={244} stroke={tcD} strokeWidth={2.5} opacity="0.45"/>
            {/* Kangaroo pocket */}
            <path d="M 120,212 C 116,215 116,228 120,230 L 180,230 C 184,228 184,215 180,212 Z" fill={tcD} opacity="0.3"/>
            {/* Sheen */}
            <path d="M 85,170 C 82,182 80,200 82,218" fill="none" stroke={tcH} strokeWidth={3} strokeLinecap="round" opacity="0.22"/>
          </>
        );

      case 'hoodie_cropped':
        return (
          <>
            <path d="M 80,162 C 64,170 58,184 60,198 L 240,198 C 242,184 236,170 220,162 C 204,157 180,155 162,156 L 138,156 C 120,155 96,157 80,162 Z" fill={tc}/>
            <line x1={150} y1={162} x2={150} y2={197} stroke={tcD} strokeWidth={2} opacity="0.4"/>
          </>
        );

      case 'graphic_tee_ggu':
      case 'graphic_tee_plain':
        return (
          <>
            {/* Shoulders/sleeves */}
            <path d="M 58,162 C 52,172 50,188 54,204 L 80,204 C 76,192 78,176 84,168 Z" fill={tc}/>
            <path d="M 242,162 C 248,172 250,188 246,204 L 220,204 C 224,192 222,176 216,168 Z" fill={tc}/>
            {/* Body */}
            <path d="M 84,168 L 82,244 L 218,244 L 216,168 C 198,160 178,158 162,158 L 138,158 C 122,158 102,160 84,168 Z" fill={tc}/>
            {/* Neckline */}
            <path d="M 126,158 C 128,150 134,146 150,146 C 166,146 172,150 174,158" fill="none" stroke={tcD} strokeWidth={2} opacity="0.5"/>
            {topStyle === 'graphic_tee_ggu' && (
              <text x={150} y={210} fontSize={22} textAnchor="middle" fill="white" fontWeight="900" opacity="0.85" fontFamily="sans-serif">GGU</text>
            )}
            <path d="M 90,172 C 88,188 88,210 90,228" fill="none" stroke={tcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.2"/>
          </>
        );

      case 'off_shoulder':
        return (
          <>
            <path d="M 62,168 Q 150,158 238,168 L 240,244 L 60,244 Z" fill={tc}/>
            <path d="M 62,168 Q 150,160 238,168" fill="none" stroke={tcD} strokeWidth={3} strokeLinecap="round"/>
            <path d="M 72,174 C 70,192 70,216 72,234" fill="none" stroke={tcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.22"/>
          </>
        );

      case 'turtleneck':
        return (
          <>
            <path d="M 80,162 C 64,170 58,186 60,202 L 240,202 C 242,186 236,170 220,162 C 204,157 180,155 162,156 L 138,156 C 120,155 96,157 80,162 Z" fill={tc}/>
            <path d="M 60,202 L 60,244 L 240,244 L 240,202 Z" fill={tc}/>
            {/* Turtleneck */}
            <path d="M 136,134 C 132,140 130,150 134,158 L 166,158 C 170,150 168,140 164,134 C 158,130 142,130 136,134 Z" fill={tc}/>
            <path d="M 88,170 C 86,188 86,214 88,232" fill="none" stroke={tcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.2"/>
          </>
        );

      case 'denim_jacket':
        return (
          <>
            <path d="M 78,162 C 58,170 52,188 54,205 L 246,205 C 248,188 242,170 222,162 C 204,156 180,154 162,155 L 138,155 C 120,154 96,156 78,162 Z" fill="#4a7abf"/>
            <path d="M 54,205 L 54,246 L 246,246 L 246,205 Z" fill="#4a7abf"/>
            {/* Lapels */}
            <path d="M 138,155 L 130,164 L 148,176 L 150,158 Z" fill="#3560a0"/>
            <path d="M 162,155 L 170,164 L 152,176 L 150,158 Z" fill="#3560a0"/>
            {/* Chest pockets */}
            <rect x={90} y={178} width={30} height={22} rx={3} fill="#3a6aaa" opacity="0.7"/>
            <rect x={180} y={178} width={30} height={22} rx={3} fill="#3a6aaa" opacity="0.7"/>
            {/* Stitching */}
            <path d="M 60,206 L 60,244" fill="none" stroke="#2a5090" strokeWidth={1.2} opacity="0.5"/>
            <path d="M 240,206 L 240,244" fill="none" stroke="#2a5090" strokeWidth={1.2} opacity="0.5"/>
          </>
        );

      case 'varsity_jacket':
        return (
          <>
            <path d="M 80,162 C 62,170 56,188 58,205 L 242,205 C 244,188 238,170 220,162 C 204,156 180,154 162,155 L 138,155 C 120,154 96,156 80,162 Z" fill={tc}/>
            <path d="M 58,205 L 58,246 L 242,246 L 242,205 Z" fill={tc}/>
            {/* White sleeves */}
            <path d="M 58,202 L 58,244 L 80,244 L 78,164 C 62,172 56,188 58,202 Z" fill="white" opacity="0.9"/>
            <path d="M 242,202 L 242,244 L 220,244 L 222,164 C 238,172 244,188 242,202 Z" fill="white" opacity="0.9"/>
            {/* Letter on chest */}
            <circle cx={115} cy={200} r={14} fill="none" stroke="white" strokeWidth={2} opacity="0.6"/>
            <text x={115} y={205} fontSize={14} textAnchor="middle" fill="white" fontWeight="bold" fontFamily="serif">G</text>
          </>
        );

      case 'tank_top':
        return (
          <>
            <path d="M 108,162 L 106,244 L 194,244 L 192,162 C 180,158 165,156 162,156 L 138,156 C 135,156 120,158 108,162 Z" fill={tc}/>
            {/* Straps */}
            <path d="M 108,162 C 104,156 106,148 112,144 L 126,142 L 124,162 Z" fill={tc}/>
            <path d="M 192,162 C 196,156 194,148 188,144 L 174,142 L 176,162 Z" fill={tc}/>
            <path d="M 116,166 C 114,184 114,210 116,230" fill="none" stroke={tcH} strokeWidth={2} strokeLinecap="round" opacity="0.22"/>
          </>
        );

      case 'cardigan':
        return (
          <>
            <path d="M 78,162 C 60,170 54,188 56,204 L 244,204 C 246,188 240,170 222,162 C 204,157 180,155 162,156 L 138,156 C 120,155 96,157 78,162 Z" fill={tc}/>
            <path d="M 56,204 L 56,245 L 244,245 L 244,204 Z" fill={tc}/>
            {/* Open front */}
            <path d="M 140,156 L 136,168 L 148,180 L 150,160" fill={tcD} opacity="0.4"/>
            <path d="M 160,156 L 164,168 L 152,180 L 150,160" fill={tcD} opacity="0.4"/>
            {/* Buttons */}
            {[175,192,209,226].map((y,i)=>(
              <circle key={i} cx={150} cy={y} r={4} fill={tcH} stroke={tcD} strokeWidth={1} opacity="0.85"/>
            ))}
          </>
        );

      case 'blazer':
        return (
          <>
            <path d="M 76,162 C 56,170 50,190 52,207 L 248,207 C 250,190 244,170 224,162 C 206,156 182,154 162,155 L 138,155 C 118,154 94,156 76,162 Z" fill="#2c3e50"/>
            <path d="M 52,207 L 52,248 L 248,248 L 248,207 Z" fill="#2c3e50"/>
            {/* Lapels */}
            <path d="M 138,155 L 126,168 L 144,185 L 150,162 Z" fill="#1a252f"/>
            <path d="M 162,155 L 174,168 L 156,185 L 150,162 Z" fill="#1a252f"/>
            {/* Pocket handkerchief */}
            <path d="M 90,190 L 90,196 L 100,196 L 100,190 Z" fill="white" opacity="0.7"/>
            {/* Button */}
            <circle cx={150} cy={198} r={3.5} fill="#1a252f"/>
          </>
        );

      default:
        return (
          <path d="M 80,162 C 62,170 56,188 58,204 L 242,204 C 244,188 238,170 220,162 C 204,157 180,155 162,156 L 138,156 C 120,155 96,157 80,162 Z" fill={tc}/>
        );
    }
  };

  // ── Bottoms ───────────────────────────────────────────────────────────────────
  const renderBottom = () => {
    const bc = botC;
    const bcD = shade(bc, -30);
    const bcH = shade(bc, 22);

    switch (botStyle) {
      case 'jeans_skinny':
        return (
          <>
            <path d="M 98,232 L 96,278 L 124,278 L 128,256 L 132,232 Z" fill={bc}/>
            <path d="M 168,232 L 172,256 L 176,278 L 204,278 L 202,232 Z" fill={bc}/>
            <rect x={98} y={232} width={104} height={22} rx={4} fill={bc}/>
            {/* Seam */}
            <line x1={150} y1={234} x2={150} y2={252} stroke={bcD} strokeWidth={1.5} opacity="0.5"/>
            {/* Sheen */}
            <path d="M 106,238 C 104,252 104,264 106,272" fill="none" stroke={bcH} strokeWidth={2} strokeLinecap="round" opacity="0.22"/>
          </>
        );

      case 'jeans_straight':
        return (
          <>
            <path d="M 94,232 L 92,278 L 126,278 L 130,254 L 134,232 Z" fill={bc}/>
            <path d="M 166,232 L 170,254 L 174,278 L 208,278 L 206,232 Z" fill={bc}/>
            <rect x={94} y={232} width={112} height={22} rx={4} fill={bc}/>
            <line x1={150} y1={234} x2={150} y2={252} stroke={bcD} strokeWidth={1.5} opacity="0.5"/>
          </>
        );

      case 'leggings':
        return (
          <>
            <path d="M 102,232 L 100,278 L 124,278 L 126,256 L 128,232 Z" fill={bc}/>
            <path d="M 172,232 L 174,256 L 176,278 L 200,278 L 198,232 Z" fill={bc}/>
            <rect x={102} y={232} width={96} height={20} rx={4} fill={bc}/>
            {/* Highlight stripe */}
            <path d="M 108,238 C 106,252 106,264 108,274" fill="none" stroke={bcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.3"/>
            <path d="M 192,238 C 194,252 194,264 192,274" fill="none" stroke={bcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'joggers':
        return (
          <>
            <path d="M 96,232 L 94,272 L 126,272 L 128,252 L 130,232 Z" fill={bc}/>
            <path d="M 170,232 L 172,252 L 174,272 L 206,272 L 204,232 Z" fill={bc}/>
            <rect x={96} y={232} width={108} height={20} rx={6} fill={bc}/>
            {/* Cuffs */}
            <rect x={96} y={268} width={28} height={8} rx={4} fill={bcD} opacity="0.7"/>
            <rect x={176} y={268} width={28} height={8} rx={4} fill={bcD} opacity="0.7"/>
          </>
        );

      case 'mini_skirt':
        return (
          <>
            <path d="M 94,232 C 90,244 88,258 92,268 L 208,268 C 212,258 210,244 206,232 Z" fill={bc}/>
            <rect x={94} y={232} width={112} height={16} rx={4} fill={bc}/>
            <path d="M 100,240 C 98,252 98,260 100,266" fill="none" stroke={bcH} strokeWidth={2} strokeLinecap="round" opacity="0.25"/>
          </>
        );

      case 'pleated_skirt':
        return (
          <>
            <path d="M 92,232 C 86,248 84,264 90,278 L 210,278 C 216,264 214,248 208,232 Z" fill={bc}/>
            <rect x={92} y={232} width={116} height={16} rx={4} fill={bc}/>
            {[0,1,2,3,4,5].map(i=>(
              <line key={i} x1={104+i*18} y1={248} x2={102+i*18} y2={276} stroke={bcD} strokeWidth={2} opacity="0.4"/>
            ))}
          </>
        );

      case 'biker_shorts':
        return (
          <>
            <path d="M 100,232 L 98,262 L 130,262 L 132,246 L 132,232 Z" fill={bc}/>
            <path d="M 168,232 L 168,246 L 170,262 L 202,262 L 200,232 Z" fill={bc}/>
            <rect x={100} y={232} width={100} height={20} rx={4} fill={bc}/>
            <path d="M 108,238 C 106,248 106,256 108,260" fill="none" stroke={bcH} strokeWidth={2.5} strokeLinecap="round" opacity="0.28"/>
          </>
        );

      case 'cargo_pants':
        return (
          <>
            <path d="M 94,232 L 92,278 L 126,278 L 128,254 L 132,232 Z" fill={bc}/>
            <path d="M 168,232 L 172,254 L 174,278 L 208,278 L 206,232 Z" fill={bc}/>
            <rect x={94} y={232} width={112} height={20} rx={4} fill={bc}/>
            {/* Cargo pockets */}
            <rect x={95} y={246} width={26} height={18} rx={4} fill={bcD} opacity="0.55"/>
            <rect x={179} y={246} width={26} height={18} rx={4} fill={bcD} opacity="0.55"/>
            {/* Pocket flap */}
            <line x1={97} y1={252} x2={119} y2={252} stroke={bcD} strokeWidth={1.5} opacity="0.6"/>
            <line x1={181} y1={252} x2={203} y2={252} stroke={bcD} strokeWidth={1.5} opacity="0.6"/>
          </>
        );

      case 'sweatpants':
        return (
          <>
            <path d="M 92,232 L 90,278 L 128,278 L 130,252 L 132,232 Z" fill={bc}/>
            <path d="M 168,232 L 170,252 L 172,278 L 210,278 L 208,232 Z" fill={bc}/>
            <rect x={92} y={232} width={116} height={22} rx={8} fill={bc}/>
            {/* Elastic waistband */}
            <rect x={92} y={232} width={116} height={14} rx={7} fill={bcD} opacity="0.4"/>
            {/* Ankle cuffs */}
            <rect x={90} y={271} width={36} height={7} rx={3.5} fill={bcD} opacity="0.55"/>
            <rect x={174} y={271} width={36} height={7} rx={3.5} fill={bcD} opacity="0.55"/>
          </>
        );

      case 'school_uniform_skirt':
        return (
          <>
            <path d="M 90,232 C 84,248 82,265 88,280 L 212,280 C 218,265 216,248 210,232 Z" fill="#1a237e"/>
            <rect x={90} y={232} width={120} height={16} rx={4} fill="#1a237e"/>
            {[0,1,2,3,4].map(i=>(
              <line key={i} x1={106+i*22} y1={248} x2={104+i*22} y2={278} stroke="#142080" strokeWidth={2.5} opacity="0.5"/>
            ))}
          </>
        );

      case 'shorts_denim':
        return (
          <>
            <path d="M 98,232 L 96,262 L 130,262 L 132,246 L 130,232 Z" fill="#4a7abf"/>
            <path d="M 170,232 L 168,246 L 170,262 L 204,262 L 202,232 Z" fill="#4a7abf"/>
            <rect x={98} y={232} width={104} height={20} rx={4} fill="#4a7abf"/>
            {/* Distressed lines */}
            <line x1={106} y1={242} x2={124} y2={242} stroke="#3a6aaa" strokeWidth={1.5} opacity="0.6"/>
            <line x1={176} y1={242} x2={194} y2={242} stroke="#3a6aaa" strokeWidth={1.5} opacity="0.6"/>
          </>
        );

      case 'shorts_athletic':
        return (
          <>
            <path d="M 100,232 L 98,264 L 130,264 L 132,248 L 130,232 Z" fill={bc}/>
            <path d="M 170,232 L 168,248 L 170,264 L 202,264 L 200,232 Z" fill={bc}/>
            <rect x={100} y={232} width={100} height={20} rx={4} fill={bc}/>
            {/* Athletic stripe */}
            <rect x={100} y={234} width={7} height={28} rx={3} fill="white" opacity="0.25"/>
            <rect x={193} y={234} width={7} height={28} rx={3} fill="white" opacity="0.25"/>
          </>
        );

      default:
        return (
          <>
            <path d="M 98,232 L 96,278 L 128,278 L 130,254 L 132,232 Z" fill={bc}/>
            <path d="M 168,232 L 170,254 L 172,278 L 204,278 L 202,232 Z" fill={bc}/>
            <rect x={98} y={232} width={104} height={22} rx={4} fill={bc}/>
          </>
        );
    }
  };

  // ── Shoes ─────────────────────────────────────────────────────────────────────
  const renderShoes = () => {
    const sc = shoeC;
    const scD = shade(sc, -35);
    const scH = shade(sc, 30);

    switch (shoeStyle) {
      case 'sneakers_classic':
        return (
          <>
            <path d="M 88,278 C 84,282 82,286 84,290 L 130,290 C 132,286 132,280 130,278 Z" fill={sc}/>
            <path d="M 170,278 C 168,280 168,286 170,290 L 216,290 C 218,286 216,282 212,278 Z" fill={sc}/>
            {/* Sole */}
            <rect x={82} y={288} width={50} height={5} rx={2.5} fill="white"/>
            <rect x={168} y={288} width={50} height={5} rx={2.5} fill="white"/>
            {/* Lace area */}
            <path d="M 92,280 C 96,276 108,274 122,276" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" opacity="0.8"/>
            <path d="M 178,280 C 182,276 194,274 208,276" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" opacity="0.8"/>
            {/* Toe highlight */}
            <ellipse cx={95} cy={282} rx={8} ry={4} fill={scH} opacity="0.3"/>
            <ellipse cx={181} cy={282} rx={8} ry={4} fill={scH} opacity="0.3"/>
          </>
        );

      case 'sneakers_high_top':
        return (
          <>
            <rect x={84} y={266} width={46} height={22} rx={6} fill={sc}/>
            <rect x={170} y={266} width={46} height={22} rx={6} fill={sc}/>
            {/* Sole */}
            <rect x={84} y={284} width={46} height={6} rx={3} fill="white"/>
            <rect x={170} y={284} width={46} height={6} rx={3} fill="white"/>
            {/* Laces */}
            {[0,1,2].map(i=>(
              <g key={i}>
                <path d={`M ${88+i*4},${268+i*4} C ${96},${268+i*4} ${110},${270+i*4} ${120+i*2},${268+i*4}`} fill="none" stroke="white" strokeWidth={1.5} opacity="0.8"/>
                <path d={`M ${174+i*4},${268+i*4} C ${182},${268+i*4} ${196},${270+i*4} ${206+i*2},${268+i*4}`} fill="none" stroke="white" strokeWidth={1.5} opacity="0.8"/>
              </g>
            ))}
          </>
        );

      case 'sneakers_platform':
        return (
          <>
            <path d="M 86,274 C 82,278 80,284 82,290 L 132,290 C 134,284 134,278 132,274 Z" fill={sc}/>
            <path d="M 168,274 C 166,278 166,284 168,290 L 218,290 C 220,284 220,278 216,274 Z" fill={sc}/>
            {/* Thick platform sole */}
            <rect x={80} y={288} width={54} height={8} rx={4} fill="white"/>
            <rect x={166} y={288} width={54} height={8} rx={4} fill="white"/>
            <ellipse cx={96} cy={278} rx={10} ry={4} fill={scH} opacity="0.28"/>
            <ellipse cx={182} cy={278} rx={10} ry={4} fill={scH} opacity="0.28"/>
          </>
        );

      case 'boots_ankle':
        return (
          <>
            <rect x={86} y={266} width={44} height={24} rx={6} fill={sc}/>
            <rect x={170} y={266} width={44} height={24} rx={6} fill={sc}/>
            <rect x={84} y={285} width={48} height={6} rx={3} fill={scD}/>
            <rect x={168} y={285} width={48} height={6} rx={3} fill={scD}/>
            {/* Boot shine */}
            <path d="M 94,270 C 92,276 92,282 94,286" fill="none" stroke={scH} strokeWidth={2.5} strokeLinecap="round" opacity="0.3"/>
            <path d="M 178,270 C 176,276 176,282 178,286" fill="none" stroke={scH} strokeWidth={2.5} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'boots_knee_high':
        return (
          <>
            <rect x={88} y={248} width={42} height={42} rx={6} fill={sc}/>
            <rect x={170} y={248} width={42} height={42} rx={6} fill={sc}/>
            <rect x={86} y={285} width={46} height={6} rx={3} fill={scD}/>
            <rect x={168} y={285} width={46} height={6} rx={3} fill={scD}/>
            {/* Knee detail */}
            <line x1={90} y1={258} x2={128} y2={258} stroke={scD} strokeWidth={1.5} opacity="0.4"/>
            <line x1={172} y1={258} x2={210} y2={258} stroke={scD} strokeWidth={1.5} opacity="0.4"/>
            <path d="M 96,252 C 94,262 94,272 96,280" fill="none" stroke={scH} strokeWidth={2.5} strokeLinecap="round" opacity="0.28"/>
          </>
        );

      case 'platform_shoes':
        return (
          <>
            <path d="M 86,272 L 130,272 L 128,288 L 84,288 Z" fill={sc}/>
            <path d="M 170,272 L 214,272 L 216,288 L 172,288 Z" fill={sc}/>
            <rect x={84} y={286} width={46} height={8} rx={4} fill="#1a1a1a"/>
            <rect x={170} y={286} width={46} height={8} rx={4} fill="#1a1a1a"/>
            {/* Heel */}
            <rect x={122} y={280} width={8} height={12} rx={2} fill="#1a1a1a"/>
            <rect x={170} y={280} width={8} height={12} rx={2} fill="#1a1a1a"/>
          </>
        );

      case 'slides':
        return (
          <>
            <ellipse cx={109} cy={284} rx={26} ry={8} fill={sc}/>
            <ellipse cx={191} cy={284} rx={26} ry={8} fill={sc}/>
            {/* Strap */}
            <path d="M 87,280 C 92,274 118,272 128,278" fill="none" stroke={sc} strokeWidth={6} strokeLinecap="round"/>
            <path d="M 173,280 C 178,274 204,272 214,278" fill="none" stroke={sc} strokeWidth={6} strokeLinecap="round"/>
          </>
        );

      case 'uggs':
        return (
          <>
            <rect x={86} y={260} width={44} height={30} rx={8} fill="#c8a882"/>
            <rect x={170} y={260} width={44} height={30} rx={8} fill="#c8a882"/>
            {/* Sherpa cuff */}
            <rect x={84} y={258} width={48} height={12} rx={6} fill="#e8d4b8"/>
            <rect x={168} y={258} width={48} height={12} rx={6} fill="#e8d4b8"/>
            <path d="M 94,264 C 92,272 92,278 94,284" fill="none" stroke="#b89470" strokeWidth={2} strokeLinecap="round" opacity="0.3"/>
          </>
        );

      case 'heels':
        return (
          <>
            <path d="M 86,278 C 82,280 82,286 86,288 L 126,288 L 122,274 Z" fill={sc}/>
            <path d="M 174,274 L 170,288 L 214,288 C 218,286 218,280 214,278 Z" fill={sc}/>
            {/* Heel */}
            <rect x={120} y={278} width={6} height={12} rx={3} fill={scD}/>
            <rect x={174} y={278} width={6} height={12} rx={3} fill={scD}/>
            {/* Strap */}
            <path d="M 88,278 C 100,272 116,270 124,274" fill="none" stroke={sc} strokeWidth={4} strokeLinecap="round"/>
            <path d="M 176,274 C 184,270 200,272 212,278" fill="none" stroke={sc} strokeWidth={4} strokeLinecap="round"/>
            {/* Shine */}
            <ellipse cx={94} cy={280} rx={6} ry={3} fill={scH} opacity="0.3"/>
          </>
        );

      case 'loafers':
        return (
          <>
            <path d="M 86,276 C 82,280 82,288 88,290 L 130,290 C 132,286 130,278 128,276 Z" fill="#6b3e1e"/>
            <path d="M 172,276 C 170,278 168,286 170,290 L 212,290 C 218,288 218,280 214,276 Z" fill="#6b3e1e"/>
            {/* Tassel/buckle */}
            <rect x={100} y={276} width={18} height={5} rx={2} fill="#c8a828"/>
            <rect x={182} y={276} width={18} height={5} rx={2} fill="#c8a828"/>
            <rect x={84} y={288} width={48} height={4} rx={2} fill="#3a1e0a"/>
            <rect x={168} y={288} width={48} height={4} rx={2} fill="#3a1e0a"/>
          </>
        );

      default:
        return (
          <>
            <path d="M 88,278 C 84,282 84,290 88,292 L 130,292 C 132,288 130,280 128,278 Z" fill={sc}/>
            <path d="M 172,278 C 170,280 168,288 170,292 L 212,292 C 216,290 216,282 212,278 Z" fill={sc}/>
          </>
        );
    }
  };

  // ── Accessories ───────────────────────────────────────────────────────────────
  const renderAccessory = () => {
    switch (accessory) {
      case 'hoop_earrings_small':
        return (
          <>
            <circle cx={87} cy={92} r={7} fill="none" stroke="#e8c840" strokeWidth={2.5}/>
            <circle cx={213} cy={92} r={7} fill="none" stroke="#e8c840" strokeWidth={2.5}/>
          </>
        );
      case 'hoop_earrings_large':
        return (
          <>
            <circle cx={84} cy={96} r={12} fill="none" stroke="#e8c840" strokeWidth={3}/>
            <circle cx={216} cy={96} r={12} fill="none" stroke="#e8c840" strokeWidth={3}/>
          </>
        );
      case 'stud_earrings':
        return (
          <>
            <circle cx={89} cy={88} r={4.5} fill="#e8c840"/>
            <circle cx={211} cy={88} r={4.5} fill="#e8c840"/>
            <circle cx={90} cy={87} r={1.5} fill="white" opacity="0.7"/>
            <circle cx={212} cy={87} r={1.5} fill="white" opacity="0.7"/>
          </>
        );
      case 'headband_simple':
        return (
          <path d="M 95,68 Q 150,52 205,68" fill="none" stroke={topC} strokeWidth={8} strokeLinecap="round"/>
        );
      case 'headband_decorated':
        return (
          <>
            <path d="M 95,68 Q 150,52 205,68" fill="none" stroke={topC} strokeWidth={8} strokeLinecap="round"/>
            {/* Flower/gem */}
            <circle cx={150} cy={56} r={7} fill="#ff69b4"/>
            <circle cx={150} cy={56} r={3.5} fill="#ffcce8"/>
            {[-20,0,20].map((dx,i)=>(
              <ellipse key={i} cx={150+dx*0.5} cy={56} rx={2.5} ry={5} fill="#ff69b4" transform={`rotate(${i*60},150,56)`} opacity="0.7"/>
            ))}
          </>
        );
      case 'hair_bow':
        return (
          <>
            <path d="M 135,64 C 130,58 128,52 134,50 C 140,48 145,54 148,60" fill="#ff69b4"/>
            <path d="M 165,64 C 170,58 172,52 166,50 C 160,48 155,54 152,60" fill="#ff69b4"/>
            <ellipse cx={150} cy={62} rx={5} ry={4} fill="#ff1493"/>
            <path d="M 136,52 C 138,48 144,46 150,48" fill="none" stroke="white" strokeWidth={1.5} opacity="0.5"/>
          </>
        );
      case 'glasses_clear':
        return (
          <>
            <rect x={106} y={74} width={36} height={24} rx={8} fill="rgba(180,220,255,0.25)" stroke="#aaaaaa" strokeWidth={2}/>
            <rect x={158} y={74} width={36} height={24} rx={8} fill="rgba(180,220,255,0.25)" stroke="#aaaaaa" strokeWidth={2}/>
            <line x1={142} y1={86} x2={158} y2={86} stroke="#aaaaaa" strokeWidth={2}/>
            <line x1={104} y1={82} x2={90} y2={82} stroke="#aaaaaa" strokeWidth={2}/>
            <line x1={196} y1={82} x2={210} y2={82} stroke="#aaaaaa" strokeWidth={2}/>
          </>
        );
      case 'glasses_sunglasses':
        return (
          <>
            <rect x={104} y={72} width={40} height={26} rx={8} fill="#1a1a1a" opacity="0.88"/>
            <rect x={156} y={72} width={40} height={26} rx={8} fill="#1a1a1a" opacity="0.88"/>
            <line x1={144} y1={85} x2={156} y2={85} stroke="#333" strokeWidth={3}/>
            <line x1={102} y1={80} x2={88} y2={80} stroke="#333" strokeWidth={2.5}/>
            <line x1={198} y1={80} x2={212} y2={80} stroke="#333" strokeWidth={2.5}/>
            <ellipse cx={120} cy={79} rx={12} ry={6} fill="white" opacity="0.1"/>
            <ellipse cx={172} cy={79} rx={12} ry={6} fill="white" opacity="0.1"/>
          </>
        );
      case 'necklace_simple':
        return (
          <path d="M 132,140 Q 150,158 168,140" fill="none" stroke="#e8c840" strokeWidth={2.5}/>
        );
      case 'necklace_pendant':
        return (
          <>
            <path d="M 132,140 Q 150,162 168,140" fill="none" stroke="#e8c840" strokeWidth={2.5}/>
            <circle cx={150} cy={158} r={5} fill="#e8c840"/>
            <circle cx={150} cy={158} r={2.5} fill="#fff8c0" opacity="0.8"/>
          </>
        );
      case 'scrunchie_wrist':
        return (
          <>
            <ellipse cx={58} cy={194} rx={10} ry={5} fill="#ff69b4" transform="rotate(-15,58,194)"/>
            <ellipse cx={242} cy={194} rx={10} ry={5} fill="#a855f7" transform="rotate(15,242,194)"/>
          </>
        );
      case 'backpack':
        return (
          <>
            <rect x={50} y={168} width={26} height={38} rx={6} fill="#ff69b4"/>
            <rect x={52} y={172} width={22} height={28} rx={4} fill={shade('#ff69b4',-25)} opacity="0.4"/>
            <rect x={57} y={176} width={12} height={8} rx={3} fill="white" opacity="0.2"/>
          </>
        );
      case 'crown_radiant':
        return (
          <>
            <path d="M 116,52 L 126,32 L 150,44 L 174,32 L 184,52 Z" fill="#ffd700" stroke="#ff69b4" strokeWidth={2}/>
            {[126,150,174].map((x,i)=>(
              <circle key={i} cx={x} cy={i===1?36:32} r={4} fill="#fff8a0"/>
            ))}
            {/* Crown shine */}
            <path d="M 124,44 L 130,34 L 136,42" fill="none" stroke="white" strokeWidth={1.5} opacity="0.5"/>
          </>
        );
      case 'ggu_badge':
        return (
          <>
            <circle cx={192} cy={180} r={14} fill="#ffd700" stroke="#ff69b4" strokeWidth={2}/>
            <text x={192} y={185} fontSize={11} textAnchor="middle" fill="#1a0a00" fontWeight="900" fontFamily="sans-serif">GGU</text>
          </>
        );
      case 'halo':
        return (
          <>
            <ellipse cx={150} cy={28} rx={38} ry={12} fill="none" stroke="#ffd700" strokeWidth={5} opacity="0.85"/>
            <ellipse cx={150} cy={28} rx={38} ry={12} fill="none" stroke="white" strokeWidth={2} opacity="0.5"/>
          </>
        );
      case 'headphones':
        return (
          <>
            <path d="M 90,84 A 62,62 0 0 1 210,84" fill="none" stroke="#1a1a1a" strokeWidth={7} strokeLinecap="round"/>
            <rect x={80} y={84} width={20} height={28} rx={8} fill="#222" stroke="#333" strokeWidth={1}/>
            <rect x={200} y={84} width={20} height={28} rx={8} fill="#222" stroke="#333" strokeWidth={1}/>
            <rect x={82} y={88} width={16} height={20} rx={5} fill="#ff69b4" opacity="0.7"/>
            <rect x={202} y={88} width={16} height={20} rx={5} fill="#ff69b4" opacity="0.7"/>
          </>
        );
      default:
        return null;
    }
  };

  // ── Makeup ────────────────────────────────────────────────────────────────────
  const Makeup = () => (
    <>
      {blush && (
        <>
          <ellipse cx={110} cy={100} rx={22} ry={12} fill="#ff8fab" opacity="0.28" filter={`url(#blur${uid})`}/>
          <ellipse cx={190} cy={100} rx={22} ry={12} fill="#ff8fab" opacity="0.28" filter={`url(#blur${uid})`}/>
        </>
      )}
      {/* Contour/shading always subtle */}
      <path d="M 94,88 C 90,95 90,108 96,118 C 92,116 88,110 88,100 Z" fill={skinShad} opacity="0.14"/>
      <path d="M 206,88 C 210,95 210,108 204,118 C 208,116 212,110 212,100 Z" fill={skinShad} opacity="0.14"/>
      {/* Highlight on nose bridge */}
      <line x1={150} y1={72} x2={150} y2={100} stroke="white" strokeWidth={2.5} strokeLinecap="round" opacity="0.12"/>
    </>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <SkinDefs/>
      <HairDefs/>

      {/* Background */}
      {renderBG()}

      {/* Shoes (behind legs) */}
      {renderShoes()}

      {/* Legs */}
      {renderBottom()}
      <Legs/>

      {/* Body base */}
      <Body/>

      {/* Arms */}
      <Hands/>

      {/* Outfit top (over body) */}
      {renderTop()}

      {/* Neck */}
      <Neck/>

      {/* Ears */}
      <Ears/>

      {/* Face */}
      <Face/>

      {/* Hair behind (back layer) */}
      {['bone_straight','beach_waves','loose_curls','ringlet_curls','locs_long','locs_short','box_braids_long','box_braids_medium','knotless_braids','goddess_braids','fulani_braids','curtain_bangs'].includes(hairStyle) && renderHair()}

      {/* Eyebrows */}
      <Eyebrows/>

      {/* Eyes */}
      <Eyes/>

      {/* Nose */}
      <Nose/>

      {/* Makeup effects */}
      <Makeup/>

      {/* Lips */}
      <Lips/>

      {/* Hair in front (top layer for puffs/buns/afro) */}
      {!['bone_straight','beach_waves','loose_curls','ringlet_curls','locs_long','locs_short','box_braids_long','box_braids_medium','knotless_braids','goddess_braids','fulani_braids','curtain_bangs'].includes(hairStyle) && renderHair()}

      {/* Accessories */}
      {renderAccessory()}

      {/* Glow vignette */}
      <defs>
        <radialGradient id={`vignette${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
        </radialGradient>
      </defs>
      <rect width={300} height={300} fill={`url(#vignette${uid})`} style={{pointerEvents:'none'}}/>
    </svg>
  );
}