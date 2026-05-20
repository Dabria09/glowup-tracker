import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_STYLES,
  EYE_COLORS,
  EYEBROW_STYLES,
  TOP_STYLES,
  BOTTOM_STYLES,
  SHOE_STYLES,
  ACCESSORIES,
  CLOTHING_COLORS,
  BG_COLORS,
} from './avatarData';

export default function AvatarPreview({ config, size = 200, ageGroup = 'glow_girls' }) {
  const s = size;
  
  // Get selected values with defaults
  const getSelected = (arr, id, fallback) => arr.find(x => x.id === id) || fallback;
  
  const skinTone = getSelected(SKIN_TONES, config?.skinTone, SKIN_TONES[1]).color;
  const hairColor = getSelected(HAIR_COLORS, config?.hairColor, HAIR_COLORS[1]).color;
  const eyeColor = getSelected(EYE_COLORS, config?.eyeColor, EYE_COLORS[0]).color;
  const topColor = getSelected(CLOTHING_COLORS, config?.topColor, CLOTHING_COLORS[5]).color;
  const bottomColor = getSelected(CLOTHING_COLORS, config?.bottomColor, CLOTHING_COLORS[3]).color;
  const shoeColor = getSelected(CLOTHING_COLORS, config?.shoeColor, CLOTHING_COLORS[1]).color;
  const bgColor = getSelected(BG_COLORS, config?.bg, BG_COLORS[0]).color;

  const hairStyle = config?.hairStyle || 'afro_full';
  const eyeStyle = config?.eyeStyle || 'almond';
  const eyebrowStyle = config?.eyebrowStyle || 'thick_natural';
  const topStyle = config?.topStyle || 'hoodie_classic';
  const bottomStyle = config?.bottomStyle || 'jeans_skinny';
  const shoeStyle = config?.shoeStyle || 'sneakers_classic';
  const accessory = config?.accessory || 'none';
  const blush = config?.blush || false;

  // Hair style SVG fragments
  const renderHair = () => {
    const hairProps = { fill: hairColor };
    
    switch (hairStyle) {
      case 'twa':
        return <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.08} {...hairProps} />;
      case 'afro_full':
        return <circle cx={s * 0.5} cy={s * 0.18} r={s * 0.22} {...hairProps} />;
      case 'afro_puffs_one':
        return (
          <>
            <circle cx={s * 0.5} cy={s * 0.14} r={s * 0.15} {...hairProps} />
            <circle cx={s * 0.5} cy={s * 0.12} r={s * 0.08} {...hairProps} />
          </>
        );
      case 'afro_puffs_two':
        return (
          <>
            <circle cx={s * 0.38} cy={s * 0.13} r={s * 0.09} {...hairProps} />
            <circle cx={s * 0.62} cy={s * 0.13} r={s * 0.09} {...hairProps} />
            <ellipse cx={s * 0.5} cy={s * 0.17} rx={s * 0.16} ry={s * 0.07} {...hairProps} />
          </>
        );
      case 'bantu_knots':
        return (
          <>
            <circle cx={s * 0.35} cy={s * 0.12} r={s * 0.06} {...hairProps} />
            <circle cx={s * 0.5} cy={s * 0.11} r={s * 0.06} {...hairProps} />
            <circle cx={s * 0.65} cy={s * 0.12} r={s * 0.06} {...hairProps} />
            <ellipse cx={s * 0.5} cy={s * 0.17} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
          </>
        );
      case 'locs_short':
      case 'locs_long':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.18} ry={s * 0.07} {...hairProps} />
            {[...Array(7)].map((_, i) => (
              <rect
                key={i}
                x={s * (0.32 + i * 0.06)}
                y={s * 0.2}
                width={s * 0.03}
                height={hairStyle === 'locs_long' ? s * 0.25 : s * 0.12}
                rx={s * 0.015}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'coils':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.18} ry={s * 0.08} {...hairProps} />
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={s * (0.35 + i * 0.075)}
                cy={s * (0.14 + (i % 2) * 0.03)}
                r={s * 0.035}
                fill="none"
                stroke={hairColor}
                strokeWidth={s * 0.02}
              />
            ))}
          </>
        );
      case 'box_braids_short':
      case 'box_braids_medium':
      case 'box_braids_long':
        const braidLength = hairStyle === 'box_braids_long' ? s * 0.28 : hairStyle === 'box_braids_medium' ? s * 0.2 : s * 0.14;
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.07} {...hairProps} />
            {[...Array(9)].map((_, i) => (
              <rect
                key={i}
                x={s * (0.3 + i * 0.05)}
                y={s * 0.19}
                width={s * 0.025}
                height={braidLength}
                rx={s * 0.012}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'cornrows':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.18} ry={s * 0.06} {...hairProps} />
            {[...Array(5)].map((_, i) => (
              <path
                key={i}
                d={`M ${s * (0.35 + i * 0.075)} ${s * 0.13} Q ${s * (0.38 + i * 0.075)} ${s * 0.17} ${s * (0.35 + i * 0.075)} ${s * 0.21}`}
                fill="none"
                stroke={hairColor}
                strokeWidth={s * 0.025}
                strokeLinecap="round"
              />
            ))}
          </>
        );
      case 'fulani_braids':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            <circle cx={s * 0.35} cy={s * 0.14} r={s * 0.04} fill="#d4a017" />
            {[...Array(6)].map((_, i) => (
              <rect
                key={i}
                x={s * (0.33 + i * 0.055)}
                y={s * 0.19}
                width={s * 0.025}
                height={s * 0.22}
                rx={s * 0.012}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'knotless_braids':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x={s * (0.32 + i * 0.05)}
                y={s * 0.18}
                width={s * 0.022}
                height={s * 0.24}
                rx={s * 0.01}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'goddess_braids':
        return (
          <>
            <path d={`M ${s*0.35} ${s*0.13} Q ${s*0.5} ${s*0.1} ${s*0.65} ${s*0.13}`} fill="none" stroke={hairColor} strokeWidth={s * 0.08} strokeLinecap="round" />
            {[...Array(4)].map((_, i) => (
              <rect
                key={i}
                x={s * (0.38 + i * 0.08)}
                y={s * 0.2}
                width={s * 0.03}
                height={s * 0.2}
                rx={s * 0.015}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'bone_straight':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.06} {...hairProps} />
            <rect x={s * 0.32} y={s * 0.18} width={s * 0.36} height={s * 0.18} rx={s * 0.02} {...hairProps} />
          </>
        );
      case 'sleek_ponytail':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            <path d={`M ${s*0.55} ${s*0.18} Q ${s*0.65} ${s*0.25} ${s*0.68} ${s*0.35}`} fill="none" stroke={hairColor} strokeWidth={s * 0.06} strokeLinecap="round" />
          </>
        );
      case 'side_part':
        return (
          <>
            <path d={`M ${s*0.42} ${s*0.12} Q ${s*0.5} ${s*0.15} ${s*0.68} ${s*0.18}`} fill={hairColor} />
            <ellipse cx={s * 0.55} cy={s * 0.2} rx={s * 0.15} ry={s * 0.08} {...hairProps} />
          </>
        );
      case 'curtain_bangs':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.06} {...hairProps} />
            <path d={`M ${s*0.32} ${s*0.14} Q ${s*0.42} ${s*0.22} ${s*0.35} ${s*0.28}`} fill={hairColor} />
            <path d={`M ${s*0.68} ${s*0.14} Q ${s*0.58} ${s*0.22} ${s*0.65} ${s*0.28}`} fill={hairColor} />
          </>
        );
      case 'beach_waves':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.06} {...hairProps} />
            {[...Array(5)].map((_, i) => (
              <path
                key={i}
                d={`M ${s * (0.35 + i * 0.075)} ${s * 0.18} Q ${s * (0.38 + i * 0.075)} ${s * 0.24} ${s * (0.35 + i * 0.075)} ${s * 0.3}`}
                fill="none"
                stroke={hairColor}
                strokeWidth={s * 0.035}
                strokeLinecap="round"
              />
            ))}
          </>
        );
      case 'ringlet_curls':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.07} {...hairProps} />
            {[...Array(6)].map((_, i) => (
              <circle
                key={i}
                cx={s * (0.36 + i * 0.06)}
                cy={s * (0.22 + (i % 2) * 0.04)}
                r={s * 0.03}
                fill="none"
                stroke={hairColor}
                strokeWidth={s * 0.02}
              />
            ))}
          </>
        );
      case 'loose_curls':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.15} rx={s * 0.18} ry={s * 0.08} {...hairProps} />
            {[...Array(5)].map((_, i) => (
              <ellipse
                key={i}
                cx={s * (0.38 + i * 0.06)}
                cy={s * (0.22 + (i % 2) * 0.03)}
                rx={s * 0.035}
                ry={s * 0.04}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'curly_high_ponytail':
        return (
          <>
            <circle cx={s * 0.5} cy={s * 0.12} r={s * 0.08} {...hairProps} />
            <ellipse cx={s * 0.5} cy={s * 0.17} rx={s * 0.16} ry={s * 0.06} {...hairProps} />
            {[...Array(4)].map((_, i) => (
              <circle
                key={i}
                cx={s * (0.44 + i * 0.04)}
                cy={s * (0.1 + (i % 2) * 0.03)}
                r={s * 0.025}
                {...hairProps}
              />
            ))}
          </>
        );
      case 'bun_low':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            <circle cx={s * 0.5} cy={s * 0.22} r={s * 0.06} {...hairProps} />
          </>
        );
      case 'bun_high':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            <circle cx={s * 0.5} cy={s * 0.1} r={s * 0.07} {...hairProps} />
          </>
        );
      case 'space_buns':
        return (
          <>
            <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.17} ry={s * 0.06} {...hairProps} />
            <circle cx={s * 0.38} cy={s * 0.11} r={s * 0.065} {...hairProps} />
            <circle cx={s * 0.62} cy={s * 0.11} r={s * 0.065} {...hairProps} />
          </>
        );
      case 'half_up_half_down':
        return (
          <>
            <circle cx={s * 0.5} cy={s * 0.11} r={s * 0.06} {...hairProps} />
            <ellipse cx={s * 0.5} cy={s * 0.18} rx={s * 0.18} ry={s * 0.08} {...hairProps} />
          </>
        );
      default:
        return <ellipse cx={s * 0.5} cy={s * 0.16} rx={s * 0.18} ry={s * 0.07} {...hairProps} />;
    }
  };

  // Eye style SVG fragments
  const renderEyes = () => {
    const eyeProps = { fill: eyeColor };
    
    switch (eyeStyle) {
      case 'almond':
        return (
          <>
            <ellipse cx={s * 0.39} cy={s * 0.34} rx={s * 0.05} ry={s * 0.045} {...eyeProps} />
            <ellipse cx={s * 0.61} cy={s * 0.34} rx={s * 0.05} ry={s * 0.045} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.325} r={s * 0.015} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.325} r={s * 0.015} fill="white" />
          </>
        );
      case 'round':
        return (
          <>
            <circle cx={s * 0.39} cy={s * 0.34} r={s * 0.045} {...eyeProps} />
            <circle cx={s * 0.61} cy={s * 0.34} r={s * 0.045} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.325} r={s * 0.015} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.325} r={s * 0.015} fill="white" />
          </>
        );
      case 'hooded':
        return (
          <>
            <ellipse cx={s * 0.39} cy={s * 0.34} rx={s * 0.05} ry={s * 0.04} {...eyeProps} />
            <ellipse cx={s * 0.61} cy={s * 0.34} rx={s * 0.05} ry={s * 0.04} {...eyeProps} />
            <path d={`M ${s*0.34} ${s*0.31} Q ${s*0.39} ${s*0.33} ${s*0.44} ${s*0.31}`} fill="none" stroke={eyeColor} strokeWidth={s * 0.015} />
            <path d={`M ${s*0.56} ${s*0.31} Q ${s*0.61} ${s*0.33} ${s*0.66} ${s*0.31}`} fill="none" stroke={eyeColor} strokeWidth={s * 0.015} />
            <circle cx={s * 0.4} cy={s * 0.33} r={s * 0.013} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.33} r={s * 0.013} fill="white" />
          </>
        );
      case 'wide':
        return (
          <>
            <circle cx={s * 0.39} cy={s * 0.34} r={s * 0.055} {...eyeProps} />
            <circle cx={s * 0.61} cy={s * 0.34} r={s * 0.055} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.33} r={s * 0.018} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.33} r={s * 0.018} fill="white" />
          </>
        );
      case 'monolid':
        return (
          <>
            <ellipse cx={s * 0.39} cy={s * 0.34} rx={s * 0.048} ry={s * 0.038} {...eyeProps} />
            <ellipse cx={s * 0.61} cy={s * 0.34} rx={s * 0.048} ry={s * 0.038} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.33} r={s * 0.013} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.33} r={s * 0.013} fill="white" />
          </>
        );
      case 'upturned':
        return (
          <>
            <ellipse cx={s * 0.39} cy={s * 0.335} rx={s * 0.045} ry={s * 0.04} {...eyeProps} transform={`rotate(-10,${s*0.39},${s*0.335})`} />
            <ellipse cx={s * 0.61} cy={s * 0.335} rx={s * 0.045} ry={s * 0.04} {...eyeProps} transform={`rotate(10,${s*0.61},${s*0.335})`} />
            <circle cx={s * 0.4} cy={s * 0.325} r={s * 0.013} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.325} r={s * 0.013} fill="white" />
          </>
        );
      case 'cat_eye':
        return (
          <>
            <path d={`M ${s*0.34} ${s*0.34} Q ${s*0.39} ${s*0.32} ${s*0.44} ${s*0.34} Q ${s*0.39} ${s*0.36} ${s*0.34} ${s*0.34}`} {...eyeProps} />
            <path d={`M ${s*0.56} ${s*0.34} Q ${s*0.61} ${s*0.32} ${s*0.66} ${s*0.34} Q ${s*0.61} ${s*0.36} ${s*0.56} ${s*0.34}`} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.335} r={s * 0.012} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.335} r={s * 0.012} fill="white" />
          </>
        );
      case 'natural':
      default:
        return (
          <>
            <ellipse cx={s * 0.39} cy={s * 0.34} rx={s * 0.045} ry={s * 0.05} {...eyeProps} />
            <ellipse cx={s * 0.61} cy={s * 0.34} rx={s * 0.045} ry={s * 0.05} {...eyeProps} />
            <circle cx={s * 0.4} cy={s * 0.325} r={s * 0.015} fill="white" />
            <circle cx={s * 0.62} cy={s * 0.325} r={s * 0.015} fill="white" />
          </>
        );
    }
  };

  // Eyebrow SVG fragments
  const renderEyebrows = () => {
    const browProps = { stroke: hairColor, strokeWidth: s * 0.02, fill: 'none', strokeLinecap: 'round' };
    
    switch (eyebrowStyle) {
      case 'thick_natural':
        return (
          <>
            <path d={`M ${s*0.32} ${s*0.29} Q ${s*0.39} ${s*0.28} ${s*0.46} ${s*0.29}`} {...browProps} />
            <path d={`M ${s*0.54} ${s*0.29} Q ${s*0.61} ${s*0.28} ${s*0.68} ${s*0.29}`} {...browProps} />
          </>
        );
      case 'thin_arched':
        return (
          <>
            <path d={`M ${s*0.33} ${s*0.3} Q ${s*0.39} ${s*0.27} ${s*0.45} ${s*0.3}`} {...browProps} strokeWidth={s * 0.012} />
            <path d={`M ${s*0.55} ${s*0.3} Q ${s*0.61} ${s*0.27} ${s*0.67} ${s*0.3}`} {...browProps} strokeWidth={s * 0.012} />
          </>
        );
      case 'straight':
        return (
          <>
            <line x1={s * 0.33} y1={s * 0.295} x2={s * 0.46} y2={s * 0.295} {...browProps} />
            <line x1={s * 0.54} y1={s * 0.295} x2={s * 0.67} y2={s * 0.295} {...browProps} />
          </>
        );
      case 'bushy':
        return (
          <>
            <path d={`M ${s*0.31} ${s*0.29} Q ${s*0.39} ${s*0.275} ${s*0.47} ${s*0.29}`} {...browProps} strokeWidth={s * 0.025} />
            <path d={`M ${s*0.53} ${s*0.29} Q ${s*0.61} ${s*0.275} ${s*0.69} ${s*0.29}`} {...browProps} strokeWidth={s * 0.025} />
          </>
        );
      case 'feathered':
        return (
          <>
            <path d={`M ${s*0.32} ${s*0.295} Q ${s*0.39} ${s*0.285} ${s*0.46} ${s*0.295}`} {...browProps} />
            <path d={`M ${s*0.54} ${s*0.295} Q ${s*0.61} ${s*0.285} ${s*0.68} ${s*0.295}`} {...browProps} />
            {[...Array(3)].map((_, i) => (
              <g key={i}>
                <line x1={s * (0.34 + i * 0.04)} y1={s * 0.29} x2={s * (0.33 + i * 0.04)} y2={s * 0.285} {...browProps} strokeWidth={s * 0.01} />
                <line x1={s * (0.56 + i * 0.04)} y1={s * 0.29} x2={s * (0.57 + i * 0.04)} y2={s * 0.285} {...browProps} strokeWidth={s * 0.01} />
              </g>
            ))}
          </>
        );
      case 'bold':
        return (
          <>
            <path d={`M ${s*0.32} ${s*0.285} Q ${s*0.39} ${s*0.27} ${s*0.46} ${s*0.285}`} {...browProps} strokeWidth={s * 0.028} />
            <path d={`M ${s*0.54} ${s*0.285} Q ${s*0.61} ${s*0.27} ${s*0.68} ${s*0.285}`} {...browProps} strokeWidth={s * 0.028} />
          </>
        );
      default:
        return null;
    }
  };

  // Top SVG fragments
  const renderTop = () => {
    const topProps = { fill: topColor };
    
    switch (topStyle) {
      case 'hoodie_classic':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.25} rx={s * 0.05} {...topProps} />
            <path d={`M ${s*0.45} ${s*0.58} Q ${s*0.5} ${s*0.62} ${s*0.55} ${s*0.58}`} fill="none" stroke={topColor} strokeWidth={s * 0.02} opacity="0.3" />
          </>
        );
      case 'hoodie_cropped':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.15} rx={s * 0.04} {...topProps} />
            <rect x={s * 0.25} y={s * 0.7} width={s * 0.03} height={s * 0.08} rx={s * 0.015} fill={skinTone} />
            <rect x={s * 0.72} y={s * 0.7} width={s * 0.03} height={s * 0.08} rx={s * 0.015} fill={skinTone} />
          </>
        );
      case 'graphic_tee_ggu':
      case 'graphic_tee_plain':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} {...topProps} />
            {topStyle === 'graphic_tee_ggu' && (
              <text x={s * 0.5} y={s * 0.68} fontSize={s * 0.06} textAnchor="middle" fill="white" fontWeight="bold">GGU</text>
            )}
          </>
        );
      case 'off_shoulder':
        return (
          <>
            <path d={`M ${s*0.22} ${s*0.6} Q ${s*0.35} ${s*0.58} ${s*0.5} ${s*0.6} Q ${s*0.65} ${s*0.58} ${s*0.78} ${s*0.6} L ${s*0.75} ${s*0.75} Q ${s*0.5} ${s*0.8} ${s*0.25} ${s*0.75} Z`} {...topProps} />
          </>
        );
      case 'turtleneck':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.25} rx={s * 0.04} {...topProps} />
            <rect x={s * 0.42} y={s * 0.52} width={s * 0.16} height={s * 0.08} rx={s * 0.03} {...topProps} />
          </>
        );
      case 'denim_jacket':
        return (
          <>
            <rect x={s * 0.23} y={s * 0.58} width={s * 0.54} height={s * 0.24} rx={s * 0.05} fill="#4a6fa5" />
            <rect x={s * 0.48} y={s * 0.58} width={s * 0.04} height={s * 0.24} fill="#3a5a8a" />
            <rect x={s * 0.28} y={s * 0.62} width={s * 0.12} height={s * 0.08} rx={s * 0.02} fill="#5a7fb5" opacity="0.5" />
            <rect x={s * 0.6} y={s * 0.62} width={s * 0.12} height={s * 0.08} rx={s * 0.02} fill="#5a7fb5" opacity="0.5" />
          </>
        );
      case 'varsity_jacket':
        return (
          <>
            <rect x={s * 0.23} y={s * 0.58} width={s * 0.54} height={s * 0.24} rx={s * 0.05} fill={topColor} />
            <rect x={s * 0.23} y={s * 0.58} width={s * 0.12} height={s * 0.24} rx={s * 0.05} fill="#fff" />
            <rect x={s * 0.65} y={s * 0.58} width={s * 0.12} height={s * 0.24} rx={s * 0.05} fill="#fff" />
            <circle cx={s * 0.42} cy={s * 0.68} r={s * 0.04} fill="#ffd700" />
          </>
        );
      case 'sports_bra_jacket':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.58} width={s * 0.18} height={s * 0.12} rx={s * 0.03} {...topProps} />
            <rect x={s * 0.54} y={s * 0.58} width={s * 0.18} height={s * 0.12} rx={s * 0.03} {...topProps} />
            <rect x={s * 0.23} y={s * 0.58} width={s * 0.54} height={s * 0.24} rx={s * 0.05} fill={topColor} opacity="0.3" />
          </>
        );
      case 'tank_top':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.58} width={s * 0.4} height={s * 0.22} rx={s * 0.04} {...topProps} />
            <rect x={s * 0.28} y={s * 0.58} width={s * 0.06} height={s * 0.08} rx={s * 0.03} {...topProps} />
            <rect x={s * 0.66} y={s * 0.58} width={s * 0.06} height={s * 0.08} rx={s * 0.03} {...topProps} />
          </>
        );
      case 'cardigan':
        return (
          <>
            <rect x={s * 0.24} y={s * 0.58} width={s * 0.52} height={s * 0.24} rx={s * 0.05} {...topProps} />
            <rect x={s * 0.48} y={s * 0.58} width={s * 0.04} height={s * 0.24} fill={topColor} opacity="0.8" />
            {[...Array(4)].map((_, i) => (
              <circle key={i} cx={s * 0.5} cy={s * (0.63 + i * 0.05)} r={s * 0.015} fill="#ffd700" />
            ))}
          </>
        );
      case 'school_uniform':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} fill="#1a237e" />
            <rect x={s * 0.45} y={s * 0.58} width={s * 0.1} height={s * 0.15} fill="white" />
            <path d={`M ${s*0.48} ${s*0.62} L ${s*0.5} ${s*0.68} L ${s*0.52} ${s*0.62}`} fill="#c41e3a" />
          </>
        );
      case 'button_up':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} {...topProps} />
            <rect x={s * 0.48} y={s * 0.58} width={s * 0.04} height={s * 0.22} fill={topColor} opacity="0.8" />
            {[...Array(4)].map((_, i) => (
              <circle key={i} cx={s * 0.5} cy={s * (0.63 + i * 0.05)} r={s * 0.012} fill="#fff" />
            ))}
          </>
        );
      case 'tie_dye':
        return (
          <>
            <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} fill="url(#tieDyeGradient)" />
            <defs>
              <radialGradient id="tieDyeGradient">
                <stop offset="0%" stopColor="#ff69b4" />
                <stop offset="33%" stopColor="#9b59b6" />
                <stop offset="66%" stopColor="#3498db" />
                <stop offset="100%" stopColor="#4caf50" />
              </radialGradient>
            </defs>
          </>
        );
      case 'puffer_vest':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.58} width={s * 0.44} height={s * 0.24} rx={s * 0.05} {...topProps} />
            {[...Array(5)].map((_, i) => (
              <line key={i} x1={s * 0.3} y1={s * (0.62 + i * 0.04)} x2={s * 0.7} y2={s * (0.62 + i * 0.04)} stroke={topColor} strokeWidth={s * 0.015} opacity="0.5" />
            ))}
          </>
        );
      case 'blazer':
        return (
          <>
            <rect x={s * 0.24} y={s * 0.58} width={s * 0.52} height={s * 0.24} rx={s * 0.04} fill="#2c3e50" />
            <rect x={s * 0.48} y={s * 0.58} width={s * 0.04} height={s * 0.24} fill="#1a252f" />
            <rect x={s * 0.3} y={s * 0.62} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill="#1a252f" opacity="0.5" />
            <rect x={s * 0.6} y={s * 0.62} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill="#1a252f" opacity="0.5" />
          </>
        );
      default:
        return <rect x={s * 0.25} y={s * 0.58} width={s * 0.5} height={s * 0.22} rx={s * 0.04} {...topProps} />;
    }
  };

  // Bottom SVG fragments
  const renderBottom = () => {
    const bottomProps = { fill: bottomColor };
    
    switch (bottomStyle) {
      case 'jeans_skinny':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
          </>
        );
      case 'jeans_straight':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.78} width={s * 0.2} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.2} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
          </>
        );
      case 'leggings':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.17} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.53} y={s * 0.78} width={s * 0.17} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
          </>
        );
      case 'joggers':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.16} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.16} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.3} y={s * 0.92} width={s * 0.18} height={s * 0.04} fill={bottomColor} opacity="0.8" />
            <rect x={s * 0.52} y={s * 0.92} width={s * 0.18} height={s * 0.04} fill={bottomColor} opacity="0.8" />
          </>
        );
      case 'mini_skirt':
        return (
          <polygon points={`${s*0.3},${s*0.78} ${s*0.7},${s*0.78} ${s*0.72},${s*0.88} ${s*0.28},${s*0.88}`} {...bottomProps} />
        );
      case 'pleated_skirt':
        return (
          <>
            <polygon points={`${s*0.3},${s*0.78} ${s*0.7},${s*0.78} ${s*0.75},${s*0.9} ${s*0.25},${s*0.9}`} {...bottomProps} />
            {[...Array(5)].map((_, i) => (
              <line key={i} x1={s * (0.35 + i * 0.08)} y1={s * 0.78} x2={s * (0.33 + i * 0.08)} y2={s * 0.88} stroke={bottomColor} strokeWidth={s * 0.01} opacity="0.5" />
            ))}
          </>
        );
      case 'biker_shorts':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.12} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.12} rx={s * 0.03} {...bottomProps} />
          </>
        );
      case 'cargo_pants':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.3} y={s * 0.82} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill={bottomColor} opacity="0.8" />
            <rect x={s * 0.58} y={s * 0.82} width={s * 0.12} height={s * 0.06} rx={s * 0.02} fill={bottomColor} opacity="0.8" />
          </>
        );
      case 'sweatpants':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.78} width={s * 0.44} height={s * 0.18} rx={s * 0.05} {...bottomProps} />
            <rect x={s * 0.3} y={s * 0.92} width={s * 0.18} height={s * 0.04} rx={s * 0.02} fill={bottomColor} opacity="0.8" />
            <rect x={s * 0.52} y={s * 0.92} width={s * 0.18} height={s * 0.04} rx={s * 0.02} fill={bottomColor} opacity="0.8" />
          </>
        );
      case 'school_uniform_skirt':
        return (
          <polygon points={`${s*0.3},${s*0.78} ${s*0.7},${s*0.78} ${s*0.73},${s*0.92} ${s*0.27},${s*0.92}`} fill="#1a237e" />
        );
      case 'shorts_denim':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.1} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.1} rx={s * 0.03} {...bottomProps} />
          </>
        );
      case 'shorts_athletic':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.1} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.1} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.3} y={s * 0.8} width={s * 0.08} height={s * 0.04} fill="white" opacity="0.3" />
            <rect x={s * 0.62} y={s * 0.8} width={s * 0.08} height={s * 0.04} fill="white" opacity="0.3" />
          </>
        );
      default:
        return (
          <>
            <rect x={s * 0.3} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
            <rect x={s * 0.52} y={s * 0.78} width={s * 0.18} height={s * 0.18} rx={s * 0.03} {...bottomProps} />
          </>
        );
    }
  };

  // Shoe SVG fragments
  const renderShoes = () => {
    const shoeProps = { fill: shoeColor };
    
    switch (shoeStyle) {
      case 'sneakers_classic':
        return (
          <>
            <ellipse cx={s * 0.35} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} {...shoeProps} />
            <ellipse cx={s * 0.65} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} {...shoeProps} />
            <rect x={s * 0.3} y={s * 0.95} width={s * 0.1} height={s * 0.02} fill="white" />
            <rect x={s * 0.6} y={s * 0.95} width={s * 0.1} height={s * 0.02} fill="white" />
          </>
        );
      case 'sneakers_high_top':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.58} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.3} y={s * 0.97} width={s * 0.1} height={s * 0.02} fill="white" />
            <rect x={s * 0.6} y={s * 0.97} width={s * 0.1} height={s * 0.02} fill="white" />
          </>
        );
      case 'sneakers_platform':
        return (
          <>
            <ellipse cx={s * 0.35} cy={s * 0.97} rx={s * 0.08} ry={s * 0.05} {...shoeProps} />
            <ellipse cx={s * 0.65} cy={s * 0.97} rx={s * 0.08} ry={s * 0.05} {...shoeProps} />
            <rect x={s * 0.28} y={s * 0.99} width={s * 0.14} height={s * 0.02} fill="white" />
            <rect x={s * 0.58} y={s * 0.99} width={s * 0.14} height={s * 0.02} fill="white" />
          </>
        );
      case 'boots_ankle':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.58} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
          </>
        );
      case 'boots_knee_high':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.9} width={s * 0.14} height={s * 0.1} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.58} y={s * 0.9} width={s * 0.14} height={s * 0.1} rx={s * 0.03} {...shoeProps} />
          </>
        );
      case 'platform_shoes':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.58} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} {...shoeProps} />
            <rect x={s * 0.28} y={s * 0.98} width={s * 0.14} height={s * 0.03} fill="#000" />
            <rect x={s * 0.58} y={s * 0.98} width={s * 0.14} height={s * 0.03} fill="#000" />
          </>
        );
      case 'slides':
        return (
          <>
            <ellipse cx={s * 0.35} cy={s * 0.97} rx={s * 0.08} ry={s * 0.035} {...shoeProps} />
            <ellipse cx={s * 0.65} cy={s * 0.97} rx={s * 0.08} ry={s * 0.035} {...shoeProps} />
            <rect x={s * 0.3} y={s * 0.95} width={s * 0.1} height={s * 0.025} fill={shoeColor} opacity="0.8" />
            <rect x={s * 0.6} y={s * 0.95} width={s * 0.1} height={s * 0.025} fill={shoeColor} opacity="0.8" />
          </>
        );
      case 'loafers':
        return (
          <>
            <ellipse cx={s * 0.35} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} fill="#8b4513" />
            <ellipse cx={s * 0.65} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} fill="#8b4513" />
            <rect x={s * 0.32} y={s * 0.95} width={s * 0.06} height={s * 0.02} fill="#ffd700" />
            <rect x={s * 0.62} y={s * 0.95} width={s * 0.06} height={s * 0.02} fill="#ffd700" />
          </>
        );
      case 'uggs':
        return (
          <>
            <rect x={s * 0.28} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} fill="#d2b48c" />
            <rect x={s * 0.58} y={s * 0.94} width={s * 0.14} height={s * 0.06} rx={s * 0.03} fill="#d2b48c" />
            <rect x={s * 0.28} y={s * 0.93} width={s * 0.14} height={s * 0.02} fill="#f5deb3" rx={s * 0.02} />
            <rect x={s * 0.58} y={s * 0.93} width={s * 0.14} height={s * 0.02} fill="#f5deb3" rx={s * 0.02} />
          </>
        );
      case 'heels':
        return (
          <>
            <path d={`M ${s*0.28} ${s*0.95} L ${s*0.42} ${s*0.95} L ${s*0.4} ${s*0.99} L ${s*0.35} ${s*0.99} Z`} fill={shoeColor} />
            <path d={`M ${s*0.58} ${s*0.95} L ${s*0.72} ${s*0.95} L ${s*0.7} ${s*0.99} L ${s*0.65} ${s*0.99} Z`} fill={shoeColor} />
            <rect x={s * 0.36} y={s * 0.97} width={s * 0.02} height={s * 0.03} fill="#000" />
            <rect x={s * 0.66} y={s * 0.97} width={s * 0.02} height={s * 0.03} fill="#000" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx={s * 0.35} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} {...shoeProps} />
            <ellipse cx={s * 0.65} cy={s * 0.97} rx={s * 0.08} ry={s * 0.04} {...shoeProps} />
          </>
        );
    }
  };

  // Accessory SVG fragments
  const renderAccessory = () => {
    switch (accessory) {
      case 'hoop_earrings_small':
        return (
          <>
            <circle cx={s * 0.28} cy={s * 0.38} r={s * 0.03} fill="none" stroke="#ffd700" strokeWidth={s * 0.01} />
            <circle cx={s * 0.72} cy={s * 0.38} r={s * 0.03} fill="none" stroke="#ffd700" strokeWidth={s * 0.01} />
          </>
        );
      case 'hoop_earrings_large':
        return (
          <>
            <circle cx={s * 0.27} cy={s * 0.4} r={s * 0.05} fill="none" stroke="#ffd700" strokeWidth={s * 0.012} />
            <circle cx={s * 0.73} cy={s * 0.4} r={s * 0.05} fill="none" stroke="#ffd700" strokeWidth={s * 0.012} />
          </>
        );
      case 'stud_earrings':
        return (
          <>
            <circle cx={s * 0.28} cy={s * 0.38} r={s * 0.015} fill="#ffd700" />
            <circle cx={s * 0.72} cy={s * 0.38} r={s * 0.015} fill="#ffd700" />
          </>
        );
      case 'headband_simple':
        return (
          <path d={`M ${s*0.3} ${s*0.22} Q ${s*0.5} ${s*0.18} ${s*0.7} ${s*0.22}`} fill="none" stroke={topColor} strokeWidth={s * 0.025} />
        );
      case 'headband_decorated':
        return (
          <>
            <path d={`M ${s*0.3} ${s*0.22} Q ${s*0.5} ${s*0.18} ${s*0.7} ${s*0.22}`} fill="none" stroke={topColor} strokeWidth={s * 0.025} />
            <circle cx={s * 0.5} cy={s * 0.19} r={s * 0.02} fill="#ff69b4" />
          </>
        );
      case 'hair_bow':
        return (
          <>
            <ellipse cx={s * 0.44} cy={s * 0.15} rx={s * 0.05} ry={s * 0.03} fill="#ff69b4" />
            <ellipse cx={s * 0.56} cy={s * 0.15} rx={s * 0.05} ry={s * 0.03} fill="#ff69b4" />
            <circle cx={s * 0.5} cy={s * 0.15} r={s * 0.02} fill="#ff1493" />
          </>
        );
      case 'glasses_clear':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.3} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="none" stroke="#888" strokeWidth={s * 0.015} />
            <rect x={s * 0.56} y={s * 0.3} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="none" stroke="#888" strokeWidth={s * 0.015} />
            <line x1={s * 0.44} y1={s * 0.345} x2={s * 0.56} y2={s * 0.345} stroke="#888" strokeWidth={s * 0.01} />
          </>
        );
      case 'glasses_sunglasses':
        return (
          <>
            <rect x={s * 0.3} y={s * 0.3} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="#1a1a1a" />
            <rect x={s * 0.56} y={s * 0.3} width={s * 0.14} height={s * 0.09} rx={s * 0.03} fill="#1a1a1a" />
            <line x1={s * 0.44} y1={s * 0.345} x2={s * 0.56} y2={s * 0.345} stroke="#1a1a1a" strokeWidth={s * 0.015} />
          </>
        );
      case 'necklace_simple':
        return (
          <path d={`M ${s*0.42} ${s*0.52} Q ${s*0.5} ${s*0.58} ${s*0.58} ${s*0.52}`} fill="none" stroke="#ffd700" strokeWidth={s * 0.01} />
        );
      case 'necklace_pendant':
        return (
          <>
            <path d={`M ${s*0.42} ${s*0.52} Q ${s*0.5} ${s*0.58} ${s*0.58} ${s*0.52}`} fill="none" stroke="#ffd700" strokeWidth={s * 0.01} />
            <circle cx={s * 0.5} cy={s * 0.56} r={s * 0.02} fill="#ffd700" />
          </>
        );
      case 'scrunchie_wrist':
        return (
          <>
            <rect x={s * 0.18} y={s * 0.68} width={s * 0.06} height={s * 0.03} rx={s * 0.015} fill="#ff69b4" />
            <rect x={s * 0.76} y={s * 0.68} width={s * 0.06} height={s * 0.03} rx={s * 0.015} fill="#9b59b6" />
          </>
        );
      case 'backpack':
        return (
          <>
            <rect x={s * 0.18} y={s * 0.58} width={s * 0.1} height={s * 0.2} rx={s * 0.03} fill="#ff69b4" />
            <rect x={s * 0.72} y={s * 0.58} width={s * 0.1} height={s * 0.2} rx={s * 0.03} fill="#ff69b4" />
          </>
        );
      case 'crown_radiant':
        return (
          <polygon points={`${s*0.35},${s*0.1} ${s*0.42},${s*0.02} ${s*0.5},${s*0.08} ${s*0.58},${s*0.02} ${s*0.65},${s*0.1}`} fill="#ffd700" stroke="#ff69b4" strokeWidth={s * 0.015} />
        );
      case 'ggu_badge':
        return (
          <circle cx={s * 0.75} cy={s * 0.62} r={s * 0.04} fill="#ffd700" stroke="#ff69b4" strokeWidth={s * 0.01}>
            <title>GGU Member</title>
          </circle>
        );
      case 'halo':
        return (
          <ellipse cx={s * 0.5} cy={s * 0.09} rx={s * 0.13} ry={s * 0.04} fill="none" stroke="#ffd700" strokeWidth={s * 0.025} />
        );
      case 'headphones':
        return (
          <>
            <path d={`M ${s*0.3} ${s*0.26} A ${s*0.2} ${s*0.2} 0 0 1 ${s*0.7} ${s*0.26}`} fill="none" stroke="#333" strokeWidth={s * 0.03} />
            <rect x={s * 0.27} y={s * 0.26} width={s * 0.06} height={s * 0.09} rx={s * 0.02} fill="#333" />
            <rect x={s * 0.67} y={s * 0.26} width={s * 0.06} height={s * 0.09} rx={s * 0.02} fill="#333" />
          </>
        );
      default:
        return null;
    }
  };

  // Background handling
  const renderBackground = () => {
    if (bgColor === 'transparent') return null;
    if (bgColor.includes('gradient')) {
      if (bgColor === 'gradient_soft') {
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5e6f0" />
                <stop offset="50%" stopColor="#e6d5f0" />
                <stop offset="100%" stopColor="#d5e6f0" />
              </linearGradient>
            </defs>
            <rect width={s} height={s} rx={s * 0.5} fill="url(#bgGradient)" />
          </>
        );
      }
      if (bgColor === 'gradient_sunset') {
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="50%" stopColor="#ff8e53" />
                <stop offset="100%" stopColor="#ffa726" />
              </linearGradient>
            </defs>
            <rect width={s} height={s} rx={s * 0.5} fill="url(#bgGradient)" />
          </>
        );
      }
      if (bgColor === 'gradient_ocean') {
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#29b6f6" />
                <stop offset="50%" stopColor="#0288d1" />
                <stop offset="100%" stopColor="#01579b" />
              </linearGradient>
            </defs>
            <rect width={s} height={s} rx={s * 0.5} fill="url(#bgGradient)" />
          </>
        );
      }
    }
    return <rect width={s} height={s} rx={s * 0.5} fill={bgColor} />;
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      {renderBackground()}

      {/* Shoes (back layer) */}
      {renderShoes()}

      {/* Bottom */}
      {renderBottom()}

      {/* Body */}
      <rect x={s * 0.28} y={s * 0.58} width={s * 0.44} height={s * 0.25} rx={s * 0.06} fill={skinTone} />

      {/* Arms */}
      <rect x={s * 0.15} y={s * 0.58} width={s * 0.13} height={s * 0.2} rx={s * 0.05} fill={skinTone} />
      <rect x={s * 0.72} y={s * 0.58} width={s * 0.13} height={s * 0.2} rx={s * 0.05} fill={skinTone} />

      {/* Neck */}
      <rect x={s * 0.45} y={s * 0.52} width={s * 0.1} height={s * 0.08} rx={s * 0.02} fill={skinTone} />

      {/* Top */}
      {renderTop()}

      {/* Head */}
      <rect x={s * 0.28} y={s * 0.18} width={s * 0.44} height={s * 0.35} rx={s * 0.08} fill={skinTone} />

      {/* Hair (behind face) */}
      {renderHair()}

      {/* Eyebrows */}
      {renderEyebrows()}

      {/* Eyes */}
      {renderEyes()}

      {/* Nose */}
      <circle cx={s * 0.5} cy={s * 0.4} r={s * 0.02} fill={`${skinTone}88`} />

      {/* Mouth - smile */}
      <path d={`M ${s*0.43} ${s*0.45} Q ${s*0.5} ${s*0.5} ${s*0.57} ${s*0.45}`} fill="none" stroke="#c87942" strokeWidth={s * 0.02} strokeLinecap="round" />

      {/* Blush */}
      {blush && (
        <>
          <ellipse cx={s * 0.34} cy={s * 0.41} rx={s * 0.05} ry={s * 0.025} fill="#ff8fab" opacity="0.4" />
          <ellipse cx={s * 0.66} cy={s * 0.41} rx={s * 0.05} ry={s * 0.025} fill="#ff8fab" opacity="0.4" />
        </>
      )}

      {/* Accessory */}
      {renderAccessory()}
    </svg>
  );
}