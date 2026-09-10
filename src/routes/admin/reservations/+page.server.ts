import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy, updateBookingStatus, hardDeleteBooking, createBooking, checkAvailability, getRoomById, getAllRooms } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { desc, eq, sql, asc } from 'drizzle-orm';
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
        guestPhone: schema.bookings.guestPhone,
        checkInDate: schema.bookings.checkInDate,
        checkOutDate: schema.bookings.checkOutDate,
        totalPrice: schema.bookings.totalPrice,
        status: schema.bookings.status,
        paymentMethod: schema.bookings.paymentMethod,
        paymentTransactionId: schema.bookings.paymentTransactionId,
        guestsCount: schema.bookings.guestsCount,
        roomName: schema.rooms.name,
        roomType: schema.rooms.type,
        createdAt: schema.bookings.createdAt
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
        type: schema.rooms.type,
        category: schema.rooms.category,
        availableRooms: schema.rooms.availableRooms,
        totalRooms: schema.rooms.totalRooms,
        pricePerNight: schema.rooms.pricePerNight,
        status: schema.rooms.status
      })
      .from(schema.rooms)
      .where(sql`${schema.rooms.status} NOT IN ('archived', 'inactive')`)
      .orderBy(asc(schema.rooms.type), asc(schema.rooms.id));
    } catch (e) {
      console.error('Error fetching reservations:', e);
    }
  } else {
    // In-memory fallback
    const allRooms = await getAllRooms({ includeArchived: false });
    rooms = allRooms.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      category: r.category,
      availableRooms: r.availableRooms,
      totalRooms: r.totalRooms,
      pricePerNight: r.pricePerNight,
      status: r.status
    }));
  }

  return {
    reservations,
    rooms,
    statusFilter: statusFilter || 'all'
  };
};

export const actions: Actions = {
  createWalkIn: async ({ request }) => {
    const data = await request.formData();
    const guestName = data.get('guestName')?.toString().trim();
    const guestPhone = data.get('guestPhone')?.toString().trim();
    const roomIdStr = data.get('roomId')?.toString();
    const checkInDate = data.get('checkInDate')?.toString().trim();
    const checkOutDate = data.get('checkOutDate')?.toString().trim();
    const roomsCountStr = data.get('roomsCount')?.toString() || '1';
    const specialRequests = data.get('specialRequests')?.toString().trim() || null;
    const eventType = data.get('eventType')?.toString().trim() || null;

    if (!guestName || !guestPhone || !roomIdStr || !checkInDate || !checkOutDate) {
      return fail(400, {
        error: 'Veuillez remplir tous les champs obligatoires (nom, téléphone, hébergement/salle, dates).',
        walkInValues: { guestName, guestPhone, roomIdStr, checkInDate, checkOutDate }
      });
    }

    // Validate past dates
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (checkInDate < todayStr) {
      return fail(400, {
        error: "La date d'arrivée ne peut pas être antérieure à aujourd'hui.",
        walkInValues: { guestName, guestPhone, roomIdStr, checkInDate, checkOutDate }
      });
    }

    if (checkOutDate < checkInDate) {
      return fail(400, {
        error: "La date de départ ne peut pas précéder la date d'arrivée.",
        walkInValues: { guestName, guestPhone, roomIdStr, checkInDate, checkOutDate }
      });
    }

    const roomId = parseInt(roomIdStr, 10);
    if (isNaN(roomId)) {
      return fail(400, { error: 'Identifiant de chambre ou salle invalide.' });
    }

    const room = await getRoomById(roomId);
    if (!room) {
      return fail(400, { error: 'Hébergement ou salle introuvable dans l’inventaire.' });
    }

    const isHall = room.type === 'hall';
    const requestedCount = isHall ? 1 : (parseInt(roomsCountStr, 10) || 1);

    // Dynamic availability check respecting existing buffers (24h/12h rooms, 48h/24h halls)
    try {
      const available = await checkAvailability(roomId, checkInDate, checkOutDate);
      if (available < requestedCount) {
        return fail(400, {
          error: `Cet hébergement n'est pas disponible pour ces dates. Les règles de tampon de préparation (${isHall ? '48h avant / 24h après pour les salles' : '24h avant / 12h après pour les chambres'}) ou une réservation existante bloquent ces dates.`,
          walkInValues: { guestName, guestPhone, roomIdStr, checkInDate, checkOutDate }
        });
      }
    } catch (err: any) {
      console.error('Error checking availability:', err);
      return fail(500, { error: 'Erreur lors de la vérification de disponibilité.' });
    }

    // Compute total price (same pricing logic as public booking flow)
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = parseFloat(room.pricePerNight);
    const totalPrice = (pricePerNight * diffDays * requestedCount).toFixed(2);

    // Generate unique reference and cash transaction ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `MDJ-${randomSuffix}`;
    const txnSuffix = Math.floor(100000 + Math.random() * 900000);
    const paymentTransactionId = `CASH-${txnSuffix}`;

    try {
      // Direct confirmed reservation & immediate simultaneous cash payment record
      await createBooking({
        bookingReference,
        guestName,
        guestPhone,
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: requestedCount,
        specialRequests,
        eventType: isHall ? eventType : null,
        totalPrice,
        paymentMethod: 'cash',
        paymentTransactionId,
        status: 'confirmed'
      });

      return {
        walkInSuccess: true,
        bookingReference,
        paymentTransactionId,
        guestName,
        roomName: room.name,
        totalPrice
      };
    } catch (e: any) {
      console.error('Error creating walk-in booking:', e);
      return fail(500, { error: e.message || 'Erreur lors de l’enregistrement de la réservation.' });
    }
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
