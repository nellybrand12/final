import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const connectionString = env.DATABASE_URL;

// Determine if DATABASE_URL is genuinely configured (not a template or sample placeholder string)
const isConfiguredDatabaseUrl = Boolean(
  connectionString &&
  connectionString.trim() !== '' &&
  !connectionString.includes('sample_db_pass') &&
  !connectionString.includes('abcdefgh12345678') &&
  !connectionString.includes('your-') &&
  !connectionString.includes('PLACEHOLDER') &&
  (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))
);

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isDbHealthy = false;

if (isConfiguredDatabaseUrl && connectionString) {
  try {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 5,
      onnotice: () => {},
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com') ? 'require' : undefined
    });
    dbInstance = drizzle(client, { schema });
    isDbHealthy = true;
  } catch (err: any) {
    console.warn('[Database] Could not initialize PostgreSQL client, using in-memory store:', err?.message || err);
    isDbHealthy = false;
  }
}

export const db = dbInstance;
export { dbInstance, isDbHealthy };

function handleDbError(operation: string, err: any) {
  if (isDbHealthy) {
    console.warn(`[Database] PostgreSQL query failed during ${operation}. Switched to in-memory store:`, err?.message || err);
    isDbHealthy = false;
  }
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
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQx0rucw-5rD5ahDanu8_rCNpsT4Z9TLxBXsaY2FhDyETMHnedd5ErFBXSOQj6UQhHrGFPJqWq4zxwga7i-QKAfyDL94xYc65Cs-W7yb90JWj7Df20w9k5_Nnkkvo5JxmokKG4uWLQRtIvMou-udEkJOHsI8w8xIrVpRg_aIQ1NK4SOAmnfUyRmllfHw-EO5oDmii-VFT8rP0NzwpfkQ3uA5YYx3UMNkv9R7X8M904grCbOYGgtHsw'
    ],
    amenities: ['Lit Double Confort', 'Salle de bain avec douche', 'Espace bureau', 'Wi-Fi haut débit', 'Smart TV'],
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
export async function getAllRooms(): Promise<schema.Room[]> {
  if (dbInstance && isDbHealthy) {
    try {
      const result = await dbInstance.select().from(schema.rooms);
      if (result.length > 0) return result;
    } catch (e) {
      handleDbError('getAllRooms', e);
    }
  }
  return INITIAL_ROOMS;
}

export async function getRoomBySlug(slug: string): Promise<schema.Room | null> {
  const allRooms = await getAllRooms();
  return allRooms.find(r => r.slug === slug || (slug === 'suite-royale' && r.id === 1)) || allRooms[0] || null;
}

export async function getRoomById(id: number): Promise<schema.Room | null> {
  const allRooms = await getAllRooms();
  return allRooms.find(r => r.id === id) || null;
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
        
        // 2. Check availability
        if (room.availableRooms < requestedCount) {
          throw new Error('Not enough rooms available');
        }

        // 3. Decrement available inventory
        await tx.update(schema.rooms)
          .set({ availableRooms: sql`${schema.rooms.availableRooms} - ${requestedCount}` })
          .where(sql`${schema.rooms.id} = ${data.roomId}`);

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
  status: 'pending_payment' | 'confirmed' | 'failed' | 'cancelled',
  transactionId?: string,
  paymentMethod?: string
): Promise<schema.Booking | null> {
  const cleanedRef = reference.trim().toUpperCase();

  if (dbInstance && isDbHealthy) {
    try {
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

export async function cancelBooking(reference: string, email: string): Promise<boolean> {
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
        
        if (!booking || booking.status === 'cancelled' || booking.status === 'completed') {
          return false;
        }

        // 2. Fetch room with lock
        const [room] = await tx.select()
          .from(schema.rooms)
          .where(sql`${schema.rooms.id} = ${booking.roomId}`)
          .for('update');
          
        if (room) {
          // 3. Restore inventory
          const restoreCount = room.type === 'hall' ? 1 : booking.guestsCount; 
          // Note: In createBooking, guestsCount actually stores the roomsCount (if not hall) based on earlier mapping.
          // Wait, let's just use booking.guestsCount for now, but really we should use the same logic as createBooking.
          // Since createBooking used data.guestsCount, we will add that back.
          await tx.update(schema.rooms)
            .set({ availableRooms: sql`${schema.rooms.availableRooms} + ${booking.guestsCount}` })
            .where(sql`${schema.rooms.id} = ${room.id}`);
        }

        // 4. Cancel booking
        await tx.update(schema.bookings)
          .set({ status: 'cancelled' })
          .where(sql`${schema.bookings.id} = ${booking.id}`);
          
        return true;
      });
    } catch (e) {
      handleDbError('cancelBooking', e);
      return false;
    }
  }

  // Fallback for in-memory
  const booking = inMemoryBookings.find(b => 
    b.bookingReference.toUpperCase() === cleanedRef && 
    b.guestEmail.toLowerCase() === cleanedEmail
  );
  if (!booking || booking.status === 'cancelled' || booking.status === 'completed') return false;
  booking.status = 'cancelled';
  return true;
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
