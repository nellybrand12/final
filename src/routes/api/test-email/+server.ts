import { json } from '@sveltejs/kit';
import { sendBookingConfirmationEmail } from '$lib/server/email';
import { getRoomById } from '$lib/server/db';
import type { Booking } from '$lib/server/db/schema';

export async function GET() {
  try {
    const mockRoom = await getRoomById(1);
    const mockBooking: Booking = {
      id: 9999,
      bookingReference: 'MDJ-TEST-1234',
      guestName: 'Admin Tester',
      guestEmail: 'nellybrand03@gmail.com', // Using the EMAIL_FROM_ADDRESS to ensure it delivers
      guestPhone: '+237 6000000',
      roomId: 1,
      checkInDate: '2026-10-01',
      checkOutDate: '2026-10-05',
      guestsCount: 2,
      specialRequests: 'Test Request',
      totalPrice: '500000',
      paymentMethod: 'hotel',
      paymentTransactionId: null,
      status: 'confirmed',
      eventType: null,
      createdAt: new Date()
    };

    const result = await sendBookingConfirmationEmail(mockBooking, mockRoom);
    return json({ success: true, result });
  } catch (err: any) {
    return json({ success: false, error: err.message }, { status: 500 });
  }
}
