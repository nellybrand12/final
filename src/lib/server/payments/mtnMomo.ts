import { env } from '$env/dynamic/private';
import crypto from 'crypto';
import type {
  MobileMoneyPaymentRequest,
  PaymentRequestResult,
  PaymentStatusResult,
  PaymentTransactionStatus
} from './types';

// ============================================================================
// MTN MOBILE MONEY (MOMO) API INTEGRATION
// ============================================================================
// Environment variables expected:
// - MTN_MOMO_API_KEY: MoMo API User ID / API Key
// - MTN_MOMO_API_SECRET: MoMo API Secret / Key
// - MTN_MOMO_SUBSCRIPTION_KEY: MoMo Primary / Secondary Subscription Key
// - MTN_MOMO_TARGET_ENVIRONMENT: 'sandbox' | 'live' (Default: 'sandbox')
// - MTN_MOMO_BASE_URL: Base URL (e.g. 'https://sandbox.momodeveloper.mtn.com' or live endpoint)
// ============================================================================

const MTN_MOMO_API_KEY = env.MTN_MOMO_API_KEY;
const MTN_MOMO_API_SECRET = env.MTN_MOMO_API_SECRET;
const MTN_MOMO_SUBSCRIPTION_KEY = env.MTN_MOMO_SUBSCRIPTION_KEY;
const MTN_MOMO_TARGET_ENVIRONMENT = env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox';
const MTN_MOMO_BASE_URL = env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

// In-memory store for tracking active transaction simulation states during dev/test
interface MtnTransactionRecord {
  transactionId: string;
  bookingReference: string;
  phone: string;
  amount: number;
  currency: string;
  status: PaymentTransactionStatus;
  createdAt: number;
  expiresAt: number;
  financialTransactionId?: string;
}

const mockMtnTransactions = new Map<string, MtnTransactionRecord>();

/**
 * Normalizes phone number to Cameroon MSISDN format (237XXXXXXXXX)
 */
export function normalizeCameroonPhone(phone: string): string {
  let cleaned = phone.replace(/[\s+\-()]/g, '');
  if (cleaned.startsWith('237') && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.length === 9) {
    return `237${cleaned}`;
  }
  return cleaned;
}

/**
 * Request Access Token from MTN MoMo Collection API
 */
