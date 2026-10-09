import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '../config/index.js';
import { 
  User, 
  UserRole,
  Team, 
  GameRecord, 
  Transaction, 
  Referral, 
  TransactionReason,
  PromoCode,
  PromoRedemption,
  Gift,
  StarPack,
  StarPayment,
  AdminAuditLog,
  SystemSettings,
  AILevelSetting,
  AIStat,
  Friend,
  CollectibleGiftItem,
  UserCollectibleGift,
  FriendRequest,
  CelebratoryNotification,
  DailyBonusClaim,
  RakeLedgerRecord,
} from './types.js';

interface DbSchema {
  users: User[];
  teams: Team[];
  games: GameRecord[];
  transactions: Transaction[];
  rake_ledger: RakeLedgerRecord[];
  referrals: Referral[];
  daily_bonus_claims: DailyBonusClaim[];
  friends: Friend[];
  friend_requests: FriendRequest[];
  celebratory_notifications: CelebratoryNotification[];
  user_collectible_gifts: UserCollectibleGift[];
  promo_codes: PromoCode[];
  promo_redemptions: PromoRedemption[];
  gifts: Gift[];
  star_packs: StarPack[];
  star_payments: StarPayment[];
  admin_audit_log: AdminAuditLog[];
  settings: SystemSettings;
  ai_level_settings: AILevelSetting[];
  ai_stats: AIStat[];
  nextIds: {
    users: number;
    teams: number;
    games: number;
    transactions: number;
    rake_ledger: number;
    referrals: number;
    daily_bonus_claims: number;
    friends: number;
    friend_requests: number;
    celebratory_notifications: number;
    user_collectible_gifts: number;
    promo_codes: number;
    promo_redemptions: number;
    gifts: number;
    star_packs: number;
    star_payments: number;
    admin_audit_log: number;
  };
}

export const DEFAULT_COLLECTIBLE_GIFTS: CollectibleGiftItem[] = [
  {
    id: 'uzuk_diamond',
    title_uz: 'Uzuk',
    title_ru: 'Кольцо',
    title_en: 'Ring',
    icon: '💍',
    token_price: 500,
    sell_price: 400,
    is_active: true,
  },
  {
    id: 'yurak_crystal',
    title_uz: 'Yurakcha',
    title_ru: 'Сердечко',
    title_en: 'Heart',
    icon: '💖',
    token_price: 250,
    sell_price: 200,
    is_active: true,
  },
  {
    id: 'atirgul_rose',
    title_uz: 'Atirgul',
    title_ru: 'Роза',
    title_en: 'Rose',
    icon: '🌹',
    token_price: 100,
    sell_price: 80,
    is_active: true,
  },
  {
    id: 'sovga_box',
    title_uz: "Sovg'acha",
    title_ru: 'Подарочек',
    title_en: 'Gift Box',
    icon: '🎁',
    token_price: 50,
    sell_price: 40,
    is_active: true,
  },
  {
    id: 'ayiq_teddy',
    title_uz: 'Ayiqcha',
    title_ru: 'Мишка',
    title_en: 'Teddy Bear',
    icon: '🧸',
    token_price: 20,
    sell_price: 15,
    is_active: true,
  },
];

const DEFAULT_AI_LEVEL_SETTINGS: AILevelSetting[] = [
  { level: 'easy', stake: 1, win_reward: 1, blunder_probability: 0.45, search_depth: 1, is_enabled: true },
  { level: 'medium', stake: 3, win_reward: 3, blunder_probability: 0.25, search_depth: 2, is_enabled: true },
  { level: 'hard', stake: 5, win_reward: 7, blunder_probability: 0.10, search_depth: 3, is_enabled: true },
  { level: 'expert', stake: 10, win_reward: 20, blunder_probability: 0.035, search_depth: 4, is_enabled: true },
];


const DEFAULT_STAR_PACKS: Omit<StarPack, 'id'>[] = [
  { title: 'Starter', tokens: 60, stars_price: 25, is_active: true, sort_order: 1, badge: null },
  { title: 'Popular', tokens: 150, stars_price: 50, is_active: true, sort_order: 2, badge: 'popular' },
  { title: 'Pro', tokens: 200, stars_price: 100, is_active: true, sort_order: 3, badge: 'best_value' },
  { title: 'Mega', tokens: 500, stars_price: 250, is_active: true, sort_order: 4, badge: null },
];

