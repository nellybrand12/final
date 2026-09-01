import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

export const load: PageServerLoad = async () => {
  let rooms: any[] = [];

  if (db && isDbHealthy) {
    try {
      rooms = await db.select().from(schema.rooms).orderBy(schema.rooms.id);
    } catch (e) {
      console.error('Error fetching rooms:', e);
    }
  }

  return { rooms };
};

export const actions: Actions = {
  updateRoom: async ({ request }) => {
    const data = await request.formData();
    const id = parseInt(data.get('id')?.toString() || '0');
    
    if (!id || !db || !isDbHealthy) return fail(400, { error: 'Invalid request' });

    const pricePerNight = data.get('pricePerNight')?.toString();
    const totalRooms = parseInt(data.get('totalRooms')?.toString() || '0');
    const availableRooms = parseInt(data.get('availableRooms')?.toString() || '0');
    const inUseRooms = parseInt(data.get('inUseRooms')?.toString() || '0');
    const descriptionFr = data.get('descriptionFr')?.toString();
    const descriptionEn = data.get('descriptionEn')?.toString();
    const imageUrl = data.get('imageUrl')?.toString();

    if (availableRooms + inUseRooms > totalRooms) {
      return fail(400, { error: 'La somme des chambres disponibles et occupées ne peut pas dépasser le total.' });
    }

    try {
      // Check if image is being replaced
      if (imageUrl) {
        const [oldRoom] = await db.select().from(schema.rooms).where(eq(schema.rooms.id, id));
        if (oldRoom && oldRoom.imageUrl && oldRoom.imageUrl !== imageUrl && oldRoom.imageUrl.includes('/storage/v1/object/public/images/')) {
          const urlParts = oldRoom.imageUrl.split('/storage/v1/object/public/images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabaseAdmin.storage.from('images').remove([filePath]);
          }
        }
      }

      await db.update(schema.rooms)
        .set({
          pricePerNight,
          totalRooms,
          availableRooms,
          inUseRooms,
          descriptionFr,
          descriptionEn,
          imageUrl
        })
        .where(eq(schema.rooms.id, id));
    } catch (e) {
      console.error('Error updating room:', e);
      return fail(500, { error: 'Database error' });
    }

    return { success: true };
  }
};
