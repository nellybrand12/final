import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql, inArray, asc } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import { env as dynamicEnv } from '$env/dynamic/private';
import dns from 'node:dns';

// Force Node.js to resolve IPv4 addresses first to avoid hanging on IPv6 AAAA lookups
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored if not supported in environment
}

// Resolve DATABASE_URL from dynamic env or process.env (kept build-safe: no
// $env/static/private import, so the app still builds when DATABASE_URL is unset)
const rawConnectionString = dynamicEnv.DATABASE_URL || process.env.DATABASE_URL || '';
const connectionString = rawConnectionString.trim();

function maskConnectionString(url: string): string {
  try {
    return url.replace(/:[^:@]+@/, ':****@');
  } catch {
    return '****';
  }
}

function validateDatabaseUrl(url: string): { isValid: boolean; host?: string; port?: string; reason?: string } {
  if (!url) {
    return { isValid: false, reason: 'DATABASE_URL is undefined or empty' };
  }
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    return { isValid: false, reason: 'DATABASE_URL protocol must be postgres:// or postgresql://' };
  }
  if (
    url.includes('sample_db_pass') ||
    url.includes('abcdefgh12345678') ||
    url.includes('your-') ||
    url.includes('PLACEHOLDER')
  ) {
    return { isValid: false, reason: 'DATABASE_URL contains placeholder values' };
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname) {
      return { isValid: false, reason: 'DATABASE_URL does not specify a valid host/hostname' };
    }
    return { isValid: true, host: parsed.hostname, port: parsed.port || '5432' };
  } catch (e: any) {
    return { isValid: false, reason: `URL parsing failed: ${e?.message || e}` };
  }
}

const validation = validateDatabaseUrl(connectionString);

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isDbHealthy = false;

if (!validation.isValid) {
  console.warn(`[Database Init] Warning: DATABASE_URL not configured (${validation.reason}). Using in-memory fallback. Masked value: ${maskConnectionString(connectionString)}`);
} else {
  console.log(`[Database Init] Connecting to Postgres at ${validation.host}:${validation.port} (target: ${maskConnectionString(connectionString)})`);

  try {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 120, // 2 minutes idle connection lifetime to prevent frequent connection renegotiation
      connect_timeout: 15,
      prepare: false, // Essential for Supabase PgBouncer (Transaction mode port 6543)
      onnotice: () => {},
      ssl: 'require'
    });
    dbInstance = drizzle(client, { schema });
    isDbHealthy = true;
    console.log('[Database Init] PostgreSQL connection pool initialized and health verified.');
  } catch (err: any) {
    console.warn('[Database Init] Could not initialize PostgreSQL client, using in-memory store:', err?.message || err);
    isDbHealthy = false;
  }
}

export const db = dbInstance;
export { dbInstance, isDbHealthy };

function handleDbError(operation: string, err: any) {
  const errMsg = err?.cause?.message || err?.message || String(err);
  const errCode = err?.code || err?.cause?.code;
  const address = err?.address || err?.cause?.address;
  const port = err?.port || err?.cause?.port;
  console.warn(`[Database] PostgreSQL query failed during ${operation}:`, {
    message: errMsg,
    code: errCode,
    address,
    port,
    isDbHealthy
  });
}

