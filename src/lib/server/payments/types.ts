export type PaymentProvider = 'hotel' | 'cinetpay';

export type PaymentTransactionStatus = 'pending' | 'successful' | 'failed' | 'timeout';

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  secretKey?: string;
  mode?: 'PRODUCTION' | 'SANDBOX';
}

export interface CinetPayCustomer {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string; // ISO 2-letter e.g. 'CM'
  state: string;   // ISO 2-letter e.g. 'CM'
  zipCode: string;
}

export interface CinetPayInitParams {
  bookingReference: string;
  amount: number;
  currency?: string;
  description: string;
  customer: CinetPayCustomer;
  notifyUrl: string;
}

export interface CinetPayCheckResponse {
  success: boolean;
  code?: string;
  message?: string;
  status: 'ACCEPTED' | 'WAITING_FOR_CUSTOMER' | 'REFUSED' | 'UNKNOWN';
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  operatorId?: string;
  raw?: any;
}
