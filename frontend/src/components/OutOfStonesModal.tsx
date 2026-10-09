import React from 'react';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { StoneIcon } from './graphics/StoneIcon.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { X, Plus, Ticket, Users } from 'lucide-react';

interface OutOfStonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStore: () => void;
  onOpenPromo: () => void;
  onInviteFriend: () => void;
}

export const OutOfStonesModal: React.FC<OutOfStonesModalProps> = ({
  isOpen,
  onClose,
  onOpenStore,
  onOpenPromo,
  onInviteFriend,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0E1533] border border-amber-500/40 p-6 shadow-[0_0_40px_rgba(255,200,61,0.25)] text-center">
        {/* Close button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Stone Graphic with shimmer */}
        <div className="my-2 flex justify-center">
          <StoneIcon size={72} glow={true} className="animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-white mt-2 tracking-tight">
          {t('out_of_stones.title')}
        </h3>
        <p className="text-xs text-gray-400 mt-1 mb-6 px-2">
          {t('out_of_stones.desc')}
        </p>

        {/* 3 Actions */}
        <div className="space-y-3">
          {/* 1. Buy via Stars */}
          <button
            onClick={() => {
              sounds.playClick();
              haptics.impact('medium');
              onClose();
              onOpenStore();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm shadow-glow-gold hover:brightness-110 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-left font-black">{t('out_of_stones.buy_stars')}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-black font-black">⭐ Stars</span>
          </button>

          {/* 2. Promo Code */}
          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onClose();
              onOpenPromo();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-extrabold text-sm shadow-glow-blue active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Ticket className="w-5 h-5" />
              </div>
              <span className="text-left">{t('out_of_stones.enter_promo')}</span>
            </div>
            <span className="text-xs text-cyan-400">{t('out_of_stones.free_badge')}</span>
          </button>

          {/* 3. Invite Friends */}
          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onClose();
              onInviteFriend();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-extrabold text-sm shadow-glow-blue active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-left">{t('out_of_stones.invite_friends')}</span>
            </div>
            <span className="text-xs font-bold text-amber-300">{t('out_of_stones.bonus_five')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
