import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const load: PageServerLoad = async () => {
  let rooms: any[] = [];

  if (db && isDbHealthy) {
    try {
      const dbRooms = await db.select().from(schema.rooms).orderBy(schema.rooms.id);

      // Fetch booking counts per room so admin knows if deletion will archive or delete
      const bookingCounts = await db
        .select({
          roomId: schema.bookings.roomId,
          count: sql<number>`count(*)::int`
        })
        .from(schema.bookings)
        .groupBy(schema.bookings.roomId);

      const bookingMap = new Map<number, number>();
      for (const item of bookingCounts) {
        if (item.roomId) {
          bookingMap.set(item.roomId, item.count);
        }
      }

      const allRoomImages = await db
        .select()
        .from(schema.roomImages)
        .orderBy(asc(schema.roomImages.sortOrder), asc(schema.roomImages.id));

      const roomImagesMap = new Map<number, string[]>();
      for (const img of allRoomImages) {
        if (!roomImagesMap.has(img.roomId)) {
          roomImagesMap.set(img.roomId, []);
        }
        roomImagesMap.get(img.roomId)!.push(img.imageUrl);
      }

      rooms = dbRooms.map((room) => ({
        ...room,
        bookingCount: bookingMap.get(room.id) || 0,
        additionalImages: roomImagesMap.get(room.id) || []
      }));
    } catch (e) {
      console.error('Error fetching rooms:', e);
    }
  }

  return { rooms };
};