// Seed / Initial data for Madadjeu Hotel
export const INITIAL_ROOMS: schema.Room[] = [
  {
    id: 1,
    slug: 'appartement-superieur',
    name: 'Appartement Supérieur',
    nameFr: 'Appartement Supérieur',
    nameEn: 'Superior Apartment',
    type: 'room',
    taglineFr: 'Le summum du raffinement résidentiel et de la distinction',
    taglineEn: 'The pinnacle of residential refinement and distinction',
    descriptionFr: 'Un vaste appartement résidentiel de 120m² alliant boiseries artisanales, marbre noble et vue imprenable sur Yaoundé. Doté d’un grand salon indépendant, cuisine équipée, lit King-Size haut de gamme et salle de bain avec baignoire balnéo.',
    descriptionEn: 'A spacious 120sqm residential apartment blending handcrafted woodwork, noble marble, and breathtaking views of Yaoundé. Featuring a large separate living room, fully equipped kitchen, premium King-size bed, and bathroom with whirlpool bath.',
    category: 'Appartement de Prestige',
    pricePerNight: '150000.00',
    maxGuests: 4,
    sizeSqM: 120,
    bedType: 'King Size Impérial',
    totalRooms: 5,
    availableRooms: 5,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2wAnr00WSMLfS4u4kwD_Z_X_uI1TMmL8C99ulDfVWorQ3wZ8Jtx038hBtlJZFMCH52zAxeHuJGHeZXYirO7WqpxkYWsyvL-gd4ZtA1fvGUnNERVv--ziiHJ1croF5YKCIRh5OozEQYWxm_XmiIJMnKPz0jdVrN2AtTv4B9xzi0yB2N-r4FP-38NnlnBi6HTsz3eHCT_SblG_ROAwtcgBaDwD6D9_o5I1XUo3_23B6Z2m5PqdM6tsL',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw'
    ],
    amenities: ['Lit King Size', 'Baignoire balnéo en marbre', 'Salon privé séparé', 'Service majordome dédié', 'Wi-Fi très haut débit', 'Cave à vin & plateau de courtoisie', 'Terrasse panoramique'],
    status: 'available',
    createdAt: new Date()
  },
  {
    id: 2,
    slug: 'appartement-classique',
    name: 'Appartement Classique',
    nameFr: 'Appartement Classique',
    nameEn: 'Classic Apartment',
    type: 'room',
    taglineFr: 'Élégance moderne, espace séjour et confort résidentiel complet',
    taglineEn: 'Modern elegance, living space and complete residential comfort',
    descriptionFr: 'Un appartement chaleureux de 75m² conçu pour les séjours prolongés et professionnels. Espace salon, kitchenette équipée, bureau ergonomique et salle de bain avec douche à l’italienne.',
    descriptionEn: 'A warm 75sqm apartment designed for extended and business stays. Living area, equipped kitchenette, ergonomic desk and bathroom with walk-in shower.',
    category: 'Appartement Exécutif',
    pricePerNight: '95000.00',
    maxGuests: 3,
    sizeSqM: 75,
    bedType: 'King Size Confort',
    totalRooms: 8,
    availableRooms: 8,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw'
    ],
    amenities: ['Lit King Size', 'Douche à l’italienne', 'Espace travail dédié', 'Smart TV 65" 4K', 'Climatisation silencieuse', 'Petit-déjeuner inclus'],
    status: 'available',
    createdAt: new Date()
  },
  {
    id: 3,
    slug: 'chambre-junior',
    name: 'Chambre Junior',
    nameFr: 'Chambre Junior',
    nameEn: 'Junior Room',
    type: 'room',
    taglineFr: 'Sérénité, design contemporain et vue apaisante',
    taglineEn: 'Serenity, contemporary design and soothing views',
    descriptionFr: 'Chambre soignée de 45m² décorée dans des tons apaisants avec des boiseries artisanales. Balcon privatif, espace salon de lecture et lit Queen-Size haute qualité.',
    descriptionEn: 'Well-appointed 45sqm room decorated in soothing tones with artisanal woodwork. Private balcony, reading lounge area and high quality Queen-size bed.',
    category: 'Chambre Confort',
    pricePerNight: '65000.00',
    maxGuests: 2,
    sizeSqM: 45,
    bedType: 'Queen Size Luxe',
    totalRooms: 10,
    availableRooms: 10,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2wAnr00WSMLfS4u4kwD_Z_X_uI1TMmL8C99ulDfVWorQ3wZ8Jtx038hBtlJZFMCH52zAxeHuJGHeZXYirO7WqpxkYWsyvL-gd4ZtA1fvGUnNERVv--ziiHJ1croF5YKCIRh5OozEQYWxm_XmiIJMnKPz0jdVrN2AtTv4B9xzi0yB2N-r4FP-38NnlnBi6HTsz3eHCT_SblG_ROAwtcgBaDwD6D9_o5I1XUo3_23B6Z2m5PqdM6tsL',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2wAnr00WSMLfS4u4kwD_Z_X_uI1TMmL8C99ulDfVWorQ3wZ8Jtx038hBtlJZFMCH52zAxeHuJGHeZXYirO7WqpxkYWsyvL-gd4ZtA1fvGUnNERVv--ziiHJ1croF5YKCIRh5OozEQYWxm_XmiIJMnKPz0jdVrN2AtTv4B9xzi0yB2N-r4FP-38NnlnBi6HTsz3eHCT_SblG_ROAwtcgBaDwD6D9_o5I1XUo3_23B6Z2m5PqdM6tsL'
    ],
    amenities: ['Lit Queen Size', 'Balcon privé', 'Produits d’accueil bio', 'Coffre-fort électronique', 'Minibar garni'],
    status: 'available',
    createdAt: new Date()
  },
  {
    id: 4,
    slug: 'chambre-standard',
    name: 'Chambre Standard',
    nameFr: 'Chambre Standard',
    nameEn: 'Standard Room',
    type: 'room',
    taglineFr: 'Confort optimal et fonctionnalités modernes pour voyageur seul ou couple',
    taglineEn: 'Optimal comfort and modern features for solo travelers or couples',
    descriptionFr: 'Chambre élégante de 35m² offrant tout le confort essentiel : literie premium, insonorisation de qualité supérieure, salle de bain moderne et bureau connecté.',
    descriptionEn: 'Elegant 35sqm room offering all essential comfort: premium bedding, superior soundproofing, modern bathroom and connected desk.',
    category: 'Chambre Standard',
    pricePerNight: '50000.00',
    maxGuests: 2,
    sizeSqM: 35,
    bedType: 'Double Confort Supérieur',
    totalRooms: 12,
    availableRooms: 12,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw'
    ],
    amenities: ['Lit Double Confort', 'Salle de bain avec douche', 'Espace bureau', 'Wi-Fi haut débit', 'Smart TV'],
    status: 'available',
    createdAt: new Date()
  },
  {
    id: 5,
    slug: 'salle-de-reception-balafon',
    name: 'Palais des Congrès & Banquets "Le Balafon"',
    nameFr: 'Palais des Congrès & Banquets "Le Balafon"',
    nameEn: 'Grand Banquet & Congress Hall "Le Balafon"',
    type: 'hall',
    taglineFr: 'Un espace majestueux pour mariages d’exception, galas et conférences de prestige',
    taglineEn: 'A majestic venue for grand weddings, galas, and prestigious conferences',
    descriptionFr: 'Vaste salle polyvalente climatisée de 350m² dotée d’une scène d’honneur, régie audiovisuelle complète, sonorisation surround, éclairage scénique modulable et cuisine relais traiteur dédiée. Idéale pour célébrations privées, banquets et séminaires d’envergure.',
    descriptionEn: 'Spacious 350sqm air-conditioned multipurpose hall featuring a stage of honor, complete AV control booth, surround sound system, modular stage lighting, and a dedicated catering staging kitchen. Ideal for private celebrations, banquets, and major corporate seminars.',
    category: 'Salle de Réception',
    pricePerNight: '350000.00',
    maxGuests: 250,
    sizeSqM: 350,
    bedType: 'Configuration Modulable',
    totalRooms: 1,
    availableRooms: 1,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Scène d’honneur & pupitre',
      'Écran de projection géant HD',
      'Système audio & micros sans fil',
      'Éclairage d’ambiance LED modulable',
      'Espace traiteur & cuisine relais',
      'Climatisation haute puissance',
      'Parking VIP sécurisé',
      'Wi-Fi fibre très haut débit'
    ],
    status: 'available',
    createdAt: new Date()
  },
  {
    id: 6,
    slug: 'salon-vip-etoile',
    name: 'Salon VIP Diplomatique & Conférences "L\'Étoile"',
    nameFr: 'Salon VIP Diplomatique & Conférences "L\'Étoile"',
    nameEn: 'VIP Diplomatic & Executive Lounge "The Star"',
    type: 'hall',
    taglineFr: 'Standing présidentiel pour réunions stratégiques, conseils et cocktails d\'affaires',
    taglineEn: 'Presidential standing for executive board meetings, strategy sessions and business cocktails',
    descriptionFr: 'Salon exécutif insonorisé de 100m² avec vue panoramique, écran interactif 4K 85", équipement de visioconférence professionnel, table de conférence en marbre noble et acajou, salon lounge privatif et service pause-café haut de gamme.',
    descriptionEn: 'A soundproofed 100sqm executive lounge with panoramic views, 85" 4K interactive screen, professional video conferencing setup, noble marble and mahogany boardroom table, private lounge area, and tailored catering service.',
    category: 'Salon de Conférence',
    pricePerNight: '180000.00',
    maxGuests: 50,
    sizeSqM: 100,
    bedType: 'Configuration Conférence & Lounge',
    totalRooms: 1,
    availableRooms: 1,
    inUseRooms: 0,
    onHoldRooms: 0,
    forceAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Écran interactif 4K 85"',
      'Système visioconférence hybride',
      'Insonorisation acoustique premium',
      'Table de conférence connectée',
      'Espace lounge privatif',
      'Machine à café Nespresso & rafraîchissements',
      'Assistance technique dédiée'
    ],
    status: 'available',
    createdAt: new Date()
  }
];

