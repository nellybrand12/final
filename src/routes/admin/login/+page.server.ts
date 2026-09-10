import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import { adminUsers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionId = cookies.get('admin_session');
  if (sessionId) {
    throw redirect(303, '/admin');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = await request.formData();
      const username = data.get('username')?.toString()?.trim();
      const password = data.get('password')?.toString();

      if (!username || !password) {
        return fail(400, { error: 'Nom d’utilisateur et mot de passe requis', username: username || '' });
      }

      if (!db || !isDbHealthy) {
        console.error('[Admin Login Action] Database is not available or unhealthy');
        return fail(500, { error: 'Base de données non disponible. Veuillez réessayer sous peu.', username });
      }

      const users = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
      if (users.length === 0) {
        return fail(401, { error: 'Identifiants invalides', username });
      }

      const user = users[0];
      const isPasswordValid = await compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return fail(401, { error: 'Identifiants invalides', username });
      }

      const deviceId = request.headers.get('user-agent') || 'unknown';
      const sessionId = await createSession(user.id, deviceId);

      cookies.set('admin_session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        secure: process.env.NODE_ENV === 'production'
      });

      throw redirect(303, '/admin');
    } catch (err) {
      if (isRedirect(err)) {
        throw err;
      }
      console.error('[Admin Login Action Error]:', err);
      return fail(500, { error: 'Une erreur serveur est survenue lors de la connexion. Veuillez réessayer.' });
    }
  }
};