export const actions: Actions = {
  create: async ({ request }) => {
    if (!db || !isDbHealthy) return fail(500, { error: 'Base de données indisponible' });

    const data = await request.formData();
    const name = data.get('name')?.toString().trim();
    const type = (data.get('type')?.toString() || 'room') as 'room' | 'hall';
    const category = data.get('category')?.toString().trim() || (type === 'hall' ? 'Salle de Réception' : 'Suite');
    const pricePerNight = data.get('pricePerNight')?.toString().trim();
    const maxGuests = parseInt(data.get('maxGuests')?.toString() || '2');
    const sizeSqM = parseInt(data.get('sizeSqM')?.toString() || (type === 'hall' ? '150' : '65'));
    const bedType = data.get('bedType')?.toString().trim() || (type === 'hall' ? 'Configuration Modulable' : 'King Size');
    const totalRooms = parseInt(data.get('totalRooms')?.toString() || (type === 'hall' ? '1' : '5'));
    const availableRooms = parseInt(data.get('availableRooms')?.toString() || totalRooms.toString());
    const imageUrl = data.get('imageUrl')?.toString().trim() || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200';
    const descriptionFr = data.get('descriptionFr')?.toString().trim() || '';
    const descriptionEn = data.get('descriptionEn')?.toString().trim() || descriptionFr;
    const taglineFr = data.get('taglineFr')?.toString().trim() || '';
    const taglineEn = data.get('taglineEn')?.toString().trim() || taglineFr;
    const amenitiesRaw = data.get('amenities')?.toString().trim() || '';

    if (!name || !pricePerNight || isNaN(parseFloat(pricePerNight))) {
      return fail(400, { error: 'Le nom et le tarif sont requis et valides.' });
    }

    const amenities = amenitiesRaw
      ? amenitiesRaw.split('\n').map((a) => a.trim()).filter(Boolean)
      : (type === 'hall' 
          ? ['Scène & Sonorisation pro', 'Vidéoprojecteur 4K', 'Climatisation puissante', 'Espace vestiaires'] 
          : ['Wi-Fi Haut Débit', 'Smart TV', 'Climatisation silencieuse', 'Salle de bain privative']);

    const additionalImagesRaw = data.getAll('additionalImages');
    const additionalImages = additionalImagesRaw
      .map((item) => item.toString().trim())
      .filter((url) => Boolean(url));

    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = type === 'hall' ? 'salle-evenement' : 'chambre-suite';

    // Verify unique slug
    let finalSlug = baseSlug;
    try {
      const existing = await db.select({ id: schema.rooms.id }).from(schema.rooms).where(eq(schema.rooms.slug, finalSlug));
      if (existing.length > 0) {
        finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
      }

      const [newRoom] = await db.insert(schema.rooms).values({
        name,
        nameFr: name,
        nameEn: name,
        slug: finalSlug,
        type,
        category,
        pricePerNight,
        maxGuests: maxGuests > 0 ? maxGuests : 2,
        sizeSqM: sizeSqM > 0 ? sizeSqM : 50,
        bedType,
        totalRooms: totalRooms > 0 ? totalRooms : 1,
        availableRooms: availableRooms >= 0 ? availableRooms : totalRooms,
        inUseRooms: 0,
        imageUrl,
        galleryImages: [imageUrl, ...additionalImages],
        descriptionFr,
        descriptionEn,
        taglineFr,
        taglineEn,
        amenities,
        status: 'available'
      }).returning({ id: schema.rooms.id });

      if (newRoom && newRoom.id && additionalImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          await db.insert(schema.roomImages).values({
            roomId: newRoom.id,
            imageUrl: additionalImages[i],
            sortOrder: i
          });
        }
      }
    } catch (e) {
      console.error('Error creating room or hall:', e);
      return fail(500, { error: 'Erreur lors de la création de la fiche dans la base de données.' });
    }

    return { 
      success: true, 
      created: true, 
      message: `${type === 'hall' ? 'La salle événementielle' : 'La chambre'} "${name}" a été créée avec succès.` 
    };
  },

  updateRoom: async ({ request }) => {
    const data = await request.formData();
    const id = parseInt(data.get('id')?.toString() || '0');
    
    if (!id || !db || !isDbHealthy) return fail(400, { error: 'Requête invalide' });

    const name = data.get('name')?.toString().trim();
    const type = data.get('type')?.toString() as 'room' | 'hall' | undefined;
    const category = data.get('category')?.toString().trim();
    const pricePerNight = data.get('pricePerNight')?.toString().trim();
    const maxGuests = parseInt(data.get('maxGuests')?.toString() || '0');
    const sizeSqM = parseInt(data.get('sizeSqM')?.toString() || '0');
    const bedType = data.get('bedType')?.toString().trim();
    const status = data.get('status')?.toString().trim() || 'available';
    const totalRooms = parseInt(data.get('totalRooms')?.toString() || '0');
    const availableRooms = parseInt(data.get('availableRooms')?.toString() || '0');
    const inUseRooms = parseInt(data.get('inUseRooms')?.toString() || '0');
    const descriptionFr = data.get('descriptionFr')?.toString();
    const descriptionEn = data.get('descriptionEn')?.toString();
    const imageUrl = data.get('imageUrl')?.toString();
    const amenitiesRaw = data.get('amenities')?.toString();
    const forceAvailable = data.get('forceAvailable') === 'on' || data.get('forceAvailable') === 'true';

    const hasAdditionalImagesManager = data.get('hasAdditionalImagesManager') === 'true';
    const additionalImagesRaw = data.getAll('additionalImages');
    const additionalImages = additionalImagesRaw
      .map((item) => item.toString().trim())
      .filter((url) => Boolean(url));

    if (totalRooms > 0 && availableRooms + inUseRooms > totalRooms) {
      return fail(400, { error: 'La somme des unités disponibles et occupées ne peut pas dépasser le total.' });
    }

    try {
      let oldRoom: schema.Room | undefined;
      // Check if image is being replaced
      if (imageUrl || hasAdditionalImagesManager) {
        const [foundRoom] = await db.select().from(schema.rooms).where(eq(schema.rooms.id, id));
        oldRoom = foundRoom;
        if (imageUrl && oldRoom && oldRoom.imageUrl && oldRoom.imageUrl !== imageUrl && oldRoom.imageUrl.includes('/storage/v1/object/public/images/')) {
          const urlParts = oldRoom.imageUrl.split('/storage/v1/object/public/images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabaseAdmin.storage.from('images').remove([filePath]);
          }
        }
      }

      const updateData: Record<string, any> = {
        pricePerNight,
        totalRooms,
        availableRooms,
        inUseRooms,
        status,
        forceAvailable,
        descriptionFr,
        descriptionEn,
        imageUrl
      };

      if (name) {
        updateData.name = name;
        updateData.nameFr = name;
      }
      if (type) updateData.type = type;
      if (category) updateData.category = category;
      if (maxGuests > 0) updateData.maxGuests = maxGuests;
      if (sizeSqM > 0) updateData.sizeSqM = sizeSqM;
      if (bedType) updateData.bedType = bedType;

      if (amenitiesRaw !== undefined) {
        updateData.amenities = amenitiesRaw
          .split('\n')
          .map((a) => a.trim())
          .filter(Boolean);
      }

      if (hasAdditionalImagesManager) {
        await db.delete(schema.roomImages).where(eq(schema.roomImages.roomId, id));
        for (let i = 0; i < additionalImages.length; i++) {
          await db.insert(schema.roomImages).values({
            roomId: id,
            imageUrl: additionalImages[i],
            sortOrder: i
          });
        }
        const effectiveMain = imageUrl || oldRoom?.imageUrl || '';
        updateData.galleryImages = [effectiveMain, ...additionalImages].filter(Boolean);
      }

      await db.update(schema.rooms)
        .set(updateData)
        .where(eq(schema.rooms.id, id));
    } catch (e) {
      console.error('Error updating room:', e);
      return fail(500, { error: 'Erreur lors de la mise à jour' });
    }

    return { success: true, updated: true, message: 'Fiche mise à jour avec succès.' };
  },

  deleteRoom: async ({ request }) => {
    const data = await request.formData();
    const id = parseInt(data.get('id')?.toString() || '0');

    if (!id || !db || !isDbHealthy) return fail(400, { error: 'Requête invalide' });

    try {
      // Check if there are bookings linked to this room/hall
      const [bookingCheck] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.bookings)
        .where(eq(schema.bookings.roomId, id));

      const count = bookingCheck?.count || 0;

      if (count > 0) {
        // Safe delete: Soft-archive the room to preserve reservation and accounting integrity
        await db
          .update(schema.rooms)
          .set({ status: 'archived' })
          .where(eq(schema.rooms.id, id));

        return {
          success: true,
          archived: true,
          message: `Cette fiche est liée à ${count} réservation(s) existante(s). Elle a été archivée en toute sécurité et retirée du site public.`
        };
      } else {
        // Hard delete: No reservations exist, safe to remove completely
        await db.delete(schema.rooms).where(eq(schema.rooms.id, id));

        return {
          success: true,
          deleted: true,
          message: 'La fiche a été supprimée définitivement avec succès.'
        };
      }
    } catch (e) {
      console.error('Error deleting room:', e);
      return fail(500, { error: 'Erreur lors de la suppression de la fiche.' });
    }
  },

  restoreRoom: async ({ request }) => {
    const data = await request.formData();
    const id = parseInt(data.get('id')?.toString() || '0');

    if (!id || !db || !isDbHealthy) return fail(400, { error: 'Requête invalide' });

    try {
      await db
        .update(schema.rooms)
        .set({ status: 'available' })
        .where(eq(schema.rooms.id, id));

      return {
        success: true,
        restored: true,
        message: 'La fiche a été restaurée avec succès et est à nouveau visible sur le site public.'
      };
    } catch (e) {
      console.error('Error restoring room:', e);
      return fail(500, { error: 'Erreur lors de la restauration de la fiche.' });
    }
  }
};

