import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = 'h-8 w-8', size }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="SFG-NOKOS Logo"
    >
      {/* Outer Red Mask/Crown Silhouette */}
      <path
        d="M 50 17 
           L 63 32 
           L 78 26 
           L 72 60 
           L 50 83 
           L 28 60 
           L 22 26 
           L 37 32 
           Z"
        fill="#EF2323"
      />
      {/* Left Eye Cutout */}
      <path
        d="M 29.5 49 
           C 29.5 49, 36 57, 45 67 
           C 41 67, 34 66.5, 29.5 59.5 
           Z"
        fill="#FFFFFF"
      />
      {/* Right Eye Cutout */}
      <path
        d="M 70.5 49 
           C 70.5 49, 64 57, 55 67 
           C 59 67, 66 66.5, 70.5 59.5 
           Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function LogoIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Crown Mask */}
      <path
        d="M250 85 L315 160 L395 130 L365 300 L250 415 L135 300 L105 130 L185 160 Z"
        fill="#EF2323"
      />
      {/* Left Eye */}
      <path
        d="M145 245 C145 245 180 285 225 335 C205 335 170 332 145 298 Z"
        fill="white"
      />
      {/* Right Eye */}
      <path
        d="M355 245 C355 245 320 285 275 335 C295 335 330 332 355 298 Z"
        fill="white"
      />
    </svg>
  );
}