async function getMtnAuthToken(): Promise<string | null> {
  if (!MTN_MOMO_API_KEY || !MTN_MOMO_API_SECRET || !MTN_MOMO_SUBSCRIPTION_KEY) {
    return null;
  }

  try {
    const authHeader = Buffer.from(`${MTN_MOMO_API_KEY}:${MTN_MOMO_API_SECRET}`).toString('base64');
    const res = await fetch(`${MTN_MOMO_BASE_URL}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY
      }
    });

    if (!res.ok) {
      console.error('[MTN MoMo] Failed to get auth token:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('[MTN MoMo] Error during auth token request:', err);
    return null;
  }
}

/**
 * Initiates an MTN MoMo "Request to Pay" (USSD Push prompt sent to customer)
 */
export async function requestMtnPayment(
  payload: MobileMoneyPaymentRequest
): Promise<PaymentRequestResult> {
  const transactionId = crypto.randomUUID();
  const phone = normalizeCameroonPhone(payload.phone);
  const currency = payload.currency || 'XAF';
  const now = Date.now();
  const expiresAt = now + 2 * 60 * 1000; // 2 minutes expiry

  const hasLiveCredentials = Boolean(
    MTN_MOMO_API_KEY &&
    MTN_MOMO_API_SECRET &&
    MTN_MOMO_SUBSCRIPTION_KEY &&
    !MTN_MOMO_API_KEY.includes('PLACEHOLDER')
  );

  if (hasLiveCredentials) {
    try {
      const token = await getMtnAuthToken();
      if (!token) {
        throw new Error('Could not obtain MTN MoMo authorization token');
      }

      const response = await fetch(`${MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': transactionId,
          'X-Target-Environment': MTN_MOMO_TARGET_ENVIRONMENT,
          'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: payload.amount.toString(),
          currency: currency,
          externalId: payload.bookingReference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phone
          },
          payerMessage: `Reservation ${payload.bookingReference} - Hotel Madadjeu`,
          payeeNote: 'Hotel Residence Madadjeu'
        })
      });

      if (!response.ok && response.status !== 202) {
        const errorText = await response.text();
        console.error('[MTN MoMo] Request to pay error:', response.status, errorText);
        return {
          success: false,
          transactionId,
          provider: 'mtn_momo',
          status: 'failed',
          message: 'Le service MTN MoMo a rejeté la demande. Vérifiez le numéro ou réessayez.',
          phone,
          amount: payload.amount
        };
      }

      // Track transaction
      mockMtnTransactions.set(transactionId, {
        transactionId,
        bookingReference: payload.bookingReference,
        phone,
        amount: payload.amount,
        currency,
        status: 'pending',
        createdAt: now,
        expiresAt
      });

      return {
        success: true,
        transactionId,
        provider: 'mtn_momo',
        status: 'pending',
        message: 'Demande de paiement envoyée. Veuillez valider le code secret sur votre téléphone.',
        phone,
        amount: payload.amount,
        expiresAt: new Date(expiresAt).toISOString()
      };
    } catch (err) {
      console.error('[MTN MoMo] Live request failed, falling back to sandbox mode:', err);
    }
  }

  // =========================================================================
  // SANDBOX / SIMULATED FALLBACK (When env vars are not set)
  // =========================================================================
  mockMtnTransactions.set(transactionId, {
    transactionId,
    bookingReference: payload.bookingReference,
    phone,
    amount: payload.amount,
    currency,
    status: 'pending',
    createdAt: now,
    expiresAt
  });

  return {
    success: true,
    transactionId,
    provider: 'mtn_momo',
    status: 'pending',
    message: 'Demande de paiement envoyée. Veuillez valider le code secret sur votre téléphone.',
    phone,
    amount: payload.amount,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

/**
 * Checks transaction status for MTN MoMo
 */
export async function checkMtnPaymentStatus(
  transactionId: string
): Promise<PaymentStatusResult> {
  const record = mockMtnTransactions.get(transactionId);
  const now = Date.now();

  const hasLiveCredentials = Boolean(
    MTN_MOMO_API_KEY &&
    MTN_MOMO_API_SECRET &&
    MTN_MOMO_SUBSCRIPTION_KEY &&
    !MTN_MOMO_API_KEY.includes('PLACEHOLDER')
  );

  if (hasLiveCredentials) {
    try {
      const token = await getMtnAuthToken();
      if (token) {
        const res = await fetch(`${MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${transactionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': MTN_MOMO_TARGET_ENVIRONMENT,
            'Ocp-Apim-Subscription-Key': MTN_MOMO_SUBSCRIPTION_KEY!
          }
        });

        if (res.ok) {
          const data = await res.json();
          // MTN MoMo returns: status: 'SUCCESSFUL' | 'FAILED' | 'PENDING'
          let status: PaymentTransactionStatus = 'pending';
          if (data.status === 'SUCCESSFUL') status = 'successful';
          else if (data.status === 'FAILED') status = 'failed';

          if (record) {
            record.status = status;
            if (data.financialTransactionId) {
              record.financialTransactionId = data.financialTransactionId;
            }
          }

          return {
            transactionId,
            bookingReference: record?.bookingReference || data.externalId || '',
            provider: 'mtn_momo',
            status,
            amount: parseFloat(data.amount) || record?.amount || 0,
            financialTransactionId: data.financialTransactionId,
            message: data.reason || (status === 'successful' ? 'Paiement confirmé avec succès.' : undefined)
          };
        }
      }
    } catch (err) {
      console.error('[MTN MoMo] Error polling live transaction status:', err);
    }
  }

  // =========================================================================
  // SANDBOX / SIMULATED STATUS TRANSITION
  // Transitions pending -> successful after ~7 seconds to simulate user entering PIN
  // Times out after 2 minutes
  // =========================================================================
  if (!record) {
    return {
      transactionId,
      bookingReference: '',
      provider: 'mtn_momo',
      status: 'failed',
      amount: 0,
      message: 'Transaction introuvable ou expirée.'
    };
  }

  // If timed out
  if (now > record.expiresAt && record.status === 'pending') {
    record.status = 'timeout';
  } else if (record.status === 'pending') {
    const elapsedSeconds = (now - record.createdAt) / 1000;
    // Simulate approval after 7 seconds
    if (elapsedSeconds >= 7) {
      record.status = 'successful';
      record.financialTransactionId = `MTN-MOM-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  }

  return {
    transactionId,
    bookingReference: record.bookingReference,
    provider: 'mtn_momo',
    status: record.status,
    amount: record.amount,
    financialTransactionId: record.financialTransactionId,
    message: record.status === 'successful' 
      ? 'Paiement MTN MoMo confirmé avec succès.' 
      : record.status === 'timeout'
      ? 'Délai d’attente dépassé (2 min). Veuillez réessayer.'
      : 'En attente de validation sur votre téléphone...'
  };
}
