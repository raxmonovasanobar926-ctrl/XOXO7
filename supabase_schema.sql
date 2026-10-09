-- ====================================================================
-- XOXO - Telegram Mini App & Real-Time Tic-Tac-Toe Game
-- Supabase PostgreSQL Database Schema & Initial Setup
-- ====================================================================
-- You can run this entire script inside Supabase SQL Editor (1-click run).
-- Dashboard: https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(64) UNIQUE NOT NULL,
  invite_code VARCHAR(16) UNIQUE NOT NULL,
  owner_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  nickname VARCHAR(32) UNIQUE NOT NULL,
  avatar_url TEXT,
  token_balance INT NOT NULL DEFAULT 25,
  referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  draws INT NOT NULL DEFAULT 0,
  role VARCHAR(16) NOT NULL DEFAULT 'user', -- 'user' | 'admin' | 'super_admin'
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Games Table (Vanishing Tic-Tac-Toe matches)
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  player_x_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  player_o_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  stake INT NOT NULL DEFAULT 1,
  board TEXT NOT NULL,
  status VARCHAR(16) NOT NULL, -- 'waiting' | 'rps' | 'in_progress' | 'finished' | 'abandoned'
  winner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  game_id BIGINT REFERENCES games(id) ON DELETE SET NULL,
  amount INT NOT NULL,
  reason VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  referred_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  bonus_paid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Daily Bonus Claims Table
CREATE TABLE IF NOT EXISTS daily_bonus_claims (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  tokens INT NOT NULL,
  max_uses INT, -- NULL means unlimited
  used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Promo Redemptions Table
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id BIGSERIAL PRIMARY KEY,
  promo_id BIGINT REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (promo_id, user_id)
);

-- 10. Admin Gifts Table
CREATE TABLE IF NOT EXISTS gifts (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(16) NOT NULL,
  amount_per_user INT NOT NULL,
  recipients_count INT,
  note TEXT NOT NULL,
  bot_message TEXT,
  status VARCHAR(16) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Telegram Star Packs Table
CREATE TABLE IF NOT EXISTS star_packs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(32) NOT NULL,
  tokens INT NOT NULL,
  stars_price INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  badge VARCHAR(16)
);

-- 12. Star Payments Table
CREATE TABLE IF NOT EXISTS star_payments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  pack_id BIGINT REFERENCES star_packs(id) ON DELETE SET NULL,
  stars_amount INT NOT NULL,
  tokens_granted INT NOT NULL,
  telegram_payment_charge_id TEXT UNIQUE NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Admin Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(48) NOT NULL,
  target_user_id BIGINT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Key-Value Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. Real-Time Application State Sync Table
CREATE TABLE IF NOT EXISTS system_state (
  id VARCHAR(32) PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Platform Commission (Rake Ledger) Table
CREATE TABLE IF NOT EXISTS rake_ledger (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(id),
  amount INT NOT NULL,
  stake INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_rake_ledger_created_at ON rake_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_rake_ledger_stake ON rake_ledger(stake);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_daily_bonus_user_id ON daily_bonus_claims(user_id, claimed_at);

-- ====================================================================
-- Default Seed Data for Star Packs
-- ====================================================================
INSERT INTO star_packs (id, title, tokens, stars_price, is_active, sort_order, badge)
VALUES
  (1, 'Starter', 60, 25, true, 1, NULL),
  (2, 'Popular', 150, 50, true, 2, 'popular'),
  (3, 'Pro', 200, 100, true, 3, 'best_value'),
  (4, 'Mega', 500, 250, true, 4, NULL)
ON CONFLICT (id) DO NOTHING;
