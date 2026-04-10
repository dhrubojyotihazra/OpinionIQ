import React, { useState } from 'react';
import { Plus, Mic, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils'; 

export interface RadiantPromptInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function RadiantPromptInput({
  placeholder = "Ask anything...",
  value: propValue,
  onChange: propOnChange,
  onSubmit,
  className,
  disabled
}: RadiantPromptInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    propOnChange?.(e.target.value);
  };

  const handleSubmit = () => {
    if (value && !disabled) {
      onSubmit?.(value);
      if (!isControlled) setInternalValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <style>{`
        @property --rotation {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        
        @keyframes rotate-gradient {
          to {
            --rotation: 360deg;
          }
        }

        .radiant-input-wrapper {
          --border-size: 3px;
          --gradient: conic-gradient(
            from var(--rotation) 
            at 50% 50% in oklab, 
            oklch(0.63 0.2 251.22) 27%, 
            oklch(0.67 0.21 25.81) 33%, 
            oklch(0.9 0.19 93.93) 41%, 
            oklch(0.79 0.25 150.49) 49%, 
            oklch(0.63 0.2 251.22) 65%, 
            oklch(0.72 0.21 150.89) 93%, 
            oklch(0.63 0.2 251.22)
          );
          animation: rotate-gradient 5s infinite linear;
        }

        .radiant-input-wrapper::before {
          content: '';
          position: absolute;
          inset: calc(var(--border-size) * -1);
          border-radius: inherit;
          background: var(--gradient);
          z-index: -1;
          filter: blur(8px);
          opacity: 0.6;
        }

        .radiant-input-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: var(--border-size);
          background: var(--gradient);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      <div className="radiant-input-wrapper relative rounded-full bg-[#1e2030] group transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
        
        {/* Animated Gradient Border */}
        <div className="radiant-input-border rounded-full" />
        
        {/* Inner Content */}
        <div className="relative z-10 flex items-center gap-2 p-1.5 pl-4 pr-1.5 h-14 md:h-16">
          
          {/* Add Button */}
          <button 
            type="button"
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Add attachment"
          >
            <Plus size={20} strokeWidth={2} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm md:text-base font-light tracking-wide h-full w-full min-w-0"
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            
            {/* Mic Button */}
            <button 
              type="button"
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Use microphone"
            >
              <Mic size={20} strokeWidth={2} />
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value || disabled}
              className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300",
                value && !disabled
                  ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md flex-shrink-0" 
                  : "bg-white/5 text-slate-500 cursor-not-allowed opacity-50 flex-shrink-0"
              )}
              aria-label="Send message"
            >
              <ArrowUp size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RadiantPromptInput;
