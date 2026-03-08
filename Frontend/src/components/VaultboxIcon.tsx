
// VaultBox SVG inline (the tesseract icon)
export default function VaultBoxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="dashboard__logo-svg">
      <defs>
        <radialGradient id="db-bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#1a2535", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#0d1117", stopOpacity: 1 }} />
        </radialGradient>
        <linearGradient id="db-faceTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#2dd4bf", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "#0d9488", stopOpacity: 0.6 }} />
        </linearGradient>
        <linearGradient id="db-faceRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#0d9488", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "#065f46", stopOpacity: 0.5 }} />
        </linearGradient>
        <linearGradient id="db-innerTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#5eead4", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#2dd4bf", stopOpacity: 0.9 }} />
        </linearGradient>
        <filter id="db-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="db-eg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#db-bgGlow)" />
      <polygon points="58,42 118,28 152,62 92,76" fill="url(#db-faceTop)" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.75" />
      <polygon points="118,28 152,62 152,132 118,98" fill="url(#db-faceRight)" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.6" />
      <polygon points="92,76 152,62 152,132 92,146" fill="#1a3a4a" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.55" />
      <polygon points="58,42 92,76 92,146 58,112" fill="#0f2535" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.5" />
      <polygon points="58,112 118,98 152,132 92,146" fill="#0a1e2e" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.4" />
      <polygon points="58,42 118,28 118,98 58,112" fill="#0d1a28" stroke="#2dd4bf" strokeWidth="1.2" opacity="0.35" />
      <polygon points="82,72 112,64 130,82 100,90" fill="url(#db-innerTop)" stroke="#5eead4" strokeWidth="1" opacity="0.9" />
      <polygon points="112,64 130,82 130,112 112,94" fill="#2dd4bf" stroke="#5eead4" strokeWidth="1" opacity="0.85" />
      <polygon points="100,90 130,82 130,112 100,120" fill="#134e4a" stroke="#5eead4" strokeWidth="1" opacity="0.8" />
      <polygon points="82,72 100,90 100,120 82,102" fill="#134e4a" stroke="#5eead4" strokeWidth="1" opacity="0.75" />
      <polygon points="82,102 112,94 130,112 100,120" fill="#0d3a36" stroke="#5eead4" strokeWidth="1" opacity="0.65" />
      <polygon points="82,72 112,64 112,94 82,102" fill="#0f3535" stroke="#5eead4" strokeWidth="1" opacity="0.6" />
      {([[58,42],[118,28],[152,62],[92,76],[58,112],[118,98],[152,132],[92,146]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#2dd4bf" filter="url(#db-eg)" opacity={0.9} />
      ))}
      {([[82,72],[112,64],[130,82],[100,90],[82,102],[112,94],[130,112],[100,120]] as [number,number][]).map(([cx,cy],i) => (
        <circle key={`i${i}`} cx={cx} cy={cy} r="3" fill="#ffffff" filter="url(#db-glow)" opacity={0.95} />
      ))}
    </svg>
  );
}