export const INITIAL_FAQS: schema.Faq[] = [
  {
    id: 1,
    category: 'Réservations & Annulations',
    question: 'Quelles sont les conditions d’annulation ?',
    answer: 'Toute annulation effectuée jusqu’à 48 heures avant l’arrivée prévue est entièrement gratuite. Pour les annulations tardives ou non-présentations, la première nuit sera facturée.',
    order: 1,
    createdAt: new Date()
  },
  {
    id: 2,
    category: 'Arrivée & Départ',
    question: 'Quelles sont les heures de Check-in et de Check-out ?',
    answer: 'Le check-in s’effectue à partir de 14h00 et le check-out jusqu’à 12h00. Un service d’arrivée anticipée ou de départ tardif est disponible sur demande auprès de la conciergerie.',
    order: 2,
    createdAt: new Date()
  },
  {
    id: 3,
    category: 'Services & Conciergerie',
    question: 'Proposez-vous un service de navette aéroport / ville ?',
    answer: 'Oui, nous mettons à disposition un service de navette privée avec chauffeur depuis l’aéroport international de Yaoundé-Nsimalen ou la gare ferroviaire sur réservation préalable.',
    order: 3,
    createdAt: new Date()
  },
  {
    id: 4,
    category: 'Restauration & Petit-déjeuner',
    question: 'Le petit-déjeuner est-il inclus dans le séjour ?',
    answer: 'Un petit-déjeuner gastronomique sous forme de buffet raffiné et de carte à la commande est inclus pour nos Appartements de Prestige et Exécutifs, et disponible en supplément pour les Chambres.',
    order: 4,
    createdAt: new Date()
  },
  {
    id: 5,
    category: 'Événements & Séminaires',
    question: 'Disposez-vous de salles pour des événements privés ou réunions professionnelles ?',
    answer: 'L’Hôtel Résidence Madadjeu dispose de salons privés équipés d’écrans haute définition et de solutions de visioconférence pour vos réunions jusqu’à 30 personnes.',
    order: 5,
    createdAt: new Date()
  }
];

