import type { PageServerLoad } from './$types';
import { getAllRooms, getAllFaqs } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const rooms = await getAllRooms();
  const faqs = await getAllFaqs();

  return {
    rooms: rooms.slice(0, 3),
    faqs: faqs.slice(0, 3)
  };
};
