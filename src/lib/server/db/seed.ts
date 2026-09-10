import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { dbInstance, isDbHealthy, INITIAL_ROOMS, INITIAL_FAQS } from "./index";
import * as schema from "./schema";

const INITIAL_SERVICES = [
  {
    id: 'suites',
    nameFr: 'Suites Privées',
    nameEn: 'Private Suites',
    highlightFr: 'Confort Résidentiel',
    highlightEn: 'Residential Comfort',
    descriptionFr: 'Chambres privées et spacieuses avec Wi-Fi haut débit, salle de bain privative entièrement équipée, téléviseur compatible avec le casting personnel, chaussons et peignoir pour un confort absolu.',
    descriptionEn: 'Spacious private rooms with high-speed Wi-Fi, a fully equipped en-suite bathroom, a TV with personal casting support, and plush slippers and a bathrobe for total comfort.',
    icon: 'king_bed',
    imageUrl: '',
    ctaTextFr: 'Découvrir nos suites',
    ctaTextEn: 'Discover Suites',
    ctaLink: '/rooms',
    order: 1
  },
  {
    id: 'restaurant',
    nameFr: 'Restaurant',
    nameEn: 'Restaurant',
    highlightFr: 'Art Culinaire & Restauration',
    highlightEn: 'Culinary Art & Dining',
    descriptionFr: 'Profitez d’un mélange de cuisine africaine et internationale préparée avec des saveurs riches et authentiques, disponible sur place ou livrée directement dans votre chambre.',
    descriptionEn: 'Enjoy a blend of African and international cuisine crafted with rich, authentic flavors, available in-house or delivered straight to your room.',
    icon: 'restaurant',
    imageUrl: '',
    ctaTextFr: 'Dîner en Chambre',
    ctaTextEn: 'In-Room Dining',
    ctaLink: '/contact',
    order: 2
  },
  {
    id: 'fitness',
    nameFr: 'Espace Fitness',
    nameEn: 'Fitness Center',
    highlightFr: 'Forme & Vitalité',
    highlightEn: 'Fitness & Vitality',
    descriptionFr: 'Une salle de sport bien équipée pour la musculation et le fitness quotidien, ouverte à tous nos clients désirant rester actifs durant leur séjour.',
    descriptionEn: 'A well-equipped gym for strength training and everyday fitness, open to all guests looking to stay active during their stay.',
    icon: 'fitness_center',
    imageUrl: '',
    ctaTextFr: 'Accès Résidents',
    ctaTextEn: 'Resident Access',
    ctaLink: '/contact',
    order: 3
  },
  {
    id: 'car-rental',
    nameFr: 'Location de Voiture',
    nameEn: 'Car Rental',
    highlightFr: 'Mobilité & Déplacements',
    highlightEn: 'Mobility & City Travel',
    descriptionFr: 'Louez un véhicule avec ou sans chauffeur privé pour des visites personnalisées de la ville et des déplacements en toute commodité.',
    descriptionEn: 'Rent a car with or without a private driver for personalized city tours and convenient travel around town.',
    icon: 'directions_car',
    imageUrl: '',
    ctaTextFr: 'Réserver un véhicule',
    ctaTextEn: 'Book a Car',
    ctaLink: 'https://wa.me/237699000000',
    order: 4
  },
  {
    id: 'event-halls',
    nameFr: 'Salles de Réception',
    nameEn: 'Event Halls',
    highlightFr: 'Événements & Rencontres',
    highlightEn: 'Events & Gatherings',
    descriptionFr: 'Salles polyvalentes pour réceptions, réunions et autres rencontres, modulables pour s’adapter à des événements de toute envergure.',
    descriptionEn: 'Versatile halls for parties, meetings, and other gatherings, adaptable to fit events of any size.',
    icon: 'celebration',
    imageUrl: '',
    ctaTextFr: 'Demander un devis',
    ctaTextEn: 'Request a Quote',
    ctaLink: '/contact',
    order: 5
  },
  {
    id: 'spa',
    nameFr: 'Massage & Spa',
    nameEn: 'Massage & Spa',
    highlightFr: 'Bien-être & Détente',
    highlightEn: 'Wellness & Relaxation',
    descriptionFr: 'Des soins de massage relaxants conçus pour vous aider à vous détendre et à vous ressourcer durant votre séjour.',
    descriptionEn: 'Relaxing massage treatments designed to help you unwind and recharge during your stay.',
    icon: 'spa',
    imageUrl: '',
    ctaTextFr: 'Réserver un soin',
    ctaTextEn: 'Book a Treatment',
    ctaLink: '/contact',
    order: 6
  }
];

const INITIAL_SETTINGS = [
  {
    key: "contact_info",
    value: {
      address: "Quartier Bastos, Yaoundé, Cameroun",
      phone: "+237 6 91 89 09 63",
      email: "madadjeuhotel2026@gmail.com",
      whatsapp: "237691890963",
    },
  },
  {
    key: "social_media",
    value: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
  },
];

export async function seedDatabase() {
  if (!dbInstance || !isDbHealthy) {
    console.warn("[Seed] Database not connected. Skipping seed.");
    return;
  }

  try {
    // Seed Admin User
    const existingAdmin = await dbInstance
      .select()
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.username, "Leblanc"));
    if (existingAdmin.length === 0) {
      const passwordHash = await hash("admin123", 10);
      await dbInstance.insert(schema.adminUsers).values({
        username: "Leblanc",
        passwordHash,
        role: "super-admin",
      });
      console.log("[Seed] Admin user seeded.");
    } else {
      if (existingAdmin[0].role !== "super-admin") {
        await dbInstance
          .update(schema.adminUsers)
          .set({ role: "super-admin" })
          .where(eq(schema.adminUsers.username, "Leblanc"));
      }
      console.log("[Seed] Admin user already exists.");
    }

    // Seed Rooms & Event Halls
    const existingRooms = await dbInstance.select().from(schema.rooms);
    if (existingRooms.length === 0) {
      await dbInstance.insert(schema.rooms).values(
        INITIAL_ROOMS.map((r) => {
          const { id, createdAt, ...rest } = r;
          return rest;
        }),
      );
      console.log("[Seed] Rooms seeded.");
    } else {
      console.log("[Seed] Rooms already exist.");
    }

    // Seed FAQs
    const existingFaqs = await dbInstance.select().from(schema.faqs);
    if (existingFaqs.length === 0) {
      await dbInstance.insert(schema.faqs).values(
        INITIAL_FAQS.map((f) => ({
          ...f,
          id: undefined, // Let the DB auto-increment
        })),
      );
      console.log("[Seed] FAQs seeded.");
    } else {
      console.log("[Seed] FAQs already exist.");
    }

    // Seed Services
    const existingServices = await dbInstance.select().from(schema.services);
    if (existingServices.length === 0) {
      await dbInstance.insert(schema.services).values(INITIAL_SERVICES);
      console.log("[Seed] Services seeded.");
    } else {
      console.log("[Seed] Services already exist.");
    }

    // Seed Site Settings
    const existingSettings = await dbInstance
      .select()
      .from(schema.siteSettings);
    if (existingSettings.length === 0) {
      await dbInstance.insert(schema.siteSettings).values(INITIAL_SETTINGS);
      console.log("[Seed] Site settings seeded.");
    } else {
      console.log("[Seed] Site settings already exist.");
    }
  } catch (error) {
    console.error("[Seed] Error seeding database:", error);
  }
}
