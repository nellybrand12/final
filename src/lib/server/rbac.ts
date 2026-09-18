import { redirect, fail } from '@sveltejs/kit';
import { validateSession } from './auth';
import type { Cookies } from '@sveltejs/kit';

export type AdminRole = 'super_admin' | 'staff';

/**
 * Route prefixes that staff users cannot access.
 * The layout.server.ts guard will redirect to /admin if a staff
 * session hits any path starting with one of these strings.
 */
export const STAFF_BLOCKED_PREFIXES = [
  '/admin/content/rooms',
  '/admin/content/services',
  '/admin/content/settings',
  '/admin/admins',
] as const;

/**
 * Reads the admin session from cookies and returns the current user's role.
 * Returns null if the session is invalid or the DB is unavailable.
 */
export async function getRoleFromCookies(cookies: Cookies): Promise<AdminRole | null> {
  const sessionId = cookies.get('admin_session');
  if (!sessionId) return null;

  const { validateSession: validate } = await import('./auth');
  const user = await validate(sessionId);
  if (!user) return null;

  return user.role as AdminRole;
}

/**
 * Use in form actions that require super_admin.
 * Returns a fail(403) response if the caller is not super_admin.
 * Usage:  const guard = await requireSuperAdmin(cookies);
 *         if (guard) return guard;
 */
export async function requireSuperAdmin(cookies: Cookies) {
  const sessionId = cookies.get('admin_session');
  if (!sessionId) {
    return fail(401, { error: 'Non authentifié' });
  }

  const user = await validateSession(sessionId);
  if (!user) {
    return fail(401, { error: 'Session invalide' });
  }

  if (user.role !== 'super_admin') {
    return fail(403, { error: 'Accès refusé — réservé au Super Administrateur' });
  }

  return null; // access granted
}

/**
 * Use in load() functions that require super_admin (redirects instead of fail).
 * Throws redirect(303, '/admin') if the role is not super_admin.
 */
export function redirectIfNotSuperAdmin(role: string | undefined | null): void {
  if (role !== 'super_admin') {
    throw redirect(303, '/admin');
  }
}
