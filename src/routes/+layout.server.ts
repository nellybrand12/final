import type { LayoutServerLoad } from './$types';
import { getAllRooms, getSettings } from '$lib/server/db';

export const load: LayoutServerLoad = async () => {
  const [rooms, settingsData] = await Promise.all([
    getAllRooms(),
    getSettings()
  ]);

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
  };

  if (settingsData) {
    settingsData.forEach(s => {
      settings[s.key] = typeof s.value === 'string' ? s.value : String(s.value ?? '');
    });
  }

  return {
    featuredRooms: rooms.slice(0, 3),
    settings
  };
};
