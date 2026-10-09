import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen = true,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 8.4 Scrim overlay to prevent infinite glass-on-glass noise */}
      <div
        className="fixed inset-0 glass-scrim transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Solid-backed Liquid Glass Modal Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-3xl glass-modal-card p-6 shadow-2xl animate-scale-up border border-white/40 dark:border-white/10 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Specular Rim */}
        <div className="specular-rim" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/50 dark:border-slate-800/60">
          <div className="font-extrabold text-lg text-slate-900 dark:text-slate-50 flex items-center space-x-2">
            {title}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 transition-colors"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="relative text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};
export default GlassModal;
