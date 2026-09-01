import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBookingByReferenceOnly, updateBookingStatus, getRoomById } from '$lib/server/db';
import { checkOrangePaymentStatus } from '$lib/server/payments/orangeMoney';
import { sendBookingConfirmationEmail } from '$lib/server/email';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { transactionId } = params;

    if (!transactionId) {
      return json({ success: false, error: 'Identifiant de transaction requis.' }, { status: 400 });
    }

    const statusResult = await checkOrangePaymentStatus(transactionId);

    if (statusResult.bookingReference) {
      const booking = await getBookingByReferenceOnly(statusResult.bookingReference);

      if (statusResult.status === 'successful') {
        const previousStatus = booking?.status;
        const updatedBooking = await updateBookingStatus(
          statusResult.bookingReference,
          'confirmed',
          transactionId,
          'orange_money'
        );

        if (updatedBooking && previousStatus !== 'confirmed') {
          getRoomById(updatedBooking.roomId).then(room => {
            sendBookingConfirmationEmail(updatedBooking, room).catch(err => {
              console.warn('[Email] Non-blocking confirmation email error:', err);
            });
          });
        }
      } else if (statusResult.status === 'failed' || statusResult.status === 'timeout') {
        await updateBookingStatus(
          statusResult.bookingReference,
          'failed',
          transactionId,
          'orange_money'
        );
      }

      return json({
        success: true,
        ...statusResult,
        guestEmail: booking?.guestEmail || ''
      });
    }

    return json({
      success: true,
      ...statusResult
    });
  } catch (err: any) {
    console.error('Error checking Orange Money status:', err);
    return json(
      { success: false, error: err.message || 'Erreur lors de la vérification du statut Orange Money.' },
      { status: 500 }
    );
  }
};
