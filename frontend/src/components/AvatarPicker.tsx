import React, { useRef } from 'react';
import { AVATAR_LIST, CharacterAvatar } from './graphics/AvatarIcons.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { Check, X, Plus, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';

interface AvatarPickerProps {
  currentAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
  onClose: () => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  onSelectAvatar,
  onClose,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectPreset = (avatarId: string) => {
    sounds.playClick();
    haptics.selection();
    onSelectAvatar(avatarId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playClick();
    haptics.notification('success');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        onSelectAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 8.4 Scrim Backdrop */}
      <div
        className="fixed inset-0 glass-scrim animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md glass-modal-card rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] animate-scale-up border border-white/50 dark:border-white/15">
        <div className="specular-rim" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                {t('profile.edit_avatar') || 'Avatar Tanlash'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('avatar.select_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9 Preset Characters + '+' Gallery Tile */}
        <div className="grid grid-cols-3 gap-2.5 py-4 overflow-y-auto max-h-[420px] pr-1">
          {AVATAR_LIST.map((item) => {
            const isSelected = currentAvatar === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPreset(item.id)}
                className={`relative flex flex-col items-center p-2.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/15 scale-102 ring-2 ring-purple-400/40 shadow-sm'
                    : 'border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-purple-400/40 active:scale-98'
                }`}
              >
                <div className="relative">
                  <CharacterAvatar avatarId={item.id} size={58} />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-extrabold shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-900 dark:text-white font-extrabold text-center truncate w-full mt-2">
                  {item.nameKey}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium text-center truncate w-full">
                  {item.tagline}
                </span>
              </button>
            );
          })}

          {/* '+' Button to Pick Image from Gallery */}
          <button
            onClick={() => {
              sounds.playClick();
              fileInputRef.current?.click();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed border-purple-400/50 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-500 transition-all hover:scale-102 active:scale-98 text-purple-700 dark:text-purple-300 min-h-[105px]"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm mb-1.5">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white text-center">
              {t('avatar.gallery_title')}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium text-center">
              {t('avatar.gallery_desc')}
            </span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
export default AvatarPicker;
