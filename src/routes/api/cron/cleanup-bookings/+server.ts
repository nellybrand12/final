import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, isDbHealthy, hardDeleteBooking } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ request }) => {
  // Simple auth for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db || !isDbHealthy) {
    return json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    // Find CinetPay bookings that are still pending and older than 2 hours
    const staleBookings = await db.select()
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.status, 'pending'),
          eq(schema.bookings.paymentMethod, 'cinetpay'),
          sql`${schema.bookings.createdAt} < NOW() - INTERVAL '2 hours'`
        )
      );

    const deletedIds = [];
    for (const booking of staleBookings) {
      const success = await hardDeleteBooking(booking.id);
      if (success) {
        deletedIds.push(booking.id);
      }
    }

    return json({ success: true, deletedCount: deletedIds.length, deletedIds });
  } catch (error: any) {
    console.error('[CRON] Error cleaning up bookings:', error);
    return json({ error: error.message }, { status: 500 });
  }
};
