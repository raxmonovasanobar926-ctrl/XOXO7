import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { StoneIcon } from './graphics/StoneIcon.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { X, Gift, ShoppingBag, Trophy, Crown, Sparkles } from 'lucide-react';
import { 
  TelegramGiftIcon, 
  TelegramGiftCard, 
  TelegramGiftDetailModal, 
  TelegramGiftMetadata 
} from './graphics/TelegramGiftIcon.tsx';

interface GiftCatalogItem {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  icon: string;
  token_price: number;
  sell_price: number;
}

interface UserGiftItem {
  id: number;
  catalog_id: string;
  title: string;
  icon: string;
  sell_price: number;
  is_premium_reward?: boolean;
  month_acquired: string;
  can_sell?: boolean;
}

export const GiftsModal: React.FC<{ onClose: () => void; onOpenStore?: () => void }> = ({
  onClose,
  onOpenStore,
}) => {
  const { user, token, refreshUser } = useAuth();
  const { t, lang } = useTranslation();

  const [tab, setTab] = useState<'store' | 'my_gifts' | 'leaderboard'>('store');
  const [catalog, setCatalog] = useState<GiftCatalogItem[]>([]);
  const [myGifts, setMyGifts] = useState<UserGiftItem[]>([]);
  const [topGifters, setTopGifters] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDetailGift, setSelectedDetailGift] = useState<any | null>(null);

  const getItemTitle = (item: GiftCatalogItem) => {
    if (lang === 'ru') return item.title_ru || item.title_uz;
    if (lang === 'en') return item.title_en || item.title_uz;
    return item.title_uz;
  };

  const fetchCatalog = () => {
    fetch('/api/gifts/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data.catalog) setCatalog(data.catalog);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

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

  const fetchLeaderboard = () => {
    fetch('/api/gifts/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.leaderboard) setTopGifters(data.leaderboard);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCatalog();
    fetchMyGifts();
    fetchLeaderboard();
  }, [token]);

  const handleBuyGift = async (catalogId: string, price: number) => {
    if (!token || actionLoading) return;
    if ((user?.token_balance || 0) < price) {
      onOpenStore?.();
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/gifts/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catalogId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(t('gifts.sold_success', { price: price, defaultValue: 'Muvaffaqiyatli xarid qilindi!' }));
        sounds.playWinDing();
        haptics.notification('success');
        refreshUser();
        fetchMyGifts();
        fetchLeaderboard();

        // Trigger luxury iOS 18 theatrical unboxing celebration!
        const purchasedItem = catalog.find((c) => c.id === catalogId);
        const itemTitle = purchasedItem ? getItemTitle(purchasedItem) : t('celebratory.luxe_gift');
        window.dispatchEvent(
          new CustomEvent('xoxo_celebrate_gift', {
            detail: {
              id: 'purchase_' + Date.now(),
              type: 'purchase',
              sender_name: user?.nickname || 'Siz',
              gift_title: itemTitle,
              gift_icon: purchasedItem?.icon || catalogId,
              amount: price,
              message: "Kolleksiyangizga qabul qilindi! Ushbu noyob sovg'a profilingiz ko'rgazmasida saqlanadi.",
            },
          })
        );
      } else {
        setErrorMsg(data.error || t('store.error_general'));
        haptics.notification('error');
      }
    } catch (e) {
      setErrorMsg(t('promo.error_network'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellGift = async (userGiftId: number) => {
    if (!token || actionLoading) return;

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    sounds.playClick();
    haptics.selection();

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
        setSuccessMsg(t('gifts.sold_success', { price: data.sellPrice }));
        haptics.notification('success');
        refreshUser();
        fetchMyGifts();
        fetchLeaderboard();
      } else {
        setErrorMsg(data.error || t('store.error_general'));
        haptics.notification('error');
      }
    } catch (e) {
      setErrorMsg(t('promo.error_network'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 8.4 Scrim Backdrop */}
      <div
        className="fixed inset-0 glass-scrim animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md glass-modal-card rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up border border-white/50 dark:border-white/15">
        <div className="specular-rim" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('gifts.title')}</h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('gifts.subtitle')}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 bg-slate-100/70 dark:bg-white/5 p-1 rounded-2xl my-3 border border-slate-200/50 dark:border-white/5 text-xs font-bold">
          <button
            onClick={() => setTab('store')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'store' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('gifts.tab_store')}</span>
          </button>
          <button
            onClick={() => setTab('my_gifts')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'my_gifts' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{t('gifts.tab_my', { count: myGifts.length })}</span>
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
              tab === 'leaderboard' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('gifts.tab_leaderboard')}</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 shadow-sm">
            {successMsg}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* TAB 1: STORE */}
          {tab === 'store' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>
                  {t('gifts.promo_banner')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {catalog.map((item) => {
                  const canAfford = (user?.token_balance || 0) >= item.token_price;
                  return (
                    <TelegramGiftCard
                      key={item.id}
                      gift={{
                        id: item.id,
                        title: getItemTitle(item),
                        token_price: item.token_price,
                        sell_price: item.sell_price,
                      }}
                      actionType="buy"
                      canAfford={canAfford}
                      onAction={() => handleBuyGift(item.id, item.token_price)}
                      onClick={() =>
                        setSelectedDetailGift({
                          id: item.id,
                          title: getItemTitle(item),
                          token_price: item.token_price,
                          sell_price: item.sell_price,
                          isOwner: false,
                        })
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MY GIFTS */}
          {tab === 'my_gifts' && (
            <div className="space-y-3">
              {myGifts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p>{t('gifts.empty_my_gifts')}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    {t('gifts.empty_hint')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myGifts.map((gift) => (
                    <TelegramGiftCard
                      key={gift.id}
                      gift={{
                        id: gift.catalog_id || gift.title,
                        title: gift.title,
                        sell_price: gift.sell_price,
                        can_sell: gift.can_sell !== false && !gift.is_premium_reward,
                        is_premium_reward: gift.is_premium_reward,
                      }}
                      actionType={gift.is_premium_reward ? 'view' : 'sell'}
                      onAction={() => {
                        if (!gift.is_premium_reward && gift.can_sell !== false) {
                          handleSellGift(gift.id);
                        } else {
                          setSelectedDetailGift({
                            id: gift.catalog_id || gift.title,
                            title: gift.title,
                            sell_price: gift.sell_price,
                            isOwner: true,
                            userGiftId: gift.id,
                          });
                        }
                      }}
                      onClick={() =>
                        setSelectedDetailGift({
                          id: gift.catalog_id || gift.title,
                          title: gift.title,
                          sell_price: gift.sell_price,
                          can_sell: gift.can_sell !== false && !gift.is_premium_reward,
                          isOwner: true,
                          userGiftId: gift.id,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADERBOARD */}
          {tab === 'leaderboard' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-900 dark:text-purple-200">
                {t('gifts.promo_banner')}
              </div>

              <div className="space-y-2">
                {topGifters.map((userRow, index) => {
                  const isTop1 = index === 0;
                  return (
                    <div
                      key={userRow.user_id}
                      className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                        isTop1
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                          : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 text-center font-black text-xs ${isTop1 ? 'text-amber-600 dark:text-amber-400 text-sm' : 'text-slate-400'}`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{userRow.nickname}</span>
                            {isTop1 && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5 inline" /> TOP #1
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                            {t('gifts.total_spent', { count: userRow.total_spent })}
                          </span>
                        </div>
                      </div>

                      {isTop1 && (
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-[10px] shadow-sm flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{t('gifts.premium_badge')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Telegram Gift Detail Modal */}
      <TelegramGiftDetailModal
        gift={selectedDetailGift}
        isOpen={!!selectedDetailGift}
        onClose={() => setSelectedDetailGift(null)}
        onBuy={(g) => handleBuyGift(g.id, g.token_price || 50)}
        onSell={() => {
          if (selectedDetailGift?.userGiftId) {
            handleSellGift(selectedDetailGift.userGiftId);
            setSelectedDetailGift(null);
          }
        }}
        isOwner={selectedDetailGift?.isOwner}
        canAfford={(user?.token_balance || 0) >= (selectedDetailGift?.token_price || 0)}
      />
    </div>
  );
};
export default GiftsModal;
