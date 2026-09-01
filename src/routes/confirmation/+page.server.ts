import type { PageServerLoad } from './$types';
import { getBookingByReference, getBookingByReferenceOnly, getRoomById } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
  const ref = url.searchParams.get('ref') || 'MDJ-84920';
  const email = url.searchParams.get('email');

  let booking = email ? await getBookingByReference(ref, email) : null;
  if (!booking) {
    booking = await getBookingByReferenceOnly(ref);
  }

  let room = null;
  if (booking) {
    room = await getRoomById(booking.roomId);
  }

  return {
    ref,
    booking,
    room
  };
};
