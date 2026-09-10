import type { PageServerLoad, Actions } from './$types';
import { db, isDbHealthy } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { hash } from 'bcryptjs';
import { validateSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ parent }) => {
  const layoutData = await parent();
  if (!layoutData.user || layoutData.user.role !== 'super-admin') {
    throw redirect(303, '/admin');
  }

  let admins: Array<{ id: number; username: string; role: string; createdAt: Date }> = [];

  if (db && isDbHealthy) {
    try {
      const records = await db
        .select({
          id: schema.adminUsers.id,
          username: schema.adminUsers.username,
          role: schema.adminUsers.role,
          createdAt: schema.adminUsers.createdAt
        })
        .from(schema.adminUsers)
        .orderBy(desc(schema.adminUsers.createdAt));
      admins = records;
    } catch (e) {
      console.error('Error fetching admin users:', e);
    }
  }

  return { admins };
};

export const actions: Actions = {
  createAdmin: async ({ request, cookies }) => {
    const sessionId = cookies.get('admin_session');
    if (!sessionId) {
      return fail(401, { error: 'Non authentifié' });
    }
    const currentUser = await validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'super-admin') {
      return fail(403, { error: 'Action réservée au Super Administrateur' });
    }

    const data = await request.formData();
    const username = data.get('username')?.toString()?.trim();
    const password = data.get('password')?.toString();

    if (!username || username.length < 3) {
      return fail(400, { error: 'Le nom d’utilisateur doit contenir au moins 3 caractères', username: username || '' });
    }

    if (!password || password.length < 6) {
      return fail(400, { error: 'Le mot de passe doit contenir au moins 6 caractères', username });
    }

    if (!db || !isDbHealthy) {
      return fail(500, { error: 'Base de données non disponible', username });
    }

    try {
      const [existing] = await db
        .select()
        .from(schema.adminUsers)
        .where(eq(schema.adminUsers.username, username));

      if (existing) {
        return fail(400, { error: 'Un compte avec ce nom d’utilisateur existe déjà', username });
      }

      const passwordHash = await hash(password, 10);

      await db.insert(schema.adminUsers).values({
        username,
        passwordHash,
        role: 'admin'
      });

      return { success: true, message: `Compte administrateur "${username}" créé avec succès.` };
    } catch (e) {
      console.error('Error creating admin account:', e);
      return fail(500, { error: 'Erreur lors de la création du compte administrateur', username });
    }
  },

  deleteAdmin: async ({ request, cookies }) => {
    const sessionId = cookies.get('admin_session');
    if (!sessionId) {
      return fail(401, { error: 'Non authentifié' });
    }
    const currentUser = await validateSession(sessionId);
    if (!currentUser || currentUser.role !== 'super-admin') {
      return fail(403, { error: 'Action réservée au Super Administrateur' });
    }

    const data = await request.formData();
    const idStr = data.get('id')?.toString();
    const id = Number(idStr);

    if (!id || isNaN(id)) {
      return fail(400, { error: 'Identifiant invalide' });
    }

    if (!db || !isDbHealthy) {
      return fail(500, { error: 'Base de données non disponible' });
    }

    try {
      const [targetUser] = await db
        .select()
        .from(schema.adminUsers)
        .where(eq(schema.adminUsers.id, id));

      if (!targetUser) {
        return fail(404, { error: 'Compte introuvable' });
      }

      if (targetUser.role === 'super-admin' || targetUser.id === currentUser.id) {
        return fail(400, { error: 'Impossible de supprimer un compte Super Administrateur' });
      }

      await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, id));
      await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, id));

      return { success: true, message: `Compte "${targetUser.username}" supprimé.` };
    } catch (e) {
      console.error('Error deleting admin account:', e);
      return fail(500, { error: 'Erreur lors de la suppression du compte' });
    }
  }
};
