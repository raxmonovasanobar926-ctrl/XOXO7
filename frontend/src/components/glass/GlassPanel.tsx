import React from 'react';

export type GlassVariant = 'default' | 'subtle' | 'blue' | 'rose' | 'gold' | 'purple';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  specular?: boolean;
  interactive?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  variant = 'default',
  specular = true,
  interactive = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<GlassVariant, string> = {
    default: 'glass-surface',
    subtle: 'glass-subtle',
    blue: 'glass-surface bg-sky-500/10 border-sky-400/40 text-sky-950 dark:text-sky-100 shadow-[0_10px_30px_-4px_rgba(2,132,199,0.12)]',
    rose: 'glass-surface bg-rose-500/10 border-rose-400/40 text-rose-950 dark:text-rose-100 shadow-[0_10px_30px_-4px_rgba(225,29,72,0.12)]',
    gold: 'glass-surface bg-amber-500/12 border-amber-400/40 text-amber-950 dark:text-amber-100 shadow-[0_10px_30px_-4px_rgba(217,119,6,0.12)]',
    purple: 'glass-surface bg-purple-500/10 border-purple-400/40 text-purple-950 dark:text-purple-100 shadow-[0_10px_30px_-4px_rgba(110,86,207,0.12)]',
  };

  const interactiveStyles = interactive
    ? 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-3xl ${variantStyles[variant]} ${specular ? 'specular-rim' : ''} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassPanel;
