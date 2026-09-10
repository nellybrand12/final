import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getBookingsByGuest, cancelBooking, getRoomById, getAllRooms } from '$lib/server/db';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
  const name = url.searchParams.get('name');
  const phone = url.searchParams.get('phone');

  let bookings: any[] = [];
  let roomsMap: Record<number, any> = {};

  if (name && phone) {
    bookings = await getBookingsByGuest(name, phone);
    if (bookings.length > 0) {
      const allRooms = await getAllRooms({ includeArchived: true });
      for (const r of allRooms) {
        roomsMap[r.id] = r;
      }
    }
  }

  return {
    searchedName: name || '',
    searchedPhone: phone || '',
    bookings,
    roomsMap
  };
};

export const actions: Actions = {
  lookup: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString()?.trim();
    const phone = data.get('phone')?.toString()?.trim();

    if (!name || !phone) {
      return fail(400, {
        error: 'Veuillez renseigner votre nom et votre numéro de téléphone.',
        values: { name, phone }
      });
    }

    const bookings = await getBookingsByGuest(name, phone);
    if (!bookings || bookings.length === 0) {
      return fail(404, {
        error: 'Aucune réservation trouvée correspondant à ces informations. Veuillez vérifier.',
        values: { name, phone }
      });
    }

    const allRooms = await getAllRooms({ includeArchived: true });
    const roomsMap: Record<number, any> = {};
    for (const r of allRooms) {
      roomsMap[r.id] = r;
    }

    return {
      success: true,
      bookings,
      roomsMap
    };
  },

  cancel: async ({ request }) => {
    const data = await request.formData();
    const reference = data.get('reference')?.toString()?.trim();
    const email = data.get('email')?.toString()?.trim();
    const name = data.get('name')?.toString()?.trim();
    const phone = data.get('phone')?.toString()?.trim();

    if (!reference || !email) {
      return fail(400, { error: 'Données manquantes.' });
    }

    const result = await cancelBooking(reference, email);
    if (!result.success) {
      return fail(400, { error: result.message || 'Impossible d’annuler cette réservation.' });
    }

    const bookings = (name && phone) ? await getBookingsByGuest(name, phone) : [];
    const allRooms = await getAllRooms({ includeArchived: true });
    const roomsMap: Record<number, any> = {};
    for (const r of allRooms) {
      roomsMap[r.id] = r;
    }

    return {
      cancelled: true,
      message: result.message,
      refundPercentage: result.refundPercentage,
      bookings,
      roomsMap
    };
  },

  extendStay: async ({ request }) => {
    const data = await request.formData();
    const reference = data.get('reference')?.toString()?.trim();
    const newCheckOut = data.get('newCheckOut')?.toString()?.trim();
    const name = data.get('name')?.toString()?.trim();
    const phone = data.get('phone')?.toString()?.trim();

    if (!reference || !newCheckOut) {
      return fail(400, { extendError: 'Données manquantes.' });
    }

    if (!db || !isDbHealthy) {
      return fail(500, { extendError: 'Base de données indisponible.' });
    }

    try {
      // 1. Fetch the booking
      const [booking] = await db.select().from(schema.bookings)
        .where(eq(schema.bookings.bookingReference, reference));

      if (!booking) {
        return fail(404, { extendError: 'Réservation introuvable.' });
      }
      if (booking.status !== 'confirmed') {
        return fail(400, { extendError: 'Seules les réservations confirmées peuvent être prolongées.' });
      }

      // 2. Validate new checkout is after current checkout
      const currentCheckOut = new Date(booking.checkOutDate);
      const requestedCheckOut = new Date(newCheckOut);
      if (requestedCheckOut <= currentCheckOut) {
        return fail(400, { extendError: 'La nouvelle date de départ doit être postérieure à la date actuelle.' });
      }

      // 3. Fetch room to compute extra cost
      const room = await getRoomById(booking.roomId);
      if (!room) {
        return fail(404, { extendError: 'Chambre introuvable.' });
      }

      // 4. Calculate additional nights & charge
      const msPerDay = 1000 * 60 * 60 * 24;
      const extraNights = Math.ceil((requestedCheckOut.getTime() - currentCheckOut.getTime()) / msPerDay);
      const roomCount = room.type === 'hall' ? 1 : booking.guestsCount;
      const additionalCharge = extraNights * parseFloat(room.pricePerNight) * roomCount;

      // 5. Check availability for the extension window
      const { checkAvailability } = await import('$lib/server/db');
      const available = await checkAvailability(booking.roomId, booking.checkOutDate, newCheckOut);
      if (available < roomCount) {
        return fail(400, { extendError: 'Pas de disponibilité pour ces dates de prolongation.' });
      }

      // 6. Remove any previous failed/expired pending extension for this booking
      await db.delete(schema.bookingExtensions)
        .where(eq(schema.bookingExtensions.bookingId, booking.id));

      // 7. Insert pending extension row
      const [extension] = await db.insert(schema.bookingExtensions).values({
        bookingId: booking.id,
        requestedCheckoutDate: newCheckOut,
        additionalCharge: additionalCharge.toFixed(2),
        status: 'pending'
      }).returning();

      // Return extension details for the client to initiate payment
      return {
        extendInitiated: true,
        extension: {
          id: extension.id,
          bookingReference: reference,
          requestedCheckoutDate: newCheckOut,
          additionalCharge,
          guestEmail: booking.guestEmail,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone
        }
      };
    } catch (e: any) {
      console.error('extendStay error:', e);
      return fail(500, { extendError: e?.message || 'Erreur lors de la prolongation.' });
    }
  }
};
