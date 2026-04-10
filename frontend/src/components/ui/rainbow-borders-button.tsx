import React from 'react';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const RainbowButton: React.FC<RainbowButtonProps> = ({ children, className, ...props }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <button 
        className="rainbow-border relative flex items-center justify-center gap-2.5 px-8 py-3 bg-black rounded-full border-none text-white cursor-pointer font-medium transition-all duration-200 w-full h-full"
        {...props}
      >
        {children}
      </button>
      
      <style>{`
        .rainbow-border::before,
        .rainbow-border::after {
          content: '';
          position: absolute;
          left: -2px;
          top: -2px;
          border-radius: 9999px; /* Rounded full for identical shape */
          background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000);
          background-size: 400%;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          z-index: -1;
          animation: rainbow 20s linear infinite;
        }
        .rainbow-border::after {
          filter: blur(20px); /* Reduced blur for cleaner look */
          opacity: 0.7;
        }
        @keyframes rainbow {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
};
