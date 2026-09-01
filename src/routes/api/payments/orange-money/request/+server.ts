import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingByReferenceOnly, updateBookingStatus } from '$lib/server/db';
import { requestOrangePayment } from '$lib/server/payments/orangeMoney';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { bookingReference, phone, amount } = body;

    if (!bookingReference || !phone) {
      return json(
        { success: false, error: 'Référence de réservation et numéro de téléphone requis.' },
        { status: 400 }
      );
    }

    const booking = await getBookingByReferenceOnly(bookingReference);
    if (!booking) {
      return json({ success: false, error: 'Réservation introuvable.' }, { status: 404 });
    }

    const chargeAmount = amount ? parseFloat(amount.toString()) : parseFloat(booking.totalPrice);

    const paymentResult = await requestOrangePayment({
      bookingReference: booking.bookingReference,
      amount: chargeAmount,
      phone,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail
    });

    if (paymentResult.success) {
      await updateBookingStatus(
        booking.bookingReference,
        'pending_payment',
        paymentResult.transactionId,
        'orange_money'
      );
    }

    return json(paymentResult);
  } catch (err: any) {
    console.error('Error in Orange Money request endpoint:', err);
    return json(
      { success: false, error: err.message || 'Erreur lors de l’envoi de la demande Orange Money.' },
      { status: 500 }
    );
  }
};
