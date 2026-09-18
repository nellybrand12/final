import dns from 'node:dns';

// Force Node.js to resolve IPv4 addresses first to avoid hanging on IPv6 AAAA lookups on IPv4-only hosts (e.g. Supabase pooler)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored if not supported in environment
}

import { redirect, error, type Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  // Admin authentication and RBAC guards
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/logout') {
    const sessionId = event.cookies.get('admin_session');
    if (!sessionId) {
      if (event.request.method === 'GET') {
        throw redirect(303, '/admin/login');
      }
      throw error(401, 'Non authentifié');
    }

    const user = await validateSession(sessionId);
    if (!user) {
      event.cookies.delete('admin_session', { path: '/' });
      if (event.request.method === 'GET') {
        throw redirect(303, '/admin/login');
      }
      throw error(401, 'Session expirée ou invalide');
    }

    event.locals.adminUser = user;

    // Staff role restrictions: blocked from content management and admin management
    const isStaffBlocked = pathname.startsWith('/admin/content') || pathname.startsWith('/admin/admins');
    if (user.role === 'staff' && isStaffBlocked) {
      if (event.request.method === 'GET') {
        throw redirect(303, '/admin');
      }
      throw error(403, 'Action non autorisée pour le personnel');
    }
  }

  const langParam = event.url.searchParams.get('lang');
  const langCookie = event.cookies.get('madadjeu_lang');
  const lang = (langParam === 'en' || (!langParam && langCookie === 'en')) ? 'en' : 'fr';

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Enforce noindex HTTP header for all admin and confirmation routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/confirmation')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
};

