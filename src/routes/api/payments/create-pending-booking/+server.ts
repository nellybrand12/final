import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoomById, createBooking, getBookingByReferenceOnly, updateBookingStatus } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      roomsCount = 1,
      guestsCount = 2,
      eventType = null,
      specialRequests = '',
      paymentMethod = 'hotel',
      existingBookingReference
    } = body;

    if (!roomId || !guestName || !guestEmail || !checkInDate || !checkOutDate) {
      return json(
        { success: false, error: 'Champs obligatoires manquants pour la réservation.' },
        { status: 400 }
      );
    }

    const room = await getRoomById(parseInt(roomId.toString(), 10));
    if (!room) {
      return json({ success: false, error: 'Chambre introuvable.' }, { status: 400 });
    }

    // Calculate nights & total price
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const count = parseInt(roomsCount.toString(), 10) || 1;
    const pricePerNight = parseFloat(room.pricePerNight);
    const totalPrice = (pricePerNight * diffDays * count).toFixed(2);

    // If an existing pending booking is being retried
    if (existingBookingReference) {
      const existing = await getBookingByReferenceOnly(existingBookingReference);
      if (existing) {
        await updateBookingStatus(
          existingBookingReference,
          'pending_payment',
          undefined,
          paymentMethod
        );
        return json({
          success: true,
          bookingReference: existing.bookingReference,
          totalPrice: parseFloat(totalPrice),
          diffDays,
          roomsCount: count,
          roomName: room.name,
          guestName: existing.guestName,
          guestEmail: existing.guestEmail,
          guestPhone: existing.guestPhone
        });
      }
    }

    // Generate fresh reference
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingReference = `MDJ-${randomSuffix}`;

    const newBooking = await createBooking({
      bookingReference,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : null,
      roomId: room.id,
      checkInDate,
      checkOutDate,
      guestsCount: room.type === 'hall' ? guestsCount : count,
      eventType: room.type === 'hall' ? eventType : null,
      specialRequests: specialRequests ? specialRequests.trim() : null,
      totalPrice,
      paymentMethod,
      paymentTransactionId: null,
      status: 'pending_payment'
    });

    return json({
      success: true,
      bookingReference: newBooking.bookingReference,
      totalPrice: parseFloat(totalPrice),
      diffDays,
      roomsCount: count,
      roomName: room.name,
      guestName: newBooking.guestName,
      guestEmail: newBooking.guestEmail,
      guestPhone: newBooking.guestPhone
    });
  } catch (err: any) {
    console.error('Error creating pending booking:', err);
    return json(
      { success: false, error: err.message || 'Erreur serveur lors de la création de la réservation.' },
      { status: 500 }
    );
  }
};
