import type { PageServerLoad } from './$types';
import { getAllServices } from '$lib/server/db';

export const load: PageServerLoad = async () => {

  const services = await getAllServices();

  return {
    services,
    meta: {
      title: 'Services & Prestations de Luxe | Hôtel Résidence Madadjeu',
      description: 'Découvrez les services haut de gamme de l’Hôtel Résidence Madadjeu : Spa & Bien-être, Haute Gastronomie, Conciergerie 24/7 et Chauffeur privé.'
    }
  };
};
