import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getCelebratoryNotificationsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const notifications = await db.getUnreadCelebratoryNotifications(req.user.userId);
    return res.json({ notifications });
  } catch (err: any) {
    console.error('[Notifications] Error fetching celebratory notifications:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function markCelebratoryNotificationReadHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const notifId = parseInt(req.params.id, 10);
    const success = await db.markCelebratoryNotificationRead(req.user.userId, notifId);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
