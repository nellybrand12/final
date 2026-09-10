import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { CinetPayConfig, CinetPayCheckResponse } from './types';

/**
 * Retrieves CinetPay configuration from siteSettings database table,
 * falling back gracefully to server environment variables.
 */
export async function getCinetPayConfig(): Promise<CinetPayConfig> {
  let apiKey = env.CINETPAY_API_KEY || '';
  let siteId = env.CINETPAY_SITE_ID || '';
  let secretKey = env.CINETPAY_SECRET_KEY || '';

  if (db && isDbHealthy) {
    try {
      const settings = await db.select().from(schema.siteSettings);
      const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

      if (settingsMap.has('cinetpay_api_key')) {
        const val = String(settingsMap.get('cinetpay_api_key') || '').trim();
        if (val) apiKey = val;
      }
      if (settingsMap.has('cinetpay_site_id')) {
        const val = String(settingsMap.get('cinetpay_site_id') || '').trim();
        if (val) siteId = val;
      }
      if (settingsMap.has('cinetpay_secret_key')) {
        const val = String(settingsMap.get('cinetpay_secret_key') || '').trim();
        if (val) secretKey = val;
      }
    } catch (err) {
      console.warn('[CinetPay Config] Error loading from siteSettings table, falling back to env:', err);
    }
  }

  return {
    apiKey: apiKey.trim(),
    siteId: siteId.trim(),
    secretKey: secretKey.trim(),
    mode: 'PRODUCTION'
  };
}

/**
 * Verifies the authenticity of incoming CinetPay webhooks via HMAC SHA256 (X-TOKEN header).
 */
export function verifyCinetPayHmac(rawBody: string, xToken: string, secretKey: string): boolean {
  if (!xToken || !secretKey) {
    return false;
  }

  try {
    const cleanToken = xToken.trim();
    const computedHmac = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');

    const tokenBuffer = Buffer.from(cleanToken);
    const computedBuffer = Buffer.from(computedHmac);

    if (tokenBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, computedBuffer);
  } catch (err) {
    console.error('[CinetPay HMAC] Verification error:', err);
    return false;
  }
}

/**
 * Authoritatively verifies a transaction status with CinetPay's server-to-server endpoint.
 * POST https://api-checkout.cinetpay.com/v2/payment/check
 */
export async function checkCinetPayTransaction(transactionId: string): Promise<CinetPayCheckResponse> {
  const config = await getCinetPayConfig();

  if (!config.apiKey || !config.siteId) {
    console.error('[CinetPay Check] Cannot check transaction: missing apikey or site_id');
    return {
      success: false,
      status: 'UNKNOWN',
      message: 'CinetPay credentials not configured on server'
    };
  }

  try {
    const payload = {
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: transactionId
    };

    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      console.warn(`[CinetPay Check] Non-OK HTTP status ${response.status}:`, data);
      return {
        success: false,
        code: String(response.status),
        status: 'UNKNOWN',
        message: data?.message || 'CinetPay check request failed',
        raw: data
      };
    }

    // Code "00" or presence of data status indicates processed response
    const transactionData = data.data || {};
    const rawStatus = (transactionData.status || data.status || '').toUpperCase();

    let normalizedStatus: 'ACCEPTED' | 'WAITING_FOR_CUSTOMER' | 'REFUSED' | 'UNKNOWN' = 'UNKNOWN';
    if (rawStatus === 'ACCEPTED' || rawStatus === 'VALIDATED' || rawStatus === 'SUCCESS') {
      normalizedStatus = 'ACCEPTED';
    } else if (
      rawStatus === 'WAITING_FOR_CUSTOMER' ||
      rawStatus === 'PENDING' ||
      rawStatus === 'INITIALIZED' ||
      rawStatus === 'WAITING_CUSTOMER_PAYMENT'
    ) {
      normalizedStatus = 'WAITING_FOR_CUSTOMER';
    } else if (
      rawStatus === 'REFUSED' ||
      rawStatus === 'CANCELLED' ||
      rawStatus === 'FAILED' ||
      rawStatus === 'REJECTED'
    ) {
      normalizedStatus = 'REFUSED';
    }

    return {
      success: data.code === '00' || Boolean(transactionData.status),
      code: data.code,
      message: data.message,
      status: normalizedStatus,
      amount: transactionData.amount ? parseFloat(transactionData.amount) : undefined,
      currency: transactionData.currency,
      paymentMethod: transactionData.payment_method,
      operatorId: transactionData.operator_id,
      raw: data
    };
  } catch (err: any) {
    console.error('[CinetPay Check] Network error during transaction check:', err);
    return {
      success: false,
      status: 'UNKNOWN',
      message: err.message
    };
  }
}

/**
 * Authoritatively confirms a reservation upon server-verified ACCEPTED status:
 * 1. Checks if already confirmed (idempotency guard)
 * 2. Decrements room availability with atomic lock
 * 3. Updates reservation status to 'confirmed'
 */
