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

  const defaultRoom = rooms.find(r => r.type === 'room') || rooms.find(r => r.type === 'apartment') || rooms[0];
  const preselectedRoom = requestedRoomId 
    ? rooms.find(r => r.id === parseInt(requestedRoomId, 10)) || defaultRoom
    : defaultRoom;

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
    const guestPhone = data.get('guestPhone')?.toString()?.trim();
    const checkInDate = data.get('checkInDate')?.toString();
    const checkOutDate = data.get('checkOutDate')?.toString();
    const roomsCountStr = data.get('roomsCount')?.toString() || data.get('guestsCount')?.toString() || '1';
    const specialRequests = data.get('specialRequests')?.toString()?.trim();

    if (!roomIdStr || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
      return fail(400, {
        error: 'Veuillez remplir tous les champs obligatoires.',
        values: { guestName, guestPhone, checkInDate, checkOutDate }
      });
    }

    const roomId = parseInt(roomIdStr, 10);
    const room = await getRoomById(roomId);
    if (!room) {
      return fail(400, { error: 'Chambre invalide.' });
    }

    // Calculate nights & total based on accommodation category
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let totalPrice = '0.00';
    let bookingGuestsCount = 1;

    if (room.type === 'hall') {
      if (!room.pricePerSeat || !room.capacity) {
        return fail(400, { error: 'Tarif par place ou capacité non configuré pour cette salle.' });
      }
      const guestCount = parseInt(data.get('guestsCount')?.toString() || data.get('expectedAttendees')?.toString() || '0', 10);
      if (guestCount < 1) {
        return fail(400, { error: 'Le nombre de participants doit être d’au moins 1 personne.' });
      }
      if (guestCount > room.capacity) {
        return fail(400, { 
          error: `Le nombre de participants (${guestCount}) dépasse la capacité maximale de la salle (${room.capacity} places).` 
        });
      }
      bookingGuestsCount = guestCount;
      const pricePerSeat = parseFloat(room.pricePerSeat);
      totalPrice = (pricePerSeat * diffDays * guestCount).toFixed(2);
    } else {
      if (!room.pricePerNight) {
        return fail(400, { error: 'Tarif par nuit non configuré pour cet hébergement.' });
      }
      const roomsCount = parseInt(roomsCountStr, 10) || 1;
      bookingGuestsCount = roomsCount;
      const pricePerNight = parseFloat(room.pricePerNight);
      totalPrice = (pricePerNight * diffDays * roomsCount).toFixed(2);
    }

    // Generate reference code
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `MDJ-${randomSuffix}`;

    try {
      const newBooking = await createBooking({
        bookingReference,
        guestName,
        guestPhone: guestPhone || null,
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: bookingGuestsCount,
        specialRequests: specialRequests || null,
        totalPrice,
        paymentMethod: 'hotel',
        paymentTransactionId: null,
        status: 'confirmed',
        eventType: room.type === 'hall' ? (data.get('eventType')?.toString() || null) : null
      });

      // Send confirmation notification with PDF receipt
      if (newBooking) {
        sendBookingConfirmationEmail(newBooking, room).catch(err => {
          console.warn('[Email] Non-blocking confirmation email error:', err);
        });
      }
    } catch (e) {
      console.error('Error creating booking:', e);
      return fail(500, { error: 'Une erreur est survenue lors de la réservation. Veuillez réessayer.' });
    }

    throw redirect(303, `/confirmation?ref=${bookingReference}`);
  }
};
