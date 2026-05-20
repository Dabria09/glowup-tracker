export default function AvatarPreview({ config, size = 180 }) {
  const s = size;
  const {
    bg = '#1a0a2e',
    skinTone = '#f5c5a3',
    hairColor = '#2c1a0e',
    hairStyle = 'short',
    eyeStyle = 'normal',
    outfitColor = '#e91e8c',
    outfitStyle = 'tee',
    accessory = 'none',
    blush = false,
  } = config || {};

  const hairStyles = {
    short: (
      <rect x={s * 0.28} y={s * 0.12} width={s * 0.44} height={s * 0.18} rx={s * 0.04} fill={hairColor} />
    ),
    long: (
      <>
        <rect x={s * 0.28} y={s * 0.12} width={s * 0.44} height={s * 0.16} rx={s * 0.04} fill={hairColor} />
        <rect x={s * 0.26} y={s * 0.26} width={s * 0.08} height={s * 0.22} rx={s * 0.03} fill={hairColor} />
        <rect x={s * 0.66} y={s * 0.26} width={s * 0.08} height={s * 0.22} rx={s * 0.03} fill={hairColor} />
      </>
    ),
    curly: (
      <>
        <ellipse cx={s * 0.33} cy={s * 0.17} rx={s * 0.08} ry={s * 0.09} fill={hairColor} />
        <ellipse cx={s * 0.43} cy={s * 0.13} rx={s * 0.08} ry={s * 0.09} fill={hairColor} />
        <ellipse cx={s * 0.57} cy={s * 0.13} rx={s * 0.08} ry={s * 0.09} fill={hairColor} />
        <ellipse cx={s * 0.67} cy={s * 0.17} rx={s * 0.08} ry={s * 0.09} fill={hairColor} />
      </>
    ),
    bun: (
      <>
        <rect x={s * 0.28} y={s * 0.14} width={s * 0.44} height={s * 0.14} rx={s * 0.03} fill={hairColor} />
        <ellipse cx={s * 0.5} cy={s * 0.1} rx={s * 0.1} ry={s * 0.1} fill={hairColor} />
      </>
    ),
    ponytail: (
      <>
        <rect x={s * 0.28} y={s * 0.12} width={s * 0.44} height={s * 0.16} rx={s * 0.04} fill={hairColor} />
        <rect x={s * 0.63} y={s * 0.2} width={s * 0.06} height={s * 0.28} rx={s * 0.03} fill={hairColor} />
      </>
    ),
    none: null,
  };

  const eyeStyles = {
    normal: (
      <>
        <ellipse cx={s * 0.39} cy={s * 0.33} rx={s * 0.045} ry={s * 0.05} fill="#1a1a2e" />
        <ellipse cx={s * 0.61} cy={s * 0.33} rx={s * 0.045} ry={s * 0.05} fill="#1a1a2e" />
        <circle cx={s * 0.395} cy={s * 0.315} r={s * 0.013} fill="white" />
        <circle cx={s * 0.615} cy={s * 0.315} r={s * 0.013} fill="white" />
      </>
    ),
    stars: (
      <>
        <text x={s * 0.31} y={s * 0.36} fontSize={s * 0.09} textAnchor="middle">⭐</text>
        <text x={s * 0.56} y={s * 0.36} fontSize={s * 0.09} textAnchor="middle">⭐</text>
      </>
    ),
    hearts: (
      <>
        <text x={s * 0.31} y={s * 0.36} fontSize={s * 0.08} textAnchor="middle">💗</text>
        <text x={s * 0.56} y={s * 0.36} fontSize={s * 0.08} textAnchor="middle">💗</text>
      </>
    ),
    cool: (
      <>
        <rect x={s * 0.32} y={s * 0.30} width={s * 0.13} height={s * 0.07} rx={s * 0.02} fill="#1a1a2e" />
        <rect x={s * 0.55} y={s * 0.30} width={s * 0.13} height={s * 0.07} rx={s * 0.02} fill="#1a1a2e" />
        <circle cx={s * 0.395} cy={s * 0.315} r={s * 0.013} fill="white" />
        <circle cx={s * 0.615} cy={s * 0.315} r={s * 0.013} fill="white" />
      </>
    ),
    wink: (
      <>
        <ellipse cx={s * 0.39} cy={s * 0.33} rx={s * 0.045} ry={s * 0.05} fill="#1a1a2e" />
        <line x1={s * 0.57} y1={s * 0.31} x2={s * 0.65} y2={s * 0.35} stroke="#1a1a2e" strokeWidth={s * 0.025} strokeLinecap="round" />
        <circle cx={s * 0.395} cy={s * 0.315} r={s * 0.013} fill="white" />
      </>
    ),
  };

  const outfitStyles = {
    tee: (
      <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} fill={outfitColor} />
    ),
    hoodie: (
      <>
        <rect x={s * 0.22} y={s * 0.57} width={s * 0.56} height={s * 0.24} rx={s * 0.05} fill={outfitColor} />
        <rect x={s * 0.22} y={s * 0.57} width={s * 0.56} height={s * 0.08} rx={s * 0.05} fill={`${outfitColor}cc`} />
      </>
    ),
    dress: (
      <polygon points={`${s*0.3},${s*0.58} ${s*0.7},${s*0.58} ${s*0.78},${s*0.82} ${s*0.22},${s*0.82}`} fill={outfitColor} />
    ),
    jacket: (
      <>
        <rect x={s * 0.22} y={s * 0.57} width={s * 0.56} height={s * 0.24} rx={s * 0.05} fill={outfitColor} />
        <rect x={s * 0.46} y={s * 0.57} width={s * 0.08} height={s * 0.24} fill={`${outfitColor}88`} />
      </>
    ),
  };

  const accessories = {
    none: null,
    crown: (
      <polygon points={`${s*0.35},${s*0.12} ${s*0.42},${s*0.04} ${s*0.5},${s*0.1} ${s*0.58},${s*0.04} ${s*0.65},${s*0.12}`} fill="#FFD700" stroke="#FFA500" strokeWidth="1.5" />
    ),
    glasses: (
      <>
        <rect x={s * 0.3} y={s * 0.29} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="none" stroke="#333" strokeWidth={s * 0.02} />
        <rect x={s * 0.56} y={s * 0.29} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="none" stroke="#333" strokeWidth={s * 0.02} />
        <line x1={s * 0.44} y1={s * 0.335} x2={s * 0.56} y2={s * 0.335} stroke="#333" strokeWidth={s * 0.015} />
      </>
    ),
    bow: (
      <>
        <ellipse cx={s * 0.44} cy={s * 0.14} rx={s * 0.07} ry={s * 0.04} fill="#ff69b4" transform={`rotate(-20,${s*0.44},${s*0.14})`} />
        <ellipse cx={s * 0.56} cy={s * 0.14} rx={s * 0.07} ry={s * 0.04} fill="#ff69b4" transform={`rotate(20,${s*0.56},${s*0.14})`} />
        <circle cx={s * 0.5} cy={s * 0.14} r={s * 0.025} fill="#ff1493" />
      </>
    ),
    halo: (
      <ellipse cx={s * 0.5} cy={s * 0.1} rx={s * 0.13} ry={s * 0.04} fill="none" stroke="#FFD700" strokeWidth={s * 0.025} />
    ),
    headphones: (
      <>
        <path d={`M ${s*0.3} ${s*0.26} A ${s*0.2} ${s*0.2} 0 0 1 ${s*0.7} ${s*0.26}`} fill="none" stroke="#555" strokeWidth={s*0.03} />
        <rect x={s * 0.27} y={s * 0.26} width={s * 0.06} height={s * 0.09} rx={s * 0.02} fill="#333" />
        <rect x={s * 0.67} y={s * 0.26} width={s * 0.06} height={s * 0.09} rx={s * 0.02} fill="#333" />
      </>
    ),
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width={s} height={s} rx={s * 0.5} fill={bg} />

      {/* Body */}
      <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.3} rx={s * 0.06} fill={skinTone} />
      {outfitStyles[outfitStyle] || outfitStyles.tee}

      {/* Arms */}
      <rect x={s * 0.12} y={s * 0.58} width={s * 0.13} height={s * 0.18} rx={s * 0.04} fill={skinTone} />
      <rect x={s * 0.75} y={s * 0.58} width={s * 0.13} height={s * 0.18} rx={s * 0.04} fill={skinTone} />

      {/* Neck */}
      <rect x={s * 0.44} y={s * 0.52} width={s * 0.12} height={s * 0.08} rx={s * 0.02} fill={skinTone} />

      {/* Head */}
      <rect x={s * 0.27} y={s * 0.17} width={s * 0.46} height={s * 0.36} rx={s * 0.08} fill={skinTone} />

      {/* Hair (behind face layer) */}
      {hairStyles[hairStyle]}

      {/* Eyes */}
      {eyeStyles[eyeStyle] || eyeStyles.normal}

      {/* Nose */}
      <circle cx={s * 0.5} cy={s * 0.39} r={s * 0.02} fill={`${skinTone}88`} />

      {/* Mouth - smile */}
      <path d={`M ${s*0.42} ${s*0.44} Q ${s*0.5} ${s*0.49} ${s*0.58} ${s*0.44}`} fill="none" stroke="#c87942" strokeWidth={s * 0.02} strokeLinecap="round" />

      {/* Blush */}
      {blush && (
        <>
          <ellipse cx={s * 0.33} cy={s * 0.40} rx={s * 0.055} ry={s * 0.03} fill="#ff8fab" opacity="0.45" />
          <ellipse cx={s * 0.67} cy={s * 0.40} rx={s * 0.055} ry={s * 0.03} fill="#ff8fab" opacity="0.45" />
        </>
      )}

      {/* Accessory */}
      {accessories[accessory]}
    </svg>
  );
}