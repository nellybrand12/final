import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: 'Notre Histoire & Philosophie | Hôtel Résidence Madadjeu',
      description: 'L’histoire et la vision de l’Hôtel Résidence Madadjeu : redéfinir le luxe hôtelier à Bafoussam à travers l’authenticité et l’artisanat d’art.'
    }
  };
};