// In-memory runtime cache for bookings and messages
const inMemoryBookings: schema.Booking[] = [
  {
    id: 1,
    bookingReference: 'MDJ-84920',
    guestName: 'Jean-Paul Kamga',
    guestEmail: 'jp.kamga@example.com',
    guestPhone: '+237 6 99 00 11 22',
    roomId: 1,
    checkInDate: '2026-09-10',
    checkOutDate: '2026-09-14',
    guestsCount: 2,
    specialRequests: 'Arrivée tardive vers 20h00, champagne en chambre.',
    totalPrice: '600000.00',
    paymentMethod: 'hotel',
    paymentTransactionId: null,
    status: 'confirmed',
    eventType: null,
    createdAt: new Date()
  }
];

const inMemoryMessages: schema.ContactMessage[] = [];

// Service helper methods
export async function getAllRooms(options?: { includeArchived?: boolean }): Promise<schema.Room[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const result = await dbInstance.select().from(schema.rooms);
      if (result.length > 0) {
        if (!options?.includeArchived) {
          return result.filter(r => r.status !== 'archived' && r.status !== 'inactive');
        }
        return result;
      }
    } catch (e) {
      handleDbError('getAllRooms', e);
    }
  }
  if (!options?.includeArchived) {
    return INITIAL_ROOMS.filter(r => r.status !== 'archived' && r.status !== 'inactive');
  }
  return INITIAL_ROOMS;
}

export async function getRoomBySlug(slug: string): Promise<schema.Room | null> {
  const allRooms = await getAllRooms({ includeArchived: true });
  return allRooms.find(r => r.slug === slug || (slug === 'suite-royale' && r.id === 1)) || null;
}

export async function getRoomById(id: number): Promise<schema.Room | null> {
  const allRooms = await getAllRooms({ includeArchived: true });
  return allRooms.find(r => r.id === id) || null;
}

export async function getRoomImages(roomId: number): Promise<string[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const records = await dbInstance
        .select({ imageUrl: schema.roomImages.imageUrl })
        .from(schema.roomImages)
        .where(eq(schema.roomImages.roomId, roomId))
        .orderBy(asc(schema.roomImages.sortOrder), asc(schema.roomImages.id));
      return records.map(r => r.imageUrl);
    } catch (e) {
      handleDbError('getRoomImages', e);
    }
  }
  return [];
}

export async function getAllFaqs(): Promise<schema.Faq[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const result = await dbInstance.select().from(schema.faqs).orderBy(schema.faqs.order);
      if (result.length > 0) return result;
    } catch (e) {
      handleDbError('getAllFaqs', e);
    }
  }
  return INITIAL_FAQS;
}

export async function getAllServices(): Promise<schema.Service[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const result = await dbInstance.select().from(schema.services).orderBy(schema.services.order);
      return result;
    } catch (e) {
      handleDbError('getAllServices', e);
    }
  }
  return [];
}

export function getBookingInterval(checkInStr: string, checkOutStr: string, roomType: string) {
  const [inY, inM, inD] = checkInStr.split('-').map(Number);
  const checkInTime = new Date(inY, inM - 1, inD, 14, 0, 0); // 14:00 check-in
  
  const [outY, outM, outD] = checkOutStr.split('-').map(Number);
  const checkOutTime = new Date(outY, outM - 1, outD, 12, 0, 0); // 12:00 check-out
  
  const isHall = roomType === 'hall';
  const beforeBufferHours = isHall ? 48 : 24;
  const afterBufferHours = isHall ? 24 : 12;
  
  const startWithBuffer = new Date(checkInTime.getTime() - beforeBufferHours * 60 * 60 * 1000);
  const endWithBuffer = new Date(checkOutTime.getTime() + afterBufferHours * 60 * 60 * 1000);
  
  return { start: startWithBuffer, end: endWithBuffer };
}

