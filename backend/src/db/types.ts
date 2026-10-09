export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
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
  role: UserRole;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_until: string | null;
  is_bot?: boolean;
  language?: 'uz' | 'ru' | 'en';
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  invite_code: string;
  owner_id: number;
  created_at: string;
}

export interface GameRecord {
  id: number;
  player_x_id: number;
  player_o_id: number | null; // Nullable for AI games
  stake: number;
  board: string; // JSON serialized board state & history
  status: 'waiting' | 'rps' | 'in_progress' | 'finished' | 'abandoned';
  winner_id: number | null;
  is_ai_game?: boolean;
  ai_level?: 'easy' | 'medium' | 'hard' | 'expert' | null;
  created_at: string;
  finished_at: string | null;
}

export type TransactionReason = 
  | 'signup_bonus' 
  | 'referral_bonus' 
  | 'daily_bonus' 
  | 'game_win' 
  | 'game_loss' 
  | 'game_refund' 
  | 'game_stake'
  | 'ai_game_stake'
  | 'ai_game_win'
  | 'ai_game_refund'
  | 'admin_gift'
  | 'admin_manual'
  | 'promo_code'
  | 'stars_purchase'
  | 'stars_refund'
  | 'token_gift_send'
  | 'token_gift_receive'
  | 'collectible_gift_buy'
  | 'collectible_gift_sell';

export interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  created_at: string;
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface CelebratoryNotification {
  id: number;
  user_id: number;
  sender_name: string;
  sender_avatar?: string;
  type: 'gift' | 'tokens' | 'admin_gift';
  gift_title?: string;
  gift_icon?: string;
  amount?: number;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface CollectibleGiftItem {
  id: string; // e.g. 'crown_diamond', 'cup_golden', 'rocket_cosmic', etc.
  title_uz: string;
  title_ru: string;
  title_en: string;
  icon: string; // emoji or SVG key
  token_price: number;
  sell_price: number;
  is_active: boolean;
}

export interface UserCollectibleGift {
  id: number;
  user_id: number;
  gift_catalog_id: string;
  title: string;
  icon: string;
  token_price: number;
  sell_price: number;
  month_acquired: string; // e.g. '2026-09'
  acquired_at: string;
  is_premium_reward?: boolean;
  can_sell?: boolean;
}


export interface Transaction {
  id: number;
  user_id: number;
  game_id: number | null;
  amount: number; // positive or negative
  reason: TransactionReason;
  created_at: string;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  bonus_paid: boolean;
  created_at: string;
}

export interface DailyBonusClaim {
  id: number;
  user_id: number;
  claimed_at: string;
}

export interface PromoCode {
  id: number;
  code: string;
  tokens: number;
  max_uses: number | null; // null = unlimited
  used_count: number;
  per_user_limit: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  note: string | null;
  created_by: number | null;
  created_at: string;
}

export interface PromoRedemption {
  id: number;
  promo_id: number;
  user_id: number;
  created_at: string;
}

export type GiftTargetType = 'single' | 'list' | 'all' | 'segment';

export interface Gift {
  id: number;
  admin_id: number;
  target_type: GiftTargetType;
  amount_per_user: number;
  recipients_count: number;
  note: string;
  bot_message: string | null;
  status: 'pending' | 'running' | 'done' | 'failed';
  created_at: string;
}

export interface StarPack {
  id: number;
  title: string;
  tokens: number;
  stars_price: number;
  is_active: boolean;
  sort_order: number;
  badge: 'best_value' | 'popular' | null;
}

export interface StarPayment {
  id: number;
  user_id: number;
  pack_id: number;
  stars_amount: number;
  tokens_granted: number;
  telegram_payment_charge_id: string;
  status: 'paid' | 'refunded';
  created_at: string;
}

export interface AdminAuditLog {
  id: number;
  admin_id: number;
  action: string;
  target_user_id: number | null;
  details: any;
  created_at: string;
}

export interface AILevelSetting {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  stake: number;
  win_reward: number;
  blunder_probability: number;
  search_depth: number;
  is_enabled: boolean;
}

export interface AIStat {
  user_id: number;
  level: 'easy' | 'medium' | 'hard' | 'expert';
  wins: number;
  draws: number;
  losses: number;
}

export interface RakeLedgerRecord {
  id: number;
  game_id: number | null;
  amount: number;
  stake: number;
  created_at: string;
}

export interface SystemSettings {
  initial_tokens: number;
  referral_bonus: number;
  turn_timeout_seconds: number;
  rps_timeout_seconds: number;
  admin_daily_gift_limit: number;
  bot_max_stones_won_per_day: number;
  bot_games_count_to_rating: boolean;
  rake_amount?: number;
  [key: string]: any;
}
