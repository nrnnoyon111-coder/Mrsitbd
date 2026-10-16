import React from 'react';

interface MrsLogoProps {
  className?: string;
  variant?: 'tech' | 'full' | 'mark' | 'card';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const MrsLogo: React.FC<MrsLogoProps> = ({
  className = '',
  variant = 'tech',
  size = 'md',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { height: 28, textSize: 'text-base', subSize: 'text-[10px]' },
    md: { height: 38, textSize: 'text-xl', subSize: 'text-xs' },
    lg: { height: 50, textSize: 'text-2xl', subSize: 'text-sm' },
    xl: { height: 68, textSize: 'text-3xl', subSize: 'text-base' },
  };

  const { height, textSize, subSize } = sizeMap[size];

  // Modern Circuit "MrS" Icon (matching uploaded image file_000000004c3081f4827909e7207bb7a9.png)
  const CircuitEmblem = (
    <svg
      width={height}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      <defs>
        <linearGradient id="mrsBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="circuitCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Rounded subtle container background for crisp contrast */}
      <rect width="120" height="120" rx="26" fill="white" className="filter drop-shadow-sm" />
      <rect x="1" y="1" width="118" height="118" rx="25" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Geometric 'M' */}
      <path
        d="M 18 80 L 18 42 L 28 34 L 38 48 L 48 34 L 54 39 L 54 80 L 44 80 L 44 56 L 38 64 L 38 64 L 32 56 L 32 80 Z"
        fill="url(#mrsBlueGrad)"
      />

      {/* Geometric 'r' */}
      <path
        d="M 58 80 L 58 48 L 68 48 L 68 56 C 70 50 75 48 80 48 L 80 58 C 74 58 68 62 68 68 L 68 80 Z"
        fill="url(#mrsBlueGrad)"
      />

      {/* Geometric 'S' connected with Circuit Traces */}
      <path
        d="M 75 80 L 92 80 L 98 74 L 98 66 L 78 66 L 78 60 L 96 60 L 96 52 L 72 52 L 72 70 L 90 70 L 90 74 L 75 74 Z"
        fill="url(#mrsBlueGrad)"
      />

      {/* PCB Circuit Traces & Terminals extending rightwards */}
      {/* Node 1 */}
      <path d="M 96 56 L 108 56" stroke="url(#circuitCyanGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="56" r="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />

      {/* Node 2 */}
      <path d="M 98 68 L 106 68" stroke="url(#circuitCyanGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="108" cy="68" r="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />

      {/* Node 3 */}
      <path d="M 96 76 L 102 76 L 106 82 L 110 82" stroke="url(#circuitCyanGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="111" cy="82" r="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />

      {/* Micro-chips / SMD squares */}
      <rect x="88" y="38" width="5" height="5" fill="#0284C7" rx="1" />
      <rect x="96" y="42" width="4" height="4" fill="#38BDF8" rx="0.8" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{CircuitEmblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {CircuitEmblem}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-slate-900 ${textSize}`}>
            MRS FAST
          </span>
          <span className={`font-bold tracking-tight text-blue-600 ${textSize}`}>
            SOLUTION
          </span>
        </div>
        {showTagline && (
          <span className={`font-medium tracking-normal text-slate-500 mt-0.5 ${subSize}`}>
            Your Trusted Partner in Industrial World
          </span>
        )}
      </div>
    </div>
  );
};
