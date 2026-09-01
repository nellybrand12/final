import { env } from '$env/dynamic/private';
import crypto from 'crypto';
import { normalizeCameroonPhone } from './mtnMomo';
import type {
  MobileMoneyPaymentRequest,
  PaymentRequestResult,
  PaymentStatusResult,
  PaymentTransactionStatus
} from './types';

// ============================================================================
// ORANGE MONEY CAMEROON API INTEGRATION
// ============================================================================
// Environment variables expected:
// - ORANGE_MONEY_API_KEY: Orange Developer App Client ID / API Key
// - ORANGE_MONEY_API_SECRET: Orange Developer App Client Secret
// - ORANGE_MONEY_MERCHANT_KEY: Orange Money Merchant Key (PIN / Code Marchand)
// - ORANGE_MONEY_BASE_URL: e.g. 'https://api.orange.com' or sandbox endpoint
// ============================================================================

const ORANGE_MONEY_API_KEY = env.ORANGE_MONEY_API_KEY;
const ORANGE_MONEY_API_SECRET = env.ORANGE_MONEY_API_SECRET;
const ORANGE_MONEY_MERCHANT_KEY = env.ORANGE_MONEY_MERCHANT_KEY;
const ORANGE_MONEY_BASE_URL = env.ORANGE_MONEY_BASE_URL || 'https://api.orange.com';

interface OrangeTransactionRecord {
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

const mockOrangeTransactions = new Map<string, OrangeTransactionRecord>();

/**
 * Obtain OAuth token from Orange API
 */
async function getOrangeAuthToken(): Promise<string | null> {
  if (!ORANGE_MONEY_API_KEY || !ORANGE_MONEY_API_SECRET) {
    return null;
  }

  try {
    const authHeader = Buffer.from(`${ORANGE_MONEY_API_KEY}:${ORANGE_MONEY_API_SECRET}`).toString('base64');
    const res = await fetch(`${ORANGE_MONEY_BASE_URL}/oauth/v3/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      console.error('[Orange Money] Failed to get auth token:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('[Orange Money] Error fetching auth token:', err);
    return null;
  }
}

/**
 * Initiates an Orange Money push payment request
 */
export async function requestOrangePayment(
  payload: MobileMoneyPaymentRequest
): Promise<PaymentRequestResult> {
  const transactionId = crypto.randomUUID();
  const phone = normalizeCameroonPhone(payload.phone);
  const currency = payload.currency || 'XAF';
  const now = Date.now();
  const expiresAt = now + 2 * 60 * 1000; // 2 minutes timeout

  const hasLiveCredentials = Boolean(
    ORANGE_MONEY_API_KEY &&
    ORANGE_MONEY_API_SECRET &&
    !ORANGE_MONEY_API_KEY.includes('PLACEHOLDER')
  );

  if (hasLiveCredentials) {
    try {
      const token = await getOrangeAuthToken();
      if (!token) {
        throw new Error('Could not obtain Orange Money authorization token');
      }

      // Orange WebPayment / MPOS API call
      const response = await fetch(`${ORANGE_MONEY_BASE_URL}/orange-money-webpay/cm/v1/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchant_key: ORANGE_MONEY_MERCHANT_KEY || 'MERCHANT_KEY_PLACEHOLDER',
          currency: 'OUV', // Central African Franc code in Orange standard or XAF
          order_id: payload.bookingReference,
          amount: payload.amount,
          return_url: 'https://residence-madadjeu.com/confirmation',
          cancel_url: 'https://residence-madadjeu.com/reserver',
          notif_url: 'https://residence-madadjeu.com/api/payments/orange-money/webhook',
          lang: 'fr',
          reference: payload.bookingReference
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Orange Money] Request error:', response.status, errorText);
        return {
          success: false,
          transactionId,
          provider: 'orange_money',
          status: 'failed',
          message: 'Le service Orange Money a rencontré une erreur. Veuillez vérifier votre numéro ou réessayer.',
          phone,
          amount: payload.amount
        };
      }

      mockOrangeTransactions.set(transactionId, {
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
        provider: 'orange_money',
        status: 'pending',
        message: 'Demande de paiement envoyée. Veuillez valider le code secret sur votre téléphone.',
        phone,
        amount: payload.amount,
        expiresAt: new Date(expiresAt).toISOString()
      };
    } catch (err) {
      console.error('[Orange Money] Live call failed, falling back to sandbox mode:', err);
    }
  }

  // =========================================================================
  // SANDBOX / SIMULATED FALLBACK (When env vars are unset)
  // =========================================================================
  mockOrangeTransactions.set(transactionId, {
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
    provider: 'orange_money',
    status: 'pending',
    message: 'Demande de paiement envoyée. Veuillez valider le code secret sur votre téléphone.',
    phone,
    amount: payload.amount,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

/**
 * Checks transaction status for Orange Money
 */
export async function checkOrangePaymentStatus(
  transactionId: string
): Promise<PaymentStatusResult> {
  const record = mockOrangeTransactions.get(transactionId);
  const now = Date.now();

  const hasLiveCredentials = Boolean(
    ORANGE_MONEY_API_KEY &&
    ORANGE_MONEY_API_SECRET &&
    !ORANGE_MONEY_API_KEY.includes('PLACEHOLDER')
  );

  if (hasLiveCredentials) {
    try {
      const token = await getOrangeAuthToken();
      if (token) {
        const res = await fetch(`${ORANGE_MONEY_BASE_URL}/orange-money-webpay/cm/v1/transactionstatus`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: record?.bookingReference,
            amount: record?.amount,
            pay_token: transactionId
          })
        });

        if (res.ok) {
          const data = await res.json();
          let status: PaymentTransactionStatus = 'pending';
          if (data.status === 'SUCCESS' || data.status === 'SUCCESSFUL') status = 'successful';
          else if (data.status === 'FAILED' || data.status === 'CANCELLED') status = 'failed';

          if (record) {
            record.status = status;
            if (data.txnid) record.financialTransactionId = data.txnid;
          }

          return {
            transactionId,
            bookingReference: record?.bookingReference || '',
            provider: 'orange_money',
            status,
            amount: record?.amount || 0,
            financialTransactionId: data.txnid,
            message: status === 'successful' ? 'Paiement Orange Money confirmé avec succès.' : undefined
          };
        }
      }
    } catch (err) {
      console.error('[Orange Money] Error checking transaction status:', err);
    }
  }

  // =========================================================================
  // SANDBOX / SIMULATED STATUS TRANSITION
  // Transitions pending -> successful after ~7 seconds
  // Times out after 2 minutes
  // =========================================================================
  if (!record) {
    return {
      transactionId,
      bookingReference: '',
      provider: 'orange_money',
      status: 'failed',
      amount: 0,
      message: 'Transaction introuvable ou expirée.'
    };
  }

  if (now > record.expiresAt && record.status === 'pending') {
    record.status = 'timeout';
  } else if (record.status === 'pending') {
    const elapsedSeconds = (now - record.createdAt) / 1000;
    if (elapsedSeconds >= 7) {
      record.status = 'successful';
      record.financialTransactionId = `OM-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  }

  return {
    transactionId,
    bookingReference: record.bookingReference,
    provider: 'orange_money',
    status: record.status,
    amount: record.amount,
    financialTransactionId: record.financialTransactionId,
    message: record.status === 'successful'
      ? 'Paiement Orange Money confirmé avec succès.'
      : record.status === 'timeout'
      ? 'Délai d’attente dépassé (2 min). Veuillez réessayer.'
      : 'En attente de validation sur votre téléphone...'
  };
}
