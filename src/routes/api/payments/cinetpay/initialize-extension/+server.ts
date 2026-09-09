import { json, type RequestHandler } from '@sveltejs/kit';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getCinetPayConfig } from '$lib/server/payments/cinetpay';

/**
 * POST /api/payments/cinetpay/initialize-extension
 * Stores a CinetPay transaction ID on an existing pending booking_extensions row
 * and returns the CinetPay payment initialization parameters.
 */
export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { extensionId, guestName, guestEmail, guestPhone, guestAddress, guestCity, guestCountry } = body;

    if (!extensionId || !guestName || !guestEmail) {
      return json({ success: false, error: 'extensionId, guestName, and guestEmail are required' }, { status: 400 });
    }

    if (!db || !isDbHealthy) {
      return json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    // 1. Fetch the extension row
    const [extension] = await db.select().from(schema.bookingExtensions)
      .where(eq(schema.bookingExtensions.id, Number(extensionId)));

    if (!extension) {
      return json({ success: false, error: 'Extension not found' }, { status: 404 });
    }
    if (extension.status !== 'pending') {
      return json({ success: false, error: 'Extension is no longer pending' }, { status: 400 });
    }

    const config = await getCinetPayConfig();

    // 2. Generate a unique transaction ID for the extension payment
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const transactionId = `MDJ-EXT-${Date.now()}-${randomSuffix}`;

    // 3. Store transaction ID on the extension row
    await db.update(schema.bookingExtensions)
      .set({ paymentTransactionId: transactionId })
      .where(eq(schema.bookingExtensions.id, extension.id));

    // 4. Build CinetPay payment parameters
    const nameParts = guestName.trim().split(/\s+/);
    const customerSurname = nameParts[0] || 'Client';
    const customerName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'Client';

    const notifyUrl = `${url.origin}/api/payments/cinetpay/notify`;
    const numericAmount = Math.round(Number(extension.additionalCharge));

    return json({
      success: true,
      transactionId,
      extensionId: extension.id,
      amount: numericAmount,
      currency: 'XAF',
      description: `Prolongation de séjour - Extension #${extension.id}`,
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
    console.error('[CinetPay Extension Init API Error]:', error);
    return json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
};
