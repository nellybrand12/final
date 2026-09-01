import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRoomBySlug, getAllRooms } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
  const room = await getRoomBySlug(params.id);

  if (!room) {
    throw error(404, 'La chambre ou suite demandée est introuvable.');
  }

  const allRooms = await getAllRooms();
  const otherRooms = allRooms.filter(r => r.id !== room.id).slice(0, 2);

  return {
    room,
    otherRooms
  };
};
