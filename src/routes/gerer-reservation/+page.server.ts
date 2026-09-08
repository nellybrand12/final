import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getBookingByReference, cancelBooking, getRoomById } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
  const ref = url.searchParams.get('ref');
  const email = url.searchParams.get('email');

  let booking = null;
  let room = null;

  if (ref && email) {
    booking = await getBookingByReference(ref, email);
    if (booking) {
      room = await getRoomById(booking.roomId);
    }
  }

  return {
    searchedRef: ref || '',
    searchedEmail: email || '',
    booking,
    room
  };
};

export const actions: Actions = {
  lookup: async ({ request }) => {
    const data = await request.formData();
    const reference = data.get('reference')?.toString()?.trim();
    const email = data.get('email')?.toString()?.trim();

    if (!reference || !email) {
      return fail(400, {
        error: 'Veuillez renseigner votre référence de réservation et votre adresse email.',
        values: { reference, email }
      });
    }

    const booking = await getBookingByReference(reference, email);
    if (!booking) {
      return fail(404, {
        error: 'Aucune réservation trouvée correspondant à ces informations. Veuillez vérifier votre référence (ex: MDJ-84920).',
        values: { reference, email }
      });
    }

    const room = await getRoomById(booking.roomId);

    return {
      success: true,
      booking,
      room
    };
  },

  cancel: async ({ request }) => {
    const data = await request.formData();
    const reference = data.get('reference')?.toString()?.trim();
    const email = data.get('email')?.toString()?.trim();

    if (!reference || !email) {
      return fail(400, { error: 'Données manquantes.' });
    }

    const result = await cancelBooking(reference, email);
    if (!result.success) {
      return fail(400, { error: result.message || 'Impossible d’annuler cette réservation.' });
    }

    const booking = await getBookingByReference(reference, email);
    const room = booking ? await getRoomById(booking.roomId) : null;

    return {
      cancelled: true,
      message: result.message,
      refundPercentage: result.refundPercentage,
      booking,
      room
    };
  }
};
