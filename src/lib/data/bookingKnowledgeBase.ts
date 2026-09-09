/**
 * Booking Knowledge Base & Deterministic Intent Engine
 * Shared single source of truth for FAQ and Rule-Based Booking Chatbot.
 * NO external AI/LLM API dependency.
 */

export interface KnowledgeTopic {
  id: string;
  category: 'booking' | 'rooms' | 'halls' | 'availability' | 'payments' | 'cancellation' | 'manage' | 'services' | 'times';
  categoryLabel: {
    fr: string;
    en: string;
  };
  question: {
    fr: string;
    en: string;
  };
  shortAnswer: {
    fr: string;
    en: string;
  };
  detailedAnswer: {
    fr: string;
    en: string;
  };
  keywords: string[]; // Normalized stems/keywords in FR and EN
  action?: {
    label: {
      fr: string;
      en: string;
    };
    href: string;
    isExternal?: boolean;
    icon?: string;
  };
}

export interface DynamicRoomSummary {
  name: string;
  nameFr?: string | null;
  nameEn?: string | null;
  category?: string | null;
  pricePerNight: string | number;
  maxGuests?: number | null;
  type?: string | null;
  status?: string | null;
}

export function formatLiveRoomPricing(rooms: DynamicRoomSummary[], locale: 'fr' | 'en'): string {
  const roomList = (rooms || []).filter(r => r.type !== 'hall' && r.status !== 'archived' && r.status !== 'inactive');
  if (!roomList.length) {
    return locale === 'fr'
      ? 'Nos hébergements de grand standing s’adaptent à tous vos besoins. Consultez la disponibilité, les capacités et les tarifs en temps réel sur notre page de réservation.'
      : 'Our luxury accommodations cater to all your needs. Check real-time availability, capacities, and rates on our booking page.';
  }

  const lines = roomList.map(r => {
    const name = locale === 'fr' ? (r.nameFr || r.name) : (r.nameEn || r.name);
    const priceNum = typeof r.pricePerNight === 'string' ? parseFloat(r.pricePerNight) : r.pricePerNight;
    const formattedPrice = isNaN(priceNum) ? r.pricePerNight : priceNum.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');
    const guestLabel = r.maxGuests
      ? (locale === 'fr' ? ` (jusqu’à ${r.maxGuests} ${r.maxGuests > 1 ? 'personnes' : 'personne'})` : ` (up to ${r.maxGuests} ${r.maxGuests > 1 ? 'guests' : 'guest'})`)
      : '';
    return `• ${name} : ${formattedPrice} FCFA / ${locale === 'fr' ? 'nuit' : 'night'}${guestLabel}`;
  });

  if (locale === 'fr') {
    return `Voici les tarifs et capacités actuels de nos chambres et appartements de grand standing :\n${lines.join('\n')}\n\nToutes nos catégories incluent Wi-Fi haut débit, climatisation, TV connectée et literie de luxe.`;
  } else {
    return `Here are the current nightly rates and guest capacities for our luxury rooms and apartments:\n${lines.join('\n')}\n\nAll categories include high-speed Wi-Fi, air conditioning, smart TV, and luxury bedding.`;
  }
}

export function formatLiveHallPricing(halls: DynamicRoomSummary[], locale: 'fr' | 'en'): string {
  const hallList = (halls || []).filter(r => r.type === 'hall' && r.status !== 'archived' && r.status !== 'inactive');
  if (!hallList.length) {
    return locale === 'fr'
      ? 'Nos espaces événementiels modulables accueillent vos banquets, mariages et conférences. Contactez la réception pour un devis et les disponibilités actuelles.'
      : 'Our versatile event venues host banquets, weddings, and conferences. Contact our front desk for current availability and custom quotes.';
  }

  const lines = hallList.map(h => {
    const name = locale === 'fr' ? (h.nameFr || h.name) : (h.nameEn || h.name);
    const priceNum = typeof h.pricePerNight === 'string' ? parseFloat(h.pricePerNight) : h.pricePerNight;
    const formattedPrice = isNaN(priceNum) ? h.pricePerNight : priceNum.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');
    const guestLabel = h.maxGuests
      ? (locale === 'fr' ? ` (jusqu’à ${h.maxGuests} ${h.maxGuests > 1 ? 'convives' : 'convive'})` : ` (up to ${h.maxGuests} ${h.maxGuests > 1 ? 'guests' : 'guest'})`)
      : '';
    return `• ${name} : ${formattedPrice} FCFA / ${locale === 'fr' ? 'jour' : 'day'}${guestLabel}`;
  });

  if (locale === 'fr') {
    return `Découvrez nos espaces de réception modulables, leurs tarifs et capacités actuels :\n${lines.join('\n')}\n\nÉquipements audiovisuels complets, sonorisation, climatisation et service traiteur sur mesure disponibles.`;
  } else {
    return `Discover our versatile event reception venues, current rates, and capacities:\n${lines.join('\n')}\n\nFull audiovisual equipment, sound system, air conditioning, and bespoke catering available.`;
  }
}

