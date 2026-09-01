import type { PageServerLoad } from './$types';
import { getAllFaqs } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const faqs = await getAllFaqs();
  return {
    faqs
  };
};
