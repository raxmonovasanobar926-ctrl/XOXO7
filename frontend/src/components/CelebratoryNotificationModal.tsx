import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Check, X, Award, Coins, Heart, Star } from 'lucide-react';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CharacterAvatar } from './graphics/AvatarIcons.tsx';
import { TelegramGiftIcon } from './graphics/TelegramGiftIcon.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';

export interface CelebratoryItem {
  id: number | string;
  sender_name: string;
  sender_avatar?: string;
  type: 'gift' | 'tokens' | 'admin_gift' | 'purchase';
  gift_title?: string;
  gift_icon?: string;
  amount?: number;
  message?: string;
  serial_number?: string;
}

export const CelebratoryNotificationModal: React.FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [activeNotification, setActiveNotification] = useState<CelebratoryItem | null>(null);

  const fetchUnreadNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/celebratory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && data.notifications.length > 0) {
          const first = data.notifications[0];
          setActiveNotification(first);
          triggerEffects();
        }
      }
    } catch (err) {
      console.error('[Celebratory] Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 8000);
    return () => clearInterval(interval);
  }, [token]);

  // Listen to local client gift purchases or events
  useEffect(() => {
    const handleLocalCelebration = (e: any) => {
      if (e.detail) {
        setActiveNotification(e.detail);
        triggerEffects();
      }
    };
    window.addEventListener('xoxo_celebrate_gift', handleLocalCelebration);
    return () => window.removeEventListener('xoxo_celebrate_gift', handleLocalCelebration);
  }, []);

  const triggerEffects = () => {
    sounds.playWin();
    haptics.notification('success');

    // Launch multi-burst luxury Apple confetti
    try {
      const count = 120;
      confetti({
        particleCount: count,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FDE047'],
        scalar: 1.1,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.65 },
          colors: ['#F59E0B', '#EC4899', '#38BDF8'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.65 },
          colors: ['#8B5CF6', '#10B981', '#F59E0B'],
        });
      }, 250);
    } catch (e) {}
  };

  const handleDismiss = async () => {
    if (!activeNotification) return;
    sounds.playClick();
    haptics.selection();

    if (token && typeof activeNotification.id === 'number') {
      try {
        await fetch(`/api/notifications/celebratory/${activeNotification.id}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}
    }

    setActiveNotification(null);
  };

  if (!activeNotification) return null;

  const isPurchase = activeNotification.type === 'purchase';
  const isBot = activeNotification.type === 'admin_gift' || activeNotification.sender_name === 'XOXO Bot';
  const isGift = activeNotification.type === 'gift' || activeNotification.type === 'purchase' || !!activeNotification.gift_title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl animate-scale-up select-none">
      {/* Dynamic Animated Halo Behind the Card */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-fuchsia-500/25 to-amber-500/25 filter blur-[60px] animate-ios-halo pointer-events-none" />

      {/* Main Apple iOS 18 Spatial Glass Presentation Card */}
      <div className="relative w-full max-w-sm ios-glass-card rounded-[32px] p-6 sm:p-7 border border-white/80 dark:border-white/20 shadow-2xl text-center specular-rim overflow-hidden bg-white/85 dark:bg-[#101626]/90 backdrop-blur-3xl">
        {/* Holographic Prismatic Surface Sheen */}
        <div className="ios-holographic-sheen" />

        {/* Luminous Top Refraction Edge */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-white/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header Category Tag */}
        <div className="relative z-10 flex items-center justify-center mb-1">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 text-slate-800 dark:text-white border border-amber-400/40 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" />
            <span>
              {isPurchase ? t('celebratory.new_gift_purchase') : isBot ? t('celebratory.admin_gift_title') : t('celebratory.friend_gift_title')}
            </span>
          </span>
        </div>

        {/* 2. 3D Spatial Collectible Showcase with Spotlight */}
        <div className="relative z-10 mx-auto my-3 flex items-center justify-center w-36 h-36">
          {/* Circular Spotlight Pedestal */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/30 via-pink-500/25 to-indigo-600/30 blur-xl animate-pulse" />
          <div className="absolute bottom-2 inset-x-4 h-7 rounded-full bg-black/10 dark:bg-black/30 blur-md" />

          {/* 3D Glass Artifact */}
          <div className="relative z-10 flex items-center justify-center transform transition-transform duration-500 hover:scale-110">
            {isGift ? (
              <TelegramGiftIcon giftId={activeNotification.gift_title || activeNotification.gift_icon || 'uzuk_diamond'} size={96} />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 border-2 border-white/80 shadow-2xl flex items-center justify-center">
                <Coins className="w-12 h-12 text-white animate-bounce-subtle" />
              </div>
            )}
          </div>
        </div>

        {/* 3. Title & Edition Info */}
        <div className="relative z-10 space-y-1 mt-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isPurchase 
              ? (activeNotification.gift_title || t('celebratory.luxe_gift'))
              : (activeNotification.gift_title || t('celebratory.stones_reward', { count: activeNotification.amount }))}
          </h3>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isPurchase
              ? t('celebratory.added_to_collection')
              : isBot
              ? t('celebratory.presented_by_admin')
              : t('celebratory.sender_prefix', { name: activeNotification.sender_name })}
          </p>
        </div>

        {/* 4. Sender / Message Frosted Speech Capsule */}
        <div className="relative z-10 my-4 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-left space-y-2 backdrop-blur-md shadow-sm">
          {!isPurchase && (
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200/60 dark:border-white/10">
              <div className="relative">
                <CharacterAvatar avatarId={activeNotification.sender_avatar || 'avatar_1'} size={34} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] text-white">
                  ✓
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                  {activeNotification.sender_name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  {isBot ? t('celebratory.official_bot') : t('celebratory.player_label')}
                </span>
              </div>
            </div>
          )}

          {activeNotification.amount && (
            <div className="flex items-center justify-between font-extrabold text-xs text-amber-700 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>{t('celebratory.tokens_received')}</span>
              </span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">+{activeNotification.amount}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
            "{activeNotification.message || (isPurchase ? t('celebratory.default_purchase_msg') : t('celebratory.default_gift_msg'))}"
          </p>
        </div>

        {/* 5. Main Call to Action Button */}
        <button
          onClick={handleDismiss}
          className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-105 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isPurchase ? t('celebratory.view_in_collection') : t('celebratory.accept_and_save')}</span>
        </button>
      </div>
    </div>
  );
};
export default CelebratoryNotificationModal;
