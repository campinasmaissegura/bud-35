import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900',
      ghost: 'hover:bg-slate-100 text-slate-700',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';