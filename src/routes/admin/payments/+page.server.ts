import type { PageServerLoad } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

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
        createdAt: schema.bookings.createdAt,
        checkInDate: schema.bookings.checkInDate,
        checkOutDate: schema.bookings.checkOutDate,
        guestsCount: schema.bookings.guestsCount,
        roomType: schema.rooms.type,
        roomName: schema.rooms.name,
        pricePerSeat: schema.rooms.pricePerSeat,
        pricePerNight: schema.rooms.pricePerNight
      })
      .from(schema.bookings)
      .leftJoin(schema.rooms, eq(schema.bookings.roomId, schema.rooms.id))
      .orderBy(desc(schema.bookings.createdAt));
    } catch (e) {
      console.error('Error fetching payments:', e);
    }
  }

  return {
    payments
  };
};
