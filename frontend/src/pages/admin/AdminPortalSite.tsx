import React, { useState, useEffect } from 'react';
import { AdminPanel } from './AdminPanel.tsx';
import { Lock, ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldAlert, Sun, Moon } from 'lucide-react';
import { sounds } from '../../utils/sounds.ts';
import { haptics } from '../../utils/haptics.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface AdminPortalSiteProps {
  onBackToApp: () => void;
}

export const AdminPortalSite: React.FC<AdminPortalSiteProps> = ({ onBackToApp }) => {
  const { user, token } = useAuth();
  const isAppAdmin = (user?.role === 'admin' || user?.role === 'super_admin') && !!token;

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('xoxo_admin_token');
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('xoxo_admin_theme') || localStorage.getItem('xoxo_theme');
    if (saved) return saved === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('xoxo_admin_theme', 'dark');
      localStorage.setItem('xoxo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('xoxo_admin_theme', 'light');
      localStorage.setItem('xoxo_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    sounds.playClick();
    haptics.selection();
    setIsDarkMode((prev) => !prev);
  };

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Verify existing token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('xoxo_admin_token');
    if (!savedToken) {
      setIsVerifying(false);
      return;
    }

    fetch('/api/admin/auth/verify', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (res.ok) {
          setAdminToken(savedToken);
        } else {
          sessionStorage.removeItem('xoxo_admin_token');
          setAdminToken(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('xoxo_admin_token');
        setAdminToken(null);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Login va parolni kiriting');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        throw new Error(data.error || 'Kirish muvaffaqiyatsiz bo‘ldi');
      }

      sounds.playWin();
      haptics.notification('success');
      sessionStorage.setItem('xoxo_admin_token', data.token);
      setAdminToken(data.token);
    } catch (err: any) {
      sounds.playDefeat();
      haptics.notification('error');
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sounds.playClick();
    sessionStorage.removeItem('xoxo_admin_token');
    setAdminToken(null);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-surface p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-lg text-center space-y-2">
          <div className="w-8 h-8 mx-auto border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Admin sessiyasi tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // If authenticated via admin credentials OR active app admin session, render Admin Panel
  const effectiveToken = adminToken || (isAppAdmin ? token : null);
  if (effectiveToken) {
    return (
      <AdminPanel
        onBackToApp={onBackToApp}
        adminToken={effectiveToken}
        onLogoutAdmin={handleLogout}
      />
    );
  }

  // High-Security Admin Login screen in Apple Liquid Glass
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative select-none">
      {/* Top bar with back to app */}
      <header className="relative z-10 flex items-center justify-between">
        <button
          onClick={onBackToApp}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ilovaga qaytish</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title={isDarkMode ? "Yorug'lik rejimiga o'tish" : "Tungi (Nachnoy) rejimga o'tish"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Kunduzgi</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                <span>Nachnoy</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>ADMIN SECURE</span>
          </div>
        </div>
      </header>

      {/* Center login card */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-8">
        <div className="glass-surface rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-white/15 shadow-2xl specular-rim">
          {/* Logo / Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tizim Boshqaruvi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
              Faqat vakolatli administratorlar uchun maxsus himoyalangan portal
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    Qolgan urinishlar: {remainingAttempts} ta
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Logini
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                className="w-full glass-input rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Xavfsizlik Paroli
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full glass-input rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Boshqaruvga Kirish</span>
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL • Brute-Force Himoyasi Faol</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[10px] text-slate-400 font-mono py-2">
        XOXO System Security Suite &bull; All administrative access is logged
      </footer>
    </div>
  );
};
export default AdminPortalSite;
