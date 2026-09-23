import React from 'react';

interface USSHLogoProps {
  className?: string;
  size?: number;
}

export const USSHLogo: React.FC<USSHLogoProps> = ({ className = 'w-11 h-11', size }) => {
  return (
    <svg
      viewBox="0 0 320 210"
      className={className}
      style={size ? { width: size, height: (size * 210) / 320 } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Trường Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM"
    >
      <defs>
        {/* Arc path for top text */}
        <path
          id="ussh-top-arc"
          d="M 30,105 A 130,85 0 0,1 290,105"
          fill="none"
        />
        {/* Arc path for bottom text */}
        <path
          id="ussh-bottom-arc"
          d="M 290,105 A 130,85 0 0,1 30,105"
          fill="none"
        />
        <radialGradient id="redGlobeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e51025" />
          <stop offset="100%" stopColor="#b50518" />
        </radialGradient>
      </defs>

      {/* Outer Blue Oval */}
      <ellipse cx="160" cy="105" rx="156" ry="101" fill="#001a70" stroke="#ffffff" strokeWidth="2.5" />

      {/* Inner Red Oval */}
      <ellipse cx="160" cy="105" rx="122" ry="76" fill="url(#redGlobeGrad)" stroke="#ffffff" strokeWidth="1.8" />

      {/* Globe Latitudes & Longitudes */}
      <ellipse cx="160" cy="105" rx="122" ry="38" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
      <line x1="38" y1="105" x2="282" y2="105" stroke="#ffffff" strokeWidth="0.8" opacity="0.75" />
      <ellipse cx="160" cy="105" rx="65" ry="76" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
      <line x1="160" y1="29" x2="160" y2="181" stroke="#ffffff" strokeWidth="0.8" opacity="0.75" />

      {/* Center Golden Pavilion (Khuê Văn Các) */}
      <g transform="translate(108, 38) scale(0.65)">
        {/* Upper Roof Top Spike */}
        <polygon points="80,5 77,15 83,15" fill="#fecb00" />
        <rect x="78" y="15" width="4" height="6" fill="#fecb00" />

        {/* Top Roof Tier */}
        <path d="M 45,35 Q 80,22 115,35 Q 125,25 120,38 L 40,38 Q 35,25 45,35 Z" fill="#fecb00" stroke="#b38600" strokeWidth="0.8" />
        {/* Roof attic wall */}
        <rect x="52" y="38" width="56" height="12" fill="#fecb00" />

        {/* Middle Main Roof with Upturned Eaves */}
        <path d="M 22,64 C 45,52 115,52 138,64 C 145,54 138,66 138,68 L 22,68 C 22,66 15,54 22,64 Z" fill="#fecb00" stroke="#b38600" strokeWidth="1" />

        {/* Pavilion Middle Floor Window (The Sun Wheel window) */}
        <rect x="36" y="68" width="88" height="34" fill="#fecb00" stroke="#996e00" strokeWidth="0.8" />
        {/* Left and Right square windows */}
        <rect x="42" y="74" width="16" height="20" fill="#a8000f" stroke="#fecb00" strokeWidth="1.5" />
        <rect x="102" y="74" width="16" height="20" fill="#a8000f" stroke="#fecb00" strokeWidth="1.5" />
        
        {/* Center Round Window with Radiant Bars */}
        <circle cx="80" cy="84" r="11" fill="#a8000f" stroke="#fecb00" strokeWidth="1.8" />
        <circle cx="80" cy="84" r="5" fill="#fecb00" />
        <line x1="69" y1="84" x2="91" y2="84" stroke="#fecb00" strokeWidth="1.2" />
        <line x1="80" y1="73" x2="80" y2="95" stroke="#fecb00" strokeWidth="1.2" />
        <line x1="72" y1="76" x2="88" y2="92" stroke="#fecb00" strokeWidth="1.2" />
        <line x1="72" y1="92" x2="88" y2="76" stroke="#fecb00" strokeWidth="1.2" />

        {/* Lintel and Columns */}
        <rect x="32" y="102" width="96" height="6" fill="#fecb00" />
        <rect x="38" y="108" width="84" height="62" fill="#c00014" stroke="#fecb00" strokeWidth="1" />

        {/* USSH VNU HCM Center Block */}
        <text
          x="80"
          y="136"
          fill="#fecb00"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontWeight="900"
          fontSize="24"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          USSH
        </text>
        <line x1="42" y1="145" x2="118" y2="145" stroke="#fecb00" strokeWidth="1.8" />
        <text
          x="80"
          y="161"
          fill="#fecb00"
          fontFamily="Segoe UI, Arial, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          VNU HCM
        </text>

        {/* Stepped Pedestal Base */}
        <rect x="30" y="170" width="100" height="6" fill="#fecb00" />
        <rect x="25" y="176" width="110" height="8" fill="#fecb00" />
        <rect x="20" y="184" width="120" height="9" fill="#fecb00" />
      </g>

      {/* Top Arc Text: ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH */}
      <text fill="#ffffff" fontSize="10.5" fontWeight="800" letterSpacing="1.2" fontFamily="Segoe UI, Arial, 'Helvetica Neue', sans-serif">
        <textPath href="#ussh-top-arc" startOffset="50%" textAnchor="middle">
          ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH
        </textPath>
      </text>

      {/* Left and Right White Divider Bullets */}
      <circle cx="21" cy="105" r="4.5" fill="#ffffff" />
      <circle cx="299" cy="105" r="4.5" fill="#ffffff" />

      {/* Bottom Arc Text: TRƯỜNG ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN */}
      <text fill="#ffffff" fontSize="9.5" fontWeight="800" letterSpacing="0.8" fontFamily="Segoe UI, Arial, 'Helvetica Neue', sans-serif">
        <textPath href="#ussh-bottom-arc" startOffset="50%" textAnchor="middle">
          TRƯỜNG ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN
        </textPath>
      </text>
    </svg>
  );
};
