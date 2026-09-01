import type { PageServerLoad } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  let payments: any[] = [];

  if (db && isDbHealthy) {
    try {
      // In this system, payments are tightly coupled to bookings right now.
      payments = await db.select({
        id: schema.bookings.id,
        bookingReference: schema.bookings.bookingReference,
        guestName: schema.bookings.guestName,
        totalPrice: schema.bookings.totalPrice,
        paymentMethod: schema.bookings.paymentMethod,
        paymentTransactionId: schema.bookings.paymentTransactionId,
        status: schema.bookings.status,
        createdAt: schema.bookings.createdAt
      })
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt));
    } catch (e) {
      console.error('Error fetching payments:', e);
    }
  }

  return {
    payments
  };
};
