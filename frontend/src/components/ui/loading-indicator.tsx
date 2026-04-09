import React from 'react';

interface SqueezeLoaderProps {
  size?: number;
  color1?: string;
  color2?: string;
  spinDuration?: number;
  squeezeDuration?: number;
  className?: string;
  containerClassName?: string;
}

const SqueezeLoader: React.FC<SqueezeLoaderProps> = ({
  size = 60, // Size in pixels
  color1 = '#8b5cf6', // Matching our indigo/purple theme
  color2 = '#06b6d4',
  spinDuration = 10, // Duration in seconds
  squeezeDuration = 3, // Duration in seconds
  className = "",
  containerClassName = "flex flex-col items-center justify-center gap-8"
}) => {
  return (
    <div className={containerClassName}>
      <div className={`flex justify-center ${className}`}>
        <div
          className="relative"
          style={{
            '--color1': color1,
            '--color2': color2,
            '--spin-duration': `${spinDuration}s`,
            '--squeeze-duration': `${squeezeDuration}s`,
            width: `${size}px`,
            height: `${size}px`,
            animation: 'custom-spin var(--spin-duration) infinite linear',
          } as React.CSSProperties}
        >
          {/* First element */}
          <div
            className="absolute rounded-md"
            style={{
              background: 'var(--color1)',
              animation: 'squeeze var(--squeeze-duration) infinite',
            }}
          />

          {/* Second element with rounded corners */}
          <div
            className="absolute rounded-full"
            style={{
              background: 'var(--color2)',
              animation: 'squeeze var(--squeeze-duration) infinite',
              animationDelay: '-1.25s',
            }}
          />
        </div>
      </div>

      {/* Fallback to regular standard style tag instead of Next.js 'style jsx' */}
      <style>{`
        @keyframes squeeze {
          0% { inset: 0 2em 2em 0; }
          12.5% { inset: 0 2em 0 0; }
          25% { inset: 2em 2em 0 0; }
          37.5% { inset: 2em 0 0 0; }
          50% { inset: 2em 0 0 2em; }
          62.5% { inset: 0 0 0 2em; }
          75% { inset: 0 0 2em 2em; }
          87.5% { inset: 0 0 2em 0; }
          100% { inset: 0 2em 2em 0; }
        }
        @keyframes custom-spin {
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default SqueezeLoader;
