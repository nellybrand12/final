import crypto from 'crypto';
import type { CardPaymentDetails, CardPaymentResult } from './types';

// ============================================================================
// GENERIC CARD PAYMENT GATEWAY INTERFACE
// ============================================================================
// Pluggable generic interface for Visa / Mastercard processors:
// - Stripe
// - Flutterwave
// - CinetPay
// - TouchPay / Campay
// ============================================================================

/**
 * Detects card brand from card number
 */
export function detectCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Credit Card';
}

/**
 * Luhn algorithm check for credit card numbers
 */
export function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Generic Card Payment Processor
 * 
 * Replace or extend this method when attaching live payment gateway SDKs
 * (e.g. Stripe PaymentIntents, Flutterwave chargeCard, CinetPay SDK)
 */
export async function processCardPayment(
  details: CardPaymentDetails
): Promise<CardPaymentResult> {
  const digits = details.cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4) || '0000';
  const cardBrand = detectCardBrand(digits);
  const transactionId = `CARD-TX-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  // Basic validation checks
  if (!details.cardHolder || details.cardHolder.trim().length < 2) {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'Veuillez saisir le nom complet du titulaire de la carte.'
    };
  }

  if (digits.length < 15 || digits.length > 19) {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'Numéro de carte bancaire incomplet ou invalide.'
    };
  }

  const expMonth = parseInt(details.expiryMonth, 10);
  const expYear = parseInt(details.expiryYear.length === 2 ? `20${details.expiryYear}` : details.expiryYear, 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'Mois d’expiration invalide (01-12).'
    };
  }

  if (isNaN(expYear) || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'La carte bancaire est expirée.'
    };
  }

  if (!details.cvc || details.cvc.trim().length < 3 || details.cvc.trim().length > 4) {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'Code de sécurité CVC/CVV invalide (3 ou 4 chiffres).'
    };
  }

  // =========================================================================
  // PRODUCTION GATEWAY HOOK
  // If integrating Stripe / Flutterwave, place API dispatch call here:
  // e.g.:
  // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  // const charge = await stripe.charges.create({ ... });
  // =========================================================================

  // Test simulation check: Card ending in '0000' can be used to simulate failure
  if (last4 === '0000') {
    return {
      success: false,
      transactionId,
      status: 'failed',
      message: 'Paiement refusé par la banque émettrice. Veuillez vérifier vos fonds ou utiliser une autre carte.',
      last4,
      cardBrand
    };
  }

  return {
    success: true,
    transactionId,
    status: 'successful',
    message: `Paiement ${cardBrand} de ${details.amount} FCFA validé avec succès.`,
    last4,
    cardBrand
  };
}
