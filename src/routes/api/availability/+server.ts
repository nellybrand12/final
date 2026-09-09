import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { checkAvailability } from '$lib/server/db';

export async function GET({ url }: RequestEvent) {
  const roomIdStr = url.searchParams.get('roomId');
  const checkInDate = url.searchParams.get('checkInDate');
  const checkOutDate = url.searchParams.get('checkOutDate');

  if (!roomIdStr || !checkInDate || !checkOutDate) {
    return json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const roomId = parseInt(roomIdStr, 10);
  if (isNaN(roomId)) {
    return json({ error: 'Invalid roomId' }, { status: 400 });
  }

  try {
    const availableCount = await checkAvailability(roomId, checkInDate, checkOutDate);
    return json({ available: availableCount });
  } catch (error) {
    console.error('Error checking availability:', error);
    return json({ error: 'Failed to check availability' }, { status: 500 });
  }
};
