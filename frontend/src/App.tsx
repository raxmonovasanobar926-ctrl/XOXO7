import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext.tsx';
import { useSocket } from './contexts/SocketContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { MatchmakingPage } from './pages/MatchmakingPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { BlockedScreen } from './components/BlockedScreen.tsx';
import { StoreModal } from './components/StoreModal.tsx';
import { PromoModal } from './components/PromoModal.tsx';
import { AdminPortalSite } from './pages/admin/AdminPortalSite.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { FriendsPage } from './pages/FriendsPage.tsx';
import { GiftsModal } from './components/GiftsModal.tsx';
import { CelebratoryNotificationModal } from './components/CelebratoryNotificationModal.tsx';
import { LiquidGlassBackground } from './components/glass/LiquidGlassBackground.tsx';
import { useTranslation } from './contexts/ThemeLanguageContext.tsx';

type RouteMode = 'app' | 'secret_admin' | '404';

const detectRouteMode = (): RouteMode => {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);

  // If path or hash is /admin or contains admin query -> strictly show 404!
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.endsWith('/admin') ||
    pathname.startsWith('/admin') ||
    hash === '#admin' ||
    hash.startsWith('#admin') ||
    params.get('tab') === 'admin' ||
    params.get('portal') === 'admin' ||
    params.get('admin') === 'true'
  ) {
    return '404';
  }

  // Dedicated Secret Admin Portal web link
  if (
    pathname === '/secret-panel' ||
    pathname === '/secret-panel/' ||
    pathname === '/secret-admin-portal' ||
    pathname === '/secret-admin-portal/' ||
    hash === '#secret-panel' ||
    hash === '#secret-admin-portal'
  ) {
    return 'secret_admin';
  }

  return 'app';
};

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const { currentRoom, insufficientBalanceInfo, clearInsufficientBalanceInfo } = useSocket();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [routeMode, setRouteMode] = useState<RouteMode>(detectRouteMode);

  // Modals state
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [isOutOfTokens, setIsOutOfTokens] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);

  // If socket emits insufficient balance error, pop up StoreModal
  useEffect(() => {
    if (insufficientBalanceInfo) {
      setIsOutOfTokens(true);
      setShowStoreModal(true);
      clearInsufficientBalanceInfo();
    }
  }, [insufficientBalanceInfo]);

  // If a game room is active, force switch to battle tab
  useEffect(() => {
    if (currentRoom) {
      setActiveTab('battle');
    }
  }, [currentRoom]);

  // Listen to popstate or hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setRouteMode(detectRouteMode());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <LiquidGlassBackground />
        <div className="relative z-10 glass-panel p-8 rounded-3xl text-center shadow-xl border border-white/60 dark:border-white/10 space-y-4 max-w-xs w-full animate-scale-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_24px_rgba(110,86,207,0.35)] animate-pulse">
            XO
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">XOXO</h2>
            <div className="flex items-center justify-center space-x-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('common.loading')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is blocked, render dedicated block screen
  if (user?.is_blocked) {
    return (
      <div className="relative min-h-screen">
        <LiquidGlassBackground />
        <BlockedScreen />
      </div>
    );
  }

  // If route is 404 (e.g. /admin was accessed), show 404 screen
  if (routeMode === '404') {
    return (
      <NotFoundPage
        onGoHome={() => {
          window.history.replaceState(null, '', '/');
          setRouteMode('app');
        }}
      />
    );
  }

  // If secret admin portal route, render web Admin Portal
  if (routeMode === 'secret_admin') {
    return (
      <div className="relative min-h-screen">
        <LiquidGlassBackground />
        <AdminPortalSite
          onBackToApp={() => {
            window.history.replaceState(null, '', '/');
            setRouteMode('app');
          }}
        />
      </div>
    );
  }

  const handleOpenStore = (outOfTokens = false) => {
    setIsOutOfTokens(outOfTokens);
    setShowStoreModal(true);
  };

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* 2. Apple Liquid Glass Background: 1px Grid + Floating Refraction Orbs */}
      <LiquidGlassBackground />

      {/* Floating Liquid Glass Top Header */}
      <Navbar
        onOpenStore={() => handleOpenStore(false)}
      />

      <main className="flex-1 px-3 pt-3 pb-28 overflow-y-auto relative z-10 overscroll-y-contain">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onGoToBattle={() => setActiveTab('battle')}
            onOpenStore={() => handleOpenStore(false)}
            onOpenPromo={() => setShowPromoModal(true)}
            onOpenGifts={() => setShowGiftsModal(true)}
          />
        )}
        {activeTab === 'battle' && (
          <MatchmakingPage onOutOfTokens={() => handleOpenStore(true)} />
        )}
        {activeTab === 'friends' && (
          <FriendsPage onOpenGiftsStore={() => setShowGiftsModal(true)} />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardPage onOpenGiftsStore={() => setShowGiftsModal(true)} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage
            onOpenStore={() => handleOpenStore(false)}
            onOpenPromo={() => setShowPromoModal(true)}
            onOpenGifts={() => setShowGiftsModal(true)}
          />
        )}
      </main>

      {/* Hide bottom navigation while actively in an in-progress game to maximize game focus */}
      {(!currentRoom || currentRoom.status === 'finished') && (
        <BottomNav
          activeTab={activeTab as NavTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Celebratory Gift & Token Delivery Modal */}
      <CelebratoryNotificationModal />

      {/* Modals with Apple Liquid Glass Scrim */}
      {showStoreModal && (
        <StoreModal
          onClose={() => setShowStoreModal(false)}
          onOpenPromo={() => {
            setShowStoreModal(false);
            setShowPromoModal(true);
          }}
          isOutOfTokens={isOutOfTokens}
        />
      )}

      {showPromoModal && (
        <PromoModal onClose={() => setShowPromoModal(false)} />
      )}

      {showGiftsModal && (
        <GiftsModal
          onClose={() => setShowGiftsModal(false)}
          onOpenStore={() => handleOpenStore(false)}
        />
      )}
    </div>
  );
};
export default App;