export const BOOKING_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'booking-process',
    category: 'booking',
    categoryLabel: {
      fr: 'Réservations',
      en: 'Reservations'
    },
    question: {
      fr: 'Comment réserver ? Faut-il créer un compte ?',
      en: 'How do I book? Do I need to create an account?'
    },
    shortAnswer: {
      fr: 'La réservation s’effectue directement en ligne en quelques clics, sans aucune création de compte (Guest Checkout). Sélectionnez simplement vos dates, votre catégorie, et renseignez votre nom, téléphone et e-mail.',
      en: 'Booking is done directly online in a few clicks with no account required (Guest Checkout). Simply select your dates, room category, and provide your name, phone number, and email.'
    },
    detailedAnswer: {
      fr: 'Notre processus de réservation est entièrement simplifié : aucun compte utilisateur ni mot de passe n’est requis (Guest Checkout). Rendez-vous sur notre page de réservation, choisissez vos dates d’arrivée et de départ, sélectionnez la chambre ou l’appartement de votre choix, puis renseignez votre nom, numéro de téléphone et adresse e-mail. Vous recevrez instantanément une confirmation par e-mail avec votre reçu officiel.',
      en: 'Our booking process is completely streamlined: no user account or password is required (Guest Checkout). Head to our booking page, choose your check-in and check-out dates, select your preferred room or apartment, and enter your full name, phone number, and email. You will instantly receive an email confirmation with your official receipt.'
    },
    keywords: [
      'reserver', 'reservation', 'comment reserver', 'compte', 'guest', 'checkout', 'creer compte',
      'book', 'booking', 'how to book', 'account', 'sign up', 'register', 'no account'
    ],
    action: {
      label: {
        fr: 'Réserver un séjour',
        en: 'Book a Stay'
      },
      href: '/reserver',
      icon: 'calendar_month'
    }
  },
  {
    id: 'room-types-pricing',
    category: 'rooms',
    categoryLabel: {
      fr: 'Chambres & Tarifs',
      en: 'Rooms & Rates'
    },
    question: {
      fr: 'Quels sont les types de chambres, leurs capacités et leurs tarifs par nuit ?',
      en: 'What are the room categories, guest capacities, and nightly rates?'
    },
    shortAnswer: {
      fr: 'Retrouvez l’ensemble de nos hébergements de grand standing avec leurs capacités d’accueil et tarifs par nuit actualisés en direct sur notre site. Toutes nos catégories incluent Wi-Fi haut débit, climatisation et literie de palace.',
      en: 'Explore our luxury accommodations with real-time guest capacities and nightly rates directly on our website. All categories include high-speed Wi-Fi, air conditioning, and luxury bedding.'
    },
    detailedAnswer: {
      fr: 'L’Hôtel Résidence Madadjeu vous accueille dans des hébergements raffinés alliant confort moderne et discrétion. Toutes nos catégories incluent Wi-Fi haut débit, climatisation et literie de luxe. Les tarifs et jauges de capacité sont administrés en direct dans notre système de réservation.',
      en: 'Hotel Residence Madadjeu welcomes you into refined accommodations combining modern comfort and absolute discretion. All categories include high-speed Wi-Fi, air conditioning, and luxury bedding. Nightly rates and capacities are managed live in our booking system.'
    },
    keywords: [
      'chambre', 'chambres', 'appartement', 'appartements', 'suite', 'suites', 'tarif', 'tarifs', 'prix', 'cout', 'combien', 'superieur', 'classique', 'junior', 'standard', 'capacite', 'capacite chambre', 'personne', 'personnes', 'places', 'lit', 'lits', 'nuit', 'nuitee',
      'room', 'rooms', 'apartment', 'apartments', 'suite', 'suites', 'rates', 'pricing', 'price', 'cost', 'how much', 'superior', 'classic', 'capacity', 'guests', 'people', 'bed', 'beds', 'night'
    ],
    action: {
      label: {
        fr: 'Explorer les chambres',
        en: 'Explore Rooms'
      },
      href: '/rooms',
      icon: 'king_bed'
    }
  },
  {
    id: 'event-halls',
    category: 'halls',
    categoryLabel: {
      fr: 'Salles d’Événements',
      en: 'Event Halls'
    },
    question: {
      fr: 'Quelles salles d’événements proposez-vous, avec quelles capacités et à quels tarifs ?',
      en: 'What event halls are available, what are their capacities, and what are their prices?'
    },
    shortAnswer: {
      fr: 'Nos espaces modulables accueillent vos banquets, mariages, conférences et séminaires d’entreprise. Les tarifs et jauges de capacité sont actualisés en temps réel selon vos besoins.',
      en: 'Our versatile venues host banquets, weddings, conferences, and corporate seminars. Capacities and rates are updated in real-time.'
    },
    detailedAnswer: {
      fr: 'Nos espaces modulables sont équipés d’une régie audiovisuelle complète, sonorisation surround et climatisation haute puissance. Un service traiteur haut de gamme peut être configuré sur mesure. Les capacités d’accueil et grilles tarifaires sont configurées en direct dans notre catalogue officiel.',
      en: 'Our versatile venues feature complete audiovisual systems, surround sound, and high-power air conditioning. Tailored catering services can be configured upon request. Guest capacities and pricing are configured live in our official catalog.'
    },
    keywords: [
      'salle', 'salles', 'evenement', 'evenements', 'fete', 'fetes', 'mariage', 'mariages', 'banquet', 'banquets', 'seminaire', 'seminaires', 'conference', 'conferences', 'balafon', 'etoile', 'reunion', 'reunions', 'capacite salle', 'places salle', 'convives', 'jauge', 'prix salle', 'prix des salles', 'tarif salle', 'tarifs salle', 'tarifs salles', 'combien coute la salle',
      'hall', 'halls', 'venue', 'venues', 'event', 'events', 'wedding', 'weddings', 'banquet', 'meeting', 'meetings', 'seminar', 'ballroom', 'party', 'hall capacity', 'hall price', 'hall rates', 'venue capacity'
    ],
    action: {
      label: {
        fr: 'Réserver une salle',
        en: 'Book a Hall'
      },
      href: '/reserver?type=hall',
      icon: 'celebration'
    }
  },
  {
    id: 'availability-buffers',
    category: 'availability',
    categoryLabel: {
      fr: 'Disponibilité & Délais',
      en: 'Availability & Buffers'
    },
    question: {
      fr: 'Comment fonctionne la disponibilité et le blocage des dates ?',
      en: 'How does availability and date blocking work?'
    },
    shortAnswer: {
      fr: 'La disponibilité est calculée en temps réel avec des marges techniques de sécurité : les chambres sont bloquées 24h avant et 12h après chaque séjour ; les salles sont bloquées 48h avant et 24h après chaque événement.',
      en: 'Availability is computed in real-time with technical security buffers: rooms are blocked 24h before check-in and 12h after check-out; halls are blocked 48h before and 24h after each event.'
    },
    detailedAnswer: {
      fr: 'Pour garantir un niveau d’hygiène, de préparation et d’entretien irréprochable, notre système applique un calendrier d’indisponibilité strict : chaque chambre réservée est automatiquement bloquée 24h avant l’arrivée (pour aération et désinfection) et 12h après le départ (pour remise à blanc). Les salles d’événements sont bloquées 48h avant (logistique, scénographie) et 24h après (démontage et nettoyage approfondi).',
      en: 'To ensure impeccable hygiene, preparation, and maintenance standards, our system applies strict date buffers: each booked room is automatically blocked 24h prior to check-in (deep preparation) and 12h after check-out (turnover). Event halls are blocked 48h prior (logistics & staging) and 24h post-event (breakdown & sanitation).'
    },
    keywords: [
      'disponibilite', 'disponible', 'dates', 'calendrier', 'bloque', 'tampon', 'buffer', 'delai', 'preparation', 'heure',
      'availability', 'available', 'dates', 'calendar', 'blocked', 'buffer', 'buffer time', 'turnover', 'preparation'
    ],
    action: {
      label: {
        fr: 'Consulter les dates',
        en: 'Check Dates'
      },
      href: '/reserver',
      icon: 'event_available'
    }
  },
  {
    id: 'payment-methods',
    category: 'payments',
    categoryLabel: {
      fr: 'Paiements & CinetPay',
      en: 'Payments & CinetPay'
    },
    question: {
      fr: 'Quels sont les modes de paiement acceptés (CinetPay, Espèces) ?',
      en: 'What payment methods are accepted (CinetPay, Cash)?'
    },
    shortAnswer: {
      fr: 'Nous acceptons le paiement en ligne sécurisé via CinetPay (Cartes bancaires Visa/Mastercard, MTN Mobile Money, Orange Money) ainsi que le règlement à l’arrivée à la réception (espèces ou Mobile Money).',
      en: 'We accept secure online payments via CinetPay (Visa/Mastercard, MTN Mobile Money, Orange Money) as well as payment upon arrival at the front desk (cash or Mobile Money).'
    },
    detailedAnswer: {
      fr: 'Vous pouvez choisir entre deux formules : (1) Paiement en ligne immédiat via la passerelle agréée CinetPay, acceptant les cartes bancaires internationales (Visa, Mastercard) et les portefeuilles mobiles locaux (MTN MoMo, Orange Money) avec chiffrement sécurisé ; (2) Paiement à l’arrivée directement à la réception de l’hôtel lors du check-in, en espèces, par carte ou par transfert Mobile Money.',
      en: 'You can choose between two convenient options: (1) Instant online payment via the certified CinetPay aggregator, supporting international cards (Visa, Mastercard) and local mobile money (MTN MoMo, Orange Money) with full encryption; (2) Payment upon arrival directly at the hotel front desk upon check-in, in cash, card, or Mobile Money.'
    },
    keywords: [
      'paiement', 'payer', 'cinetpay', 'momo', 'mtn', 'orange', 'orange money', 'carte', 'visa', 'mastercard', 'espece', 'arrivee', 'reglement',
      'payment', 'pay', 'methods', 'cinetpay', 'mobile money', 'card', 'credit card', 'arrival', 'cash', 'pay at arrival'
    ],
    action: {
      label: {
        fr: 'Voir les options de réservation',
        en: 'View Booking Options'
      },
      href: '/reserver',
      icon: 'payments'
    }
  },
  {
    id: 'cancellation-policy',
    category: 'cancellation',
    categoryLabel: {
      fr: 'Politique d’Annulation',
      en: 'Cancellation Policy'
    },
    question: {
      fr: 'Quelles sont les conditions d’annulation et de remboursement à 95% ?',
      en: 'What is the cancellation and 95% refund policy?'
    },
    shortAnswer: {
      fr: 'Les chambres peuvent être annulées jusqu’à 20h avant l’arrivée (14h) pour un remboursement de 95%. Pour les salles, le préavis est de 36h minimum pour 95% de remboursement. Au-delà, contactez notre service client.',
      en: 'Rooms can be cancelled up to 20h before check-in (2 PM) for a 95% refund. Event halls require at least 36h notice for a 95% refund. Beyond these windows, please contact customer support.'
    },
    detailedAnswer: {
      fr: 'Notre politique d’annulation prévoit un remboursement de 95% du montant payé (les 5% restants couvrent les frais de transaction bancaire) sous respect des délais suivants : (1) Chambres & Suites : annulation demandée au moins 20 heures avant l’heure officielle de check-in (14h00) ; (2) Salles d’événements : annulation demandée au moins 36 heures avant l’heure de mise à disposition. Pour toute annulation effectuée en deçà de ces préavis, la réservation devient non-remboursable, mais notre service client reste joignable pour convenir d’un report selon les disponibilités.',
      en: 'Our cancellation policy guarantees a 95% refund of the paid amount (5% covers banking processing fees) under the following notice periods: (1) Rooms & Suites: cancellation requested at least 20 hours prior to official check-in time (2:00 PM); (2) Event Halls: cancellation requested at least 36 hours prior to the scheduled event time. Cancellations made inside these notice windows are non-refundable; however, our guest relations team can assist with rescheduling subject to availability.'
    },
    keywords: [
      'annulation', 'annuler', 'remboursement', 'rembourser', '95%', 'delai', '20h', '36h', 'frais', 'politique', 'conditions',
      'cancellation', 'cancel', 'refund', '95', 'notice', '20 hours', '36 hours', 'policy', 'terms'
    ],
    action: {
      label: {
        fr: 'Gérer une réservation',
        en: 'Manage a Booking'
      },
      href: '/gerer-reservation',
      icon: 'cancel'
    }
  },
  {
    id: 'manage-extend-booking',
    category: 'manage',
    categoryLabel: {
      fr: 'Gérer / Prolonger un Séjour',
      en: 'Manage / Extend Stay'
    },
    question: {
      fr: 'Comment consulter ou prolonger une réservation existante ?',
      en: 'How do I look up or extend an existing booking?'
    },
    shortAnswer: {
      fr: 'Rendez-vous sur notre page « Gérer ma réservation » et indiquez simplement votre Nom et votre Numéro de téléphone. Vous pourrez voir les détails de votre réservation, télécharger votre reçu ou prolonger votre séjour.',
      en: 'Go to our "Manage Booking" page and enter your Name and Phone number. You can view your reservation details, download receipts, or extend your stay.'
    },
    detailedAnswer: {
      fr: 'Aucun identifiant complexe n’est nécessaire : sur la page « Gérer ma réservation », renseignez votre Nom et votre Numéro de téléphone saisis lors de votre réservation. Vous accédez à votre dossier en temps réel : détails des dates, récapitulatif financier, téléchargement de la facture PDF officielle. Vous pouvez également prolonger votre séjour si la chambre est disponible pour les dates souhaitées et régler le complément par CinetPay en toute simplicité.',
      en: 'No complex credentials needed: on the "Manage Booking" page, enter your Name and Phone number registered during booking. You can access your file in real time: dates, financial summary, official PDF invoice download. You can also request an extension of your stay if the category is available for the additional dates, with instant payment via CinetPay.'
    },
    keywords: [
      'gerer', 'retrouver', 'chercher', 'prolonger', 'extension', 'modifier', 'recu', 'facture', 'nom', 'telephone', 'dossier', 'prolonger reservation', 'prolonger sejour', 'gerer reservation', 'consulter reservation', 'retrouver reservation', 'modifier reservation',
      'manage', 'lookup', 'find', 'extend', 'extension', 'modify', 'receipt', 'invoice', 'phone', 'name', 'details', 'extend booking', 'extend stay', 'manage booking', 'find booking'
    ],
    action: {
      label: {
        fr: 'Accéder à mon dossier',
        en: 'Access My Booking'
      },
      href: '/gerer-reservation',
      icon: 'manage_accounts'
    }
  },
  {
    id: 'hotel-services',
    category: 'services',
    categoryLabel: {
      fr: 'Services de l’Hôtel',
      en: 'Hotel Services'
    },
    question: {
      fr: 'Quels sont les services et commodités proposés par l’hôtel ?',
      en: 'What services and amenities are offered by the hotel?'
    },
    shortAnswer: {
      fr: 'Nous offrons 6 services haut de gamme : Suites & Appartements privés, Restaurant gastronomique & Terrasse, Salle de Fitness moderne, Location de véhicules avec chauffeur, Salles d’événements, et Espace Massage & Spa.',
      en: 'We offer 6 upscale services: Private Suites & Apartments, Gourmet Restaurant & Terrace, Modern Fitness Center, Car Rental with Chauffeur, Event & Banquet Halls, and Massage & Spa.'
    },
    detailedAnswer: {
      fr: 'L’Hôtel Résidence Madadjeu met à votre disposition une panoplie complète de services de prestige : (1) Suites et appartements tout équipés avec conciergerie 24/7 ; (2) Restaurant & Bar panoramique proposant une cuisine raffinée locale et internationale ; (3) Salle de fitness équipée d’appareils cardio et de musculation ; (4) Service de location de véhicules haut de gamme avec chauffeur privé pour vos déplacements sécurisés ; (5) Salles de conférences et de banquets modulables ; (6) Espace bien-être proposant massages relaxants et soins personnalisés.',
      en: 'Hotel Residence Madadjeu provides a comprehensive suite of prestigious amenities: (1) Fully appointed suites and apartments with 24/7 concierge; (2) Restaurant & Panoramic Bar featuring refined local and international cuisine; (3) Modern fitness center with cardio and weight training gear; (4) Premium car rental with private chauffeur for secure travel; (5) Modular banquet and conference halls; (6) Wellness spa center offering therapeutic massage and body treatments.'
    },
    keywords: [
      'service', 'services', 'restaurant', 'manger', 'fitness', 'sport', 'salle de sport', 'voiture', 'location', 'chauffeur', 'vehicule', 'spa', 'massage', 'detente',
      'service', 'services', 'amenities', 'restaurant', 'dining', 'gym', 'fitness', 'car rental', 'car', 'chauffeur', 'spa', 'massage', 'wellness'
    ],
    action: {
      label: {
        fr: 'Découvrir tous les services',
        en: 'Discover All Amenities'
      },
      href: '/amenities',
      icon: 'spa'
    }
  },
  {
    id: 'checkin-checkout-times',
    category: 'times',
    categoryLabel: {
      fr: 'Heures d’Arrivée & Départ',
      en: 'Check-in & Check-out'
    },
    question: {
      fr: 'Quelles sont les heures de Check-in et de Check-out ?',
      en: 'What are the check-in and check-out times?'
    },
    shortAnswer: {
      fr: 'Le check-in s’effectue à partir de 14h00 et le check-out jusqu’à 12h00. Une arrivée anticipée ou un départ tardif peut être arrangé auprès de la conciergerie.',
      en: 'Check-in starts from 2:00 PM and check-out is until 12:00 PM. Early check-in or late check-out may be arranged through the concierge.'
    },
    detailedAnswer: {
      fr: 'Notre heure officielle d’arrivée (Check-in) est fixée à partir de 14h00, et l’heure limite de départ (Check-out) est à 12h00. Cela permet à notre équipe d’effectuer la remise à neuf intégrale de la chambre conformément à notre protocole d’hygiène 5 étoiles. Si vous souhaitez bénéficier d’un check-in matinal ou d’un check-out tardif, veuillez contacter la réception ou la conciergerie 24h/24.',
      en: 'Our official check-in time starts at 2:00 PM, and the check-out deadline is 12:00 PM (noon). This allows our housekeeping team to execute a comprehensive room sanitization protocol. Should you require early check-in or late check-out, please contact our 24/7 front desk concierge.'
    },
    keywords: [
      'heure', 'heures', 'arrivee', 'depart', 'checkin', 'checkout', 'check-in', 'check-out', 'tardif', 'matinal',
      'time', 'hours', 'checkin', 'checkout', 'check-in', 'check-out', 'arrival', 'departure', 'early check-in', 'late check-out'
    ],
    action: {
      label: {
        fr: 'Contacter la réception',
        en: 'Contact Front Desk'
      },
      href: '/contact',
      icon: 'schedule'
    }
  }
];

