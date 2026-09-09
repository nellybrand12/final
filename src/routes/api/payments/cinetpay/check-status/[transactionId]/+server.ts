import { json, type RequestHandler } from '@sveltejs/kit';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { checkCinetPayTransaction, confirmCinetPayBooking, failCinetPayBooking } from '$lib/server/payments/cinetpay';

export const GET: RequestHandler = async ({ params }) => {
  const transactionId = params.transactionId;

  if (!transactionId) {
    return json({ success: false, error: 'Transaction ID missing' }, { status: 400 });
  }

  try {
    if (!db || !isDbHealthy) {
      return json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Check current status in DB
    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.paymentTransactionId, transactionId));

    if (!booking) {
      return json({ success: false, error: 'Réservation introuvable' }, { status: 404 });
    }

    if (booking.status === 'confirmed') {
      return json({
        success: true,
        status: 'confirmed',
        bookingReference: booking.bookingReference,
        guestEmail: booking.guestEmail
      });
    }

    if (booking.status === 'failed') {
      return json({
        success: true,
        status: 'failed',
        bookingReference: booking.bookingReference
      });
    }

    // 2. If still pending, trigger authoritative check directly with CinetPay
    const verification = await checkCinetPayTransaction(transactionId);

    if (verification.status === 'ACCEPTED') {
      const confirmRes = await confirmCinetPayBooking(transactionId, {
        paymentMethod: verification.paymentMethod || 'cinetpay',
        operatorId: verification.operatorId
      });

      return json({
        success: true,
        status: 'confirmed',
        bookingReference: confirmRes.booking?.bookingReference || booking.bookingReference,
        guestEmail: confirmRes.booking?.guestEmail || booking.guestEmail
      });
    } else if (verification.status === 'WAITING_FOR_CUSTOMER') {
      return json({
        success: true,
        status: 'pending',
        bookingReference: booking.bookingReference
      });
    } else if (verification.status === 'REFUSED') {
      await failCinetPayBooking(transactionId);
      return json({
        success: true,
        status: 'failed',
        bookingReference: booking.bookingReference
      });
    }

    return json({
      success: true,
      status: booking.status,
      bookingReference: booking.bookingReference
    });
  } catch (err: any) {
    console.error('[CinetPay Check-Status API Error]:', err);
    return json({ success: false, error: err.message || 'Error checking status' }, { status: 500 });
  }
};
