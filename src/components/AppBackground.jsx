/**
 * AppBackground - reads the user's saved background customization from localStorage
 * and renders the same color tint + pattern overlays used on the Dashboard.
 */
const PATTERN_SVGS = {
  stars: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='10' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9733;</text></svg>",
  hearts: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='8' y='40' font-size='28' fill='rgba(255,255,255,0.03)'>&#9829;</text></svg>",
  sparkles: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='36' font-size='26' fill='rgba(255,255,255,0.035)'>&#10022;</text></svg>",
  flowers: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#10047;</text></svg>",
  butterflies: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='6' y='46' font-size='32' fill='rgba(255,255,255,0.03)'>&#129419;</text></svg>",
  diamonds: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><polygon points='22,3 41,22 22,41 3,22' fill='rgba(255,255,255,0.03)'/></svg>",
  crowns: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='8' y='46' font-size='32' fill='rgba(255,255,255,0.03)'>&#128081;</text></svg>",
  dots: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.03)'/></svg>",
  moons: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9790;</text></svg>",
  lightning: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.03)'>&#9889;</text></svg>",
  fire: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.03)'>&#128293;</text></svg>",
  snowflakes: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='38' font-size='28' fill='rgba(255,255,255,0.035)'>&#10052;</text></svg>",
  music: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='6' y='40' font-size='28' fill='rgba(255,255,255,0.03)'>&#9834;</text></svg>",
  rainbow: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='55'><text x='4' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#127752;</text></svg>",
  clouds: "<svg xmlns='http://www.w3.org/2000/svg' width='70' height='50'><text x='4' y='36' font-size='30' fill='rgba(255,255,255,0.03)'>&#9729;</text></svg>",
  paws: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#128062;</text></svg>",
  lips: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#128139;</text></svg>",
  eyes: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#129535;</text></svg>",
};

function readBg() {
  try {
    return {
      bgColor: localStorage.getItem('ggu_bg_color') || '#8b2d88',
      bgPattern: localStorage.getItem('ggu_bg_pattern') || 'hearts',
      bgImage: localStorage.getItem('ggu_bg_image') || null,
      bgImagePos: JSON.parse(localStorage.getItem('ggu_bg_image_pos') || 'null') || { x: 50, y: 50 },
    };
  } catch {
    return { bgColor: '#8b2d88', bgPattern: 'hearts', bgImage: null, bgImagePos: { x: 50, y: 50 } };
  }
}

export default function AppBackground() {
  const { bgColor, bgPattern, bgImage, bgImagePos } = readBg();

  const patternStyle = () => {
    if (bgImage) return {
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: `${bgImagePos.x}% ${bgImagePos.y}%`,
    };
    if (bgPattern && bgPattern !== 'none' && PATTERN_SVGS[bgPattern]) {
      return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[bgPattern])}")` };
    }
    return {};
  };

  return (
    <>
      {/* Color tint */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: bgColor, opacity: 0.12 }} />
      {/* Pattern / bg image */}
      {(bgPattern !== 'none' || bgImage) && (
        <div className="fixed inset-0 pointer-events-none z-0" style={patternStyle()} />
      )}
    </>
  );
}