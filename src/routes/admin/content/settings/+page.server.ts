import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  let settings: Record<string, string> = {
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_whatsapp: '',
    social_facebook: '',
    social_instagram: '',
    social_tripadvisor: '',
    social_bookingcom: '',
    social_tripcom: '',
    contact_map_coords: '',
    mtn_api_key: '',
    orange_api_key: '',
    card_api_key: ''
  };

  if (db && isDbHealthy) {
    try {
      const results = await db.select().from(schema.siteSettings);
      results.forEach(row => {
        settings[row.key] = typeof row.value === 'string' ? row.value : String(row.value);
      });
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  }

  return { settings };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const settingsObj: Record<string, string> = {};
    
    for (const [key, value] of data.entries()) {
      settingsObj[key] = value.toString();
    }

    if (db && isDbHealthy) {
      const database = db;
      try {
        const promises = Object.entries(settingsObj).map(([key, value]) => {
          return database.insert(schema.siteSettings)
            .values({ key, value })
            .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value, updatedAt: new Date() } });
        });
        
        await Promise.all(promises);
      } catch (e) {
        console.error('Error updating settings:', e);
        return fail(500, { error: 'Database error while saving settings' });
      }
    }

    return { success: true };
  }
};
