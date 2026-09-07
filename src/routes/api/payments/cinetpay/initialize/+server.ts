import { json, type RequestHandler } from '@sveltejs/kit';
import { db, isDbHealthy, createBooking, getBookingByReferenceOnly } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getCinetPayConfig } from '$lib/server/payments/cinetpay';

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json();
    const {
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
      guestCity,
      guestCountry,
      guestsCount,
      specialRequests,
      eventType
    } = body;

    if (!roomId || !checkInDate || !checkOutDate || !totalPrice || !guestName || !guestEmail) {
      return json({ success: false, error: 'Champs requis manquants pour la réservation' }, { status: 400 });
    }

    const config = await getCinetPayConfig();
    if (!config.apiKey || !config.siteId) {
      console.warn('[CinetPay Init] CinetPay API key or Site ID not yet configured in siteSettings or env.');
    }

    // Generate unique CinetPay transaction ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const transactionId = `MDJ-CP-${Date.now()}-${randomSuffix}`;

    // Generate or use booking reference
    let bookingReference = (body.bookingReference || '').trim().toUpperCase();
    if (!bookingReference) {
      bookingReference = `MDJ-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Check if booking already exists in DB
    const existingBooking = await getBookingByReferenceOnly(bookingReference);

    if (existingBooking) {
      if (db && isDbHealthy) {
        await db
          .update(schema.bookings)
          .set({
            paymentTransactionId: transactionId,
            paymentMethod: 'cinetpay',
            status: 'pending_payment',
            totalPrice: totalPrice.toString()
          })
          .where(eq(schema.bookings.id, existingBooking.id));
      }
    } else {
      // Create pending booking (note: inventory is not decremented yet because status is pending_payment)
      await createBooking({
        bookingReference,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone ? guestPhone.trim() : '',
        roomId: Number(roomId),
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount) || 1,
        specialRequests: specialRequests ? specialRequests.trim() : null,
        eventType: eventType ? eventType.trim() : null,
        totalPrice: totalPrice.toString(),
        paymentMethod: 'cinetpay',
        paymentTransactionId: transactionId,
        status: 'pending_payment'
      });
    }

    // Parse customer name into name and surname
    const nameParts = guestName.trim().split(/\s+/);
    const customerSurname = nameParts[0] || 'Client';
    const customerName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'Client';

    // Build absolute notify_url
    const notifyUrl = `${url.origin}/api/payments/cinetpay/notify`;
    const numericAmount = Math.round(Number(totalPrice));

    return json({
      success: true,
      transactionId,
      bookingReference,
      amount: numericAmount,
      currency: 'XAF',
      description: `Réservation Hôtel Résidence Madadjeu - ${bookingReference}`,
      apiKey: config.apiKey,
      siteId: config.siteId,
      notifyUrl,
      mode: 'PRODUCTION',
      customer: {
        name: customerName,
        surname: customerSurname,
        email: guestEmail.trim(),
        phoneNumber: (guestPhone || '').trim(),
        address: (guestAddress || 'Bastos, Yaoundé').trim(),
        city: (guestCity || 'Yaoundé').trim(),
        country: (guestCountry || 'CM').trim().toUpperCase(),
        state: 'CM',
        zipCode: '00237'
      }
    });
  } catch (error: any) {
    console.error('[CinetPay Init API Error]:', error);
    return json({ success: false, error: error.message || 'Erreur serveur lors de l\'initialisation du paiement' }, { status: 500 });
  }
};
