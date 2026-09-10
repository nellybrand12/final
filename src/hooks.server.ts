import dns from 'node:dns';

// Force Node.js to resolve IPv4 addresses first to avoid hanging on IPv6 AAAA lookups on IPv4-only hosts (e.g. Supabase pooler)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored if not supported in environment
}

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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
  if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/confirmation')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
};

