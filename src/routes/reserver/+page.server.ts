import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getAllRooms, getRoomById, createBooking } from '$lib/server/db';
import { sendBookingConfirmationEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ url }) => {
  const rooms = await getAllRooms();
  const requestedRoomId = url.searchParams.get('roomId');
  const checkInParam = url.searchParams.get('checkIn') || '';
  const checkOutParam = url.searchParams.get('checkOut') || '';
  const roomsParam = parseInt(url.searchParams.get('rooms') || url.searchParams.get('guests') || '1', 10);

  const preselectedRoom = requestedRoomId 
    ? rooms.find(r => r.id === parseInt(requestedRoomId, 10)) || rooms[0]
    : rooms[0];

  return {
    rooms,
    preselectedRoom,
    initialCheckIn: checkInParam,
    initialCheckOut: checkOutParam,
    initialRooms: roomsParam > 0 ? roomsParam : 1
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const roomIdStr = data.get('roomId')?.toString();
    const guestName = data.get('guestName')?.toString()?.trim();
    const guestEmail = data.get('guestEmail')?.toString()?.trim();
    const guestPhone = data.get('guestPhone')?.toString()?.trim();
    const checkInDate = data.get('checkInDate')?.toString();
    const checkOutDate = data.get('checkOutDate')?.toString();
    const roomsCountStr = data.get('roomsCount')?.toString() || data.get('guestsCount')?.toString() || '1';
    const specialRequests = data.get('specialRequests')?.toString()?.trim();

    if (!roomIdStr || !guestName || !guestEmail || !checkInDate || !checkOutDate) {
      return fail(400, {
        error: 'Veuillez remplir tous les champs obligatoires.',
        values: { guestName, guestEmail, guestPhone, checkInDate, checkOutDate }
      });
    }

    const roomId = parseInt(roomIdStr, 10);
    const room = await getRoomById(roomId);
    if (!room) {
      return fail(400, { error: 'Chambre invalide.' });
    }

    // Calculate nights & total
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const roomsCount = parseInt(roomsCountStr, 10) || 1;
    const pricePerNight = parseFloat(room.pricePerNight);
    const totalPrice = (pricePerNight * diffDays * roomsCount).toFixed(2);

    // Generate reference code
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `MDJ-${randomSuffix}`;

    try {
      const newBooking = await createBooking({
        bookingReference,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: roomsCount, // Maps rooms count to guestsCount in DB schema
        specialRequests: specialRequests || null,
        totalPrice,
        paymentMethod: 'hotel',
        paymentTransactionId: null,
        status: 'confirmed',
        eventType: data.get('eventType')?.toString() || null
      });

      // Send confirmation email with PDF receipt
      if (newBooking) {
        sendBookingConfirmationEmail(newBooking, room).catch(err => {
          console.warn('[Email] Non-blocking confirmation email error:', err);
        });
      }
    } catch (e) {
      console.error('Error creating booking:', e);
      return fail(500, { error: 'Une erreur est survenue lors de la réservation. Veuillez réessayer.' });
    }

    throw redirect(303, `/confirmation?ref=${bookingReference}&email=${encodeURIComponent(guestEmail)}`);
  }
};
