import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  let services: any[] = [];

  if (db && isDbHealthy) {
    try {
      services = await db.select().from(schema.services).orderBy(schema.services.id);
    } catch (e) {
      console.error('Error fetching services:', e);
    }
  }

  return { services };
};

export const actions: Actions = {
  updateService: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    
    if (!id || !db || !isDbHealthy) return fail(400, { error: 'Invalid request' });

    const nameFr = data.get('nameFr')?.toString() || '';
    const nameEn = data.get('nameEn')?.toString() || '';
    const descriptionFr = data.get('descriptionFr')?.toString() || '';
    const descriptionEn = data.get('descriptionEn')?.toString() || '';
    const highlightFr = data.get('highlightFr')?.toString() || '';
    const highlightEn = data.get('highlightEn')?.toString() || '';
    const icon = data.get('icon')?.toString() || '';
    const ctaTextFr = data.get('ctaTextFr')?.toString() || '';
    const ctaTextEn = data.get('ctaTextEn')?.toString() || '';
    const ctaLink = data.get('ctaLink')?.toString() || '';

    try {
      await db.update(schema.services)
        .set({
          nameFr,
          nameEn,
          descriptionFr,
          descriptionEn,
          highlightFr,
          highlightEn,
          icon,
          ctaTextFr,
          ctaTextEn,
          ctaLink
        })
        .where(eq(schema.services.id, id));
    } catch (e) {
      console.error('Error updating service:', e);
      return fail(500, { error: 'Database error' });
    }

    return { success: true };
  }
};
