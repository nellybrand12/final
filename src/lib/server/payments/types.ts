export type PaymentProvider = 'hotel' | 'mtn_momo' | 'orange_money' | 'card';

export type PaymentTransactionStatus = 'pending' | 'successful' | 'failed' | 'timeout';

export interface MobileMoneyPaymentRequest {
  bookingReference: string;
  amount: number;
  phone: string;
  currency?: string; // Default: 'XAF'
  guestName: string;
  guestEmail: string;
}

export interface PaymentRequestResult {
  success: boolean;
  transactionId: string;
  provider: PaymentProvider;
  status: PaymentTransactionStatus;
  message: string;
  phone?: string;
  amount: number;
  expiresAt?: string;
}

export interface PaymentStatusResult {
  transactionId: string;
  bookingReference: string;
  provider: PaymentProvider;
  status: PaymentTransactionStatus;
  amount: number;
  message?: string;
  financialTransactionId?: string;
}

export interface CardPaymentDetails {
  bookingReference: string;
  amount: number;
  currency?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  guestEmail: string;
}

export interface CardPaymentResult {
  success: boolean;
  transactionId: string;
  status: 'successful' | 'failed';
  message: string;
  last4?: string;
  cardBrand?: string;
}
