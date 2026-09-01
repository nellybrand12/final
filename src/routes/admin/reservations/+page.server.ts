import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  let reservations: any[] = [];
  let rooms: any[] = [];

  if (db && isDbHealthy) {
    try {
      reservations = await db.select({
        id: schema.bookings.id,
        bookingReference: schema.bookings.bookingReference,
        guestName: schema.bookings.guestName,
        checkInDate: schema.bookings.checkInDate,
        checkOutDate: schema.bookings.checkOutDate,
        totalPrice: schema.bookings.totalPrice,
        status: schema.bookings.status,
        paymentMethod: schema.bookings.paymentMethod,
        roomName: schema.rooms.name
      })
      .from(schema.bookings)
      .leftJoin(schema.rooms, eq(schema.bookings.roomId, schema.rooms.id))
      .orderBy(desc(schema.bookings.createdAt));

      rooms = await db.select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        availableRooms: schema.rooms.availableRooms,
        pricePerNight: schema.rooms.pricePerNight
      }).from(schema.rooms);
    } catch (e) {
      console.error('Error fetching reservations:', e);
    }
  }

  return {
    reservations,
    rooms
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    // Implementation for manual creation
    // ...
  },
  updateStatus: async ({ request }) => {
    const data = await request.formData();
    const idStr = data.get('id')?.toString();
    const status = data.get('status')?.toString();

    if (!idStr || !status) return fail(400, { error: 'Missing data' });
    const id = parseInt(idStr);

    if (db && isDbHealthy) {
      try {
        const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id));
        if (!booking) return fail(404, { error: 'Booking not found' });

        const oldStatus = booking.status;
        
        await db.update(schema.bookings)
          .set({ status })
          .where(eq(schema.bookings.id, id));

        // Inventory adjustment
        if (oldStatus !== 'cancelled' && oldStatus !== 'failed' && (status === 'cancelled' || status === 'failed')) {
          // Booking cancelled/failed, return room to inventory
          await db.update(schema.rooms)
            .set({ availableRooms: sql`${schema.rooms.availableRooms} + 1` })
            .where(eq(schema.rooms.id, booking.roomId));
        } else if ((oldStatus === 'cancelled' || oldStatus === 'failed') && (status === 'confirmed' || status === 'pending_payment')) {
          // Re-instated booking, decrement inventory
          await db.update(schema.rooms)
            .set({ availableRooms: sql`${schema.rooms.availableRooms} - 1` })
            .where(eq(schema.rooms.id, booking.roomId));
        }

      } catch (e) {
        console.error('Error updating status:', e);
        return fail(500, { error: 'Database error' });
      }
    }
  }
};
