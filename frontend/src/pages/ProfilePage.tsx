import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { AvatarPicker } from '../components/AvatarPicker.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { CharacterAvatar, StoneIcon } from '../components/graphics/index.ts';
import { 
  Share2, 
  Copy, 
  Check, 
  Edit3, 
  Ticket,
  Plus,
  AtSign,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Gift,
  Trophy,
  Swords,
  Star,
  Flame,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Coins
} from 'lucide-react';
import { 
  TelegramGiftIcon, 
  TelegramGiftCard, 
  TelegramGiftDetailModal, 
  getGiftDisplayMeta,
  TelegramGiftMetadata 
} from '../components/graphics/TelegramGiftIcon.tsx';

interface ProfilePageProps {
  onOpenStore?: () => void;
  onOpenPromo?: () => void;
  onOpenGifts?: () => void;
}

// Telegram Official Verified Badge (Rosette with white checkmark)
export const TelegramVerifiedBadge: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block shrink-0 drop-shadow-sm ${className}`}
  >
    <path
      d="M10.27 2.29a2.5 2.5 0 0 1 3.46 0l.97.94a2.5 2.5 0 0 0 2.29.68l1.32-.23a2.5 2.5 0 0 1 2.85 1.98l.3 1.32a2.5 2.5 0 0 0 1.63 1.77l1.26.47a2.5 2.5 0 0 1 1.5 3.14l-.44 1.28a2.5 2.5 0 0 0 .68 2.29l.94.97a2.5 2.5 0 0 1 0 3.46l-.94.97a2.5 2.5 0 0 0-.68 2.29l.44 1.28a2.5 2.5 0 0 1-1.5 3.14l-1.26.47a2.5 2.5 0 0 0-1.63 1.77l-.3 1.32a2.5 2.5 0 0 1-2.85 1.98l-1.32-.23a2.5 2.5 0 0 0-2.29.68l-.97.94a2.5 2.5 0 0 1-3.46 0l-.97-.94a2.5 2.5 0 0 0-2.29-.68l-1.32.23a2.5 2.5 0 0 1-2.85-1.98l-.3-1.32a2.5 2.5 0 0 0-1.63-1.77l-1.26-.47a2.5 2.5 0 0 1-1.5-3.14l.44-1.28a2.5 2.5 0 0 0-.68-2.29l-.94-.97a2.5 2.5 0 0 1 0-3.46l.94-.97a2.5 2.5 0 0 0 .68-2.29l-.44-1.28a2.5 2.5 0 0 1 1.5-3.14l1.26-.47a2.5 2.5 0 0 0 1.63-1.77l.3-1.32a2.5 2.5 0 0 1 2.85-1.98l1.32.23a2.5 2.5 0 0 0 2.29-.68l.97-.94z"
      fill="#2AABEE"
    />
    <path
      d="M8.5 12.3l2.4 2.4 4.8-5"
      stroke="#ffffff"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenStore,
  onOpenPromo,
  onOpenGifts,
}) => {
  const { user, token, refreshUser, updateProfile } = useAuth();
  const { t } = useTranslation();

  // Nickname modal & checking state
  const [showNickModal, setShowNickModal] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [nickError, setNickError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Referral & Gifts stats
  const [refStats, setRefStats] = useState<any>({ totalInvited: 0, activeInvited: 0, totalEarned: 0, referrals: [] });
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedNick, setCopiedNick] = useState(false);
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  const refLink = `https://t.me/xoxoglobalbot?start=ref_${user?.telegram_id || 12345678}`;

  const fetchMyGifts = () => {
    if (!token) return;
    fetch('/api/gifts/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.gifts) setMyGifts(data.gifts);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (token) {
      fetch('/api/referrals/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setRefStats(data))
        .catch(() => {});

      fetchMyGifts();
    }
  }, [token]);

  // Live real-time debounced nickname availability checker
  useEffect(() => {
    if (!showNickModal) return;

    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    const clean = newNick.trim();
    setNickError(null);

    if (!clean) {
      setIsChecking(false);
      setIsAvailable(null);
      setStatusMessage(null);
      return;
    }

    if (clean === user?.nickname) {
      setIsChecking(false);
      setIsAvailable(true);
      setStatusMessage(null);
      return;
    }

    if (clean.length < 3 || clean.length > 20) {
      setIsChecking(false);
      setIsAvailable(false);
      setStatusMessage(t('profile.nick_rule_hint'));
      return;
    }

    setIsChecking(true);
    setStatusMessage(t('profile.nick_checking'));

    checkTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(clean)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsChecking(false);

        if (res.ok && data.available) {
          setIsAvailable(true);
          setStatusMessage(t('profile.nick_available'));
        } else {
          setIsAvailable(false);
          setStatusMessage(data.error || t('profile.nick_taken'));
        }
      } catch (err) {
        setIsChecking(false);
        setIsAvailable(null);
      }
    }, 350);

    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [newNick, showNickModal, user?.nickname, token, t]);

  const handleOpenNickModal = () => {
    setNewNick(user?.nickname || '');
    setNickError(null);
    setIsAvailable(null);
    setStatusMessage(null);
    sounds.playClick();
    haptics.selection();
    setShowNickModal(true);
  };

  const handleSaveNickname = async () => {
    const clean = newNick.trim();
    if (!clean || isSaving) return;
    if (clean === user?.nickname) {
      setShowNickModal(false);
      return;
    }
    if (isAvailable === false) return;

    setIsSaving(true);
    setNickError(null);
    sounds.playClick();
    haptics.selection();

    const res = await updateProfile({ nickname: clean });
    setIsSaving(false);

    if (res.success) {
      setShowNickModal(false);
      haptics.notification('success');
    } else {
      setNickError(res.error || t('profile.nick_taken'));
      setIsAvailable(false);
      haptics.notification('error');
    }
  };

  const handleSelectAvatar = async (avatarId: string) => {
    setShowAvatarPicker(false);
    const res = await updateProfile({ avatar_url: avatarId });
    if (res.success) {
      haptics.notification('success');
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopiedRef(true);
    sounds.playClick();
    haptics.notification('success');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyId = () => {
    if (!user?.telegram_id) return;
    navigator.clipboard.writeText(String(user.telegram_id));
    setCopiedId(true);
    sounds.playClick();
    haptics.notification('success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyNick = () => {
    if (!user?.nickname) return;
    navigator.clipboard.writeText(`@${user.nickname}`);
    setCopiedNick(true);
    sounds.playClick();
    haptics.notification('success');
    setTimeout(() => setCopiedNick(false), 2000);
  };

  const handleShareRef = () => {
    const text = t('profile.share_text');
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`;
    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(tgUrl);
    } else {
      window.open(tgUrl, '_blank');
    }
  };

  // Convert gift back to stones
  const handleSellGift = async (gift: TelegramGiftMetadata) => {
    const userGiftId = (gift as any).userGiftId || (gift as any).id;
    if (!userGiftId || !token) return;
    try {
      const res = await fetch('/api/gifts/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userGiftId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sounds.playWinDing();
        haptics.notification('success');
        setSelectedGift(null);
        refreshUser();
        fetchMyGifts();
      }
    } catch (e) {}
  };

  const totalMatches = (user?.wins || 0) + (user?.losses || 0) + (user?.draws || 0);
  const winRatePercent = totalMatches > 0 ? Math.round(((user?.wins || 0) / totalMatches) * 100) : 0;

  return (
    <div className="space-y-4 pb-28 animate-fadeIn select-none">
      {/* 1. Official Telegram Profile Card */}
      <div 
        className="rounded-[32px] p-6 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        style={{
          background: 'linear-gradient(180deg, #182333 0%, #101924 60%, #0b1118 100%)',
        }}
      >
        {/* Ambient Radial Spotlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-sky-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Specular Rim */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Telegram Avatar Showcase with Halo & Camera Edit Button */}
        <div className="relative inline-block mx-auto mb-3.5">
          <div className="p-1 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 shadow-[0_0_24px_rgba(56,189,248,0.35)]">
            <div className="p-0.5 rounded-full bg-[#101924]">
              <CharacterAvatar 
                avatarId={user?.avatar_url || 'fox'} 
                size={88} 
                className="shadow-inner" 
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              sounds.playClick();
              setShowAvatarPicker(true);
            }}
            className="absolute -bottom-1 -right-1 p-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.5)] hover:scale-110 active:scale-95 transition-all border border-white/30"
            title={t('profile.edit_avatar')}
          >
            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Display Nickname with Telegram Verified Rosette */}
        <div className="flex items-center justify-center space-x-1.5 mb-1.5">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>{user?.nickname || 'O\'yinchi'}</span>
            <TelegramVerifiedBadge size={19} />
          </h2>
        </div>

        {/* Telegram Handles & ID Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {/* @Nickname Pill (Click to edit) */}
          <button
            onClick={handleOpenNickModal}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-sky-300 hover:text-white transition-all active:scale-95"
            title="Taxallusni tahrirlash"
          >
            <AtSign className="w-3 h-3 text-sky-400" />
            <span>{user?.nickname}</span>
            <Edit3 className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
          </button>

          {/* Telegram ID Pill (Click to copy) */}
          <button
            onClick={handleCopyId}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all active:scale-95"
            title="Telegram ID nusxalash"
          >
            <span>ID: {user?.telegram_id || 12345678}</span>
            {copiedId ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* Role Badge */}
          {user?.role === 'super_admin' ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/40">
              👑 Super Admin
            </span>
          ) : user?.role === 'admin' ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
              🛡 Admin
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30 flex items-center space-x-1">
              <Star className="w-2.5 h-2.5 fill-current text-sky-400" />
              <span>Telegram O'yinchisi</span>
            </span>
          )}
        </div>

        {/* 4-Metric Official Telegram Glass Bar */}
        <div className="grid grid-cols-4 gap-2 my-4 pt-4 border-t border-white/10">
          {/* Balance */}
          <div 
            onClick={() => {
              sounds.playClick();
              haptics.impact('medium');
              onOpenStore?.();
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-center cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-center space-x-1 text-amber-400 mb-0.5">
              <StoneIcon size="xs" />
              <span className="text-base font-black text-amber-300 font-mono">
                {user?.token_balance || 0}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Balans
            </span>
          </div>

          {/* Wins */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-0.5">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-base font-black text-white font-mono">
                {user?.wins || 0}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {t('profile.wins')}
            </span>
          </div>

          {/* Gifts */}
          <div 
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenGifts ? onOpenGifts() : onOpenStore?.();
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-center cursor-pointer transition-all active:scale-95"
          >
            <div className="flex items-center justify-center space-x-1 text-purple-400 mb-0.5">
              <Gift className="w-3.5 h-3.5" />
              <span className="text-base font-black text-purple-300 font-mono">
                {myGifts.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {t('profile.gifts')}
            </span>
          </div>

          {/* Friends / Referrals */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center space-x-1 text-sky-400 mb-0.5">
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-base font-black text-white font-mono">
                {refStats.totalInvited || 0}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Do'stlar
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => {
              sounds.playClick();
              haptics.impact('medium');
              onOpenStore?.();
            }}
            className="flex-1 min-w-[120px] flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 font-black text-xs text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t('dashboard.buy_stones')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenPromo?.();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 font-bold text-xs text-white active:scale-95 transition-all shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('dashboard.promo_code')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenGifts ? onOpenGifts() : onOpenStore?.();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 font-bold text-xs text-white active:scale-95 transition-all shadow-sm"
          >
            <Gift className="w-3.5 h-3.5 text-pink-400" />
            <span>{t('profile.gifts_store')}</span>
          </button>
        </div>
      </div>

      {/* 2. Official Telegram Collectible Gifts Shelf */}
      <div 
        className="rounded-[30px] p-5 text-left border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #182333 0%, #121a27 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>{t('profile.gifts_collection')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {myGifts.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{t('profile.gifts_expo_subtitle')}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenGifts ? onOpenGifts() : onOpenStore?.();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center space-x-1 active:scale-95 transition-all"
          >
            <span>{t('profile.store_short')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myGifts.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <TelegramGiftIcon giftId="sovga_box" size={42} />
            </div>
            <h4 className="text-sm font-extrabold text-white mb-1">
              {t('profile.gifts_empty_title')}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-3">
              {t('profile.gifts_empty_desc')}
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                haptics.impact('medium');
                onOpenGifts ? onOpenGifts() : onOpenStore?.();
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('profile.open_gifts_store')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myGifts.map((g, idx) => {
              const catalogId = String(g.gift_catalog_id || g.icon || g.title || 'sovga_box');
              const meta = getGiftDisplayMeta(catalogId);
              const giftData: TelegramGiftMetadata = {
                ...g,
                id: catalogId,
                title: typeof g.title === 'string' ? g.title : meta.title,
                token_price: g.token_price !== undefined ? g.token_price : meta.price,
                sell_price: g.sell_price !== undefined ? g.sell_price : meta.sellPrice,
                serialNumber: g.serial_number || `№ ${String(idx + 1).padStart(3, '0')}`,
                rarity: g.rarity || meta.rarity,
                userGiftId: g.id,
              };

              return (
                <TelegramGiftCard
                  key={g.id || idx}
                  gift={giftData}
                  actionLabel="Ko'rish"
                  actionType="view"
                  onClick={() => setSelectedGift(giftData)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Game Battle Stats & Win Rate */}
      <div 
        className="rounded-[30px] p-5 text-left border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #182333 0%, #121a27 100%)',
        }}
      >
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Swords className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              {t('profile.stats')}
            </h3>
            <p className="text-[11px] text-slate-400">Janglardagi natijalar va g'alaba foizi</p>
          </div>
        </div>

        {/* Win Rate Progress Bar */}
        <div className="my-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">{t('profile.win_rate')}</span>
            <span className="text-emerald-400 font-mono font-black text-sm">{winRatePercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, winRatePercent)}%` }}
            />
          </div>
        </div>

        {/* 3 Breakdown Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('profile.total_games')}</span>
            <span className="text-base font-black text-white font-mono">{totalMatches}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-emerald-400 block font-semibold uppercase">{t('profile.wins')}</span>
            <span className="text-base font-black text-emerald-400 font-mono">{user?.wins || 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-rose-400 block font-semibold uppercase">{t('profile.losses')}</span>
            <span className="text-base font-black text-rose-400 font-mono">{user?.losses || 0}</span>
          </div>
        </div>
      </div>

      {/* 4. Telegram Referral & Share Hub */}
      <div 
        className="rounded-[30px] p-5 text-left border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #182333 0%, #121a27 100%)',
        }}
      >
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              {t('profile.referrals')}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('profile.referral_bonus_info', { count: 5 })}
            </p>
          </div>
        </div>

        {/* Referral Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-3">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-semibold">{t('profile.invited_total')}</span>
            <span className="text-base font-black text-white font-mono">{refStats.totalInvited || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-semibold">{t('profile.invited_active')}</span>
            <span className="text-base font-black text-sky-400 font-mono">{refStats.activeInvited || 0}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-semibold">{t('profile.total_earned')}</span>
            <span className="text-base font-black text-amber-400 font-mono">+{refStats.totalEarned || 0}</span>
          </div>
        </div>

        {/* Share & Copy Buttons */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleShareRef}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-black text-xs text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Telegramda ulashish</span>
          </button>
          <button
            onClick={handleCopyRef}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 font-bold text-xs text-white shadow-sm active:scale-95 transition-all flex items-center space-x-1"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? t('profile.copied') : t('profile.copy')}</span>
          </button>
        </div>
      </div>

      {/* 5. Detailed Telegram Gift Inspection Modal */}
      {selectedGift && (
        <TelegramGiftDetailModal
          gift={selectedGift}
          userBalance={user?.token_balance || 0}
          isOwner={true}
          onClose={() => setSelectedGift(null)}
          onSell={handleSellGift}
          onSend={() => {
            setSelectedGift(null);
            onOpenGifts ? onOpenGifts() : onOpenStore?.();
          }}
        />
      )}

      {/* 6. Unique Nickname Modal */}
      {showNickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Scrim */}
          <div 
            onClick={() => setShowNickModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
          />

          {/* Modal Container */}
          <div 
            className="relative w-full max-w-sm rounded-3xl p-6 border border-white/15 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] overflow-hidden animate-scaleIn z-10"
            style={{
              background: 'linear-gradient(180deg, #182333 0%, #101924 100%)',
            }}
          >
            {/* Top Specular Rim */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowNickModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-2 bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-sm">
                <AtSign className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {t('profile.edit_nick_title')}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed px-2">
                {t('profile.nick_rule_hint')}
              </p>
            </div>

            {/* Nickname Input Pill */}
            <div className="space-y-3">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-black text-sm">@</span>
                <input
                  type="text"
                  value={newNick}
                  maxLength={20}
                  onChange={(e) => setNewNick(e.target.value)}
                  placeholder={t('profile.new_nick_placeholder')}
                  className="w-full pl-8 pr-10 py-3 rounded-2xl bg-white/5 border border-white/15 text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner"
                  autoFocus
                />
                {isChecking ? (
                  <Loader2 className="absolute right-3.5 w-4 h-4 text-sky-400 animate-spin" />
                ) : isAvailable === true ? (
                  <CheckCircle2 className="absolute right-3.5 w-4 h-4 text-emerald-400" />
                ) : isAvailable === false ? (
                  <XCircle className="absolute right-3.5 w-4 h-4 text-rose-400" />
                ) : null}
              </div>

              {/* Real-time Status Banner */}
              {statusMessage && (
                <div 
                  className={`p-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isAvailable === true
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : isAvailable === false
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                      : 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
                  }`}
                >
                  {isAvailable === true && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {isAvailable === false && <XCircle className="w-4 h-4 shrink-0" />}
                  {isChecking && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
                  <span>{statusMessage}</span>
                </div>
              )}

              {nickError && (
                <p className="text-xs font-bold text-rose-400 text-center">
                  {nickError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNickModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-all active:scale-95"
                >
                  {t('profile.cancel')}
                </button>

                <button
                  type="button"
                  disabled={isChecking || isAvailable === false || newNick.trim().length < 3 || isSaving}
                  onClick={handleSaveNickname}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('profile.save')}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t('profile.save')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={user?.avatar_url || 'fox'}
          onSelectAvatar={handleSelectAvatar}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
