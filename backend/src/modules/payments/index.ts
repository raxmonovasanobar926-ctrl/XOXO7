import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { getTelegramBotInstance } from '../../bot/index.js';

/**
 * Get active Star packs for store display
 */
export async function getStarPacksHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const packs = await db.getStarPacks(true);
    return res.json({ packs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

/**
 * Create Telegram Stars Invoice Link for a token pack
 */
export async function createStarInvoiceHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const { packId } = req.body;
    const pack = await db.getStarPackById(Number(packId));
    if (!pack || !pack.is_active) {
      return res.status(404).json({ error: 'Ushbu paket topilmadi yoki nofaol' });
    }

    const user = await db.findUserById(req.user.userId);
    if (!user || user.is_blocked) {
      return res.status(403).json({ error: 'Akkauntingiz bloklangan' });
    }

    const bot = getTelegramBotInstance();

    // Payload to identify payment on webhook
    const payload = JSON.stringify({
      userId: user.id,
      packId: pack.id,
      timestamp: Date.now(),
    });

    if (bot) {
      try {
        const invoiceLink = await bot.telegram.createInvoiceLink({
          title: `XOXO: ${pack.title} Paketi`,
          description: `${pack.tokens} ta token olish uchun ${pack.stars_price} Telegram Stars to‘lang.`,
          payload,
          provider_token: '', // Must be empty for Telegram Stars
          currency: 'XTR', // Telegram Stars currency
          prices: [{ label: pack.title, amount: pack.stars_price }],
        });

        return res.json({
          invoiceLink,
          pack,
        });
      } catch (botErr: any) {
        console.warn('[Payments] Telegram createInvoiceLink error, falling back to mock link:', botErr.message);
      }
    }

    // Dev mode fallback mock invoice link if live bot token not provided
    const mockInvoiceLink = `https://t.me/$mock_star_invoice_${pack.id}_${user.id}`;
    return res.json({
      invoiceLink: mockInvoiceLink,
      pack,
      isMock: true,
    });
  } catch (err: any) {
    console.error('[Payments] Error creating invoice:', err);
    return res.status(500).json({ error: 'Invoice yaratishda xatolik yuz berdi' });
  }
}

/**
 * Dev mode simulation endpoint to test instant Star purchase
 */
export async function simulateStarPaymentHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    // Payment simulation is strictly forbidden in production
    if (config.nodeEnv === 'production') {
      return res.status(403).json({ error: 'To‘lov simulyatsiyasi production muhitida taqiqlangan' });
    }

    const { packId } = req.body;
    const pack = await db.getStarPackById(Number(packId));
    if (!pack) return res.status(404).json({ error: 'Paket topilmadi' });

    const chargeId = `mock_charge_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const result = await db.recordStarPayment(
      req.user.userId,
      pack.id,
      pack.stars_price,
      pack.tokens,
      chargeId
    );

    const user = await db.findUserById(req.user.userId);

    return res.json({
      success: true,
      message: `Muvaffaqiyatli! +${pack.tokens} token hisobingizga qo‘shildi.`,
      tokensGranted: pack.tokens,
      newBalance: user?.token_balance,
      payment: result.payment,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
}
