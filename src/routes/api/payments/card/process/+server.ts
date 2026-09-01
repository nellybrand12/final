import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingByReferenceOnly, updateBookingStatus, getRoomById } from '$lib/server/db';
import { processCardPayment } from '$lib/server/payments/cardGateway';
import { sendBookingConfirmationEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      bookingReference,
      cardNumber,
      cardHolder,
      expiryMonth,
      expiryYear,
      cvc,
      amount
    } = body;

    if (!bookingReference || !cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvc) {
      return json(
        { success: false, error: 'Veuillez remplir tous les champs de la carte bancaire.' },
        { status: 400 }
      );
    }

    const booking = await getBookingByReferenceOnly(bookingReference);
    if (!booking) {
      return json({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
    }

    const chargeAmount = amount ? parseFloat(amount.toString()) : parseFloat(booking.totalPrice);

    const paymentResult = await processCardPayment({
      bookingReference: booking.bookingReference,
      amount: chargeAmount,
      cardNumber,
      cardHolder,
      expiryMonth,
      expiryYear,
      cvc,
      guestEmail: booking.guestEmail
    });

    if (paymentResult.success) {
      const updatedBooking = await updateBookingStatus(
        booking.bookingReference,
        'confirmed',
        paymentResult.transactionId,
        'card'
      );

      // Trigger automatic confirmation email with PDF receipt
      if (updatedBooking) {
        getRoomById(updatedBooking.roomId).then(room => {
          sendBookingConfirmationEmail(updatedBooking, room).catch(err => {
            console.warn('[Email] Non-blocking confirmation email error:', err);
          });
        });
      }
    } else {
      await updateBookingStatus(
        booking.bookingReference,
        'failed',
        paymentResult.transactionId,
        'card'
      );
    }

    return json({
      ...paymentResult,
      bookingReference: booking.bookingReference,
      guestEmail: booking.guestEmail
    });
  } catch (err: any) {
    console.error('Error processing card payment:', err);
    return json(
      { success: false, error: err.message || 'Erreur lors du traitement de la carte bancaire.' },
      { status: 500 }
    );
  }
};