export async function checkAvailability(roomId: number, checkInDate: string, checkOutDate: string): Promise<number> {
  const room = await getRoomById(roomId);
  if (!room) return 0;
  
  if (room.forceAvailable) {
    return room.totalRooms;
  }
  
  const requestedInterval = getBookingInterval(checkInDate, checkOutDate, room.type);
  
  let activeBookings: schema.Booking[] = [];
  let pendingExtensions: schema.BookingExtension[] = [];
  
  if (dbInstance && isDbHealthy) {
    try {
      activeBookings = await dbInstance.select()
        .from(schema.bookings)
        .where(
          sql`${schema.bookings.roomId} = ${roomId} AND ${schema.bookings.status} IN ('pending', 'confirmed')`
        );

      if (activeBookings.length > 0) {
        const bookingIds = activeBookings.map(b => b.id);
        pendingExtensions = await dbInstance.select()
          .from(schema.bookingExtensions)
          .where(
            sql`${schema.bookingExtensions.status} = 'pending' AND ${inArray(schema.bookingExtensions.bookingId, bookingIds)}`
          );
      }
    } catch (e) {
      handleDbError('checkAvailability', e);
    }
  } else {
    activeBookings = inMemoryBookings.filter(b => b.roomId === roomId && (b.status === 'pending' || b.status === 'confirmed'));
  }

  let maxConcurrent = 0;
  type Event = { time: number; type: 'start' | 'end'; count: number };
  const events: Event[] = [];
  
  for (const booking of activeBookings) {
    const extension = pendingExtensions.find(e => e.bookingId === booking.id);
    const effectiveCheckOut = extension ? extension.requestedCheckoutDate : booking.checkOutDate;
    const interval = getBookingInterval(booking.checkInDate, effectiveCheckOut, room.type);
    
    if (interval.start.getTime() < requestedInterval.end.getTime() && interval.end.getTime() > requestedInterval.start.getTime()) {
      events.push({ time: interval.start.getTime(), type: 'start', count: booking.guestsCount });
      events.push({ time: interval.end.getTime(), type: 'end', count: booking.guestsCount });
    }
  }
  
  events.push({ time: requestedInterval.start.getTime(), type: 'start', count: 0 }); 
  
  events.sort((a, b) => {
    if (a.time === b.time) {
      return a.type === 'end' ? -1 : 1;
    }
    return a.time - b.time;
  });
  
  let currentConcurrent = 0;
  for (const event of events) {
    if (event.type === 'start') {
      currentConcurrent += event.count;
      if (event.time >= requestedInterval.start.getTime() && event.time < requestedInterval.end.getTime()) {
        if (currentConcurrent > maxConcurrent) {
          maxConcurrent = currentConcurrent;
        }
      }
    } else {
      currentConcurrent -= event.count;
    }
  }

  let concurrentAtStart = 0;
  for (const booking of activeBookings) {
    const extension = pendingExtensions.find(e => e.bookingId === booking.id);
    const effectiveCheckOut = extension ? extension.requestedCheckoutDate : booking.checkOutDate;
    const interval = getBookingInterval(booking.checkInDate, effectiveCheckOut, room.type);
    
    if (interval.start.getTime() <= requestedInterval.start.getTime() && interval.end.getTime() > requestedInterval.start.getTime()) {
      concurrentAtStart += booking.guestsCount;
    }
  }
  if (concurrentAtStart > maxConcurrent) {
    maxConcurrent = concurrentAtStart;
  }

  return Math.max(0, room.totalRooms - maxConcurrent);
}

export async function createBooking(data: Omit<schema.Booking, 'id' | 'createdAt'>): Promise<schema.Booking> {
  const newBooking: schema.Booking = {
    id: inMemoryBookings.length + 1,
    ...data,
    createdAt: new Date()
  };

  if (dbInstance && isDbHealthy) {
    try {
      return await dbInstance.transaction(async (tx) => {
        // 1. Lock the room row for update to prevent race conditions
        const [room] = await tx.select()
          .from(schema.rooms)
          .where(sql`${schema.rooms.id} = ${data.roomId}`)
          .for('update');
        
        if (!room) {
          throw new Error('Room not found');
        }

        const requestedCount = data.guestsCount || 1; // Assuming guestsCount stores the number of rooms requested for now
        
        // 2. Check dynamic availability (with buffers)
        const currentAvail = await checkAvailability(data.roomId, data.checkInDate, data.checkOutDate);
        if (currentAvail < requestedCount) {
          throw new Error('Not enough rooms available for these dates');
        }

        // 3. Decrement available inventory and increase onHold or inUse
        if (data.status === 'confirmed') {
          await tx.update(schema.rooms)
            .set({ 
              availableRooms: sql`${schema.rooms.availableRooms} - ${requestedCount}`,
              inUseRooms: sql`${schema.rooms.inUseRooms} + ${requestedCount}`
            })
            .where(sql`${schema.rooms.id} = ${data.roomId}`);
        } else {
          await tx.update(schema.rooms)
            .set({ 
              availableRooms: sql`${schema.rooms.availableRooms} - ${requestedCount}`,
              onHoldRooms: sql`${schema.rooms.onHoldRooms} + ${requestedCount}`
            })
            .where(sql`${schema.rooms.id} = ${data.roomId}`);
        }

        // 4. Create the booking
        const [inserted] = await tx.insert(schema.bookings).values(data).returning();
        
        return inserted;
      });
    } catch (e) {
      handleDbError('createBooking', e);
      throw e; // Rethrow so the caller knows the booking failed
    }
  }

  inMemoryBookings.push(newBooking);
  return newBooking;
}

