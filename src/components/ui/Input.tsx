'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-bold opacity-70 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-foreground/[0.03] border-2 border-transparent rounded-2xl px-5 py-4 text-base outline-none transition-all placeholder:text-foreground/30 focus:border-blue-500/30 focus:bg-transparent',
            error && 'border-red-500/50 focus:border-red-500/50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
