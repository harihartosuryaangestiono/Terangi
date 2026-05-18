import React from 'react';
import { cn } from '../lib/utils';

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm',
    secondary: 'bg-primary-100 text-primary-900 hover:bg-primary-200',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'hover:bg-primary-50 text-gray-700 hover:text-primary-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 py-2 text-base',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-11 w-11',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