class DatabaseManager {
  private pgPool: Pool | null = null;
  private isPostgres = false;
  private filePath: string;
  private memoryData: DbSchema;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'db.json');
    this.memoryData = this.loadFromFile();

    if (config.databaseUrl && (config.databaseUrl.startsWith('postgres://') || config.databaseUrl.startsWith('postgresql://'))) {
      try {
        const isSupabaseOrCloud = config.databaseUrl.includes('supabase') || 
                                  config.databaseUrl.includes('pooler') || 
                                  config.databaseUrl.includes('sslmode=require') ||
                                  process.env.NODE_ENV === 'production';
        this.pgPool = new Pool({
          connectionString: config.databaseUrl,
          ssl: isSupabaseOrCloud ? { rejectUnauthorized: false } : undefined,
        });
        this.isPostgres = true;
        console.log('[DB] Configured for PostgreSQL (Supabase / Cloud DB)');
      } catch (err) {
        console.warn('[DB] Failed to init PG pool, falling back to local persistent store', err);
        this.isPostgres = false;
      }
    } else {
      console.log('[DB] Using local persistent JSON store at:', this.filePath);
    }
  }

  private updateUserReferencesInSchema(schema: any, oldId: number, newId: number) {
    if (schema.users) {
      for (const u of schema.users) {
        if (u.referred_by === oldId) u.referred_by = newId;
      }
    }
    if (schema.teams) {
      for (const t of schema.teams) {
        if (t.owner_id === oldId) t.owner_id = newId;
      }
    }
    if (schema.games) {
      for (const g of schema.games) {
        if (g.player_x_id === oldId) g.player_x_id = newId;
        if (g.player_o_id === oldId) g.player_o_id = newId;
        if (g.winner_id === oldId) g.winner_id = newId;
      }
    }
    if (schema.transactions) {
      for (const tx of schema.transactions) {
        if (tx.user_id === oldId) tx.user_id = newId;
      }
    }
    if (schema.referrals) {
      for (const r of schema.referrals) {
        if (r.referrer_id === oldId) r.referrer_id = newId;
        if (r.referred_id === oldId) r.referred_id = newId;
      }
    }
    if (schema.friends) {
      for (const f of schema.friends) {
        if (f.user_id === oldId) f.user_id = newId;
        if (f.friend_id === oldId) f.friend_id = newId;
      }
    }
    if (schema.friend_requests) {
      for (const fr of schema.friend_requests) {
        if (fr.sender_id === oldId) fr.sender_id = newId;
        if (fr.recipient_id === oldId) fr.recipient_id = newId;
      }
    }
    if (schema.celebratory_notifications) {
      for (const cn of schema.celebratory_notifications) {
        if (cn.user_id === oldId) cn.user_id = newId;
      }
    }
    if (schema.user_collectible_gifts) {
      for (const g of schema.user_collectible_gifts) {
        if (g.user_id === oldId) g.user_id = newId;
      }
    }
    if (schema.daily_bonus_claims) {
      for (const dbc of schema.daily_bonus_claims) {
        if (dbc.user_id === oldId) dbc.user_id = newId;
      }
    }
    if (schema.ai_stats) {
      for (const ais of schema.ai_stats) {
        if (ais.user_id === oldId) ais.user_id = newId;
      }
    }
    if (schema.star_payments) {
      for (const sp of schema.star_payments) {
        if (sp.user_id === oldId) sp.user_id = newId;
      }
    }
    if (schema.promo_codes) {
      for (const pc of schema.promo_codes) {
        if (pc.created_by === oldId) pc.created_by = newId;
      }
    }
    if (schema.promo_redemptions) {
      for (const pr of schema.promo_redemptions) {
        if (pr.user_id === oldId) pr.user_id = newId;
      }
    }
    if (schema.gifts) {
      for (const gf of schema.gifts) {
        if (gf.admin_id === oldId) gf.admin_id = newId;
      }
    }
    if (schema.admin_audit_log) {
      for (const al of schema.admin_audit_log) {
        if (al.admin_id === oldId) al.admin_id = newId;
        if (al.target_user_id === oldId) al.target_user_id = newId;
      }
    }
  }

  private getDefaultData(): DbSchema {
    return {
      users: [],
      teams: [],
      games: [],
      transactions: [],
      rake_ledger: [],
      referrals: [],
      daily_bonus_claims: [],
      friends: [],
      friend_requests: [],
      celebratory_notifications: [],
      user_collectible_gifts: [],
      promo_codes: [],
      promo_redemptions: [],
      gifts: [],
      star_packs: DEFAULT_STAR_PACKS.map((p, idx) => ({ id: idx + 1, ...p })),
      star_payments: [],
      admin_audit_log: [],
      ai_level_settings: [...DEFAULT_AI_LEVEL_SETTINGS],
      ai_stats: [],
      settings: {
        initial_tokens: config.initialTokens,
        referral_bonus: config.referralBonus,
        turn_timeout_seconds: config.turnTimeoutSeconds,
        rps_timeout_seconds: config.rpsTimeoutSeconds,
        admin_daily_gift_limit: config.adminDailyGiftLimit,
        bot_max_stones_won_per_day: 30,
        bot_games_count_to_rating: false,
        rake_amount: 1,
      },
      nextIds: {
        users: 1,
        teams: 1,
        games: 1,
        transactions: 1,
        rake_ledger: 1,
        referrals: 1,
        daily_bonus_claims: 1,
        friends: 1,
        friend_requests: 1,
        celebratory_notifications: 1,
        user_collectible_gifts: 1,
        promo_codes: 1,
        promo_redemptions: 1,
        gifts: 1,
        star_packs: 5,
        star_payments: 1,
        admin_audit_log: 1,
      },
    };
  }

  private ensureSchemaDefaults(parsed: any): DbSchema {
    if (!parsed || typeof parsed !== 'object') return this.getDefaultData();
    if (!Array.isArray(parsed.users)) parsed.users = [];
    if (!Array.isArray(parsed.teams)) parsed.teams = [];
    if (!Array.isArray(parsed.games)) parsed.games = [];
    if (!Array.isArray(parsed.transactions)) parsed.transactions = [];
    if (!Array.isArray(parsed.rake_ledger)) parsed.rake_ledger = [];
    if (!Array.isArray(parsed.referrals)) parsed.referrals = [];
    if (!Array.isArray(parsed.daily_bonus_claims)) parsed.daily_bonus_claims = [];
    if (!Array.isArray(parsed.friends)) parsed.friends = [];
    if (!Array.isArray(parsed.friend_requests)) parsed.friend_requests = [];
    if (!Array.isArray(parsed.celebratory_notifications)) parsed.celebratory_notifications = [];
    if (!Array.isArray(parsed.user_collectible_gifts)) parsed.user_collectible_gifts = [];
    if (!Array.isArray(parsed.promo_codes)) parsed.promo_codes = [];
    if (!Array.isArray(parsed.promo_redemptions)) parsed.promo_redemptions = [];
    if (!Array.isArray(parsed.gifts)) parsed.gifts = [];
    if (!Array.isArray(parsed.star_packs) || parsed.star_packs.length === 0) {
      parsed.star_packs = DEFAULT_STAR_PACKS.map((p, idx) => ({ id: idx + 1, ...p }));
    }
    if (!Array.isArray(parsed.star_payments)) parsed.star_payments = [];
    if (!Array.isArray(parsed.admin_audit_log)) parsed.admin_audit_log = [];

    if (!Array.isArray(parsed.ai_level_settings) || parsed.ai_level_settings.length === 0) {
      parsed.ai_level_settings = [...DEFAULT_AI_LEVEL_SETTINGS];
    }
    if (!Array.isArray(parsed.ai_stats)) {
      parsed.ai_stats = [];
    }

    if (!parsed.settings) {
      parsed.settings = {
        initial_tokens: config.initialTokens,
        referral_bonus: config.referralBonus,
        turn_timeout_seconds: config.turnTimeoutSeconds,
        rps_timeout_seconds: config.rpsTimeoutSeconds,
        admin_daily_gift_limit: config.adminDailyGiftLimit,
        bot_max_stones_won_per_day: 30,
        bot_games_count_to_rating: false,
        rake_amount: 1,
      };
    } else {
      if (parsed.settings.bot_max_stones_won_per_day === undefined) {
        parsed.settings.bot_max_stones_won_per_day = 30;
      }
      if (parsed.settings.bot_games_count_to_rating === undefined) {
        parsed.settings.bot_games_count_to_rating = false;
      }
      if (parsed.settings.rake_amount === undefined) {
        parsed.settings.rake_amount = 1;
      }
    }

    if (!parsed.nextIds) {
      parsed.nextIds = {
        users: parsed.users.length + 1,
        teams: parsed.teams.length + 1,
        games: parsed.games.length + 1,
        transactions: parsed.transactions.length + 1,
        rake_ledger: parsed.rake_ledger.length + 1,
        referrals: parsed.referrals.length + 1,
        daily_bonus_claims: parsed.daily_bonus_claims.length + 1,
        friends: parsed.friends.length + 1,
        friend_requests: parsed.friend_requests.length + 1,
        celebratory_notifications: parsed.celebratory_notifications.length + 1,
        user_collectible_gifts: parsed.user_collectible_gifts.length + 1,
        promo_codes: parsed.promo_codes.length + 1,
        promo_redemptions: parsed.promo_redemptions.length + 1,
        gifts: parsed.gifts.length + 1,
        star_packs: 5,
        star_payments: parsed.star_payments.length + 1,
        admin_audit_log: parsed.admin_audit_log.length + 1,
      };
    } else {
      if (!parsed.nextIds.users) parsed.nextIds.users = parsed.users.length + 1;
      if (!parsed.nextIds.teams) parsed.nextIds.teams = parsed.teams.length + 1;
      if (!parsed.nextIds.games) parsed.nextIds.games = parsed.games.length + 1;
      if (!parsed.nextIds.transactions) parsed.nextIds.transactions = parsed.transactions.length + 1;
      if (!parsed.nextIds.rake_ledger) parsed.nextIds.rake_ledger = parsed.rake_ledger.length + 1;
      if (!parsed.nextIds.referrals) parsed.nextIds.referrals = parsed.referrals.length + 1;
      if (!parsed.nextIds.daily_bonus_claims) parsed.nextIds.daily_bonus_claims = parsed.daily_bonus_claims.length + 1;
      if (!parsed.nextIds.friends) parsed.nextIds.friends = parsed.friends.length + 1;
      if (!parsed.nextIds.friend_requests) parsed.nextIds.friend_requests = parsed.friend_requests.length + 1;
      if (!parsed.nextIds.celebratory_notifications) parsed.nextIds.celebratory_notifications = parsed.celebratory_notifications.length + 1;
      if (!parsed.nextIds.user_collectible_gifts) parsed.nextIds.user_collectible_gifts = parsed.user_collectible_gifts.length + 1;
      if (!parsed.nextIds.promo_codes) parsed.nextIds.promo_codes = parsed.promo_codes.length + 1;
      if (!parsed.nextIds.promo_redemptions) parsed.nextIds.promo_redemptions = parsed.promo_redemptions.length + 1;
      if (!parsed.nextIds.gifts) parsed.nextIds.gifts = parsed.gifts.length + 1;
      if (!parsed.nextIds.star_packs) parsed.nextIds.star_packs = 5;
      if (!parsed.nextIds.star_payments) parsed.nextIds.star_payments = parsed.star_payments.length + 1;
      if (!parsed.nextIds.admin_audit_log) parsed.nextIds.admin_audit_log = parsed.admin_audit_log.length + 1;
    }

    // Migration / normalization of user IDs:
    // Ensure all users have either valid 8-digit random ID or 3-digit custom ID
    let threeDigitCount = parsed.users.filter((u: any) => u.id >= 100 && u.id <= 999).length;
    for (const u of parsed.users) {
      if (!u.role) u.role = 'user';
      if (u.is_blocked === undefined) u.is_blocked = false;
      if (u.blocked_reason === undefined) u.blocked_reason = null;
      if (u.blocked_until === undefined) u.blocked_until = null;

      const is3Digit = u.id >= 100 && u.id <= 999;
      if (u.id < 100 || (is3Digit && threeDigitCount > 2) || (u.id > 999 && u.id < 10000000)) {
        let newId = Math.floor(10000000 + Math.random() * 90000000);
        while (parsed.users.some((x: any) => x.id === newId)) {
          newId = Math.floor(10000000 + Math.random() * 90000000);
        }
        const oldId = u.id;
        u.id = newId;
        this.updateUserReferencesInSchema(parsed, oldId, newId);
      }
    }

    // Migrate any legacy gift catalog IDs to the 5 new Telegram collectible gifts
    if (Array.isArray(parsed.user_collectible_gifts)) {
      const validIds = DEFAULT_COLLECTIBLE_GIFTS.map(g => g.id);
      for (const g of parsed.user_collectible_gifts) {
        if (!validIds.includes(g.gift_catalog_id)) {
          if (g.gift_catalog_id === 'crown_diamond' || g.token_price >= 500) {
            g.gift_catalog_id = 'uzuk_diamond';
            g.title = 'Uzuk';
            g.icon = '💍';
            g.token_price = 500;
            g.sell_price = 400;
          } else if (g.gift_catalog_id === 'cup_golden' || g.token_price >= 250) {
            g.gift_catalog_id = 'yurak_crystal';
            g.title = 'Yurakcha';
            g.icon = '💖';
            g.token_price = 250;
            g.sell_price = 200;
          } else if (g.gift_catalog_id === 'rocket_cosmic' || g.token_price >= 100) {
            g.gift_catalog_id = 'atirgul_rose';
            g.title = 'Atirgul';
            g.icon = '🌹';
            g.token_price = 100;
            g.sell_price = 80;
          } else if (g.gift_catalog_id === 'scepter_royal' || g.token_price >= 50) {
            g.gift_catalog_id = 'sovga_box';
            g.title = "Sovg'acha";
            g.icon = '🎁';
            g.token_price = 50;
            g.sell_price = 40;
          } else {
            g.gift_catalog_id = 'ayiq_teddy';
            g.title = 'Ayiqcha';
            g.icon = '🧸';
            g.token_price = 20;
            g.sell_price = 15;
          }
        }
      }
    }

    return parsed as DbSchema;
  }

  private loadFromFile(): DbSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const defaults = this.ensureSchemaDefaults(parsed);
        this.saveToFile(defaults, false);
        return defaults;
      } catch (e) {
        console.error('[DB] Error reading local db file, initializing fresh', e);
      }
    }

    const defaultData = this.getDefaultData();
    this.saveToFile(defaultData, false);
    return defaultData;
  }

  private saveToFile(data = this.memoryData, syncToPostgres = true) {
    try {
      const content = JSON.stringify(data, null, 2);
      try {
        const tempPath = `${this.filePath}.tmp`;
        fs.writeFileSync(tempPath, content, 'utf-8');
        fs.renameSync(tempPath, this.filePath);
      } catch {
        fs.writeFileSync(this.filePath, content, 'utf-8');
      }
    } catch (e) {
      console.error('[DB] Failed to save DB to file:', e);
    }

    if (syncToPostgres && this.isPostgres && this.pgPool) {
      this.syncStateToPostgres(data);
    }
  }

  private async syncStateToPostgres(data: DbSchema) {
    if (!this.pgPool) return;
    try {
      await this.pgPool.query(
        `INSERT INTO system_state (id, state, updated_at) 
         VALUES ('xoxo_main', $1, now()) 
         ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`,
        [JSON.stringify(data)]
      );
    } catch (e: any) {
      console.error('[DB] Error syncing state to Supabase / PostgreSQL:', e?.message || e);
    }
  }

  public async init() {
    // Check and set super admin role if specified in config
    if (config.superAdminTelegramId) {
      const existingSuper = this.memoryData.users.find(u => Number(u.telegram_id) === Number(config.superAdminTelegramId));
      if (existingSuper && existingSuper.role !== 'super_admin') {
        existingSuper.role = 'super_admin';
        this.saveToFile();
        console.log(`[DB] Super admin role assigned to telegram_id ${config.superAdminTelegramId}`);
      }
    }

    if (this.isPostgres && this.pgPool) {
      try {
        const client = await this.pgPool.connect();
        await client.query(`
          CREATE TABLE IF NOT EXISTS teams (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(64) UNIQUE NOT NULL,
            invite_code VARCHAR(16) UNIQUE NOT NULL,
            owner_id BIGINT,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS users (
            id BIGSERIAL PRIMARY KEY,
            telegram_id BIGINT UNIQUE NOT NULL,
            nickname VARCHAR(32) UNIQUE NOT NULL,
            avatar_url TEXT,
            token_balance INT NOT NULL DEFAULT 25,
            referred_by BIGINT REFERENCES users(id),
            team_id BIGINT REFERENCES teams(id),
            wins INT DEFAULT 0,
            losses INT DEFAULT 0,
            draws INT DEFAULT 0,
            role VARCHAR(16) NOT NULL DEFAULT 'user',
            is_blocked BOOLEAN NOT NULL DEFAULT false,
            blocked_reason TEXT,
            blocked_until TIMESTAMP,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS games (
            id BIGSERIAL PRIMARY KEY,
            player_x_id BIGINT REFERENCES users(id),
            player_o_id BIGINT REFERENCES users(id),
            stake INT NOT NULL,
            board TEXT NOT NULL,
            status VARCHAR(16) NOT NULL,
            winner_id BIGINT REFERENCES users(id),
            is_ai_game BOOLEAN NOT NULL DEFAULT false,
            ai_level VARCHAR(8),
            created_at TIMESTAMP DEFAULT now(),
            finished_at TIMESTAMP
          );

          ALTER TABLE games ADD COLUMN IF NOT EXISTS is_ai_game BOOLEAN NOT NULL DEFAULT false;
          ALTER TABLE games ADD COLUMN IF NOT EXISTS ai_level VARCHAR(8);
          ALTER TABLE games ALTER COLUMN player_o_id DROP NOT NULL;

          CREATE TABLE IF NOT EXISTS ai_level_settings (
            level VARCHAR(8) PRIMARY KEY,
            stake INT NOT NULL,
            win_reward INT NOT NULL,
            blunder_probability NUMERIC(4,3) NOT NULL,
            search_depth INT NOT NULL,
            is_enabled BOOLEAN NOT NULL DEFAULT true
          );

          CREATE TABLE IF NOT EXISTS ai_stats (
            user_id BIGINT REFERENCES users(id),
            level VARCHAR(8),
            wins INT NOT NULL DEFAULT 0,
            draws INT NOT NULL DEFAULT 0,
            losses INT NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, level)
          );

          -- Archive and drop daily_bonus_claims if present
          DO $$
          BEGIN
            IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_bonus_claims') THEN
              CREATE TABLE IF NOT EXISTS daily_bonus_claims_archive AS SELECT * FROM daily_bonus_claims;
              DROP TABLE IF EXISTS daily_bonus_claims;
            END IF;
          END $$;

          CREATE TABLE IF NOT EXISTS transactions (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT REFERENCES users(id),
            game_id BIGINT REFERENCES games(id),
            amount INT NOT NULL,
            reason VARCHAR(32) NOT NULL,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS rake_ledger (
            id BIGSERIAL PRIMARY KEY,
            game_id BIGINT REFERENCES games(id),
            amount INT NOT NULL,
            stake INT NOT NULL,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS referrals (
            id BIGSERIAL PRIMARY KEY,
            referrer_id BIGINT REFERENCES users(id),
            referred_id BIGINT REFERENCES users(id),
            bonus_paid BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS promo_codes (
            id BIGSERIAL PRIMARY KEY,
            code VARCHAR(32) UNIQUE NOT NULL,
            tokens INT NOT NULL,
            max_uses INT,
            used_count INT NOT NULL DEFAULT 0,
            per_user_limit INT NOT NULL DEFAULT 1,
            starts_at TIMESTAMP,
            expires_at TIMESTAMP,
            is_active BOOLEAN NOT NULL DEFAULT true,
            note TEXT,
            created_by BIGINT REFERENCES users(id),
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS promo_redemptions (
            id BIGSERIAL PRIMARY KEY,
            promo_id BIGINT REFERENCES promo_codes(id),
            user_id BIGINT REFERENCES users(id),
            created_at TIMESTAMP DEFAULT now(),
            UNIQUE (promo_id, user_id)
          );

          CREATE TABLE IF NOT EXISTS gifts (
            id BIGSERIAL PRIMARY KEY,
            admin_id BIGINT REFERENCES users(id),
            target_type VARCHAR(16) NOT NULL,
            amount_per_user INT NOT NULL,
            recipients_count INT,
            note TEXT NOT NULL,
            bot_message TEXT,
            status VARCHAR(16) NOT NULL,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS star_packs (
            id BIGSERIAL PRIMARY KEY,
            title VARCHAR(32) NOT NULL,
            tokens INT NOT NULL,
            stars_price INT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            sort_order INT DEFAULT 0,
            badge VARCHAR(16)
          );

          CREATE TABLE IF NOT EXISTS star_payments (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT REFERENCES users(id),
            pack_id BIGINT REFERENCES star_packs(id),
            stars_amount INT NOT NULL,
            tokens_granted INT NOT NULL,
            telegram_payment_charge_id TEXT UNIQUE NOT NULL,
            status VARCHAR(16) NOT NULL DEFAULT 'paid',
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS admin_audit_log (
            id BIGSERIAL PRIMARY KEY,
            admin_id BIGINT REFERENCES users(id),
            action VARCHAR(48) NOT NULL,
            target_user_id BIGINT,
            details JSONB,
            created_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(64) PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT now()
          );

          CREATE TABLE IF NOT EXISTS system_state (
            id VARCHAR(32) PRIMARY KEY,
            state JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT now()
          );
        `);

        // Load or seed persistent state from Supabase / PostgreSQL
        const stateRes = await client.query(`SELECT state FROM system_state WHERE id = 'xoxo_main' LIMIT 1`);
        if (stateRes.rows.length > 0 && stateRes.rows[0].state) {
          this.memoryData = this.ensureSchemaDefaults(stateRes.rows[0].state);
          console.log(`[DB] Successfully loaded state from Supabase / PostgreSQL (${this.memoryData.users.length} users, ${this.memoryData.games.length} games)`);
          this.saveToFile(this.memoryData, false);
        } else {
          await client.query(
            `INSERT INTO system_state (id, state, updated_at) VALUES ('xoxo_main', $1, now()) 
             ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`,
            [JSON.stringify(this.memoryData)]
          );
          console.log('[DB] Initial state seeded to Supabase / PostgreSQL system_state');
        }

        client.release();
        console.log('[DB] PostgreSQL / Supabase schema initialized successfully');
      } catch (err) {
        console.error('[DB] Postgres connection error, switching to persistent local store:', err);
        this.isPostgres = false;
      }
    }
  }

  // ================= USERS =================
  public async findUserById(id: number): Promise<User | null> {
    const user = this.memoryData.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  public async findUserByTelegramId(telegramId: number): Promise<User | null> {
    const user = this.memoryData.users.find(u => Number(u.telegram_id) === Number(telegramId));
    return user ? { ...user } : null;
  }

  public async findUserByNickname(nickname: string): Promise<User | null> {
    const lower = nickname.trim().toLowerCase();
    const user = this.memoryData.users.find(u => u.nickname.toLowerCase() === lower);
    return user ? { ...user } : null;
  }

  public generateUniqueUserId(): number {
    let id = Math.floor(10000000 + Math.random() * 90000000);
    while (this.memoryData.users.some(u => u.id === id)) {
      id = Math.floor(10000000 + Math.random() * 90000000);
    }
    return id;
  }

  public async createUser(telegramId: number, nickname: string, avatarUrl: string, referredBy?: number): Promise<User> {
    const now = new Date().toISOString();
    const id = this.generateUniqueUserId();
    
    // Check if this user is the configured super_admin
    const isSuperAdmin = config.superAdminTelegramId && Number(telegramId) === Number(config.superAdminTelegramId);
    const role: UserRole = isSuperAdmin ? 'super_admin' : 'user';

    const user: User = {
      id,
      telegram_id: Number(telegramId),
      nickname,
      avatar_url: avatarUrl,
      token_balance: this.memoryData.settings.initial_tokens || config.initialTokens,
      referred_by: referredBy || null,
      team_id: null,
      wins: 0,
      losses: 0,
      draws: 0,
      role,
      is_blocked: false,
      blocked_reason: null,
      blocked_until: null,
      created_at: now,
    };
    this.memoryData.users.push(user);

    // Record welcome bonus transaction
    await this.recordTransaction(id, user.token_balance, 'signup_bonus');

    // Handle referral
    if (referredBy) {
      const refId = this.memoryData.nextIds.referrals++;
      this.memoryData.referrals.push({
        id: refId,
        referrer_id: referredBy,
        referred_id: id,
        bonus_paid: true,
        created_at: now,
      });

      const refBonus = this.memoryData.settings.referral_bonus || config.referralBonus;
      // Credit bonus to referrer
      await this.updateUserBalance(referredBy, refBonus, 'referral_bonus');
    }

    this.saveToFile();
    return { ...user };
  }

  public async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    const user = this.memoryData.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    this.saveToFile();
    return { ...user };
  }

  public async updateUserBalance(userId: number, delta: number, reason: TransactionReason, gameId?: number): Promise<number> {
    const user = this.memoryData.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    // Strict atomic balance enforcement against overdraft / double-spend attacks:
    if (delta < 0 && reason !== 'stars_refund' && (user.token_balance + delta < 0)) {
      throw new Error('ERR_INSUFFICIENT_FUNDS');
    }

    user.token_balance += delta;
    // Allow negative balance only for refund cases if requested, otherwise clamp to 0
    if (reason !== 'stars_refund' && user.token_balance < 0) {
      user.token_balance = 0;
    }
    await this.recordTransaction(userId, delta, reason, gameId);
    this.saveToFile();
    return user.token_balance;
  }

  public async recordTransaction(userId: number, amount: number, reason: TransactionReason, gameId?: number): Promise<Transaction> {
    const id = this.memoryData.nextIds.transactions++;
    const tx: Transaction = {
      id,
      user_id: userId,
      game_id: gameId || null,
      amount,
      reason,
      created_at: new Date().toISOString(),
    };
    this.memoryData.transactions.push(tx);
    this.saveToFile();
    return { ...tx };
  }

  public async getUserTransactions(userId: number, limit = 20): Promise<Transaction[]> {
    return this.memoryData.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // ================= RAKE & COMMISSION LEDGER =================
  public async recordRake(gameId: number | null, amount: number, stake: number): Promise<RakeLedgerRecord> {
    const id = this.memoryData.nextIds.rake_ledger++;
    const record: RakeLedgerRecord = {
      id,
      game_id: gameId || null,
      amount,
      stake,
      created_at: new Date().toISOString(),
    };
    this.memoryData.rake_ledger.push(record);
    this.saveToFile();
    return { ...record };
  }

  public async getRakeStats() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allRakes = this.memoryData.rake_ledger || [];
    const totalRake = allRakes.reduce((sum, r) => sum + r.amount, 0);
    const todayRake = allRakes.filter(r => r.created_at.startsWith(todayStr)).reduce((sum, r) => sum + r.amount, 0);
    const weekRake = allRakes.filter(r => new Date(r.created_at) >= sevenDaysAgo).reduce((sum, r) => sum + r.amount, 0);
    const monthRake = allRakes.filter(r => new Date(r.created_at) >= thirtyDaysAgo).reduce((sum, r) => sum + r.amount, 0);

    // Distribution by stake levels (2, 4, 6, 10)
    const stakes = [2, 4, 6, 10];
    const byStake = stakes.map(stk => {
      const ofStake = allRakes.filter(r => r.stake === stk);
      return {
        stake: stk,
        count: ofStake.length,
        totalRake: ofStake.reduce((s, r) => s + r.amount, 0),
      };
    });

    // 30-day daily breakdown
    const dailyRake: Array<{ date: string; rake: number; gamesCount: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const recordsOnDay = allRakes.filter(r => r.created_at.startsWith(dStr));
      dailyRake.push({
        date: dStr.slice(5), // 'MM-DD'
        rake: recordsOnDay.reduce((s, r) => s + r.amount, 0),
        gamesCount: recordsOnDay.length,
      });
    }

    return {
      totalRake,
      todayRake,
      weekRake,
      monthRake,
      byStake,
      dailyRake,
    };
  }

  // ================= ADMIN & USER MANAGEMENT =================
  public async blockUser(targetUserId: number, adminId: number, reason: string, blockedUntil: string | null = null): Promise<{ success: boolean; error?: string }> {
    const target = this.memoryData.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Foydalanuvchi topilmadi' };

    const admin = this.memoryData.users.find(u => u.id === adminId);
    if (!admin) return { success: false, error: 'Admin topilmadi' };

    // Cannot block super_admin under any circumstances
    if (target.role === 'super_admin') {
      return { success: false, error: 'Super Adminni bloklash mumkin emas!' };
    }

    // Admins cannot block other admins; only super_admin can block an admin
    if (target.role === 'admin' && admin.role !== 'super_admin') {
      return { success: false, error: 'Admin faqat Super Admin tomonidan bloklanishi mumkin!' };
    }

    target.is_blocked = true;
    target.blocked_reason = reason;
    target.blocked_until = blockedUntil;

    await this.recordAudit(adminId, 'block_user', targetUserId, { reason, blockedUntil });
    this.saveToFile();
    return { success: true };
  }

  public async unblockUser(targetUserId: number, adminId: number): Promise<{ success: boolean; error?: string }> {
    const target = this.memoryData.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Foydalanuvchi topilmadi' };

    const admin = this.memoryData.users.find(u => u.id === adminId);
    if (target.role === 'admin' && admin && admin.role !== 'super_admin') {
      return { success: false, error: 'Admin faqat Super Admin tomonidan blokdan chiqarilishi mumkin!' };
    }

    target.is_blocked = false;
    target.blocked_reason = null;
    target.blocked_until = null;

    await this.recordAudit(adminId, 'unblock_user', targetUserId, {});
    this.saveToFile();
    return { success: true };
  }

  public async setAdminRole(targetUserId: number, adminId: number, newRole: 'admin' | 'user'): Promise<{ success: boolean; error?: string }> {
    const admin = this.memoryData.users.find(u => u.id === adminId);
    if (!admin || admin.role !== 'super_admin') {
      return { success: false, error: 'Faqat Super Admin adminlarni tayinlashi yoki olib tashlashi mumkin!' };
    }

    const target = this.memoryData.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Foydalanuvchi topilmadi' };

    if (target.role === 'super_admin') {
      return { success: false, error: 'Super Admin rolini o‘zgartirib bo‘lmaydi!' };
    }

    const prevRole = target.role;
    target.role = newRole;

    await this.recordAudit(adminId, newRole === 'admin' ? 'promote_admin' : 'demote_admin', targetUserId, { prevRole, newRole });
    this.saveToFile();
    return { success: true };
  }

  public async adjustUserBalance(targetUserId: number, adminId: number, delta: number, reason: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    const target = this.memoryData.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Foydalanuvchi topilmadi' };

    if (!reason || !reason.trim()) {
      return { success: false, error: 'Balansni o‘zgartirish uchun sabab ko‘rsatilishi shart!' };
    }

    const newBalance = await this.updateUserBalance(targetUserId, delta, 'admin_manual');
    await this.recordAudit(adminId, 'adjust_balance', targetUserId, { delta, reason, newBalance });
    
    // Send celebratory notification if delta > 0
    if (delta > 0) {
      await this.addCelebratoryNotification({
        userId: targetUserId,
        senderName: 'XOXO Bot',
        type: 'admin_gift',
        amount: delta,
        message: `Sizga XOXO botdan ${delta} ta tosh sovg'a qilindi!`,
      });
    }

    return { success: true, newBalance };
  }

  public async changeUserId(targetUserId: number, newId: number, adminId: number): Promise<{ success: boolean; error?: string }> {
    const target = this.memoryData.users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Foydalanuvchi topilmadi' };

    if (!newId || isNaN(newId) || newId <= 0) {
      return { success: false, error: 'Yaroqsiz ID kiritildi' };
    }

    if (newId === targetUserId) {
      return { success: true };
    }

    const is3Digit = newId >= 100 && newId <= 999;
    const is8Digit = newId >= 10000000 && newId <= 99999999;

    if (!is3Digit && !is8Digit) {
      return { success: false, error: 'ID faqat 3 xonali (masalan: 777) yoki 8 xonali tasodifiy raqam bo‘lishi shart!' };
    }

    if (is3Digit) {
      // Check current 3-digit ID users limit (max 2)
      const current3DigitUsers = this.memoryData.users.filter(u => u.id >= 100 && u.id <= 999 && u.id !== targetUserId);
      if (current3DigitUsers.length >= 2) {
        return { success: false, error: 'Maksimal 2 ta foydalanuvchiga 3 xonali ID berish mumkin!' };
      }
    }

    // Check unique ID
    const existing = this.memoryData.users.find(u => u.id === newId);
    if (existing) {
      return { success: false, error: `Ushbu ID (${newId}) allaqachon boshqa foydalanuvchi tomonidan band qilingan!` };
    }

    const oldId = target.id;
    target.id = newId;
    this.updateUserReferencesInSchema(this.memoryData, oldId, newId);

    await this.recordAudit(adminId, 'change_user_id', newId, { oldId, newId });
    this.saveToFile();
    return { success: true };
  }

  public async getAdminUsersList(options: {
    search?: string;
    filter?: 'all' | 'active' | 'blocked' | 'admins';
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    let list = [...this.memoryData.users];

    // Filter
    if (options.filter === 'active') {
      list = list.filter(u => !u.is_blocked);
    } else if (options.filter === 'blocked') {
      list = list.filter(u => u.is_blocked);
    } else if (options.filter === 'admins') {
      list = list.filter(u => u.role === 'admin' || u.role === 'super_admin');
    }

    // Search (safe against nulls, support nickname, telegram_id, id, username)
    if (options.search && options.search.trim()) {
      const rawQ = options.search.trim().toLowerCase();
      const cleanQ = rawQ.startsWith('@') ? rawQ.slice(1) : rawQ;
      list = list.filter(u => {
        const nick = (u.nickname || '').toLowerCase();
        const username = ((u as any).username || '').toLowerCase();
        const tgId = String(u.telegram_id || '');
        const id = String(u.id || '');
        return (
          nick.includes(rawQ) ||
          nick.includes(cleanQ) ||
          username.includes(rawQ) ||
          username.includes(cleanQ) ||
          tgId.includes(cleanQ) ||
          id.includes(cleanQ)
        );
      });
    }

    const total = list.length;
    const sorted = list.sort((a, b) => b.id - a.id);
    const paginated = sorted.slice((page - 1) * limit, page * limit);

    return {
      users: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getAdminsList(): Promise<User[]> {
    return this.memoryData.users.filter(u => u.role === 'admin' || u.role === 'super_admin');
  }

  // ================= PROMO CODES =================
  public async createPromoCode(data: {
    code: string;
    tokens: number;
    max_uses: number | null;
    per_user_limit?: number;
    starts_at?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
    note?: string | null;
    created_by: number;
  }): Promise<{ success: boolean; promo?: PromoCode; error?: string }> {
    const cleanCode = data.code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Promokod kiritilishi shart' };

    const existing = this.memoryData.promo_codes.find(p => p.code === cleanCode);
    if (existing) return { success: false, error: 'Bunday nomli promokod allaqachon mavjud' };

    const id = this.memoryData.nextIds.promo_codes++;
    const promo: PromoCode = {
      id,
      code: cleanCode,
      tokens: data.tokens,
      max_uses: data.max_uses ?? null,
      used_count: 0,
      per_user_limit: data.per_user_limit ?? 1,
      starts_at: data.starts_at || null,
      expires_at: data.expires_at || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      note: data.note || null,
      created_by: data.created_by,
      created_at: new Date().toISOString(),
    };

    this.memoryData.promo_codes.push(promo);
    await this.recordAudit(data.created_by, 'create_promo', null, { code: cleanCode, tokens: data.tokens });
    this.saveToFile();
    return { success: true, promo };
  }

  public async getAllPromoCodes(): Promise<PromoCode[]> {
    return [...this.memoryData.promo_codes].sort((a, b) => b.id - a.id);
  }

  public async updatePromoCode(id: number, adminId: number, data: Partial<PromoCode>): Promise<{ success: boolean; promo?: PromoCode; error?: string }> {
    const promo = this.memoryData.promo_codes.find(p => p.id === id);
    if (!promo) return { success: false, error: 'Promokod topilmadi' };

    Object.assign(promo, data);
    await this.recordAudit(adminId, 'update_promo', null, { id, updates: data });
    this.saveToFile();
    return { success: true, promo };
  }

  public async deletePromoCode(id: number, adminId: number): Promise<{ success: boolean; error?: string }> {
    const index = this.memoryData.promo_codes.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'Promokod topilmadi' };

    const code = this.memoryData.promo_codes[index].code;
    this.memoryData.promo_codes.splice(index, 1);
    await this.recordAudit(adminId, 'delete_promo', null, { id, code });
    this.saveToFile();
    return { success: true };
  }

  public async redeemPromoCode(userId: number, inputCode: string): Promise<{ success: boolean; tokens?: number; newBalance?: number; error?: string; errorCode?: string }> {
    const cleanCode = inputCode.trim().toUpperCase();
    const promo = this.memoryData.promo_codes.find(p => p.code === cleanCode);
    if (!promo) {
      return { success: false, error: 'Bunday promokod mavjud emas', errorCode: 'not_found' };
    }

    if (!promo.is_active) {
      return { success: false, error: 'Ushbu promokod faol emas', errorCode: 'inactive' };
    }

    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return { success: false, error: 'Promokod hali kuchga kirmagan', errorCode: 'not_started' };
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return { success: false, error: 'Promokodning amal qilish muddati tugagan', errorCode: 'expired' };
    }

    // Check global usage limit
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return { success: false, error: 'Ushbu promokoddan foydalanish limiti tugagan', errorCode: 'max_uses' };
    }

    // Check user usage limit (atomic check)
    const userUses = this.memoryData.promo_redemptions.filter(r => r.promo_id === promo.id && r.user_id === userId).length;
    if (userUses >= promo.per_user_limit) {
      return { success: false, error: 'Siz bu promokoddan allaqachon foydalangansiz', errorCode: 'already_used' };
    }

    // Atomic execution (Race-condition safe in Node single-thread event loop for in-memory / row-level lock)
    promo.used_count++;

    const redId = this.memoryData.nextIds.promo_redemptions++;
    this.memoryData.promo_redemptions.push({
      id: redId,
      promo_id: promo.id,
      user_id: userId,
      created_at: now.toISOString(),
    });

    const newBalance = await this.updateUserBalance(userId, promo.tokens, 'promo_code');
    this.saveToFile();

    return {
      success: true,
      tokens: promo.tokens,
      newBalance,
    };
  }

  // ================= GIFTS / AIRDROP =================
  public async createGift(data: {
    admin_id: number;
    target_type: 'single' | 'list' | 'all' | 'segment';
    amount_per_user: number;
    recipients_count: number;
    note: string;
    bot_message?: string | null;
  }): Promise<Gift> {
    const id = this.memoryData.nextIds.gifts++;
    const gift: Gift = {
      id,
      admin_id: data.admin_id,
      target_type: data.target_type,
      amount_per_user: data.amount_per_user,
      recipients_count: data.recipients_count,
      note: data.note,
      bot_message: data.bot_message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.memoryData.gifts.push(gift);
    await this.recordAudit(data.admin_id, 'create_gift_airdrop', null, { ...data, giftId: id });
    this.saveToFile();
    return { ...gift };
  }

  public async updateGiftStatus(giftId: number, status: 'running' | 'done' | 'failed') {
    const gift = this.memoryData.gifts.find(g => g.id === giftId);
    if (gift) {
      gift.status = status;
      this.saveToFile();
    }
  }

  public async getAllGifts(): Promise<Gift[]> {
    return [...this.memoryData.gifts].sort((a, b) => b.id - a.id);
  }

  public async getAdminTodayGiftedTokens(adminId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const todayGifts = this.memoryData.gifts.filter(g => g.admin_id === adminId && g.created_at.startsWith(today) && g.status !== 'failed');
    return todayGifts.reduce((sum, g) => sum + (g.amount_per_user * g.recipients_count), 0);
  }

  // ================= STARS PAYMENTS & PACKS =================
  public async getStarPacks(activeOnly = true): Promise<StarPack[]> {
    let packs = [...this.memoryData.star_packs];
    if (activeOnly) {
      packs = packs.filter(p => p.is_active);
    }
    return packs.sort((a, b) => a.sort_order - b.sort_order);
  }

  public async getStarPackById(id: number): Promise<StarPack | null> {
    const p = this.memoryData.star_packs.find(x => x.id === id);
    return p ? { ...p } : null;
  }

  public async updateStarPack(id: number, adminId: number, data: Partial<StarPack>): Promise<{ success: boolean; error?: string }> {
    const pack = this.memoryData.star_packs.find(p => p.id === id);
    if (!pack) return { success: false, error: 'Paket topilmadi' };
    Object.assign(pack, data);
    await this.recordAudit(adminId, 'update_star_pack', null, { id, updates: data });
    this.saveToFile();
    return { success: true };
  }

  public async recordStarPayment(
    userId: number,
    packId: number,
    starsAmount: number,
    tokensGranted: number,
    chargeId: string
  ): Promise<{ success: boolean; payment?: StarPayment; error?: string }> {
    // Idempotent: check if chargeId was already processed
    const existing = this.memoryData.star_payments.find(p => p.telegram_payment_charge_id === chargeId);
    if (existing) {
      return { success: true, payment: existing };
    }

    const id = this.memoryData.nextIds.star_payments++;
    const payment: StarPayment = {
      id,
      user_id: userId,
      pack_id: packId,
      stars_amount: starsAmount,
      tokens_granted: tokensGranted,
      telegram_payment_charge_id: chargeId,
      status: 'paid',
      created_at: new Date().toISOString(),
    };
    this.memoryData.star_payments.push(payment);

    // Credit tokens
    await this.updateUserBalance(userId, tokensGranted, 'stars_purchase');
    this.saveToFile();
    return { success: true, payment };
  }

  public async refundStarPayment(paymentId: number, adminId: number): Promise<{ success: boolean; error?: string }> {
    const payment = this.memoryData.star_payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, error: 'To‘lov topilmadi' };
    if (payment.status === 'refunded') return { success: false, error: 'To‘lov allaqachon qaytarilgan' };

    payment.status = 'refunded';
    // Deduct tokens
    await this.updateUserBalance(payment.user_id, -payment.tokens_granted, 'stars_refund');
    await this.recordAudit(adminId, 'refund_star_payment', payment.user_id, { paymentId, stars: payment.stars_amount, tokens: payment.tokens_granted });
    this.saveToFile();
    return { success: true };
  }

  public async getAllStarPayments(): Promise<any[]> {
    return this.memoryData.star_payments
      .sort((a, b) => b.id - a.id)
      .map(p => {
        const u = this.memoryData.users.find(user => user.id === p.user_id);
        const pack = this.memoryData.star_packs.find(pk => pk.id === p.pack_id);
        return {
          ...p,
          userNickname: u?.nickname || 'Unknown',
          userTelegramId: u?.telegram_id || 0,
          packTitle: pack?.title || 'Custom Pack',
        };
      });
  }

  // ================= AUDIT LOG =================
  public async recordAudit(adminId: number, action: string, targetUserId: number | null, details: any): Promise<AdminAuditLog> {
    const id = this.memoryData.nextIds.admin_audit_log++;
    const log: AdminAuditLog = {
      id,
      admin_id: adminId,
      action,
      target_user_id: targetUserId,
      details,
      created_at: new Date().toISOString(),
    };
    this.memoryData.admin_audit_log.push(log);
    this.saveToFile();
    return { ...log };
  }

  public async getAuditLogs(limit = 100, page = 1) {
    const sorted = [...this.memoryData.admin_audit_log].sort((a, b) => b.id - a.id);
    const total = sorted.length;
    const paginated = sorted.slice((page - 1) * limit, page * limit).map(l => {
      const admin = this.memoryData.users.find(u => u.id === l.admin_id);
      const target = l.target_user_id ? this.memoryData.users.find(u => u.id === l.target_user_id) : null;
      return {
        ...l,
        adminNickname: admin?.nickname || 'Admin',
        targetNickname: target?.nickname || null,
      };
    });
    return {
      logs: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ================= SETTINGS =================
  public async getSettings(): Promise<SystemSettings> {
    return { ...this.memoryData.settings };
  }

  public async updateSettings(adminId: number, newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    Object.assign(this.memoryData.settings, newSettings);
    await this.recordAudit(adminId, 'update_settings', null, newSettings);
    this.saveToFile();
    return { ...this.memoryData.settings };
  }

  // ================= GAMES =================
  public async createGameRecord(
    playerXId: number,
    playerOId: number | null,
    stake: number,
    board: string,
    isAiGame = false,
    aiLevel: 'easy' | 'medium' | 'hard' | 'expert' | null = null
  ): Promise<GameRecord> {
    const id = this.memoryData.nextIds.games++;
    const game: GameRecord = {
      id,
      player_x_id: playerXId,
      player_o_id: playerOId,
      stake,
      board,
      status: 'waiting',
      winner_id: null,
      is_ai_game: isAiGame,
      ai_level: aiLevel,
      created_at: new Date().toISOString(),
      finished_at: null,
    };
    this.memoryData.games.push(game);
    this.saveToFile();
    return { ...game };
  }

  // ================= AI OPPONENT STATS & SETTINGS =================
  public async getAILevelSettings(): Promise<AILevelSetting[]> {
    return [...this.memoryData.ai_level_settings];
  }

  public async getAILevelSetting(level: string): Promise<AILevelSetting | undefined> {
    return this.memoryData.ai_level_settings.find(s => s.level === level);
  }

  public async updateAILevelSetting(adminId: number, level: string, updates: Partial<AILevelSetting>): Promise<AILevelSetting | null> {
    const setting = this.memoryData.ai_level_settings.find(s => s.level === level);
    if (!setting) return null;
    Object.assign(setting, updates);
    await this.recordAudit(adminId, 'update_ai_level_setting', null, { level, updates });
    this.saveToFile();
    return { ...setting };
  }

  public async getUserAIStats(userId: number): Promise<AIStat[]> {
    return this.memoryData.ai_stats.filter(s => s.user_id === userId);
  }

  public async recordAIStat(userId: number, level: 'easy' | 'medium' | 'hard' | 'expert', result: 'win' | 'draw' | 'loss'): Promise<void> {
    let stat = this.memoryData.ai_stats.find(s => s.user_id === userId && s.level === level);
    if (!stat) {
      stat = {
        user_id: userId,
        level,
        wins: 0,
        draws: 0,
        losses: 0,
      };
      this.memoryData.ai_stats.push(stat);
    }
    if (result === 'win') stat.wins++;
    else if (result === 'draw') stat.draws++;
    else if (result === 'loss') stat.losses++;
    this.saveToFile();
  }

  public async getStonesWonFromAIToday(userId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const todayWins = this.memoryData.transactions.filter(
      t => t.user_id === userId && t.reason === 'ai_game_win' && t.created_at.startsWith(today)
    );
    let totalNetWon = 0;
    for (const t of todayWins) {
      let stake = 0;
      if (t.game_id) {
        const g = this.memoryData.games.find(gm => gm.id === t.game_id);
        if (g) stake = g.stake;
      }
      const net = Math.max(0, t.amount - stake);
      totalNetWon += net;
    }
    return totalNetWon;
  }

  public async updateGameRecord(id: number, data: Partial<GameRecord>): Promise<GameRecord | null> {
    const game = this.memoryData.games.find(g => g.id === id);
    if (!game) return null;
    Object.assign(game, data);
    this.saveToFile();
    return { ...game };
  }

  public async findGameById(id: number): Promise<GameRecord | null> {
    const game = this.memoryData.games.find(g => g.id === id);
    return game ? { ...game } : null;
  }

  public async getRecentGames(userId: number, limit = 10) {
    const userGames = this.memoryData.games
      .filter(g => g.player_x_id === userId || g.player_o_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return userGames.map(g => {
      const opponentId = g.player_x_id === userId ? g.player_o_id : g.player_x_id;
      const opponent = this.memoryData.users.find(u => u.id === opponentId);
      const isWinner = g.winner_id === userId;
      const isDraw = g.status === 'finished' && g.winner_id === null;

      const rakeEntry = this.memoryData.rake_ledger ? this.memoryData.rake_ledger.find(r => r.game_id === g.id) : null;
      const rake = !g.is_ai_game && isWinner ? (rakeEntry ? rakeEntry.amount : (this.memoryData.settings.rake_amount ?? 1)) : 0;
      const winTx = this.memoryData.transactions.find(tx => tx.game_id === g.id && tx.user_id === userId && (tx.reason === 'game_win' || tx.reason === 'ai_game_win'));
      const prize = isWinner ? (winTx ? winTx.amount : (g.is_ai_game ? g.stake * 2 : (g.stake * 2 - rake))) : 0;

      return {
        ...g,
        opponentNickname: opponent ? opponent.nickname : (g.is_ai_game ? 'AI Golem' : 'Unknown'),
        opponentAvatar: opponent ? opponent.avatar_url : (g.is_ai_game ? 'ninja' : 'avatar_1'),
        result: isDraw ? 'draw' : isWinner ? 'win' : 'loss',
        prize,
        rake,
      };
    });
  }

  // ================= TEAMS =================
  public async createTeam(name: string, inviteCode: string, ownerId: number): Promise<Team> {
    const id = this.memoryData.nextIds.teams++;
    const team: Team = {
      id,
      name,
      invite_code: inviteCode,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
    };
    this.memoryData.teams.push(team);

    // Assign owner to team
    await this.updateUser(ownerId, { team_id: id });
    this.saveToFile();
    return { ...team };
  }

  public async findTeamById(id: number): Promise<Team | null> {
    const team = this.memoryData.teams.find(t => t.id === id);
    return team ? { ...team } : null;
  }

  public async findTeamByInviteCode(code: string): Promise<Team | null> {
    const team = this.memoryData.teams.find(t => t.invite_code.toUpperCase() === code.trim().toUpperCase());
    return team ? { ...team } : null;
  }

  public async findTeamByName(name: string): Promise<Team | null> {
    const lower = name.trim().toLowerCase();
    const team = this.memoryData.teams.find(t => t.name.toLowerCase() === lower);
    return team ? { ...team } : null;
  }

  public async getTeamMembers(teamId: number): Promise<User[]> {
    return this.memoryData.users.filter(u => u.team_id === teamId);
  }

  public async joinTeam(userId: number, teamId: number): Promise<boolean> {
    const team = await this.findTeamById(teamId);
    if (!team) return false;
    await this.updateUser(userId, { team_id: teamId });
    return true;
  }

  public async leaveTeam(userId: number): Promise<boolean> {
    await this.updateUser(userId, { team_id: null });
    return true;
  }

  // ================= LEADERBOARD =================
  private isBotUser(u: any): boolean {
    if (!u) return true;
    if (u.is_bot) return true;
    if (!u.telegram_id || Number(u.telegram_id) <= 1000) return true;
    const nick = (u.nickname || '').trim().toLowerCase();
    if (!nick) return true;
    if (nick === 'pebble' || nick === 'rocky' || nick === 'granite' || nick === 'obsidian') return true;
    if (
      nick.startsWith('ai_') ||
      nick.startsWith('aitester') ||
      nick.startsWith('e2e_') ||
      nick.startsWith('res_') ||
      nick.startsWith('resa_') ||
      nick.startsWith('resb_') ||
      nick.startsWith('resai_') ||
      nick.startsWith('raketester') ||
      nick.startsWith('drawtester') ||
      nick.startsWith('surrenderp') ||
      nick.startsWith('dyntester')
    ) {
      return true;
    }
    return false;
  }

  public async getIndividualLeaderboard(period: 'all' | 'monthly' | 'weekly' = 'all', limit = 100) {
    // Filter out blocked users and bots (only real human players appear)
    const validUsers = this.memoryData.users.filter(u => !u.is_blocked && !this.isBotUser(u));

    const usersWithStats = validUsers.map(u => {
      const userGifts = this.memoryData.user_collectible_gifts.filter(g => g.user_id === u.id);
      const totalGiftValue = userGifts.reduce((sum, g) => sum + (g.token_price || 0), 0);
      return {
        ...u,
        totalGiftValue,
        giftCount: userGifts.length,
      };
    });

    usersWithStats.sort((a, b) => {
      if (b.totalGiftValue !== a.totalGiftValue) {
        return b.totalGiftValue - a.totalGiftValue;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.token_balance - a.token_balance;
    });

    return usersWithStats.slice(0, limit).map((u, index) => {
      const totalGames = u.wins + u.losses + u.draws;
      const winRate = totalGames > 0 ? Math.round((u.wins / totalGames) * 100) : 0;
      const team = u.team_id ? this.memoryData.teams.find(t => t.id === u.team_id) : null;
      return {
        rank: index + 1,
        id: u.id,
        nickname: u.nickname,
        avatar_url: u.avatar_url,
        token_balance: u.token_balance,
        total_gift_value: u.totalGiftValue,
        gift_count: u.giftCount,
        wins: u.wins,
        losses: u.losses,
        draws: u.draws,
        winRate,
        team_name: team ? team.name : null,
      };
    });
  }

  public async getUserRank(userId: number): Promise<number> {
    const validUsers = this.memoryData.users.filter(u => !u.is_blocked && !this.isBotUser(u));
    const usersWithStats = validUsers.map(u => {
      const userGifts = this.memoryData.user_collectible_gifts.filter(g => g.user_id === u.id);
      const totalGiftValue = userGifts.reduce((sum, g) => sum + (g.token_price || 0), 0);
      return {
        id: u.id,
        wins: u.wins,
        token_balance: u.token_balance,
        totalGiftValue,
      };
    });
    usersWithStats.sort((a, b) => {
      if (b.totalGiftValue !== a.totalGiftValue) {
        return b.totalGiftValue - a.totalGiftValue;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.token_balance - a.token_balance;
    });
    const index = usersWithStats.findIndex(u => u.id === userId);
    return index >= 0 ? index + 1 : 999;
  }

  public async getTeamLeaderboard(limit = 100) {
    const teamsWithStats = this.memoryData.teams.map(team => {
      const members = this.memoryData.users.filter(u => u.team_id === team.id && !u.is_blocked);
      const totalWins = members.reduce((sum, m) => sum + (m.wins || 0), 0);
      const totalTokens = members.reduce((sum, m) => sum + (m.token_balance || 0), 0);
      return {
        id: team.id,
        name: team.name,
        invite_code: team.invite_code,
        member_count: members.length,
        total_wins: totalWins,
        total_tokens: totalTokens,
      };
    });

    teamsWithStats.sort((a, b) => {
      if (b.total_tokens !== a.total_tokens) {
        return b.total_tokens - a.total_tokens;
      }
      return b.total_wins - a.total_wins;
    });

    return teamsWithStats.slice(0, limit).map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));
  }

  // ================= REFERRALS & BONUSES =================
  public async getReferralStats(userId: number) {
    const refs = this.memoryData.referrals.filter(r => r.referrer_id === userId);
    const referredUsers = refs.map(r => this.memoryData.users.find(u => u.id === r.referred_id)).filter(Boolean) as User[];
    
    const activeCount = referredUsers.filter(u => (u.wins + u.losses + u.draws) > 0).length;
    const refBonus = this.memoryData.settings.referral_bonus || config.referralBonus;
    const totalEarned = refs.length * refBonus;

    return {
      totalInvited: refs.length,
      activeInvited: activeCount,
      totalEarned,
      referrals: referredUsers.map(u => ({
        id: u.id,
        nickname: u.nickname,
        avatar_url: u.avatar_url,
        joined_at: u.created_at,
        games_played: u.wins + u.losses + u.draws,
      })),
    };
  }


  // ================= ADMIN DASHBOARD STATS =================
  public async getAdminDashboardStats() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const totalUsers = this.memoryData.users.length;
    const todayNewUsers = this.memoryData.users.filter(u => u.created_at.startsWith(todayStr)).length;
    const todayMatches = this.memoryData.games.filter(g => g.created_at.startsWith(todayStr)).length;
    const totalMatches = this.memoryData.games.length;

    const totalCirculatingTokens = this.memoryData.users.reduce((sum, u) => sum + u.token_balance, 0);

    const todayTransactions = this.memoryData.transactions.filter(t => t.created_at.startsWith(todayStr));
    const todayTokensGranted = todayTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const todayTokensSpent = todayTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Stars revenue
    const allPaidStars = this.memoryData.star_payments.filter(p => p.status === 'paid');
    const totalStarsRevenue = allPaidStars.reduce((sum, p) => sum + p.stars_amount, 0);
    const totalPacksSold = allPaidStars.length;

    // Today stars
    const todayStarsRevenue = allPaidStars
      .filter(p => p.created_at.startsWith(todayStr))
      .reduce((sum, p) => sum + p.stars_amount, 0);

    // Week stars (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStarsRevenue = allPaidStars
      .filter(p => new Date(p.created_at) >= sevenDaysAgo)
      .reduce((sum, p) => sum + p.stars_amount, 0);

    // Month stars (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthStarsRevenue = allPaidStars
      .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.stars_amount, 0);

    // 30-day historical chart data
    const dailyStats: Array<{ date: string; users: number; games: number; stars: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];

      const usersCount = this.memoryData.users.filter(u => u.created_at.startsWith(dStr)).length;
      const gamesCount = this.memoryData.games.filter(g => g.created_at.startsWith(dStr)).length;
      const starsRevenue = allPaidStars.filter(p => p.created_at.startsWith(dStr)).reduce((s, p) => s + p.stars_amount, 0);

      dailyStats.push({
        date: dStr.slice(5), // 'MM-DD'
        users: usersCount,
        games: gamesCount,
        stars: starsRevenue,
      });
    }

    // Platform Rake Revenue
    const allRakes = this.memoryData.rake_ledger || [];
    const totalRake = allRakes.reduce((sum, r) => sum + r.amount, 0);
    const todayRake = allRakes.filter(r => r.created_at.startsWith(todayStr)).reduce((sum, r) => sum + r.amount, 0);

    return {
      totalUsers,
      todayNewUsers,
      todayMatches,
      totalMatches,
      totalCirculatingTokens,
      todayTokensGranted,
      todayTokensSpent,
      totalStarsRevenue,
      todayStarsRevenue,
      weekStarsRevenue,
      monthStarsRevenue,
      totalPacksSold,
      totalRake,
      todayRake,
      dailyStats,
    };
  }

  public async getAdminAIStats() {
    const aiGames = this.memoryData.games.filter(g => g.is_ai_game);
    const levels: Array<'easy' | 'medium' | 'hard' | 'expert'> = ['easy', 'medium', 'hard', 'expert'];
    
    let totalStonesLostToBank = 0;
    let totalStonesCreatedAsPrize = 0;

    const levelStats = levels.map(lvl => {
      const setting = this.memoryData.ai_level_settings.find(s => s.level === lvl);
      const gamesOfLevel = aiGames.filter(g => g.ai_level === lvl && g.status === 'finished');
      
      let humanWins = 0;
      let aiWins = 0;
      let draws = 0;

      for (const g of gamesOfLevel) {
        if (g.winner_id === g.player_x_id) {
          humanWins++;
          totalStonesCreatedAsPrize += (setting?.win_reward || 0);
        } else if (g.winner_id === null) {
          draws++;
        } else {
          aiWins++;
          totalStonesLostToBank += g.stake;
        }
      }

      const total = gamesOfLevel.length;
      return {
        level: lvl,
        setting,
        totalGames: total,
        humanWins,
        aiWins,
        draws,
        winRate: total > 0 ? ((humanWins / total) * 100).toFixed(1) : '0.0',
        aiWinRate: total > 0 ? ((aiWins / total) * 100).toFixed(1) : '0.0',
        drawRate: total > 0 ? ((draws / total) * 100).toFixed(1) : '0.0',
      };
    });

    return {
      totalAiGames: aiGames.length,
      totalStonesLostToBank,
      totalStonesCreatedAsPrize,
      netEconomyImpact: totalStonesCreatedAsPrize - totalStonesLostToBank,
      botMaxStonesWonPerDay: this.memoryData.settings.bot_max_stones_won_per_day || 30,
      botGamesCountToRating: !!this.memoryData.settings.bot_games_count_to_rating,
      levelStats,
    };
  }

  public async getGlobalStats() {
    const totalMatches = this.memoryData.games.length;
    const today = new Date().toISOString().split('T')[0];
    const todayMatches = this.memoryData.games.filter(g => g.created_at.startsWith(today)).length;
    const totalUsers = this.memoryData.users.length;
    return {
      totalMatches,
      todayMatches,
      totalUsers,
    };
  }

  // ================= DAILY BONUS =================
  public async getDailyBonusStatus(userId: number) {
    const claims = this.memoryData.daily_bonus_claims
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime());
    
    const lastClaim = claims[0];
    const bonusAmount = this.memoryData.settings.daily_bonus || 5;

    if (!lastClaim) {
      return { ready: true, nextClaimInSeconds: 0, bonusAmount };
    }

    const lastTime = new Date(lastClaim.claimed_at).getTime();
    const nowTime = Date.now();
    const diffSeconds = Math.floor((nowTime - lastTime) / 1000);
    const cooldownSeconds = 24 * 3600;

    if (diffSeconds >= cooldownSeconds) {
      return { ready: true, nextClaimInSeconds: 0, bonusAmount };
    } else {
      return {
        ready: false,
        nextClaimInSeconds: cooldownSeconds - diffSeconds,
        bonusAmount,
        lastClaimedAt: lastClaim.claimed_at,
      };
    }
  }

  public async claimDailyBonus(userId: number) {
    const status = await this.getDailyBonusStatus(userId);
    if (!status.ready) {
      throw new Error(`Daily bonus not ready yet.`);
    }

    const now = new Date().toISOString();
    const claimId = this.memoryData.nextIds.daily_bonus_claims++;
    this.memoryData.daily_bonus_claims.push({
      id: claimId,
      user_id: userId,
      claimed_at: now,
    });

    const newBalance = await this.updateUserBalance(userId, status.bonusAmount, 'daily_bonus');
    this.saveToFile();
    return {
      success: true,
      bonusAmount: status.bonusAmount,
      newBalance,
      nextClaimInSeconds: 24 * 3600,
    };
  }

  // ================= FRIEND REQUESTS & FRIENDS =================
  public async sendFriendRequest(senderId: number, targetQuery: string | number): Promise<{ success: boolean; message: string; request?: FriendRequest }> {
    const qStr = String(targetQuery).trim().toLowerCase();
    const target = this.memoryData.users.find(u => 
      String(u.id) === qStr || 
      String(u.telegram_id) === qStr || 
      u.nickname.toLowerCase() === qStr
    );

    if (!target) {
      throw new Error("Bunday ID yoki Nickname li foydalanuvchi topilmadi!");
    }
    if (senderId === target.id) {
      throw new Error("O'zingizga do'stlik so'rovi yubora olmaysiz!");
    }

    const isFriend = this.memoryData.friends.some(f => f.user_id === senderId && f.friend_id === target.id);
    if (isFriend) {
      throw new Error("Ushbu foydalanuvchi allaqachon do'stlaringiz ro'yxatida!");
    }

    const existing = (this.memoryData.friend_requests || []).find(r => 
      (r.sender_id === senderId && r.recipient_id === target.id) ||
      (r.sender_id === target.id && r.recipient_id === senderId)
    );

    if (existing) {
      if (existing.status === 'pending') {
        throw new Error("Do'stlik so'rovi allaqachon yuborilgan!");
      } else if (existing.status === 'accepted') {
        throw new Error("Siz allaqachon do'stsiz!");
      }
    }

    const now = new Date().toISOString();
    const id = (this.memoryData.nextIds.friend_requests = (this.memoryData.nextIds.friend_requests || 0) + 1);
    const req: FriendRequest = {
      id,
      sender_id: senderId,
      recipient_id: target.id,
      status: 'pending',
      created_at: now,
    };

    if (!this.memoryData.friend_requests) this.memoryData.friend_requests = [];
    this.memoryData.friend_requests.push(req);
    this.saveToFile();

    return { success: true, message: `Do'stlik so'rovi ${target.nickname} ga yuborildi!`, request: req };
  }

  public async respondFriendRequest(userId: number, requestId: number, action: 'accept' | 'decline'): Promise<{ success: boolean; message: string }> {
    if (!this.memoryData.friend_requests) throw new Error("So'rovlar mavjud emas!");
    const req = this.memoryData.friend_requests.find(r => r.id === requestId && r.recipient_id === userId);
    if (!req) {
      throw new Error("So'rov topilmadi!");
    }
    if (req.status !== 'pending') {
      throw new Error("So'rov allaqachon ko'rib chiqilgan!");
    }

    const now = new Date().toISOString();
    if (action === 'accept') {
      req.status = 'accepted';
      
      const id1 = this.memoryData.nextIds.friends++;
      this.memoryData.friends.push({ id: id1, user_id: req.sender_id, friend_id: req.recipient_id, created_at: now });

      const id2 = this.memoryData.nextIds.friends++;
      this.memoryData.friends.push({ id: id2, user_id: req.recipient_id, friend_id: req.sender_id, created_at: now });

      this.saveToFile();
      return { success: true, message: "Do'stlik so'rovi qabul qilindi!" };
    } else {
      req.status = 'rejected';
      this.saveToFile();
      return { success: true, message: "So'rov rad etildi." };
    }
  }

  public async getFriends(userId: number) {
    const friendEntries = this.memoryData.friends.filter(f => f.user_id === userId);
    const friendUsers: any[] = [];
    for (const entry of friendEntries) {
      const friendObj = this.memoryData.users.find(u => u.id === entry.friend_id);
      if (friendObj && !friendObj.is_blocked) {
        const giftsCount = this.memoryData.user_collectible_gifts.filter(g => g.user_id === friendObj.id).length;
        friendUsers.push({
          id: friendObj.id,
          telegram_id: friendObj.telegram_id,
          nickname: friendObj.nickname,
          avatar_url: friendObj.avatar_url,
          wins: friendObj.wins,
          losses: friendObj.losses,
          draws: friendObj.draws,
          token_balance: friendObj.token_balance,
          gifts_count: giftsCount,
          added_at: entry.created_at,
        });
      }
    }
    return friendUsers;
  }

  public async getFriendsData(userId: number) {
    const friends = await this.getFriends(userId);
    const incomingReqs = (this.memoryData.friend_requests || [])
      .filter(r => r.recipient_id === userId && r.status === 'pending')
      .map(r => {
        const sender = this.memoryData.users.find(u => u.id === r.sender_id);
        return {
          id: r.id,
          sender: sender ? { id: sender.id, nickname: sender.nickname, avatar_url: sender.avatar_url, role: sender.role } : null,
          created_at: r.created_at,
        };
      })
      .filter(r => r.sender !== null);

    return { friends, pendingRequests: incomingReqs };
  }

  public async addFriend(userId: number, query: string | number) {
    return this.sendFriendRequest(userId, query);
  }

  // ================= CELEBRATORY NOTIFICATIONS =================
  public async addCelebratoryNotification(data: {
    userId: number;
    senderName: string;
    senderAvatar?: string;
    type: 'gift' | 'tokens' | 'admin_gift';
    giftTitle?: string;
    giftIcon?: string;
    amount?: number;
    message?: string;
  }): Promise<CelebratoryNotification> {
    const id = (this.memoryData.nextIds.celebratory_notifications = (this.memoryData.nextIds.celebratory_notifications || 0) + 1);
    const notif: CelebratoryNotification = {
      id,
      user_id: data.userId,
      sender_name: data.senderName,
      sender_avatar: data.senderAvatar,
      type: data.type,
      gift_title: data.giftTitle,
      gift_icon: data.giftIcon,
      amount: data.amount,
      message: data.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    if (!this.memoryData.celebratory_notifications) {
      this.memoryData.celebratory_notifications = [];
    }
    this.memoryData.celebratory_notifications.push(notif);
    this.saveToFile();
    return notif;
  }

  public async getUnreadCelebratoryNotifications(userId: number): Promise<CelebratoryNotification[]> {
    if (!this.memoryData.celebratory_notifications) return [];
    return this.memoryData.celebratory_notifications.filter(n => n.user_id === userId && !n.is_read);
  }

  public async markCelebratoryNotificationRead(userId: number, notifId: number): Promise<boolean> {
    if (!this.memoryData.celebratory_notifications) return false;
    const n = this.memoryData.celebratory_notifications.find(x => x.id === notifId && x.user_id === userId);
    if (!n) return false;
    n.is_read = true;
    this.saveToFile();
    return true;
  }

  // ================= TOKEN GIFTING (Strictly 10 or 25 tokens) =================
  public async giftTokens(senderId: number, recipientTargetId: number, amount: number) {
    if (amount !== 10 && amount !== 25) {
      throw new Error("Faqat 10 yoki 25 ta token yuborish mumkin!");
    }
    const recipient = this.memoryData.users.find(u => u.id === recipientTargetId || Number(u.telegram_id) === Number(recipientTargetId));
    if (!recipient) {
      throw new Error("Qabul qiluvchi foydalanuvchi topilmadi!");
    }
    if (senderId === recipient.id) {
      throw new Error("O'zingizga token yubora olmaysiz!");
    }
    const sender = this.memoryData.users.find(u => u.id === senderId);
    if (!sender) throw new Error("Yuboruvchi topilmadi");
    if (sender.token_balance < amount) {
      throw new Error("Balansingizda yetarli token mavjud emas!");
    }

    await this.updateUserBalance(senderId, -amount, 'token_gift_send');
    await this.updateUserBalance(recipient.id, amount, 'token_gift_receive');

    await this.addCelebratoryNotification({
      userId: recipient.id,
      senderName: sender.nickname,
      senderAvatar: sender.avatar_url,
      type: 'tokens',
      amount,
      message: `Sizga do'stingiz ${sender.nickname} ${amount} ta tosh sovg'a qildi!`,
    });

    this.saveToFile();
    return {
      sender_balance: sender.token_balance,
      recipient_nickname: recipient.nickname,
      amount,
    };
  }

  // ================= COLLECTIBLE GIFTS =================
  public async getCollectibleCatalog() {
    return DEFAULT_COLLECTIBLE_GIFTS;
  }

  public async getUserCollectibleGifts(userId: number) {
    return this.memoryData.user_collectible_gifts.filter(g => g.user_id === userId);
  }

  public async buyCollectibleGift(userId: number, giftCatalogId: string, recipientTargetId?: number) {
    const catalogItem = DEFAULT_COLLECTIBLE_GIFTS.find(g => g.id === giftCatalogId);
    if (!catalogItem || !catalogItem.is_active) {
      throw new Error("Sovg'a katalogda topilmadi!");
    }

    const buyer = this.memoryData.users.find(u => u.id === userId);
    if (!buyer) throw new Error("Foydalanuvchi topilmadi");
    if (buyer.token_balance < catalogItem.token_price) {
      throw new Error(`Balansingizda yetarli token mavjud emas! Narxi: ${catalogItem.token_price} Tosh`);
    }

    let recipientId = userId;
    if (recipientTargetId) {
      const recipient = this.memoryData.users.find(u => u.id === recipientTargetId || Number(u.telegram_id) === Number(recipientTargetId));
      if (recipient) {
        recipientId = recipient.id;
      }
    }

    await this.updateUserBalance(userId, -catalogItem.token_price, 'collectible_gift_buy');

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newGiftId = this.memoryData.nextIds.user_collectible_gifts++;

    const newGift: UserCollectibleGift = {
      id: newGiftId,
      user_id: recipientId,
      gift_catalog_id: catalogItem.id,
      title: catalogItem.title_uz,
      icon: catalogItem.icon,
      token_price: catalogItem.token_price,
      sell_price: catalogItem.sell_price,
      month_acquired: monthStr,
      acquired_at: now.toISOString(),
      can_sell: true,
    };

    this.memoryData.user_collectible_gifts.push(newGift);

    if (recipientId !== userId) {
      await this.addCelebratoryNotification({
        userId: recipientId,
        senderName: buyer.nickname,
        senderAvatar: buyer.avatar_url,
        type: 'gift',
        giftTitle: catalogItem.title_uz,
        giftIcon: catalogItem.icon,
        message: `Sizga do'stingiz ${buyer.nickname} sovg'a yubordi!`,
      });
    }

    this.saveToFile();

    return newGift;
  }

  public async sellCollectibleGift(userId: number, userGiftId: number) {
    const giftIdx = this.memoryData.user_collectible_gifts.findIndex(g => g.id === userGiftId && g.user_id === userId);
    if (giftIdx === -1) {
      throw new Error("Sovg'a topilmadi!");
    }
    const gift = this.memoryData.user_collectible_gifts[giftIdx];
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (gift.is_premium_reward) {
      throw new Error("Telegram Premium sovg'alarini sotib bo'lmaydi!");
    }
    if (gift.can_sell === false) {
      throw new Error("Ushbu sovg'ani sotib bo'lmaydi!");
    }

    this.memoryData.user_collectible_gifts.splice(giftIdx, 1);
    await this.updateUserBalance(userId, gift.sell_price, 'collectible_gift_sell');

    this.saveToFile();
    return { success: true, sellPrice: gift.sell_price };
  }

  public async giftCollectibleGift(senderId: number, userGiftId: number, recipientTargetId: number) {
    const gift = this.memoryData.user_collectible_gifts.find(g => g.id === userGiftId && g.user_id === senderId);
    if (!gift) throw new Error("Sovg'a topilmadi!");

    const sender = this.memoryData.users.find(u => u.id === senderId);
    const recipient = this.memoryData.users.find(u => u.id === recipientTargetId || Number(u.telegram_id) === Number(recipientTargetId));
    if (!recipient) throw new Error("Qabul qiluvchi topilmadi!");
    if (recipient.id === senderId) throw new Error("O'zingizga sovg'a qila olmaysiz!");

    gift.user_id = recipient.id;

    await this.addCelebratoryNotification({
      userId: recipient.id,
      senderName: sender?.nickname || 'Do\'stingiz',
      senderAvatar: sender?.avatar_url,
      type: 'gift',
      giftTitle: gift.title,
      giftIcon: gift.icon,
      message: `Sizga do'stingiz ${sender?.nickname || ''} sovg'a yubordi!`,
    });

    this.saveToFile();
    return { success: true, recipient: recipient.nickname };
  }

  public async getTopGiftersLeaderboard(monthStr?: string) {
    const now = new Date();
    const targetMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthGifts = this.memoryData.user_collectible_gifts.filter(g => g.month_acquired === targetMonth);

    const userTotals: Record<number, number> = {};
    for (const g of monthGifts) {
      userTotals[g.user_id] = (userTotals[g.user_id] || 0) + g.token_price;
    }

    const leaderboard = Object.keys(userTotals)
      .map(uIdStr => {
        const uId = Number(uIdStr);
        const user = this.memoryData.users.find(u => u.id === uId);
        return {
          user_id: uId,
          user,
          nickname: user?.nickname || `User #${uId}`,
          avatar_url: user?.avatar_url || 'avatar_1',
          total_spent: userTotals[uId],
          is_current_winner: false,
        };
      })
      .filter(entry => entry.user && !entry.user.is_blocked && !this.isBotUser(entry.user))
      .map(({ user, ...rest }) => rest);

    leaderboard.sort((a, b) => b.total_spent - a.total_spent);

    if (leaderboard.length > 0) {
      leaderboard[0].is_current_winner = true;
    }

    return leaderboard;
  }

  public async grantCollectibleGiftByAdmin(targetUserId: number, giftCatalogId: string, adminId: number) {
    const catalogItem = DEFAULT_COLLECTIBLE_GIFTS.find(g => g.id === giftCatalogId);
    if (!catalogItem) throw new Error("Sovg'a katalogda topilmadi!");

    const user = this.memoryData.users.find(u => u.id === targetUserId);
    if (!user) throw new Error("Foydalanuvchi topilmadi!");

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newGiftId = this.memoryData.nextIds.user_collectible_gifts++;

    const newGift: UserCollectibleGift = {
      id: newGiftId,
      user_id: targetUserId,
      gift_catalog_id: catalogItem.id,
      title: catalogItem.title_uz,
      icon: catalogItem.icon,
      token_price: catalogItem.token_price,
      sell_price: catalogItem.sell_price,
      month_acquired: monthStr,
      acquired_at: now.toISOString(),
      can_sell: true,
    };

    this.memoryData.user_collectible_gifts.push(newGift);

    await this.addCelebratoryNotification({
      userId: targetUserId,
      senderName: 'XOXO Bot',
      type: 'admin_gift',
      giftTitle: catalogItem.title_uz,
      giftIcon: catalogItem.icon,
      message: `Sizga XOXO botdan "${catalogItem.title_uz}" (${catalogItem.icon}) sovg'asi berildi!`,
    });

    await this.recordAudit(adminId, 'grant_collectible_gift', targetUserId, { giftCatalogId, title: catalogItem.title_uz });
    this.saveToFile();
    return newGift;
  }

  public async resetUserStats(targetUserId: number, adminId: number) {
    const user = this.memoryData.users.find(u => u.id === targetUserId);
    if (!user) throw new Error("Foydalanuvchi topilmadi");
    user.wins = 0;
    user.losses = 0;
    user.draws = 0;
    await this.recordAudit(adminId, 'reset_user_stats', targetUserId, {});
    this.saveToFile();
    return { success: true };
  }

  public async getSuspiciousActivities(): Promise<any[]> {
    const suspicious: any[] = [];
    const finishedGames = this.memoryData.games.filter(g => g.status === 'finished' && g.winner_id);

    // Group PvP games by player pair to detect deliberate loss / chip dumping
    const pairMap = new Map<string, { p1: number; p2: number; total: number; wins: Record<number, number> }>();
    for (const g of finishedGames) {
      const p1Id = g.player_x_id || (g as any).player1_id;
      const p2Id = g.player_o_id || (g as any).player2_id;
      if (!p1Id || !p2Id || !g.winner_id) continue;
      const minId = Math.min(p1Id, p2Id);
      const maxId = Math.max(p1Id, p2Id);
      const pairKey = `${minId}_${maxId}`;

      let pair = pairMap.get(pairKey);
      if (!pair) {
        pair = { p1: minId, p2: maxId, total: 0, wins: { [minId]: 0, [maxId]: 0 } };
        pairMap.set(pairKey, pair);
      }
      pair.total++;
      pair.wins[g.winner_id] = (pair.wins[g.winner_id] || 0) + 1;
    }

    for (const data of pairMap.values()) {
      if (data.total >= 3) {
        const p1Wins = data.wins[data.p1] || 0;
        const p2Wins = data.wins[data.p2] || 0;
        const maxWins = Math.max(p1Wins, p2Wins);
        const winRatio = maxWins / data.total;

        if (winRatio >= 0.75) {
          const dominantWinnerId = p1Wins >= p2Wins ? data.p1 : data.p2;
          const loserId = dominantWinnerId === data.p1 ? data.p2 : data.p1;
          const u1 = this.memoryData.users.find(u => u.id === dominantWinnerId);
          const u2 = this.memoryData.users.find(u => u.id === loserId);

          suspicious.push({
            type: 'chip_dumping',
            severity: 'high',
            description: `G'ayritabiiy o'yinlar juftligi: ${u1?.nickname || dominantWinnerId} vs ${u2?.nickname || loserId} (${data.total} o'yinda ${maxWins} g'alaba, ${Math.round(winRatio * 100)}%)`,
            primaryUserId: dominantWinnerId,
            secondaryUserId: loserId,
            totalGames: data.total,
            ratio: winRatio,
            detectedAt: new Date().toISOString(),
          });
        }
      }
    }

    return suspicious;
  }
}


export const db = new DatabaseManager();
