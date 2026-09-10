import { json } from '@sveltejs/kit';
import { getAllRooms } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const rooms = await getAllRooms();
  return json(rooms, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache'
    }
  });
};
