import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    coordinates: {
      lat: 5.4779,
      lng: 10.4200,
      address: 'Quartier Résidentiel de Banengo, Bafoussam, Cameroun'
    }
  };
};
