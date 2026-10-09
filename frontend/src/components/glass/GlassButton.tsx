import React from 'react';

export type GlassButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'outline';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl font-semibold',
    md: 'min-h-[48px] px-5 py-2.5 text-sm rounded-2xl font-bold',
    lg: 'min-h-[56px] px-6 py-3.5 text-base rounded-2xl font-extrabold',
  }[size];

  const variantStyles = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    gold: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black shadow-[0_4px_16px_rgba(217,119,6,0.35)] hover:brightness-105 active:scale-[0.98] border border-amber-300/40',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:brightness-105 active:scale-[0.98] border border-rose-300/40',
    outline: 'bg-transparent hover:bg-white/10 dark:hover:bg-white/5 text-current border border-current/25 active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center space-x-2 select-none transition-all duration-200 ${
        fullWidth ? 'w-full' : ''
      } ${sizeStyles} ${variantStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default GlassButton;
