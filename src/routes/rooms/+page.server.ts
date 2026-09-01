import type { PageServerLoad } from './$types';
import { getAllRooms } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const rooms = await getAllRooms();
  return {
    rooms
  };
};
