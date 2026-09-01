import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingByReferenceOnly, updateBookingStatus, getRoomById } from '$lib/server/db';
import { sendBookingConfirmationEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { bookingReference } = body;

    if (!bookingReference) {
      return json({ success: false, error: 'Référence de réservation requise.' }, { status: 400 });
    }

    const booking = await getBookingByReferenceOnly(bookingReference);
    if (!booking) {
      return json({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
    }

    const updatedBooking = await updateBookingStatus(
      booking.bookingReference,
      'confirmed',
      undefined,
      'hotel'
    );

    // Trigger automatic confirmation email with PDF receipt in background
    if (updatedBooking) {
      getRoomById(updatedBooking.roomId).then(room => {
        sendBookingConfirmationEmail(updatedBooking, room).catch(err => {
          console.warn('[Email] Non-blocking confirmation email error:', err);
        });
      });
    }

    return json({
      success: true,
      bookingReference: booking.bookingReference,
      guestEmail: booking.guestEmail,
      message: 'Réservation confirmée avec règlement sur place.'
    });
  } catch (err: any) {
    console.error('Error confirming hotel payment:', err);
    return json(
      { success: false, error: err.message || 'Erreur lors de la confirmation de la réservation.' },
      { status: 500 }
    );
  }
};
