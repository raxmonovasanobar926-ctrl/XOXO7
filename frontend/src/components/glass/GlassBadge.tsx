import React from 'react';

export type GlassBadgeVariant = 'highlight' | 'apple' | 'blue' | 'rose' | 'gold' | 'subtle';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: GlassBadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'subtle',
  className = '',
  icon,
}) => {
  const variantStyles: Record<GlassBadgeVariant, string> = {
    highlight: 'glass-highlight text-purple-900 dark:text-purple-100 font-extrabold',
    apple: 'bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-100 border border-white/80 dark:border-white/20 shadow-sm backdrop-blur-md font-semibold',
    blue: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 backdrop-blur-sm font-bold',
    rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-sm font-bold',
    gold: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 backdrop-blur-sm font-bold',
    subtle: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 backdrop-blur-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs transition-colors ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
export default GlassBadge;