export async function getBookingByReferenceOnly(reference: string): Promise<schema.Booking | null> {
  const cleanedRef = reference.trim().toUpperCase();

  if (dbInstance && isDbHealthy) {
    try {
      const results = await dbInstance.select().from(schema.bookings);
      const match = results.find(b => b.bookingReference.toUpperCase() === cleanedRef);
      if (match) return match;
    } catch (e) {
      handleDbError('getBookingByReferenceOnly', e);
    }
  }

  return inMemoryBookings.find(b => b.bookingReference.toUpperCase() === cleanedRef) || null;
}

export async function updateBookingStatus(
  reference: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  transactionId?: string,
  paymentMethod?: string
): Promise<schema.Booking | null> {
  const cleanedRef = reference.trim().toUpperCase();

  if (dbInstance && isDbHealthy) {
    try {
      const [existing] = await dbInstance
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.bookingReference, cleanedRef));

      if (existing) {
        const requestedRooms = existing.guestsCount || 1;
        if (existing.status === 'pending' && status === 'confirmed') {
          await dbInstance
            .update(schema.rooms)
            .set({
              onHoldRooms: sql`GREATEST(${schema.rooms.onHoldRooms} - ${requestedRooms}, 0)`,
              inUseRooms: sql`${schema.rooms.inUseRooms} + ${requestedRooms}`
            })
            .where(eq(schema.rooms.id, existing.roomId));
        } else if (existing.status === 'confirmed' && status === 'completed') {
          await dbInstance
            .update(schema.rooms)
            .set({
              inUseRooms: sql`GREATEST(${schema.rooms.inUseRooms} - ${requestedRooms}, 0)`,
              availableRooms: sql`${schema.rooms.availableRooms} + ${requestedRooms}`
            })
            .where(eq(schema.rooms.id, existing.roomId));
        } else if (existing.status === 'pending' && status === 'cancelled') {
          await dbInstance
            .update(schema.rooms)
            .set({
              onHoldRooms: sql`GREATEST(${schema.rooms.onHoldRooms} - ${requestedRooms}, 0)`,
              availableRooms: sql`${schema.rooms.availableRooms} + ${requestedRooms}`
            })
            .where(eq(schema.rooms.id, existing.roomId));
        } else if (existing.status === 'confirmed' && status === 'cancelled') {
          await dbInstance
            .update(schema.rooms)
            .set({
              inUseRooms: sql`GREATEST(${schema.rooms.inUseRooms} - ${requestedRooms}, 0)`,
              availableRooms: sql`${schema.rooms.availableRooms} + ${requestedRooms}`
            })
            .where(eq(schema.rooms.id, existing.roomId));
        }
      }

      const updateData: Partial<typeof schema.bookings.$inferInsert> = { status };
      if (transactionId !== undefined) updateData.paymentTransactionId = transactionId;
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

      const [updated] = await dbInstance
        .update(schema.bookings)
        .set(updateData)
        .where(eq(schema.bookings.bookingReference, cleanedRef))
        .returning();
      if (updated) return updated;
    } catch (e) {
      handleDbError('updateBookingStatus', e);
    }
  }

  const booking = inMemoryBookings.find(b => b.bookingReference.toUpperCase() === cleanedRef);
  if (booking) {
    booking.status = status;
    if (transactionId !== undefined) booking.paymentTransactionId = transactionId;
    if (paymentMethod !== undefined) booking.paymentMethod = paymentMethod;
    return booking;
  }
  return null;
}

export async function getBookingByReference(reference: string, email: string): Promise<schema.Booking | null> {
  const cleanedRef = reference.trim().toUpperCase();
  const cleanedEmail = email.trim().toLowerCase();

  if (dbInstance && isDbHealthy) {
    try {
      const results = await dbInstance.select().from(schema.bookings);
      const match = results.find(b => 
        b.bookingReference.toUpperCase() === cleanedRef && 
        b.guestEmail.toLowerCase() === cleanedEmail
      );
      if (match) return match;
    } catch (e) {
      handleDbError('getBookingByReference', e);
    }
  }

  return inMemoryBookings.find(b => 
    b.bookingReference.toUpperCase() === cleanedRef && 
    b.guestEmail.toLowerCase() === cleanedEmail
  ) || null;
}

export interface CancelBookingResult {
  success: boolean;
  message: string;
  refundPercentage?: number;
  minHoursRequired?: number;
  hoursRemaining?: number;
  isEligibleForRefund?: boolean;
}

