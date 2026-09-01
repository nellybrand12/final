import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createContactMessage } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  return {
    meta: {
      title: 'Contactez la Résidence Madadjeu | Conciergerie 24/7',
      description: 'Prenez contact avec notre équipe pour toute question, réservation sur-mesure ou demande événementielle.'
    }
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString()?.trim();
    const email = data.get('email')?.toString()?.trim();
    const phone = data.get('phone')?.toString()?.trim();
    const subject = data.get('subject')?.toString()?.trim();
    const message = data.get('message')?.toString()?.trim();

    if (!name || !email || !message) {
      return fail(400, {
        error: 'Veuillez remplir tous les champs obligatoires (Nom, Email, Message).',
        values: { name, email, phone, subject, message }
      });
    }

    try {
      await createContactMessage({
        name,
        email,
        phone: phone || null,
        subject: subject || 'Demande Générale',
        message
      });

      return {
        success: true,
        message: 'Votre message a été transmis avec succès à notre direction. Nous vous répondrons dans les plus brefs délais.'
      };
    } catch (e) {
      console.error('Error saving contact message:', e);
      return fail(500, {
        error: 'Une erreur est survenue lors de l’envoi de votre message. Veuillez réessayer ou nous joindre par téléphone.'
      });
    }
  }
};
