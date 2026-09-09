import type { PageServerLoad } from './$types';
import { getAllFaqs, getAllRooms } from '$lib/server/db';

export const prerender = false;

export const load: PageServerLoad = async ({ setHeaders, depends }) => {
  depends('app:rooms');
  setHeaders({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache'
  });

  const [faqs, rooms] = await Promise.all([
    getAllFaqs(),
    getAllRooms()
  ]);

  return {
    faqs,
    rooms
  };
};
