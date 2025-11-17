/**
 * Button Component
 *
 * A reusable button component with multiple variants and sizes.
 * Supports all standard button HTML attributes plus custom styling options.
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Click Me
 * </Button>
 * ```
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button content */
  children: React.ReactNode;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:from-red-700 hover:to-red-600 hover:scale-[1.01]',
    secondary: 'brand-surface text-gray-100 border border-white/10 hover:border-red-500/60',
    outline: 'border border-red-500/60 text-red-500 hover:bg-red-500/10',
    ghost: 'text-red-500 hover:bg-white/5',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;