import type { RequestHandler } from './$types';
import { getAllRooms } from '$lib/server/db';
import { env } from '$env/dynamic/public';

export const prerender = false;

export const GET: RequestHandler = async ({ url }) => {
  // Determine the canonical base URL (prefer production domain or custom public app url)
  let baseUrl = 'https://residence-madadjeu.com';
  if (env.PUBLIC_APP_URL && !env.PUBLIC_APP_URL.includes('localhost')) {
    baseUrl = env.PUBLIC_APP_URL.replace(/\/$/, '');
  } else if (url.origin && !url.origin.includes('localhost')) {
    baseUrl = url.origin.replace(/\/$/, '');
  }

  const today = new Date().toISOString().split('T')[0];

  // 1. Core static public routes (excluding /admin, /confirmation, and 307 redirect routes)
  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/rooms', priority: '0.9', changefreq: 'daily' },
    { path: '/reserver', priority: '0.9', changefreq: 'daily' },
    { path: '/amenities', priority: '0.8', changefreq: 'weekly' },
    { path: '/take-a-tour', priority: '0.8', changefreq: 'weekly' },
    { path: '/location', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/faq', priority: '0.7', changefreq: 'weekly' },
    { path: '/gerer-reservation', priority: '0.6', changefreq: 'monthly' },
    { path: '/conditions-generales', priority: '0.5', changefreq: 'yearly' },
    { path: '/politique-de-confidentialite', priority: '0.5', changefreq: 'yearly' },
  ];

  // 2. Fetch live rooms dynamically from database
  let dynamicRooms: { path: string; priority: string; changefreq: string; lastmod?: string }[] = [];
  try {
    const rooms = await getAllRooms();
    dynamicRooms = rooms
      .filter((r) => r.slug && r.status !== 'archived')
      .map((r) => ({
        path: `/rooms/${r.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : today
      }));
  } catch (err) {
    // If DB fails, fallback gracefully to core room slugs
    dynamicRooms = [
      { path: '/rooms/suite-junior', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { path: '/rooms/appartement-prestige', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { path: '/rooms/suite-presidentielle', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { path: '/rooms/chambre-standard', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { path: '/rooms/salle-de-reception-balafon', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { path: '/rooms/salon-vip-etoile', priority: '0.8', changefreq: 'weekly', lastmod: today }
    ];
  }

  const allEntries = [...staticRoutes, ...dynamicRooms];

  const xmlEntries = allEntries
    .map((entry) => {
      const loc = `${baseUrl}${entry.path}`;
      const frLoc = `${baseUrl}${entry.path}${entry.path.includes('?') ? '&' : '?'}lang=fr`;
      const enLoc = `${baseUrl}${entry.path}${entry.path.includes('?') ? '&' : '?'}lang=en`;
      const lastmod = ('lastmod' in entry && entry.lastmod) ? entry.lastmod : today;

      return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${frLoc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enLoc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
};