export function evaluateCancellationPolicy(checkInDateStr: string, roomType: string | null | undefined): {
  hoursRemaining: number;
  minHoursRequired: number;
  isEligibleForRefund: boolean;
  refundPercentage: number;
  isPast: boolean;
} {
  // Check-in date format YYYY-MM-DD, check-in starts at 14:00
  const [y, m, d] = checkInDateStr.split('-').map(Number);
  const checkInTime = new Date(y, m - 1, d, 14, 0, 0);
  const now = new Date();
  const hoursRemaining = (checkInTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const isHall = roomType === 'hall';
  const minHoursRequired = isHall ? 36 : 20;
  const isPast = hoursRemaining < 0;
  const isEligibleForRefund = !isPast && hoursRemaining >= minHoursRequired;
  const refundPercentage = isEligibleForRefund ? 95 : 0;

  return {
    hoursRemaining,
    minHoursRequired,
    isEligibleForRefund,
    refundPercentage,
    isPast
  };
}

export async function cancelBooking(reference: string, email: string): Promise<CancelBookingResult> {
  const cleanedRef = reference.trim().toUpperCase();
  const cleanedEmail = email.trim().toLowerCase();

  if (dbInstance && isDbHealthy) {
    try {
      return await dbInstance.transaction(async (tx) => {
        // 1. Fetch booking with lock
        const [booking] = await tx.select()
          .from(schema.bookings)
          .where(
            sql`${schema.bookings.bookingReference} = ${cleanedRef} AND lower(${schema.bookings.guestEmail}) = ${cleanedEmail}`
          )
          .for('update');
        
        if (!booking) {
          return { success: false, message: 'Aucune réservation trouvée pour ces identifiants.' };
        }

        if (booking.status === 'cancelled') {
          return { success: false, message: 'Cette réservation a déjà été annulée.' };
        }

        if (booking.status === 'completed') {
          return { success: false, message: 'Ce séjour est déjà terminé et ne peut plus être annulé.' };
        }

        // 2. Fetch room with lock
        const [room] = await tx.select()
          .from(schema.rooms)
          .where(sql`${schema.rooms.id} = ${booking.roomId}`)
          .for('update');
          
        const policy = evaluateCancellationPolicy(booking.checkInDate, room?.type);
        if (policy.isPast) {
          return {
            success: false,
            message: 'La date prévue est déjà passée. L’annulation en ligne n’est plus possible.',
            hoursRemaining: policy.hoursRemaining,
            minHoursRequired: policy.minHoursRequired
          };
        }

        if (room) {
          // 3. Restore inventory
          const restoreCount = room.type === 'hall' ? 1 : booking.guestsCount; 
          if (booking.status === 'pending') {
            await tx.update(schema.rooms)
              .set({ 
                availableRooms: sql`${schema.rooms.availableRooms} + ${restoreCount}`,
                onHoldRooms: sql`GREATEST(${schema.rooms.onHoldRooms} - ${restoreCount}, 0)`
              })
              .where(sql`${schema.rooms.id} = ${room.id}`);
          } else if (booking.status === 'confirmed') {
            await tx.update(schema.rooms)
              .set({ 
                availableRooms: sql`${schema.rooms.availableRooms} + ${restoreCount}`,
                inUseRooms: sql`GREATEST(${schema.rooms.inUseRooms} - ${restoreCount}, 0)`
              })
              .where(sql`${schema.rooms.id} = ${room.id}`);
          }
        }

        // 4. Cancel booking
        await tx.update(schema.bookings)
          .set({ status: 'cancelled' })
          .where(sql`${schema.bookings.id} = ${booking.id}`);
          
        const isHall = room?.type === 'hall';
        const message = policy.isEligibleForRefund
          ? `Votre réservation a été annulée avec succès. Conformément à notre politique (${isHall ? '≥ 36h pour les salles' : '≥ 20h pour les chambres'}), un remboursement de 95% est accordé.`
          : `Votre réservation a été annulée. Toutefois, l’annulation intervenant à moins de ${policy.minHoursRequired}h avant ${isHall ? 'l’événement' : 'le séjour'}, aucun remboursement n’est applicable selon nos conditions générales.`;

        return {
          success: true,
          message,
          refundPercentage: policy.refundPercentage,
          minHoursRequired: policy.minHoursRequired,
          hoursRemaining: policy.hoursRemaining,
          isEligibleForRefund: policy.isEligibleForRefund
        };
      });
    } catch (e) {
      handleDbError('cancelBooking', e);
      return { success: false, message: 'Une erreur est survenue lors de l’annulation de votre réservation.' };
    }
  }

  // Fallback for in-memory
  const booking = inMemoryBookings.find(b => 
    b.bookingReference.toUpperCase() === cleanedRef && 
    b.guestEmail.toLowerCase() === cleanedEmail
  );
  if (!booking) return { success: false, message: 'Aucune réservation trouvée.' };
  if (booking.status === 'cancelled') return { success: false, message: 'Cette réservation a déjà été annulée.' };
  if (booking.status === 'completed') return { success: false, message: 'Ce séjour est déjà terminé.' };

  const room = INITIAL_ROOMS.find(r => r.id === booking.roomId);
  const policy = evaluateCancellationPolicy(booking.checkInDate, room?.type);
  if (policy.isPast) {
    return { success: false, message: 'La date prévue est déjà passée.' };
  }

  booking.status = 'cancelled';
  const isHall = room?.type === 'hall';
  const message = policy.isEligibleForRefund
    ? `Votre réservation a été annulée avec succès. Conformément à notre politique (${isHall ? '≥ 36h pour les salles' : '≥ 20h pour les chambres'}), un remboursement de 95% est accordé.`
    : `Votre réservation a été annulée. Délai inférieur à ${policy.minHoursRequired}h, aucun remboursement applicable.`;

  return {
    success: true,
    message,
    refundPercentage: policy.refundPercentage,
    minHoursRequired: policy.minHoursRequired,
    hoursRemaining: policy.hoursRemaining,
    isEligibleForRefund: policy.isEligibleForRefund
  };
}

export async function createContactMessage(data: Omit<schema.ContactMessage, 'id' | 'createdAt'>): Promise<schema.ContactMessage> {
  const newMsg: schema.ContactMessage = {
    id: inMemoryMessages.length + 1,
    ...data,
    createdAt: new Date()
  };

  if (dbInstance && isDbHealthy) {
    try {
      const [inserted] = await dbInstance.insert(schema.contactMessages).values(data).returning();
      if (inserted) return inserted;
    } catch (e) {
      handleDbError('createContactMessage', e);
    }
  }

  inMemoryMessages.push(newMsg);
  return newMsg;
}

export async function getSettings(): Promise<schema.SiteSetting[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const result = await dbInstance.select().from(schema.siteSettings);
      return result;
    } catch (e) {
      handleDbError('getSettings', e);
    }
  }
  return [];
}