export async function confirmCinetPayBooking(
  transactionId: string,
  paymentDetails?: { paymentMethod?: string; operatorId?: string }
): Promise<{ success: boolean; booking: schema.Booking | null; alreadyConfirmed: boolean; error?: string }> {
  if (!db || !isDbHealthy) {
    console.error('[CinetPay Confirm] Database is unavailable');
    return { success: false, booking: null, alreadyConfirmed: false, error: 'Database unavailable' };
  }

  try {
    let bookingToNotify: schema.Booking | null = null;
    let isAlreadyConfirmed = false;

    await db.transaction(async (tx) => {
      // 1. Fetch the booking with transaction lock
      const [booking] = await tx
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.paymentTransactionId, transactionId))
        .for('update');

      if (!booking) {
        throw new Error(`Booking with transactionId ${transactionId} not found`);
      }

      if (booking.status === 'confirmed') {
        isAlreadyConfirmed = true;
        bookingToNotify = booking;
        return;
      }

      // 2. Fetch the room with transaction lock
      const [room] = await tx
        .select()
        .from(schema.rooms)
        .where(eq(schema.rooms.id, booking.roomId))
        .for('update');

      if (!room) {
        throw new Error(`Room with ID ${booking.roomId} not found`);
      }

      const requestedRooms = booking.guestsCount || 1;

      // 3. Decrement room availability
      await tx
        .update(schema.rooms)
        .set({
          availableRooms: sql`GREATEST(${schema.rooms.availableRooms} - ${requestedRooms}, 0)`
        })
        .where(eq(schema.rooms.id, room.id));

      // 4. Update booking to confirmed
      const [updatedBooking] = await tx
        .update(schema.bookings)
        .set({
          status: 'confirmed',
          paymentMethod: paymentDetails?.paymentMethod || 'cinetpay',
          paymentTransactionId: transactionId
        })
        .where(eq(schema.bookings.id, booking.id))
        .returning();

      bookingToNotify = updatedBooking;
    });

    if (isAlreadyConfirmed) {
      return { success: true, booking: bookingToNotify, alreadyConfirmed: true };
    }

    if (bookingToNotify) {
      const confirmedBooking: schema.Booking = bookingToNotify;
      return { success: true, booking: confirmedBooking, alreadyConfirmed: false };
    }

    return { success: false, booking: null, alreadyConfirmed: false, error: 'Could not update booking' };
  } catch (err: any) {
    console.error('[CinetPay Confirm] Error confirming booking:', err);
    return { success: false, booking: null, alreadyConfirmed: false, error: err.message };
  }
}

/**
 * Fails a reservation if CinetPay returns REFUSED or definitive cancellation.
 */
export async function failCinetPayBooking(transactionId: string): Promise<boolean> {
  if (!db || !isDbHealthy) {
    return false;
  }

  try {
    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.paymentTransactionId, transactionId));

    if (booking && booking.status === 'pending') {
      await db
        .update(schema.bookings)
        .set({ status: 'failed' })
        .where(eq(schema.bookings.id, booking.id));
      return true;
    }
    return false;
  } catch (err) {
    console.error('[CinetPay Fail] Error marking booking as failed:', err);
    return false;
  }
}

/**
 * Confirms a booking extension when CinetPay payment is ACCEPTED.
 * Updates the extension row to 'confirmed', then updates the original booking's checkOutDate.
 */
export async function confirmCinetPayExtension(
  transactionId: string
): Promise<{ success: boolean; alreadyConfirmed: boolean; error?: string }> {
  if (!db || !isDbHealthy) {
    return { success: false, alreadyConfirmed: false, error: 'Database unavailable' };
  }

  try {
    let alreadyConfirmed = false;

    await db.transaction(async (tx) => {
      const [extension] = await tx
        .select()
        .from(schema.bookingExtensions)
        .where(eq(schema.bookingExtensions.paymentTransactionId, transactionId))
        .for('update');

      if (!extension) {
        throw new Error(`Extension with transactionId ${transactionId} not found`);
      }

      if (extension.status === 'confirmed') {
        alreadyConfirmed = true;
        return;
      }

      await tx
        .update(schema.bookingExtensions)
        .set({ status: 'confirmed' })
        .where(eq(schema.bookingExtensions.id, extension.id));

      await tx
        .update(schema.bookings)
        .set({ checkOutDate: extension.requestedCheckoutDate })
        .where(eq(schema.bookings.id, extension.bookingId));
    });

    return { success: true, alreadyConfirmed };
  } catch (err: any) {
    console.error('[CinetPay Extension Confirm] Error:', err);
    return { success: false, alreadyConfirmed: false, error: err.message };
  }
}

/**
 * Fails/expires a booking extension if CinetPay payment is REFUSED.
 * The original booking is completely unaffected.
 */
export async function failCinetPayExtension(transactionId: string): Promise<boolean> {
  if (!db || !isDbHealthy) return false;

  try {
    await db
      .update(schema.bookingExtensions)
      .set({ status: 'failed' })
      .where(eq(schema.bookingExtensions.paymentTransactionId, transactionId));
    return true;
  } catch (err) {
    console.error('[CinetPay Extension Fail] Error:', err);
    return false;
  }
}
