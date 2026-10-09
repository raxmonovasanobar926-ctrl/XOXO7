import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: number;
  telegram_id: number;
  nickname: string;
  avatar_url: string;
  token_balance: number;
  referred_by: number | null;
  team_id: number | null;
  wins: number;
  losses: number;
  draws: number;
  role: 'user' | 'admin' | 'super_admin';
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_until: string | null;
  rank: number;
  winRate: number;
  team?: {
    id: number;
    name: string;
    invite_code: string;
  } | null;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  loginDev: (devId?: number, nickname?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { nickname?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('xoxo_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation?.();
      } catch (e) {
        console.warn('Telegram WebApp init warning:', e);
      }
    }
  }, []);

  const authenticate = async (initDataString: string, startParam?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: initDataString,
          startParam: startParam || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Avtorizatsiyadan o‘tib bo‘lmadi');
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('xoxo_token', data.token);
      await fetchUserData(data.token);
    } catch (err) {
      console.error('[Auth] Error authenticating:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (jwtToken: string) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        // Token expired
        setToken(null);
        localStorage.removeItem('xoxo_token');
        setUser(null);
      }
    } catch (err) {
      console.error('[Auth] Error fetching user data:', err);
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const tgInitData = tg?.initData;
    const startParam = tg?.initDataUnsafe?.start_param;

    if (tgInitData && tgInitData.length > 0) {
      // Real Telegram WebApp session
      authenticate(tgInitData, startParam);
    } else if (token) {
      // Stored token
      fetchUserData(token).finally(() => setIsLoading(false));
    } else {
      // Default to dev mode user for seamless local development
      loginDev(1001, 'Player_One');
    }
  }, []);

  const loginDev = async (devId = 1001, nickname = 'Player_One') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: `dev_user_${devId}`,
          nickname,
          avatarUrl: 'avatar_1',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem('xoxo_token', data.token);
        await fetchUserData(data.token);
      }
    } catch (e) {
      console.error('Dev login error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserData(token);
    }
  };

  const updateProfile = async (updates: { nickname?: string; avatar_url?: string }) => {
    if (!token) return { success: false, error: 'No token' };
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Server xatoligi' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginDev,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