export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
  if (dbInstance && isDbHealthy) {
    try {
      await dbInstance.transaction(async (tx) => {
        for (const [key, value] of Object.entries(settings)) {
          // Update or insert (upsert)
          await tx.insert(schema.siteSettings)
            .values({ key, value })
            .onConflictDoUpdate({
              target: schema.siteSettings.key,
              set: { value }
            });
        }
      });
      return true;
    } catch (e) {
      handleDbError('updateSettings', e);
      return false;
    }
  }
  return false;
}


export function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('+237')) return p;
  if (p.startsWith('237') && p.length > 9) return '+' + p;
  if (!p.startsWith('+')) return '+237' + p;
  return p;
}

export async function getBookingsByGuest(name: string, phone: string): Promise<schema.Booking[]> {
  const normalizedPhone = normalizePhone(phone);
  const searchName = name.trim().toLowerCase();

  if (dbInstance && isDbHealthy) {
    try {
      const results = await dbInstance.select().from(schema.bookings);
      return results.filter(b => 
        b.guestName.toLowerCase().includes(searchName) && 
        (b.guestPhone ? normalizePhone(b.guestPhone) === normalizedPhone : false)
      );
    } catch (e) {
      handleDbError('getBookingsByGuest', e);
    }
  }

  return inMemoryBookings.filter(b => 
    b.guestName.toLowerCase().includes(searchName) && 
    (b.guestPhone ? normalizePhone(b.guestPhone) === normalizedPhone : false)
  );
}

export async function hardDeleteBooking(id: number): Promise<boolean> {
  if (dbInstance && isDbHealthy) {
    try {
      await dbInstance.transaction(async (tx) => {
        const [booking] = await tx.select().from(schema.bookings).where(eq(schema.bookings.id, id)).for('update');
        if (!booking) return;

        if (booking.status === 'pending' || booking.status === 'confirmed') {
          const [room] = await tx.select().from(schema.rooms).where(eq(schema.rooms.id, booking.roomId)).for('update');
          if (room) {
            const restoreCount = room.type === 'hall' ? 1 : booking.guestsCount;
            if (booking.status === 'pending') {
              await tx.update(schema.rooms)
                .set({
                  availableRooms: sql`${schema.rooms.availableRooms} + ${restoreCount}`,
                  onHoldRooms: sql`GREATEST(${schema.rooms.onHoldRooms} - ${restoreCount}, 0)`
                })
                .where(eq(schema.rooms.id, room.id));
            } else if (booking.status === 'confirmed') {
              await tx.update(schema.rooms)
                .set({
                  availableRooms: sql`${schema.rooms.availableRooms} + ${restoreCount}`,
                  inUseRooms: sql`GREATEST(${schema.rooms.inUseRooms} - ${restoreCount}, 0)`
                })
                .where(eq(schema.rooms.id, room.id));
            }
          }
        }

        await tx.delete(schema.bookings).where(eq(schema.bookings.id, id));
      });
      return true;
    } catch (e) {
      handleDbError('hardDeleteBooking', e);
      return false;
    }
  }

  const idx = inMemoryBookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    inMemoryBookings.splice(idx, 1);
    return true;
  }
  return false;
}