/**
 * Normalizes a string by stripping diacritics, lowercasing, and removing punctuation.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic intent matcher.
 * Matches user query against keywords and stems in the knowledge base.
 * Returns the best matching topic or null if below threshold.
 */
export function matchBookingIntent(query: string): KnowledgeTopic | null {
  if (!query || query.trim().length < 2) return null;

  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(' ').filter(w => w.length > 2);

  if (words.length === 0) return null;

  let bestMatch: KnowledgeTopic | null = null;
  let highestScore = 0;

  for (const topic of BOOKING_KNOWLEDGE_BASE) {
    let score = 0;

    for (const keyword of topic.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      
      // Exact full match of keyword phrase
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(' ') ? 8 : 4;
      } else {
        // Individual token matching
        const kwWords = normalizedKeyword.split(' ');
        for (const kwWord of kwWords) {
          if (kwWord.length > 2 && words.includes(kwWord)) {
            score += 2;
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = topic;
    }
  }

  // Require a minimal threshold score of 3 to avoid irrelevant false positives
  if (highestScore >= 3) {
    return bestMatch;
  }

  return null;
}

/**
 * Quick prompt suggestions for one-click button flow.
 */
export const QUICK_TOPIC_CHIPS = [
  { id: 'room-types-pricing', labelFr: 'Chambres & Tarifs', labelEn: 'Rooms & Rates', icon: 'king_bed' },
  { id: 'event-halls', labelFr: 'Salles de Fêtes', labelEn: 'Event Halls', icon: 'celebration' },
  { id: 'booking-process', labelFr: 'Comment Réserver', labelEn: 'How to Book', icon: 'calendar_month' },
  { id: 'payment-methods', labelFr: 'Paiements & CinetPay', labelEn: 'Payments & CinetPay', icon: 'payments' },
  { id: 'cancellation-policy', labelFr: 'Annulation (95%)', labelEn: 'Cancellation (95%)', icon: 'verified_user' },
  { id: 'manage-extend-booking', labelFr: 'Gérer ma Réservation', labelEn: 'Manage My Booking', icon: 'manage_accounts' },
  { id: 'hotel-services', labelFr: 'Nos Services', labelEn: 'Our Services', icon: 'spa' }
];
