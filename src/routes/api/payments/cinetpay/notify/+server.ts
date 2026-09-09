import { json, type RequestHandler } from '@sveltejs/kit';
import {
  getCinetPayConfig,
  verifyCinetPayHmac,
  checkCinetPayTransaction,
  confirmCinetPayBooking,
  failCinetPayBooking,
  confirmCinetPayExtension,
  failCinetPayExtension
} from '$lib/server/payments/cinetpay';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const rawBody = await request.text();
    const headers = request.headers;
    const xToken = headers.get('x-token') || headers.get('X-TOKEN') || '';

    // Parse incoming payload (supports both JSON and form-urlencoded formats)
    let transactionId = '';

    try {
      const parsedJson = JSON.parse(rawBody);
      transactionId = parsedJson.cpm_trans_id || parsedJson.transaction_id || '';
    } catch {
      // Parse URL encoded form params
      const searchParams = new URLSearchParams(rawBody);
      transactionId = searchParams.get('cpm_trans_id') || searchParams.get('transaction_id') || '';
    }

    if (!transactionId) {
      console.warn('[CinetPay Webhook] Received notification without cpm_trans_id');
      return json({ success: false, error: 'Missing cpm_trans_id' }, { status: 400 });
    }

    const config = await getCinetPayConfig();

    // Verify HMAC if X-TOKEN and secret/api key are present
    const hmacSecret = config.secretKey || config.apiKey;
    if (xToken && hmacSecret) {
      const isValidHmac = verifyCinetPayHmac(rawBody, xToken, hmacSecret);
      if (!isValidHmac) {
        console.warn(`[CinetPay Webhook] HMAC token verification failed for transaction ${transactionId}`);
        return json({ success: false, error: 'Invalid HMAC signature' }, { status: 401 });
      }
    } else if (config.secretKey && !xToken) {
      console.warn(`[CinetPay Webhook] Missing X-TOKEN header while secretKey is configured`);
      return json({ success: false, error: 'Missing X-TOKEN header' }, { status: 401 });
    }

    // Authoritative Server-to-Server Verification with CinetPay API
    const verification = await checkCinetPayTransaction(transactionId);

    console.log(
      `[CinetPay Webhook] Authoritative verification for ${transactionId}: status=${verification.status}, code=${verification.code}`
    );

    if (verification.status === 'ACCEPTED') {
      // Check if this transaction belongs to a booking extension first
      let isExtension = false;
      if (db && isDbHealthy) {
        const [ext] = await db.select({ id: schema.bookingExtensions.id })
          .from(schema.bookingExtensions)
          .where(eq(schema.bookingExtensions.paymentTransactionId, transactionId))
          .limit(1);
        isExtension = Boolean(ext);
      }

      if (isExtension) {
        const result = await confirmCinetPayExtension(transactionId);
        if (!result.success) {
          console.error(`[CinetPay Webhook] Failed to confirm extension: ${result.error}`);
          return json({ success: false, error: result.error }, { status: 500 });
        }
        console.log(`[CinetPay Webhook] Extension successfully confirmed for transaction ${transactionId}`);
        return json({ success: true, message: 'Extension confirmed' });
      }

      const result = await confirmCinetPayBooking(transactionId, {
        paymentMethod: verification.paymentMethod || 'cinetpay',
        operatorId: verification.operatorId
      });

      if (!result.success) {
        console.error(`[CinetPay Webhook] Failed to confirm reservation: ${result.error}`);
        return json({ success: false, error: result.error }, { status: 500 });
      }

      console.log(`[CinetPay Webhook] Reservation successfully confirmed for transaction ${transactionId}`);
      return json({ success: true, message: 'Reservation confirmed' });
    } else if (verification.status === 'WAITING_FOR_CUSTOMER') {
      // Leave reservation as pending (do NOT fail it)
      console.log(`[CinetPay Webhook] Transaction ${transactionId} is waiting for customer validation`);
      return json({ success: true, message: 'Transaction pending customer validation' });
    } else if (verification.status === 'REFUSED') {
      // Try to fail an extension first; if that finds nothing, fail the booking
      const extFailed = await failCinetPayExtension(transactionId);
      if (!extFailed) {
        await failCinetPayBooking(transactionId);
      }
      console.log(`[CinetPay Webhook] Transaction ${transactionId} was refused/failed.`);
      return json({ success: true, message: 'Transaction marked as failed' });
    } else {
      console.warn(`[CinetPay Webhook] Unrecognized transaction status: ${verification.status}`);
      return json({ success: true, message: 'Status noted' });
    }
  } catch (error: any) {
    console.error('[CinetPay Webhook Error]:', error);
    return json({ success: false, error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
};
