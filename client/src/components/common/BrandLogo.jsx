import React from 'react';

/**
 * Smart Service Hub Official Brand Logo
 * Color palette based on brand identity:
 * - Primary Blue: #0D47A1
 * - Accent Orange: #FF8A00
 * - Text Dark: #1E293B
 * - Background Light: #F5F7FA
 */
export default function BrandLogo({
  size = 'md',
  iconOnly = false,
  withTagline = true,
  inverted = false,
  className = ''
}) {
  // Dimensions map
  const sizeMap = {
    xs: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    sm: { icon: 34, text: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 42, text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Graphic */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
      >
        <defs>
          {/* Gradients for depth and vibrance */}
          <linearGradient id="sshBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1565C0" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>

          <linearGradient id="sshOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#FF8A00" />
          </linearGradient>

          <linearGradient id="sshRoofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D47A1" />
            <stop offset="100%" stopColor="#1976D2" />
          </linearGradient>
        </defs>

        {/* 1. House Roof Contour (Top Hex Peak) */}
        <path
          d="M50 8 L88 32 L78 39 L50 21 L22 39 L12 32 Z"
          fill="url(#sshRoofGrad)"
        />

        {/* 2. Top "S" Curve Ribbon in Radiant Accent Orange */}
        <path
          d="M32 38 C 32 34, 40 28, 56 28 C 72 28, 80 36, 80 44 C 80 52, 68 56, 52 59 C 40 61, 32 64, 30 68 C 28 65, 29 55, 38 52 C 54 48, 66 47, 66 43 C 66 38, 60 36, 52 36 C 42 36, 36 40, 36 42 Z"
          fill="url(#sshOrangeGrad)"
        />

        {/* 3. Lower "S" Loop in Deep Primary Blue */}
        <path
          d="M50 56 C 68 53, 84 57, 84 72 C 84 86, 68 94, 48 94 C 28 94, 16 84, 16 72 C 16 66, 20 60, 26 56 L 33 63 C 28 66, 26 70, 26 73 C 26 80, 34 85, 48 85 C 62 85, 72 80, 72 73 C 72 66, 62 63, 48 65 C 44 65, 40 64, 36 62 Z"
          fill="url(#sshBlueGrad)"
        />

        {/* 4. Integrated Service Tool / Wrench Cutout Silhouette inside the lower loop */}
        <g transform="translate(46, 68) rotate(-35) scale(0.7)">
          <path
            d="M 6 0 L 22 0 C 25 -5, 31 -6, 35 -3 C 39 0, 40 6, 37 10 L 30 10 L 26 7 L 18 15 L 20 23 L 16 27 C 12 30, 6 29, 3 25 C 0 21, 1 15, 6 12 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
        </g>
      </svg>

      {/* Typography Lockup */}
      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight leading-none">
            <span
              className={`font-black ${currentSize.text} ${
                inverted ? 'text-white' : 'text-slate-900'
              }`}
            >
              Smart&nbsp;
            </span>
            <span
              className={`font-black ${currentSize.text} text-[#0D47A1]`}
            >
              Service&nbsp;
            </span>
            <span
              className={`font-black ${currentSize.text} text-[#FF8A00]`}
            >
              Hub
            </span>
          </div>

          {withTagline && (
            <p
              className={`font-medium ${currentSize.sub} tracking-wide mt-1 ${
                inverted ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              All Your Services, One Hub
            </p>
          )}
        </div>
      )}
    </div>
  );
}
