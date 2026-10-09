import React, { useEffect, useState } from 'react';
import { X, Trophy, Swords, UserPlus, Gift, Send, Copy, Check, Shield, Award, Users, Sparkles } from 'lucide-react';
import { CharacterAvatar } from './graphics/AvatarIcons.tsx';
import { 
  TelegramGiftIcon, 
  TelegramGiftCard, 
  TelegramGiftDetailModal, 
  TelegramVerifiedBadge,
  getGiftDisplayMeta,
  TelegramGiftMetadata 
} from './graphics/TelegramGiftIcon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';

interface PublicProfileModalProps {
  userId: number;
  onClose: () => void;
  onSendGift?: (targetUserId: number) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userId,
  onClose,
  onSendGift,
}) => {
  const { token, user: currentUser } = useAuth();
  const { t } = useTranslation();
  const { isUserOnline } = useSocket();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'self' | 'none' | 'pending_sent' | 'pending_received' | 'friends'>('none');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<any | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data.user);
        setFriendshipStatus(data.user.friendshipStatus || 'none');
      } else {
        setError("Foydalanuvchi ma'lumotlarini yuklab bo'lmadi");
      }
    } catch (e) {
      setError("Server xatoligi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (!profileUser) return;
    sounds.playClick();
    haptics.selection();
    navigator.clipboard.writeText(String(profileUser.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSendFriendRequest = async () => {
    if (!token || !profileUser) return;
    setActionLoading(true);
    setActionMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: profileUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendshipStatus('pending_sent');
        setActionMsg(t('public_profile.request_sent'));
        haptics.notification('success');
      } else {
        setActionMsg(data.error || t('public_profile.request_send_error', { defaultValue: "So'rov yuborishda xatolik" }));
        haptics.notification('error');
      }
    } catch (e: any) {
      setActionMsg(t('public_profile.server_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondRequest = async (action: 'accept' | 'decline') => {
    if (!token || !profileUser) return;
    setActionLoading(true);
    setActionMsg(null);
    sounds.playClick();

    try {
      const friendsRes = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (friendsRes.ok) {
        const fData = await friendsRes.json();
        const pending = (fData.pendingRequests || []).find((r: any) => r.sender.id === profileUser.id);
        if (pending) {
          const res = await fetch('/api/friends/respond', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ requestId: pending.id, action }),
          });
          if (res.ok) {
            setFriendshipStatus(action === 'accept' ? 'friends' : 'none');
            setActionMsg(action === 'accept' ? t('public_profile.request_accepted') : t('public_profile.request_declined'));
          }
        }
      }
    } catch (e) {
      setActionMsg(t('common.error_occurred'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-scaleUp">
      <div 
        className="relative w-full max-w-sm rounded-[32px] p-6 sm:p-7 border border-white/15 shadow-2xl text-center overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #182333 0%, #101924 100%)',
        }}
      >
        {/* Ambient Halo Radial Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-sky-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Specular Rim */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Profil yuklanmoqda...</span>
          </div>
        ) : error || !profileUser ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-rose-400 font-bold text-sm">{error || 'Foydalanuvchi topilmadi'}</p>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold">
              Yopish
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto pr-1 space-y-4">
            {/* Header Avatar & Nickname */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 shadow-xl">
                <div className="p-0.5 rounded-full bg-[#101924]">
                  <CharacterAvatar avatarId={profileUser.avatar_url || 'avatar_1'} size={72} />
                </div>
                <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-600 text-white shadow-md border border-white/40">
                  #{profileUser.rank || '1'}
                </span>
                {/* Presence Status Dot on Avatar */}
                <span
                  title={isUserOnline(profileUser.id) || profileUser.is_online ? 'Online' : 'Offline'}
                  className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-[#101924] flex items-center justify-center ${
                    isUserOnline(profileUser.id) || profileUser.is_online
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]'
                      : 'bg-slate-400'
                  }`}
                />
              </div>

              <h2 className="text-xl font-extrabold text-white mt-2 flex items-center gap-1.5">
                <span>{profileUser.nickname}</span>
                <TelegramVerifiedBadge size={18} />
                {profileUser.role === 'super_admin' && <Shield className="w-4 h-4 text-rose-400 inline" />}
                {profileUser.role === 'admin' && <Shield className="w-4 h-4 text-purple-400 inline" />}
              </h2>

              <span className="text-xs text-slate-400 font-medium block mt-0.5">
                {profileUser.team?.name || profileUser.team_name ? (profileUser.team?.name || profileUser.team_name) : t('public_profile.solo_player')}
              </span>

              {/* ID Badge with Copy Button and Live Online Status */}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-sky-300 flex items-center space-x-1.5 hover:bg-white/10 transition-all active:scale-95"
                >
                  <span>ID: {profileUser.id}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>

                {isUserOnline(profileUser.id) || profileUser.is_online ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center space-x-1.5 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60" />
                    <span>Offline</span>
                  </span>
                )}
              </div>
            </div>

            {/* Notification message */}
            {actionMsg && (
              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold text-center animate-fadeIn">
                {actionMsg}
              </div>
            )}

            {/* Friend Actions */}
            {friendshipStatus !== 'self' && (
              <div className="flex items-center justify-center gap-2">
                {friendshipStatus === 'none' && (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('public_profile.send_friend_request')}</span>
                  </button>
                )}

                {friendshipStatus === 'pending_sent' && (
                  <span className="flex-1 py-2 px-3 rounded-2xl bg-white/5 border border-white/10 text-sky-300 text-xs font-bold text-center">
                    {t('public_profile.request_already_sent')}
                  </span>
                )}

                {friendshipStatus === 'pending_received' && (
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => handleRespondRequest('accept')}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
                    >
                      {t('public_profile.accept_request')}
                    </button>
                    <button
                      onClick={() => handleRespondRequest('decline')}
                      disabled={actionLoading}
                      className="py-2 px-3 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold"
                    >
                      {t('public_profile.decline_request')}
                    </button>
                  </div>
                )}

                {friendshipStatus === 'friends' && (
                  <span className="flex-1 py-2 px-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center justify-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>{t('public_profile.your_friend')}</span>
                  </span>
                )}

                {onSendGift && (
                  <button
                    onClick={() => {
                      onClose();
                      onSendGift(profileUser.id);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center space-x-1 active:scale-95 hover:bg-amber-500/30"
                  >
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>{t('public_profile.send_gift_btn')}</span>
                  </button>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('public_profile.wins_stat')}</span>
                <span className="text-base font-black text-emerald-400 font-mono">{profileUser.wins || 0}</span>
              </div>
              <div className="text-center border-x border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('public_profile.losses_stat')}</span>
                <span className="text-base font-black text-rose-400 font-mono">{profileUser.losses || 0}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('public_profile.winrate_stat')}</span>
                <span className="text-base font-black text-sky-400 font-mono">{profileUser.winRate || 0}%</span>
              </div>
            </div>

            {/* Collectible Gifts Showcase */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('public_profile.collectible_gifts_title')}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  {t('public_profile.gift_count', { count: profileUser.gifts?.length || 0 })}
                </span>
              </div>

              {!profileUser.gifts || profileUser.gifts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 italic">
                  {t('leaderboard.no_gifts')}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {profileUser.gifts.map((g: any, idx: number) => {
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
                        actionLabel={t('gifts.view_action')}
                        actionType="view"
                        onClick={() => setSelectedGift(giftData)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Gift Inspection Modal */}
        {selectedGift && (
          <TelegramGiftDetailModal
            gift={selectedGift}
            isOwner={false}
            onClose={() => setSelectedGift(null)}
            onSend={() => {
              if (onSendGift && profileUser) {
                setSelectedGift(null);
                onClose();
                onSendGift(profileUser.id);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PublicProfileModal;
