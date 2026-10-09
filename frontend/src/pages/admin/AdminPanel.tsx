import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { sounds } from '../../utils/sounds.ts';
import { haptics } from '../../utils/haptics.ts';
import { CharacterAvatar } from '../../components/graphics/index.ts';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Gift, 
  Shield, 
  Star, 
  History, 
  Settings as SettingsIcon,
  Search,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Coins,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Clock,
  ArrowLeft,
  Hash,
  Edit3,
  Sun,
  Moon,
  X,
  Loader2
} from 'lucide-react';

type AdminTab = 'dashboard' | 'users' | 'promo' | 'gifts' | 'admins' | 'stars' | 'audit' | 'settings';

interface AdminPanelProps {
  onBackToApp: () => void;
  adminToken?: string;
  onLogoutAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp, adminToken, onLogoutAdmin }) => {
  const { user, token: userToken } = useAuth();
  const token = adminToken || sessionStorage.getItem('xoxo_admin_token') || userToken;
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

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

  const isSuperAdmin = user?.role === 'super_admin' || !!adminToken || !!sessionStorage.getItem('xoxo_admin_token');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked' | 'admins'>('all');
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleSearchSubmit = () => {
    setAppliedSearch(userSearchInput.trim());
    setUserPage(1);
  };

  const handleClearSearch = () => {
    setUserSearchInput('');
    setAppliedSearch('');
    setUserPage(1);
  };

  // Action Modals
  const [blockModal, setBlockModal] = useState<{ userId: number; nickname: string } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockDays, setBlockDays] = useState('0'); // 0 = permanent

  const [balanceModal, setBalanceModal] = useState<{ userId: number; nickname: string; currentBalance: number } | null>(null);
  const [balanceDelta, setBalanceDelta] = useState('');
  const [balanceReason, setBalanceReason] = useState('');

  // ID Override Modal
  const [idChangeModal, setIdChangeModal] = useState<{ userId: number; nickname: string; currentId: number } | null>(null);
  const [newCustomIdInput, setNewCustomIdInput] = useState('');

  // Admin Grant Gift Modal
  const [grantGiftModal, setGrantGiftModal] = useState<{ userId: number; nickname: string } | null>(null);
  const [selectedGiftCatalogId, setSelectedGiftCatalogId] = useState('uzuk_diamond');

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [createPromoModal, setCreatePromoModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    tokens: 25,
    max_uses: 100,
    per_user_limit: 1,
    note: '',
  });

  // Gifts State
  const [giftsList, setGiftsList] = useState<any[]>([]);
  const [createGiftModal, setCreateGiftModal] = useState(false);
  const [newGift, setNewGift] = useState({
    target_type: 'all' as 'all' | 'single' | 'list' | 'segment',
    amount_per_user: 10,
    note: '',
    bot_message: '',
    singleQuery: '',
    userListText: '',
    segmentTop: 50,
  });
  const [giftConfirmModal, setGiftConfirmModal] = useState<any | null>(null);

  // Admins State (Super Admin)
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminQuery, setNewAdminQuery] = useState('');

  // Stars State (Super Admin)
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [starPacks, setStarPacks] = useState<any[]>([]);
  const [refundConfirm, setRefundConfirm] = useState<any | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);

  // Settings State (Super Admin)
  const [settingsData, setSettingsData] = useState<any>(null);
  const [rakeStats, setRakeStats] = useState<any>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial Data Fetch
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'dashboard') {
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.stats && setDashboardStats(d.stats));
      fetch('/api/admin/rake/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.stats && setRakeStats(d.stats))
        .catch(() => {});
    } else if (activeTab === 'users') {
      setIsUsersLoading(true);
      fetch(`/api/admin/users?search=${encodeURIComponent(appliedSearch)}&filter=${userFilter}&page=${userPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => {
          if (d.users) setUsersList(d.users);
          if (d.total !== undefined) setUsersTotal(d.total);
        })
        .catch(err => {
          console.error('[Admin] Error fetching users:', err);
        })
        .finally(() => {
          setIsUsersLoading(false);
        });
    } else if (activeTab === 'promo') {
      fetch('/api/admin/promo', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.promoCodes && setPromoCodes(d.promoCodes));
    } else if (activeTab === 'gifts') {
      fetch('/api/admin/gifts', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.gifts && setGiftsList(d.gifts));
    } else if (activeTab === 'admins' && isSuperAdmin) {
      fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.admins && setAdminsList(d.admins));
    } else if (activeTab === 'stars' && isSuperAdmin) {
      fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.payments && setPaymentsList(d.payments));
      fetch('/api/admin/packs', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.packs && setStarPacks(d.packs));
    } else if (activeTab === 'audit') {
      fetch(`/api/admin/audit-log?page=${auditPage}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.logs && setAuditLogs(d.logs));
    } else if (activeTab === 'settings' && isSuperAdmin) {
      fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => d.settings && setSettingsData(d.settings));
    }
  }, [activeTab, appliedSearch, userFilter, userPage, auditPage, token, isSuperAdmin]);

  // Actions
  const handleBlockUser = async () => {
    if (!blockModal || !blockReason.trim() || !token) return;
    const days = parseInt(blockDays, 10);
    const blockedUntil = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

    try {
      const res = await fetch(`/api/admin/users/${blockModal.userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: blockReason, blocked_until: blockedUntil }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Foydalanuvchi muvaffaqiyatli bloklandi');
        setBlockModal(null);
        setBlockReason('');
        // Refresh list
        setUserPage(1);
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Foydalanuvchi blokdan chiqarildi');
        setUserPage(1);
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleAdjustBalance = async () => {
    if (!balanceModal || !balanceReason.trim() || !token) return;
    const delta = parseInt(balanceDelta, 10);
    if (isNaN(delta) || delta === 0) return;

    try {
      const res = await fetch(`/api/admin/users/${balanceModal.userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ delta, reason: balanceReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Balans muvaffaqiyatli o‘zgartirildi: ${data.newBalance} token`);
        setBalanceModal(null);
        setBalanceDelta('');
        setBalanceReason('');
        setUserPage(1);
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleChangeUserId = async () => {
    if (!idChangeModal || !newCustomIdInput.trim() || !token) return;
    const newId = parseInt(newCustomIdInput.trim(), 10);
    if (isNaN(newId)) {
      showToast("ID raqam bo'lishi kerak", 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${idChangeModal.userId}/change-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `ID muvaffaqiyatli #${newId} ga o'zgartirildi`);
        setIdChangeModal(null);
        setNewCustomIdInput('');
        setUserPage(1);
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleGrantGiftToUser = async () => {
    if (!grantGiftModal || !token) return;
    try {
      const res = await fetch(`/api/admin/users/${grantGiftModal.userId}/grant-gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ giftCatalogId: selectedGiftCatalogId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Kolleksiya sovg\'asi muvaffaqiyatli taqdim etildi! 🎁');
        setGrantGiftModal(null);
        setUserPage(1);
      } else {
        showToast(data.error || 'Sovg\'a berishda xatolik', 'error');
      }
    } catch (e) {
      showToast('Serverda xatolik', 'error');
    }
  };

  const handleResetUserStats = async (userId: number, nickname: string) => {
    if (!token) return;
    if (!window.confirm(`${nickname} ning g'alaba/mag'lubiyat statistikasini nolga tushirishni tasdiqlaysizmi?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-stats`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${nickname} statistikasi nollashtirildi`);
        setUserPage(1);
      } else {
        showToast(data.error || 'Xatolik', 'error');
      }
    } catch (e) {
      showToast('Serverda xatolik', 'error');
    }
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code.trim() || !token) return;
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newPromo),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Promokod muvaffaqiyatli yaratildi');
        setCreatePromoModal(false);
        setNewPromo({ code: '', tokens: 25, max_uses: 100, per_user_limit: 1, note: '' });
        // Refresh
        setActiveTab('promo');
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminQuery.trim() || !token) return;
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: newAdminQuery.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setNewAdminQuery('');
        // Refresh
        const r = await fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (d.admins) setAdminsList(d.admins);
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleRemoveAdmin = async (adminId: number) => {
    if (!token || !confirm('Ushbu foydalanuvchidan admin huquqini olib tashlashni tasdiqlaysizmi?')) return;
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Adminlik huquqi olib tashlandi');
        setAdminsList(prev => prev.filter(a => a.id !== adminId));
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleRefundPayment = async () => {
    if (!refundConfirm || !token) return;
    try {
      const res = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentId: refundConfirm.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setRefundConfirm(null);
        // Refresh
        fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => d.payments && setPaymentsList(d.payments));
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleTriggerGift = async () => {
    if (!newGift.note.trim() || !token) return;
    try {
      let options: any = {};
      if (newGift.target_type === 'single') {
        const u = usersList.find(x => x.nickname.toLowerCase() === newGift.singleQuery.toLowerCase() || String(x.telegram_id) === newGift.singleQuery);
        if (u) options.singleUserId = u.id;
      } else if (newGift.target_type === 'list') {
        options.userList = newGift.userListText.split(',').map(s => s.trim());
      } else if (newGift.target_type === 'segment') {
        options.segmentOptions = { topRank: newGift.segmentTop };
      }

      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          target_type: newGift.target_type,
          amount_per_user: newGift.amount_per_user,
          note: newGift.note,
          bot_message: newGift.bot_message,
          options,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setGiftConfirmModal(null);
        setCreateGiftModal(false);
        // Refresh
        fetch('/api/admin/gifts', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(d => d.gifts && setGiftsList(d.gifts));
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settingsData) return;

    if (settingsData.rake_amount !== undefined) {
      const r = Number(settingsData.rake_amount);
      if (isNaN(r) || r < 0 || r >= 2) {
        showToast("Komissiya miqdori 0 dan katta yoki teng va eng kichik stavkadan (2 tosh) kichik bo'lishi shart!", 'error');
        return;
      }
      if (!window.confirm("Platforma komissiyasini (rake_amount) o'zgartirish butun PvP o'yin iqtisodiyotiga ta'sir qiladi. Saqlashni tasdiqlaysizmi?")) {
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Sozlamalar muvaffaqiyatli saqlandi');
      } else {
        showToast(data.error, 'error');
      }
    } catch (e) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 flex flex-col pb-16 transition-colors duration-300">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0D121F]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onBackToApp}
            className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 transition-all active:scale-95"
            title="Mini Appga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1.5">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
              XOXO Admin
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title={isDarkMode ? "Kunduzgi rejimga o'tish" : "Tungi (Nachnoy) rejimga o'tish"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="hidden sm:inline">Kunduzgi</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                <span className="hidden sm:inline">Nachnoy</span>
              </>
            )}
          </button>

          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
            isSuperAdmin ? 'bg-amber-400 text-black shadow-glow-gold' : 'bg-indigo-500/15 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 border border-indigo-500/30 dark:border-cyan-400/40'
          }`}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
          </span>
          {onLogoutAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold transition-all active:scale-95"
              title="Admin seansidan chiqish"
            >
              <Lock className="w-3 h-3" />
              <span>Chiqish</span>
            </button>
          )}
        </div>
      </header>

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-16 left-4 right-4 z-50 p-3 rounded-2xl border text-xs font-bold text-center shadow-2xl animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' : 'bg-rose-950/90 border-rose-400 text-rose-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white/70 dark:bg-[#0D121F]/70 border-b border-slate-200/80 dark:border-white/10 px-2 py-2 overflow-x-auto flex space-x-1.5 no-scrollbar backdrop-blur-md">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'users' ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar</span>
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'promo' ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Promokodlar</span>
        </button>

        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'gifts' ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Sovg‘alar</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'admins' ? 'bg-amber-500 text-black dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Adminlar</span>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('stars')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stars' ? 'bg-amber-500 text-black dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Stars & Daromad</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'settings' ? 'bg-amber-500 text-black dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-400/30 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Sozlamalar</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-4">
        {/* ================= 3.1 DASHBOARD ================= */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Jami Foydalanuvchilar</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{dashboardStats.totalUsers}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">+{dashboardStats.todayNewUsers} bugun</span>
              </div>

              <div className="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Bugungi O‘yinlar</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-cyan-300">{dashboardStats.todayMatches}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Jami: {dashboardStats.totalMatches}</span>
              </div>

              <div className="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Aylanmadagi Tokenlar</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-300">{dashboardStats.totalCirculatingTokens}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Berilgan: +{dashboardStats.todayTokensGranted}</span>
              </div>

              <div className="glass-card p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Stars Daromadi</span>
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{dashboardStats.totalStarsRevenue} ⭐</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Bugun: +{dashboardStats.todayStarsRevenue} ⭐</span>
              </div>
            </div>

            {/* Stars Revenue Summary */}
            <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center space-x-1.5">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Stars Xaridlar Statistikasi</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{dashboardStats.todayStarsRevenue} ⭐</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Bugun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-lg font-black text-indigo-600 dark:text-cyan-300 block">{dashboardStats.weekStarsRevenue} ⭐</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Oxirgi 7 kun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">{dashboardStats.monthStarsRevenue} ⭐</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Oxirgi 30 kun</span>
                </div>
              </div>
            </div>

            {/* Platform Commission (Rake) Section */}
            <div className="glass-card p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                  <Coins className="w-4 h-4 text-purple-500" />
                  <span>Platforma Komissiyasi (Rake) Statistikasi</span>
                </h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Jami: {rakeStats?.totalRake ?? (dashboardStats?.totalRake ?? 0)} tosh
                </span>
              </div>

              {/* Rake Metric Summary */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-base font-black text-slate-900 dark:text-white block font-mono">
                    {rakeStats?.todayRake ?? (dashboardStats?.todayRake ?? 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Bugun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-base font-black text-indigo-600 dark:text-cyan-300 block font-mono">
                    {rakeStats?.weekRake ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">7 kun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 block font-mono">
                    {rakeStats?.monthRake ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">30 kun</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                    {rakeStats?.totalRake ?? (dashboardStats?.totalRake ?? 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Jami</span>
                </div>
              </div>

              {/* Breakdown by Stake Tier */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Stavka Darajalari Bo‘yicha Taqsimot
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(rakeStats?.byStake || [
                    { stake: 2, count: 0, totalRake: 0 },
                    { stake: 4, count: 0, totalRake: 0 },
                    { stake: 6, count: 0, totalRake: 0 },
                    { stake: 10, count: 0, totalRake: 0 },
                  ]).map((item: any) => (
                    <div key={item.stake} className="p-2 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{item.stake} tosh</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400">+{item.totalRake}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.count} ta yutuq
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-Day Daily Rake Chart */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Oxirgi 30 kunlik Rake dinamikasi
                </span>
                <div className="h-28 flex items-end justify-between space-x-1 pt-3 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-1">
                  {(rakeStats?.dailyRake || []).map((day: any, idx: number) => {
                    const maxRake = Math.max(1, ...((rakeStats?.dailyRake || []).map((d: any) => d.rake)));
                    const heightPercent = Math.max(8, Math.round((day.rake / maxRake) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[8px]">
                        <div className="absolute -top-9 scale-0 group-hover:scale-100 transition-all bg-black/90 text-[9px] px-2 py-1 rounded-md border border-white/20 whitespace-nowrap z-20 pointer-events-none text-white">
                          {day.date}: {day.rake} tosh ({day.gamesCount} o'yin)
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            day.rake > 0 ? 'bg-gradient-to-t from-purple-600 to-indigo-500' : 'bg-slate-300 dark:bg-slate-800'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>30 kun oldin</span>
                  <span>Bugun</span>
                </div>
              </div>
            </div>

            {/* 30-Day Activity Bar Chart */}
            <div className="glass-card p-4 rounded-3xl border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Oxirgi 30 kunlik faollik</span>
              </h4>
              <div className="h-32 flex items-end justify-between space-x-1 pt-4 border-b border-white/10 overflow-x-auto pb-1">
                {dashboardStats.dailyStats?.map((day: any, idx: number) => {
                  const maxGames = Math.max(1, ...dashboardStats.dailyStats.map((d: any) => d.games));
                  const heightPercent = Math.max(8, Math.round((day.games / maxGames) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[8px]">
                      {/* Tooltip */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-black/90 text-[9px] px-2 py-1 rounded-md border border-white/20 whitespace-nowrap z-20 pointer-events-none">
                        {day.date}: {day.games} o‘yin, {day.stars} ⭐
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all ${
                          day.stars > 0 ? 'bg-gradient-to-t from-amber-500 to-yellow-400' : 'bg-gradient-to-t from-cyan-600 to-brand-blue'
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                <span>30 kun oldin</span>
                <span>Bugun</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3.2 USERS MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Search & Filter Bar */}
            <div className="glass-card p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 flex flex-col md:flex-row gap-2.5 items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Nickname, Telegram ID, @username..."
                    value={userSearchInput}
                    onChange={(e) => setUserSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchSubmit();
                      }
                    }}
                    className="w-full rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400"
                  />
                  {userSearchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                      title="Tozalash"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={isUsersLoading}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  title="Qidiruv tugmasi"
                >
                  {isUsersLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Qidirish</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex space-x-1 w-full md:w-auto overflow-x-auto">
                {(['all', 'active', 'blocked', 'admins'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setUserFilter(f);
                      setUserPage(1);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      userFilter === f ? 'bg-indigo-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/40 shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'active' ? 'Faol' : f === 'blocked' ? 'Bloklangan' : 'Adminlar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Status & User Count */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
              {appliedSearch ? (
                <div className="flex items-center space-x-2">
                  <span>Qidiruv natijasi: <strong className="text-purple-600 dark:text-cyan-400">"{appliedSearch}"</strong> ({usersTotal} ta topildi)</span>
                  <button
                    onClick={handleClearSearch}
                    className="text-[11px] text-rose-500 hover:underline font-bold cursor-pointer"
                  >
                    Filtrni tozalash
                  </button>
                </div>
              ) : (
                <span>Jami: <strong className="text-slate-900 dark:text-white font-mono">{usersTotal}</strong> ta foydalanuvchi</span>
              )}
              {isUsersLoading && (
                <span className="flex items-center text-xs text-purple-600 dark:text-cyan-400 font-semibold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" /> Yuklanmoqda...
                </span>
              )}
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-[10px] uppercase border-b border-slate-200/70 dark:border-white/5">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Telegram ID</th>
                      <th className="p-3">Balans</th>
                      <th className="p-3">O‘yinlar</th>
                      <th className="p-3">Rol</th>
                      <th className="p-3">Holat</th>
                      <th className="p-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                    {usersList.map((u) => {
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                          <td className="p-3 flex items-center space-x-2">
                            <CharacterAvatar avatarId={u.avatar_url || 'fox'} size={28} />
                            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{u.nickname}</span>
                          </td>
                          <td className="p-3 text-slate-500 dark:text-gray-400 font-mono">{u.telegram_id}</td>
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-300">{u.token_balance} tok</td>
                          <td className="p-3 text-slate-500 dark:text-gray-400">{u.wins}W / {u.losses}L</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              u.role === 'super_admin' ? 'bg-amber-400 text-black' : u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.is_blocked ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                                Bloklangan
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                                Faol
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1">
                            {/* Grant Collectible Gift */}
                            <button
                              onClick={() => setGrantGiftModal({ userId: u.id, nickname: u.nickname })}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-pink-400"
                              title="Kolleksiya sovg'asi berish"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>

                            {/* Adjust balance */}
                            <button
                              onClick={() => setBalanceModal({ userId: u.id, nickname: u.nickname, currentBalance: u.token_balance })}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-amber-300"
                              title="Balansni o‘zgartirish"
                            >
                              <Coins className="w-3.5 h-3.5" />
                            </button>

                            {/* Change ID */}
                            <button
                              onClick={() => {
                                setIdChangeModal({ userId: u.id, nickname: u.nickname, currentId: u.id });
                                setNewCustomIdInput(String(u.id));
                              }}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-purple-400"
                              title="ID ni o'zgartirish"
                            >
                              <Hash className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Stats */}
                            <button
                              onClick={() => handleResetUserStats(u.id, u.nickname)}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-cyan-400"
                              title="Statistikani nollashtirish"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Block / Unblock */}
                            {u.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(u.id)}
                                className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                title="Blokdan chiqarish"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setBlockModal({ userId: u.id, nickname: u.nickname })}
                                className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                title="Bloklash"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>Jami: {usersTotal} ta</span>
                <div className="flex space-x-2">
                  <button
                    disabled={userPage <= 1}
                    onClick={() => setUserPage(p => p - 1)}
                    className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                  >
                    Oldingi
                  </button>
                  <span className="py-1">Sahifa {userPage}</span>
                  <button
                    disabled={usersList.length < 20}
                    onClick={() => setUserPage(p => p + 1)}
                    className="px-2.5 py-1 rounded bg-white/5 disabled:opacity-30"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3.3 PROMO CODES ================= */}
        {activeTab === 'promo' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Promokodlar Ro‘yxati</h3>
              <button
                onClick={() => setCreatePromoModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs shadow-glow-blue active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi Promokod</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {promoCodes.map((p) => (
                <div key={p.id} className="glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-cyan-300 block">{p.code}</span>
                    <span className="text-xs font-bold text-amber-300">+{p.tokens} token</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Ishlatilgan: {p.used_count} / {p.max_uses ?? 'Cheksiz'}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {p.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3.4 GIFTS AIRDROP ================= */}
        {activeTab === 'gifts' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Sovg‘a Tarqatish Tarixi (Airdrop)</h3>
              <button
                onClick={() => setCreateGiftModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Sovg‘a Tarqatish</span>
              </button>
            </div>

            <div className="space-y-2">
              {giftsList.map((g) => (
                <div key={g.id} className="glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">
                      +{g.amount_per_user} token • {g.recipients_count} ta foydalanuvchiga
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Sabab: {g.note} • {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    g.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' : g.status === 'running' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3.5 ADMINS MANAGEMENT (super_admin) ================= */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="space-y-4 animate-fadeIn">
            {/* Add Admin */}
            <div className="glass-card p-4 rounded-3xl border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Yangi Admin Tayinlash</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Telegram ID yoki Nickname..."
                  value={newAdminQuery}
                  onChange={(e) => setNewAdminQuery(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleAddAdmin}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs shadow-glow-gold active:scale-95"
                >
                  Tayinlash
                </button>
              </div>
            </div>

            {/* Admins List */}
            <div className="space-y-2">
              {adminsList.map((a) => (
                <div key={a.id} className="glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">{a.nickname}</span>
                      <span className="text-[10px] text-gray-400 font-mono">TG ID: {a.telegram_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      a.role === 'super_admin' ? 'bg-amber-400 text-black' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {a.role}
                    </span>

                    {a.role !== 'super_admin' && (
                      <button
                        onClick={() => handleRemoveAdmin(a.id)}
                        className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                        title="Adminlikdan olish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3.6 STARS & REVENUE (super_admin) ================= */}
        {activeTab === 'stars' && isSuperAdmin && (
          <div className="space-y-4 animate-fadeIn">
            {/* Payments List */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-3 border-b border-white/5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Barcha Telegram Stars Xaridlari</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-gray-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Paket</th>
                      <th className="p-3">Stars</th>
                      <th className="p-3">Token</th>
                      <th className="p-3">Sana</th>
                      <th className="p-3">Holat</th>
                      <th className="p-3 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paymentsList.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-white">{p.userNickname}</td>
                        <td className="p-3 text-gray-300">{p.packTitle}</td>
                        <td className="p-3 font-black text-amber-400">{p.stars_amount} ⭐</td>
                        <td className="p-3 font-bold text-cyan-300">+{p.tokens_granted}</td>
                        <td className="p-3 text-gray-400 text-[10px]">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            p.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {p.status === 'paid' && (
                            <button
                              onClick={() => setRefundConfirm(p)}
                              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3.7 AUDIT LOG ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-sm font-bold text-white">Admin Harakatlari Tarixi (Audit Log)</h3>
            <div className="space-y-2">
              {auditLogs.map((l) => (
                <div key={l.id} className="glass-card p-3 rounded-2xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-300">{l.action}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(l.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px] mt-1">
                    Bajaruvchi: <strong className="text-white">{l.adminNickname}</strong>
                    {l.targetNickname && (
                      <span> • Nishon: <strong className="text-amber-300">{l.targetNickname}</strong></span>
                    )}
                  </div>
                  {l.details && (
                    <pre className="mt-1.5 p-2 rounded-lg bg-black/40 text-[10px] text-gray-300 font-mono overflow-x-auto">
                      {JSON.stringify(l.details)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3.8 SETTINGS (super_admin) ================= */}
        {activeTab === 'settings' && isSuperAdmin && settingsData && (
          <form onSubmit={handleSaveSettings} className="glass-card p-5 rounded-3xl border border-white/10 space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <SettingsIcon className="w-4 h-4 text-amber-400" />
              <span>Dinamik Tizim Sozlamalari</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Boshlang‘ich Token (Yangi user uchun):</label>
                <input
                  type="number"
                  value={settingsData.initial_tokens}
                  onChange={(e) => setSettingsData({ ...settingsData, initial_tokens: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Referral Bonusi (Do‘st taklifi):</label>
                <input
                  type="number"
                  value={settingsData.referral_bonus}
                  onChange={(e) => setSettingsData({ ...settingsData, referral_bonus: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Kunlik Bonus (Daily token):</label>
                <input
                  type="number"
                  value={settingsData.daily_bonus}
                  onChange={(e) => setSettingsData({ ...settingsData, daily_bonus: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Yurish Vaqti (Soniya):</label>
                <input
                  type="number"
                  value={settingsData.turn_timeout_seconds}
                  onChange={(e) => setSettingsData({ ...settingsData, turn_timeout_seconds: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Admin Kunlik Sovg‘a Limiti:</label>
                <input
                  type="number"
                  value={settingsData.admin_daily_gift_limit}
                  onChange={(e) => setSettingsData({ ...settingsData, admin_daily_gift_limit: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-amber-400 font-bold block mb-1">Platforma Komissiyasi (PvP Rake, tosh):</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="1"
                  value={settingsData.rake_amount !== undefined ? settingsData.rake_amount : 1}
                  onChange={(e) => setSettingsData({ ...settingsData, rake_amount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold border border-amber-400/40"
                />
                <span className="text-[10px] text-amber-300/80 block mt-1">
                  * Har bir PvP g'alabadan olinadigan komissiya (Standart: 1 tosh). Cheklov: eng kichik stavkadan (2 tosh) kam bo'lishi shart.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-glow-gold active:scale-95"
            >
              Sozlamalarni Saqlash
            </button>
          </form>
        )}
      </main>

      {/* ================= MODALS ================= */}
      {/* 1. Block Modal */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-rose-500/40 p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-rose-300 mb-1">Foydalanuvchini Bloklash</h3>
            <p className="text-xs text-gray-400 mb-3">{blockModal.nickname} hisobini cheklash</p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Sabab (Majburiy):</label>
                <input
                  type="text"
                  placeholder="Masalan: Qoidabuzarlik, soxta akkaunt..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Muddat:</label>
                <select
                  value={blockDays}
                  onChange={(e) => setBlockDays(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white bg-dark-800"
                >
                  <option value="0">Doimiy (Muddatsiz)</option>
                  <option value="1">1 kunga</option>
                  <option value="3">3 kunga</option>
                  <option value="7">7 kunga</option>
                  <option value="30">30 kunga</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleBlockUser}
                  disabled={!blockReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 font-bold text-xs text-white disabled:opacity-50"
                >
                  Bloklashni Tasdiqlash
                </button>
                <button
                  onClick={() => setBlockModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                >
                  Bekor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Balance Adjust Modal */}
      {balanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-white/20 p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-1">Balansni Qo‘lda O‘zgartirish</h3>
            <p className="text-xs text-gray-400 mb-3">
              {balanceModal.nickname} (Joriy: {balanceModal.currentBalance} token)
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Miqdor (Masalan: +50 yoki -20):</label>
                <input
                  type="number"
                  placeholder="+50 yoki -20"
                  value={balanceDelta}
                  onChange={(e) => setBalanceDelta(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Sabab (Audit uchun majburiy):</label>
                <input
                  type="text"
                  placeholder="Kompensatsiya, xatolikni tuzatish..."
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleAdjustBalance}
                  disabled={!balanceDelta || !balanceReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs disabled:opacity-50"
                >
                  Saqlash
                </button>
                <button
                  onClick={() => setBalanceModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                >
                  Bekor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Promo Modal */}
      {createPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-white/20 p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-3">Yangi Promokod Yaratish</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Kod nomi:</label>
                <input
                  type="text"
                  placeholder="XOXO_SPRING"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">Token miqdori:</label>
                  <input
                    type="number"
                    value={newPromo.tokens}
                    onChange={(e) => setNewPromo({ ...newPromo, tokens: parseInt(e.target.value, 10) })}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Max ishlatish soni:</label>
                  <input
                    type="number"
                    value={newPromo.max_uses}
                    onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value, 10) })}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Izoh (ixtiyoriy):</label>
                <input
                  type="text"
                  placeholder="Telegram kanal uchun..."
                  value={newPromo.note}
                  onChange={(e) => setNewPromo({ ...newPromo, note: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleCreatePromo}
                  disabled={!newPromo.code.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs disabled:opacity-50"
                >
                  Yaratish
                </button>
                <button
                  onClick={() => setCreatePromoModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                >
                  Bekor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Create Gift Airdrop Modal */}
      {createGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-purple-500/30 p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-purple-300 mb-3">Token Airdrop Tarqatish</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Qabul qiluvchilar:</label>
                <select
                  value={newGift.target_type}
                  onChange={(e) => setNewGift({ ...newGift, target_type: e.target.value as any })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white bg-dark-800"
                >
                  <option value="all">Barcha foydalanuvchilar</option>
                  <option value="single">Bitta foydalanuvchi</option>
                  <option value="list">Ro‘yxat bo‘yicha</option>
                  <option value="segment">Segment (Top-N reyting)</option>
                </select>
              </div>

              {newGift.target_type === 'single' && (
                <div>
                  <label className="text-gray-400 block mb-1">Foydalanuvchi Nickname yoki TG ID:</label>
                  <input
                    type="text"
                    value={newGift.singleQuery}
                    onChange={(e) => setNewGift({ ...newGift, singleQuery: e.target.value })}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {newGift.target_type === 'list' && (
                <div>
                  <label className="text-gray-400 block mb-1">Vergul bilan ajratilgan ID/Nicknamelar:</label>
                  <textarea
                    rows={2}
                    value={newGift.userListText}
                    onChange={(e) => setNewGift({ ...newGift, userListText: e.target.value })}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-400 block mb-1">Har bir foydalanuvchiga token:</label>
                <input
                  type="number"
                  value={newGift.amount_per_user}
                  onChange={(e) => setNewGift({ ...newGift, amount_per_user: parseInt(e.target.value, 10) })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Sabab/Izoh (Audit uchun majburiy):</label>
                <input
                  type="text"
                  placeholder="Navro‘z bayrami sovg‘asi..."
                  value={newGift.note}
                  onChange={(e) => setNewGift({ ...newGift, note: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Telegram xabar matni (ixtiyoriy):</label>
                <input
                  type="text"
                  placeholder="Bayramingiz muborak bo‘lsin!"
                  value={newGift.bot_message}
                  onChange={(e) => setNewGift({ ...newGift, bot_message: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setGiftConfirmModal(true)}
                  disabled={!newGift.note.trim() || newGift.amount_per_user <= 0}
                  className="flex-1 py-2.5 rounded-xl bg-purple-500 font-extrabold text-xs text-white disabled:opacity-50"
                >
                  Ko‘rib chiqish
                </button>
                <button
                  onClick={() => setCreateGiftModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
                >
                  Bekor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Gift Confirmation Dialog */}
      {giftConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-purple-500/40 p-5 shadow-2xl text-center">
            <Gift className="w-10 h-10 text-purple-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-extrabold text-white">Sovg‘a Tarqatishni Tasdiqlash</h3>
            <p className="text-xs text-gray-300 mt-2">
              Tanlangan segmentdagi barcha qabul qiluvchilarga <strong className="text-amber-300">{newGift.amount_per_user} token</strong> beriladi.
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Sabab: {newGift.note}</p>

            <div className="flex space-x-2 pt-4">
              <button
                onClick={handleTriggerGift}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-black text-xs text-white shadow-lg"
              >
                Ha, Tarqatilsin!
              </button>
              <button
                onClick={() => setGiftConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
              >
                Orqaga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Refund Confirmation Dialog */}
      {refundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-rose-500/40 p-5 shadow-2xl text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-2 animate-pulse" />
            <h3 className="text-base font-extrabold text-white">To‘lovni Qaytarish (Refund)</h3>
            <p className="text-xs text-gray-300 mt-2">
              Foydalanuvchi: <strong className="text-white">{refundConfirm.userNickname}</strong><br />
              Miqdor: <strong className="text-amber-400">{refundConfirm.stars_amount} Stars</strong><br />
              Ayiriladigan tokenlar: <strong className="text-rose-400">-{refundConfirm.tokens_granted} token</strong>
            </p>

            <div className="flex space-x-2 pt-4">
              <button
                onClick={handleRefundPayment}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 font-black text-xs text-white"
              >
                Refund Tasdiqlash
              </button>
              <button
                onClick={() => setRefundConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Change User ID Modal */}
      {idChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-purple-500/40 p-5 shadow-2xl text-center">
            <Hash className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="text-base font-extrabold text-white">ID Raqamini O'zgartirish</h3>
            <p className="text-xs text-gray-300 mt-1">
              Foydalanuvchi: <strong className="text-white">{idChangeModal.nickname}</strong> (Hozirgi ID: #{idChangeModal.currentId})
            </p>
            <div className="p-2.5 my-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-200 text-left">
              💡 <strong>Eslatma:</strong> Standart ID 8 xonali bo'ladi. Maxsus <strong>3 xonali ID (100 - 999)</strong> butun tizimda faqat maksimal <strong>2 ta foydalanuvchiga</strong> berilishi mumkin!
            </div>

            <div className="text-left space-y-1 mb-4">
              <label className="text-[11px] text-gray-400 font-bold block">Yangi ID:</label>
              <input
                type="number"
                value={newCustomIdInput}
                onChange={(e) => setNewCustomIdInput(e.target.value)}
                placeholder="Masalan: 777 yoki 12345678"
                className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleChangeUserId}
                disabled={!newCustomIdInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 font-extrabold text-xs text-white shadow-lg disabled:opacity-50"
              >
                ID Saqlash
              </button>
              <button
                onClick={() => setIdChangeModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Grant Collectible Gift Modal */}
      {grantGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-card rounded-3xl border border-pink-500/40 p-5 shadow-2xl text-center">
            <Gift className="w-10 h-10 text-pink-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-extrabold text-white">Kolleksiya Sovg'asi Berish</h3>
            <p className="text-xs text-gray-300 mt-1">
              Foydalanuvchi: <strong className="text-white">{grantGiftModal.nickname}</strong>
            </p>

            <div className="text-left space-y-2 my-4">
              <label className="text-xs text-gray-400 font-bold block">Sovg'ani tanlang:</label>
              <select
                value={selectedGiftCatalogId}
                onChange={(e) => setSelectedGiftCatalogId(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold text-xs bg-slate-900 border border-white/20"
              >
                <option value="uzuk_diamond">💍 1. Uzuk (500 Tosh)</option>
                <option value="yurak_crystal">💖 2. Yurakcha (250 Tosh)</option>
                <option value="atirgul_rose">🌹 3. Atirgul (100 Tosh)</option>
                <option value="sovga_box">🎁 4. Sovg'acha (50 Tosh)</option>
                <option value="ayiq_teddy">🧸 5. Ayiqcha (20 Tosh)</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleGrantGiftToUser}
                className="flex-1 py-2.5 rounded-xl bg-pink-600 font-extrabold text-xs text-white shadow-lg active:scale-95"
              >
                Sovg'a Taqdim Etish
              </button>
              <button
                onClick={() => setGrantGiftModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-gray-300"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
