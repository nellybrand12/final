import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy, updateBookingStatus, hardDeleteBooking } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
  let reservations: any[] = [];
  let rooms: any[] = [];
  
  const statusFilter = url.searchParams.get('status');

  if (db && isDbHealthy) {
    try {
      let query = db.select({
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
      .$dynamic();

      if (statusFilter && statusFilter !== 'all') {
        query = query.where(eq(schema.bookings.status, statusFilter as any));
      }

      reservations = await query.orderBy(desc(schema.bookings.createdAt));

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
    rooms,
    statusFilter: statusFilter || 'all'
  };
};

export const actions: Actions = {
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

        // Ensure we pass the status correctly typed.
        if (['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
           await updateBookingStatus(booking.bookingReference, status as any);
        }

      } catch (e) {
        console.error('Error updating status:', e);
        return fail(500, { error: 'Database error' });
      }
    }
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const idStr = data.get('id')?.toString();
    if (!idStr) return fail(400, { error: 'Missing id' });
    const id = parseInt(idStr);
    
    const success = await hardDeleteBooking(id);
    if (!success) {
      return fail(500, { error: 'Failed to delete booking' });
    }
    return { success: true };
  }
};
