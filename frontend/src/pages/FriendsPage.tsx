import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { CharacterAvatar } from '../components/graphics/index.ts';
import { PublicProfileModal } from '../components/PublicProfileModal.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { 
  Users, 
  UserPlus, 
  Gift, 
  Send, 
  Check, 
  Copy, 
  X, 
  Share2, 
  Search,
  Inbox,
  Eye,
  UserCheck,
  UserX,
  Swords,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext.tsx';

interface FriendUser {
  id: number;
  telegram_id: number;
  nickname: string;
  avatar_url: string;
  wins: number;
  losses: number;
  draws: number;
  token_balance: number;
  gifts_count: number;
  added_at: string;
  is_online?: boolean;
}

interface PendingRequest {
  id: number;
  created_at: string;
  sender: {
    id: number;
    nickname: string;
    avatar_url: string;
    wins: number;
    losses: number;
  };
}

export const FriendsPage: React.FC<{ onOpenGiftsStore?: () => void }> = ({ onOpenGiftsStore }) => {
  const { user, token, refreshUser } = useAuth();
  const { isUserOnline, createRoom } = useSocket();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [showOnlyOnline, setShowOnlyOnline] = useState<boolean>(false);

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // Profile modal state
  const [inspectUserId, setInspectUserId] = useState<number | null>(null);

  // Selected friend for gift modal action
  const [selectedGiftFriend, setSelectedGiftFriend] = useState<FriendUser | null>(null);

  // Transfer owned gift state
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [giftingLoading, setGiftingLoading] = useState(false);

  // Copy User ID status
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchFriendsData = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/friends', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.friends) setFriends(data.friends);
        if (data.pendingRequests) setPendingRequests(data.pendingRequests);
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

  useEffect(() => {
    fetchFriendsData();
    fetchMyGifts();
  }, [token]);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim() || !token) return;
    setSearchLoading(true);
    setSearchMsg(null);
    sounds.playClick();

    try {
      // We search via friend request lookup or public profile
      const res = await fetch(`/api/users/${searchQuery.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSearchResults([data.user]);
      } else {
        setSearchResults([]);
        setSearchMsg(t('friends.user_not_found'));
      }
    } catch (e) {
      setSearchMsg(t('friends.search_error'));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequestDirect = async (targetId: number) => {
    if (!token) return;
    sounds.playClick();
    haptics.selection();
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: targetId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(t('friends.request_sent'));
        haptics.notification('success');
        fetchFriendsData();
      } else {
        setErrorMsg(data.error || t('friends.request_send_error'));
        haptics.notification('error');
      }
    } catch (e) {
      setErrorMsg(t('errors.ERR_SERVER_ERROR'));
    }
  };

  const handleRespondRequest = async (requestId: number, action: 'accept' | 'decline') => {
    if (!token) return;
    sounds.playClick();
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'accept') {
          setSuccessMsg(t('friends.request_accepted'));
          haptics.notification('success');
        } else {
          setSuccessMsg(t('friends.request_declined'));
        }
        fetchFriendsData();
      } else {
        setErrorMsg(data.error || t('errors.ERR_SERVER_ERROR'));
      }
    } catch (e) {
      setErrorMsg(t('errors.ERR_SERVER_ERROR'));
    }
  };

  const handleSendGift = async () => {
    if (!selectedGiftFriend || !selectedGiftId || !token) return;
    setGiftingLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/gifts/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userGiftId: selectedGiftId,
          recipientUserId: selectedGiftFriend.id,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(t('friends.gift_sent_success', { name: selectedGiftFriend.nickname }));
        haptics.notification('success');
        setSelectedGiftFriend(null);
        setSelectedGiftId(null);
        fetchMyGifts();
        fetchFriendsData();
      } else {
        setErrorMsg(data.error || t('friends.gift_send_error'));
        haptics.notification('error');
      }
    } catch (e) {
      setErrorMsg(t('errors.ERR_SERVER_ERROR'));
    } finally {
      setGiftingLoading(false);
    }
  };

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(String(user.id));
    setCopiedId(true);
    sounds.playClick();
    haptics.notification('success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const refLink = `https://t.me/xoxoglobalbot?start=ref_${user?.telegram_id || 12345678}`;

  return (
    <div className="space-y-4 pb-24 safe-bottom-padding animate-fadeIn select-none">
      {/* User ID & Invite Banner */}
      <div className="glass-surface rounded-3xl p-5 border border-white/70 dark:border-white/10 shadow-md specular-rim">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">
              {t('friends.your_id_number')}
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="font-mono font-black text-2xl text-purple-600 dark:text-purple-400">#{user?.id}</span>
              <button
                onClick={handleCopyId}
                className="p-1.5 rounded-xl bg-slate-100/60 dark:bg-white/10 hover:bg-slate-200/60 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                title={t('friends.copy_id_title')}
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(refLink);
              sounds.playClick();
              haptics.notification('success');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('friends.invite_link')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex p-1 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/40 dark:border-white/10">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'friends'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('friends.tab_friends')} ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'search'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{t('friends.tab_search')}</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all relative ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{t('friends.tab_requests')}</span>
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center shadow-sm">
          {successMsg}
        </div>
      )}

      {/* TAB 1: FRIENDS LIST */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="glass-surface rounded-3xl p-4 border border-white/70 dark:border-white/10 shadow-md specular-rim">
            {/* Online Summary & Filter Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xs text-slate-800 dark:text-white">
                  {t('friends.friends_tab')} ({friends.length})
                </span>
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-[10px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{friends.filter((f) => isUserOnline(f.id) || Boolean(f.is_online)).length} online</span>
                </span>
              </div>

              {friends.length > 0 && (
                <div className="flex items-center space-x-1 bg-slate-200/60 dark:bg-white/5 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowOnlyOnline(false);
                    }}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      !showOnlyOnline
                        ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {t('friends.all_filter')}
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowOnlyOnline(true);
                    }}
                    className={`px-2 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                      showOnlyOnline
                        ? 'bg-white dark:bg-white/20 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{t('friends.only_online_filter')}</span>
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">{t('friends.loading')}</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('friends.no_friends_yet')}</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 rounded-2xl bg-purple-600 text-white text-xs font-extrabold shadow-md hover:brightness-105 active:scale-95"
                >
                  {t('friends.search_friends_by_id_btn')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {[...friends]
                  .sort((a, b) => {
                    const aOn = isUserOnline(a.id) || Boolean(a.is_online);
                    const bOn = isUserOnline(b.id) || Boolean(b.is_online);
                    if (aOn && !bOn) return -1;
                    if (!aOn && bOn) return 1;
                    return 0;
                  })
                  .filter((f) => {
                    if (!showOnlyOnline) return true;
                    return isUserOnline(f.id) || Boolean(f.is_online);
                  })
                  .map((f) => {
                    const isOnline = isUserOnline(f.id) || Boolean(f.is_online);
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isOnline
                            ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border-emerald-500/25 dark:border-emerald-500/30 shadow-sm'
                            : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5'
                        }`}
                      >
                        <div
                          onClick={() => setInspectUserId(f.id)}
                          className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                        >
                          {/* Avatar with Live Presence Glow Badge */}
                          <div className="relative shrink-0">
                            <CharacterAvatar avatarId={f.avatar_url || 'fox'} size={42} />
                            <span
                              title={isOnline ? t('friends.online_tooltip') : t('friends.offline_tooltip')}
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                                isOnline
                                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                                  : 'bg-slate-400'
                              }`}
                            >
                              {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
                                {f.nickname}
                                <Eye className="w-3 h-3 text-purple-500 opacity-60 shrink-0" />
                              </span>

                              {/* Real-Time Online / Offline Badge */}
                              {isOnline ? (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] tracking-wide shrink-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Online</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 font-medium text-[9px] shrink-0">
                                  Offline
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                              ID: #{f.id} • {f.wins}W / {f.losses}L
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                          {/* Quick Challenge Button if Online */}
                          {isOnline && (
                            <button
                              onClick={() => {
                                sounds.playClick();
                                createRoom(2, true);
                              }}
                              title={t('friends.challenge_title')}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-extrabold text-xs active:scale-95 transition-all shadow-sm"
                            >
                              <Swords className="w-3.5 h-3.5 text-purple-500" />
                              <span>{t('friends.challenge_action')}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedGiftFriend(f);
                              setSelectedGiftId(null);
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-xs active:scale-95 transition-all shadow-sm"
                          >
                            <Gift className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t('friends.gift_action')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEARCH USERS BY ID */}
      {activeTab === 'search' && (
        <div className="glass-surface rounded-3xl p-5 border border-white/70 dark:border-white/10 shadow-md specular-rim space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              {t('friends.search_title')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('friends.search_subtitle')}
            </p>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={t('friends.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              className="flex-1 glass-input rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleSearchUsers}
              disabled={searchLoading || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md disabled:opacity-50 hover:brightness-105 active:scale-95 transition-all flex items-center space-x-1"
            >
              <Search className="w-4 h-4" />
              <span>{searchLoading ? t('friends.searching') : t('friends.search_btn')}</span>
            </button>
          </div>

          {searchMsg && (
            <div className="text-center py-4 text-xs text-slate-400 font-semibold">{searchMsg}</div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2 pt-2">
              {searchResults.map((u) => {
                const uOnline = isUserOnline(u.id) || Boolean(u.is_online);
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm"
                  >
                    <div
                      onClick={() => setInspectUserId(u.id)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <div className="relative shrink-0">
                        <CharacterAvatar avatarId={u.avatar_url || 'fox'} size={44} />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                            uOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                            {u.nickname}
                          </span>
                          {uOnline ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
                              Online
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 font-medium text-[9px]">
                              Offline
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold block mt-0.5">
                          ID: #{u.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setInspectUserId(u.id)}
                        className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-xs transition-all"
                        title={t('friends.view_profile_title')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendRequestDirect(u.id)}
                        className="px-3 py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-sm flex items-center space-x-1 active:scale-95"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{t('friends.request_action')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INCOMING FRIEND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="glass-surface rounded-3xl p-5 border border-white/70 dark:border-white/10 shadow-md specular-rim space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Inbox className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('friends.incoming_requests', { count: pendingRequests.length })}</span>
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              {t('friends.no_requests')}
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((r) => {
                const reqOnline = isUserOnline(r.sender.id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm"
                  >
                    <div
                      onClick={() => setInspectUserId(r.sender.id)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <div className="relative shrink-0">
                        <CharacterAvatar avatarId={r.sender.avatar_url || 'fox'} size={40} />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            reqOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {r.sender.nickname}
                          </span>
                          {reqOnline && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[8px]">
                              Online
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          ID: #{r.sender.id} • {r.sender.wins}W / {r.sender.losses}L
                        </span>
                      </div>
                    </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRespondRequest(r.id, 'accept')}
                      className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm active:scale-95 transition-all"
                      title={t('friends.accept_title')}
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRespondRequest(r.id, 'decline')}
                      className="p-2 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 active:scale-95 transition-all"
                      title={t('friends.decline_title')}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* Public Profile Inspector Modal */}
      {inspectUserId !== null && (
        <PublicProfileModal
          userId={inspectUserId}
          onClose={() => setInspectUserId(null)}
          onSendGift={(targetId) => {
            const friendObj = friends.find((f) => f.id === targetId);
            if (friendObj) {
              setSelectedGiftFriend(friendObj);
            }
          }}
        />
      )}

      {/* Send Gift Modal */}
      {selectedGiftFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 glass-scrim animate-fade-in" onClick={() => setSelectedGiftFriend(null)} />
          <div className="relative z-10 w-full max-w-sm glass-modal-card rounded-3xl p-5 shadow-2xl animate-scale-up border border-white/50 dark:border-white/15">
            <div className="specular-rim" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/10">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {t('friends.send_gift_to', { name: selectedGiftFriend.nickname })}
              </h3>
              <button
                onClick={() => setSelectedGiftFriend(null)}
                className="p-1 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myGifts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 space-y-3">
                <p>{t('friends.no_gifts_to_send')}</p>
                <button
                  onClick={() => {
                    setSelectedGiftFriend(null);
                    onOpenGiftsStore?.();
                  }}
                  className="px-4 py-2 rounded-2xl bg-amber-500 text-white font-extrabold text-xs shadow-sm hover:brightness-105 active:scale-95"
                >
                  {t('friends.buy_gifts_from_store')}
                </button>
              </div>
            ) : (
              <div className="py-3 space-y-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                  {t('friends.choose_gift_to_send')}
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {myGifts.map((g) => {
                    const isSelected = selectedGiftId === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGiftId(g.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/15 shadow-sm scale-102 ring-2 ring-amber-400/40'
                            : 'border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5'
                        }`}
                      >
                        <span className="text-2xl">{g.icon}</span>
                        <span className="font-extrabold text-[11px] text-slate-900 dark:text-white mt-1">{g.title}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!selectedGiftId || giftingLoading}
                  onClick={handleSendGift}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-md disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{giftingLoading ? t('friends.gift_sending') : t('friends.gift_send_action')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default FriendsPage;
