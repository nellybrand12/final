// Svelte 5 reactive i18n store with complete FR / EN localization
import { browser } from "$app/environment";

export type Locale = "fr" | "en";

const translations = {
  fr: {
    // Navigation & Drawer
    nav: {
      home: "Accueil",
      menu: "Menu",
      close: "Fermer",
      rooms: "Chambres & Appartements",
      amenities: "Services",
      location: "Situation & Accès",
      takeTour: "Visite Guidée",
      about: "Notre Histoire",
      contact: "Contact & Conciergerie",
      manageBooking: "Gérer ma Réservation",
      bookNow: "Réserver",
      bookStay: "Réserver votre séjour",
      discoverRooms: "Découvrir les Chambres",
      language: "Langue",
      addressTitle: "Adresse & Localisation",
      address: "Face Garde Présidentielle, Etoug-Ebe, Yaoundé, Cameroun",
      phone: "+237 6 91 89 09 63",
      conciergeService: "Conciergerie 24/7",
      followUs: "Suivez-nous",
    },
    // Hero Section
    hero: {
      locationTag: "YAOUNDÉ • CAMEROUN",
      initialTitle: "HÔTEL RÉSIDENCE MADADJEU",
      initialSubtitle: "APPARTEMENTS & CHAMBRES DE PRESTIGE • CONFORT EXCLUSIF",
      locationPill: "Rue Naomi Eto · Face à la Garde Présidentielle",
      showcaseTitle: "L'Excellence Hôtelière & Résidentielle",
      showcaseSubtitle: "L'idéal pour votre plaisir",
      ctaRooms: "Découvrir les Chambres",
      scrollDiscover: "Découvrir",
    },
    // Sub-Hero Section "Une Invitation à la Détente"
    invitation: {
      badge: "Expérience Résidentielle",
      title: "Une Invitation à la Détente",
      description:
        "Idéalement implanté face à la Garde Présidentielle à Etoug-Ebe, Yaoundé, l’Hôtel Résidence Madadjeu réinvente l’art de recevoir. Entre appartements de grand standing, quiétude absolue, équipements haut de gamme et conciergerie privée 24/7, offrez-vous une parenthèse feutrée au cœur de la capitale.",
      ctaRooms: "Voir les Chambres",
      ctaTour: "Visiter la Résidence",
      imageAlt:
        "Intérieur raffiné d’un appartement à l’Hôtel Résidence Madadjeu Yaoundé",
    },
    // Pillars
    pillars: {
      massageTitle: "Massages & Relaxation",
      massageDesc:
        "Des rituels de massage personnalisés pour apaiser le corps et l’esprit.",
      diningTitle: "Haute Gastronomie",
      diningDesc:
        "Cuisine savoureuse mêlant terroir camerounais et spécialités internationales.",
      conciergeTitle: "Conciergerie 24/7",
      conciergeDesc:
        "Un service majordome attentionné et discret pour combler chacune de vos exigences.",
      fitnessTitle: "Salle de Fitness",
      fitnessDesc:
        "Espace d’entraînement moderne avec équipements cardio et musculation.",
    },
    // "Ce qui nous distingue" Full-Width Carousel
    distinction: {
      badge: "Excellence & Distinction",
      title: "Ce qui nous distingue",
      subtitle:
        "Une signature hôtelière singulière conçue pour les voyageurs et résidents les plus exigeants",
      exploreBtn: "Explorer les lieux",
      bookBtn: "Réserver votre séjour",
      slides: [
        {
          id: "security",
          num: "01",
          tag: "Sécurité & Emplacement Stratégique",
          title: "Un Emplacement d’Exception & Sécurité Absolue",
          description:
            "Idéalement implanté face à la Garde Présidentielle à Etoug-Ebe, l’Hôtel Résidence Madadjeu offre une quiétude incomparable et un dispositif de sécurité permanent 24h/24.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
          link: "/location",
        },
        {
          id: "apartments",
          num: "02",
          tag: "Appartements & Chambres de Prestige",
          title: "Des Espaces de Vie Feutrés & Raffinés",
          description:
            "Appartements spacieux et chambres contemporaines dotés d’ébénisteries nobles, d’insonorisation soignée, d’une literie haut de gamme et d’équipements connectés.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1",
          link: "/rooms",
        },
        {
          id: "service",
          num: "03",
          tag: "Majordome & Conciergerie Dédiée",
          title: "Un Accompagnement Personnalisé 24/7",
          description:
            "Accueil VIP, transferts aéroportuaires sur-mesure, service en chambre et conciergerie privée : notre personnel anticipe chacun de vos besoins avec discrétion.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-",
          link: "/amenities",
        },
        {
          id: "rooftop",
          num: "04",
          tag: "Rooftop & Haute Gastronomie",
          title: "Panorama Spectaculaire & Table d’Hôtes",
          description:
            "Savourez une cuisine inventive et des cocktails signature sur notre terrasse panoramique surplombant la capitale, pour des instants de détente inoubliables.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eI6d4BvFff1_1jR1JcW0fMhN0lK4-B83_19k0g8e91uG1c62qKx4yUu3k5v4jL6b8e8f8_2z3g-4h5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2",
          link: "/amenities",
        },
      ],
    },
    // Home Rooms Showcase
    showcase: {
      badge: "Sélection Résidentielle",
      heading: "Nos Espaces de Prestige",
      description:
        "Chambres d’exception et appartements tout équipés avec salon privatif, cuisine moderne et vue dégagée sur Yaoundé.",
      exploreAll: "Explorer toutes les chambres",
      from: "À partir de",
      perNight: "FCFA / nuit",
      details: "Détails & Photos",
      book: "Réserver",
      upTo: "Jusqu’à",
      guests: "personnes",
    },
    // Prime Geographical Location — Neighborhood Carousel (100vw)
    neighborhoods: {
      badge: "Localisation Stratégique",
      title: "Au Cœur de Yaoundé & de ses Quartiers Emblématiques",
      subtitle:
        "Une implantation d’élite à Etoug-Ebe, alliant la sérénité face à la Garde Présidentielle à une accessibilité immédiate vers les centres névralgiques de la capitale.",
      interactiveMapCta: "Consulter la carte interactive & tous les accès",
      slides: [
        {
          id: "garde",
          name: "Garde Présidentielle (Etoug-Ebe)",
          description:
            "Situé à proximité immédiate de la Résidence, le quartier de la Garde Présidentielle offre un calme souverain et un niveau de sécurité maximal 24h/24.",
          distance: "200 m",
          driveTime: "1 min",
          walkTime: "2 min",
          imageUrl:
            "https://mindef.gov.cm/wp-content/uploads/2025/05/Passe-et-Avenir-6.jpg",
        },
        {
          id: "zoo",
          name: "Parc Zoo-Botanique de Mvog-Betsi",
          description:
            "Le plus grand parc zoologique du Cameroun, abritant une diversité d’espèces animales et végétales, idéal pour les familles et les passionnés de nature.",
          distance: "950 m",
          driveTime: "3 min",
          walkTime: "14 min",
          imageUrl:
            "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-400x400/15/92/fd/fc.jpg",
        },
        {
          id: "palais",
          name: "Palais des Congrès de Yaoundé",
          description:
            "Haut lieu des sommets internationaux, des réceptions d’État et des grands événements culturels, situé sur une colline verdoyante surplombant la cité.",
          distance: "4.2 km",
          driveTime: "8 min",
          walkTime: "35 min",
          imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Yaound%C3%A9_Sports_Palace_2014_%2802%29.JPG/3840px-Yaound%C3%A9_Sports_Palace_2014_%2802%29.JPG",
        },
        {
          id: "centre",
          name: "Centre Administratif & Boulevard du 20 Mai",
          description:
            "Le cœur décisionnel de la capitale : ministères, banques centrales, sièges d’entreprises et grandes galeries commerciales.",
          distance: "4.9 km",
          driveTime: "9 min",
          walkTime: "45 min",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMUcwix3wbLQpUwzHRRtVmLuTqTzsA1nP5p5o09apKONbOmYvA9cApO0Z4&s=10",
        },
        {
          id: "bastos",
          name: "Bastos & Quartier Diplomatique",
          description:
            "Quartier résidentiel huppé abritant ambassades internationales, résidences consulaires, terrasses raffinées et tables gastronomiques.",
          distance: "6.8 km",
          driveTime: "15 min",
          walkTime: "55 min",
          imageUrl:
            "https://news.uniresa.com/wp-content/uploads/2026/04/Top-5-quartiers-confortables-a-Yaounde-scaled.jpg",
        },
        {
          id: "aeroport",
          name: "Aéroport International de Yaoundé-Nsimalen (NSI)",
          description:
            "Porte d’entrée aérienne internationale de Yaoundé avec service dédié de navette VIP et chauffeur privé Madadjeu disponible.",
          distance: "24 km",
          driveTime: "30 min",
          walkTime: "N/A",
          imageUrl:
            "https://www.1flt.com/_next/image?url=%2Fphotos%2Fairport-aerial.jpg&w=3840&q=75",
        },
      ],
    },
    // Testimonials
    testimonials: {
      badge: "Avis Vérifiés & Témoignages",
      title: "Ne nous croyez pas sur parole !",
      subtitle:
        "Les impressions authentiques de nos hôtes diplomatiques, professionnels et résidents.",
      sourceLabel: "Avis vérifié",
      reviews: [
        {
          id: 1,
          author: "Marc-Antoine de V.",
          origin: "Paris, France",
          platform: "TripAdvisor",
          stayType: "Séjour Diplomatique",
          date: "Août 2026",
          title: "Un séjour d’exception et de sécurité absolue",
          quote:
            "L’emplacement face à la Garde Présidentielle procure une tranquillité d’esprit totale. Les appartements sont spacieux, d’une propreté exemplaire, et la conciergerie a répondu à toutes nos exigences avec une discrétion remarquable.",
        },
        {
          id: 2,
          author: "Dr. Aminata Kébé",
          origin: "Dakar, Sénégal",
          platform: "Booking.com",
          stayType: "Mission Professionnelle",
          date: "Juillet 2026",
          title: "Appartement impeccable et vue magique sur le rooftop",
          quote:
            "Un cadre digne des plus grandes maisons d’hôtes internationales. Le Wi-Fi par fibre optique est ultra-rapide pour travailler, et la gastronomie servie sur le rooftop au crépuscule est tout simplement magique.",
        },
        {
          id: 3,
          author: "David & Sarah Jenkins",
          origin: "Londres, Royaume-Uni",
          platform: "Google Maps",
          stayType: "Séjour Privé & Découverte",
          date: "Août 2026",
          title: "Un refuge chaleureux et un accueil sur-mesure",
          quote:
            "Nous avons passé deux semaines inoubliables. Le personnel est aux petits soins, la literie est d’un confort exceptionnel et le service navette avec chauffeur privé a rendu tous nos déplacements fluides et agréables.",
        },
        {
          id: 4,
          author: "Jean-Christophe M.",
          origin: "Genève, Suisse",
          platform: "Trip.com",
          stayType: "Voyage d’Affaires",
          date: "Juin 2026",
          title: "La référence hôtelière confidentielle de Yaoundé",
          quote:
            "Le parfait équilibre entre indépendance résidentielle et prestations haut de gamme. Les salles de travail insonorisées et le salon exécutif ont été parfaits pour nos rendez-vous avec nos partenaires locaux.",
        },
      ],
    },
    // Multi-Step Reservation Page
    reserve: {
      metaTitle: "Réservation Directe Sécurisée | Hôtel Résidence Madadjeu",
      metaDesc:
        "Réservez votre séjour en ligne à l’Hôtel Résidence Madadjeu face à la Garde Présidentielle à Yaoundé. Meilleur tarif garanti et confirmation immédiate.",
      tag: "Réservation Directe Sécurisée",
      heading: "Réservez Votre Séjour",
      subheading:
        "Un accueil sur mesure vous attend à l’Hôtel Résidence Madadjeu à Yaoundé.",
      step1Title: "Dates & Logement",
      step2Title: "Coordonnées",
      step3Title: "Paiement & Confirmation",
      step1Heading: "1. Choisissez votre logement, dates & nombre de chambres",
      step2Heading: "2. Coordonnées du client principal",
      step3Heading: "3. Modalité de règlement & validation",
      selectRoomLabel: "Sélectionnez votre hébergement",
      checkInLabel: "Date d’Arrivée",
      checkOutLabel: "Date de Départ",
      roomsCountLabel: "Nombre de Chambres",
      roomOptionSingle: "Chambre",
      roomOptionPlural: "Chambres",
      nextStepDetails: "Étape Suivante : Coordonnées",
      nextStepPayment: "Étape Suivante : Paiement",
      prevStep: "Retour",
      fullNameLabel: "Nom et Prénom *",
      fullNamePlaceholder: "Ex: Paul-Alain Kamga",
      emailLabel: "Adresse Email *",
      emailPlaceholder: "paul@example.com",
      phoneLabel: "Numéro de Téléphone *",
      phonePlaceholder: "+237 6 XX XX XX XX",
      specialRequestsLabel:
        "Demandes Particulières ou Heure d’Arrivée (Optionnel)",
      specialRequestsPlaceholder:
        "Arrivée tardive, lit bébé, transfert aéroport Nsimalen, préférences d’étage...",
      paymentTitle: "Sélectionnez votre mode de règlement",
      payOnlineTitle: "Paiement en ligne sécurisé (CinetPay)",
      payOnlineDesc: "MTN MoMo, Orange Money, Cartes Visa & Mastercard.",
      cinetpaySecurityBadge: "Paiement Sécurisé SSL 256-bit",
      cinetpayModalOpen:
        "Le guichet de paiement CinetPay est ouvert. Veuillez finaliser votre transaction dans la fenêtre contextuelle.",
      cinetpayVerifying:
        "Vérification du statut de votre transaction auprès de CinetPay...",
      cinetpayPopupNotice:
        "Cliquez sur « Payer maintenant » pour ouvrir le guichet de paiement sécurisé CinetPay directement sur cette page.",
      payNowBtn: "Payer maintenant",
      payHotelTitle: "Paiement sur place à l’arrivée",
      payHotelDesc:
        "Règlement par carte bancaire, espèces ou Mobile Money lors du check-in.",
      payHotelNotice:
        "Aucun prélèvement immédiat. Votre réservation est garantie et vous règlerez votre séjour à la réception lors de votre arrivée.",
      payMtnTitle: "MTN Mobile Money",
      payMtnDesc: "Débit direct et sécurisé sur votre compte MTN Mobile Money.",
      payOrangeTitle: "Orange Money",
      payOrangeDesc:
        "Débit direct et sécurisé sur votre compte Orange Money Cameroun.",
      payCardTitle: "Carte Bancaire (Visa / Mastercard)",
      payCardDesc: "Garantie par passerelle bancaire cryptée SSL 256-bit.",
      momoPhoneLabel: "Numéro de téléphone Mobile Money",
      momoPhonePlaceholder: "6 XX XX XX XX ou 2376XXXXXXXX",
      momoSendBtn: "Envoyer la demande de paiement",
      momoSending: "Envoi de la demande...",
      momoPendingInstruction:
        "Consultez votre téléphone et entrez votre code secret pour valider le transfert de",
      momoWaitingApproval: "En attente de validation sur votre mobile...",
      momoTimeoutWarning:
        "Délai d’attente dépassé (2 min). Le transfert n’a pas été validé.",
      momoRetryBtn: "Réessayer le paiement",
      cardHolderLabel: "Nom du titulaire",
      cardHolderPlaceholder: "Ex: Paul-Alain Kamga",
      cardNumberLabel: "Numéro de carte bancaire",
      cardNumberPlaceholder: "•••• •••• •••• ••••",
      cardExpiryLabel: "Date d’expiration",
      cardExpiryPlaceholder: "MM/AA",
      cardCvcLabel: "Code CVC / CVV",
      cardCvcPlaceholder: "123",
      cardPayBtn: "Payer",
      cardProcessing: "Traitement du paiement en cours...",
      paymentSuccess: "Paiement validé avec succès !",
      paymentFailed:
        "Le paiement a échoué. Veuillez vérifier vos informations ou essayer un autre moyen de paiement.",
      switchPaymentMethod: "Changer de moyen de paiement",
      termsNotice:
        "En confirmant cette réservation, vous acceptez nos conditions générales ainsi que notre politique d’annulation gratuite jusqu’à 48 heures avant votre séjour.",
      confirmSubmit: "Confirmer la réservation",
      summaryTitle: "Récapitulatif de Réservation",
      summaryCheckIn: "Arrivée :",
      summaryCheckOut: "Départ :",
      summaryDuration: "Durée du séjour :",
      summaryRooms: "Chambres réservées :",
      summaryUndefined: "Non définie",
      taxesIncluded: "Taxes et services hôteliers",
      includedLabel: "Inclus",
      totalAmountLabel: "Montant Total",
      perNight: "FCFA / nuit",
      conciergeShuttleBadge: "Conciergerie & Navette disponibles 24/7",
    },
    // Confirmation Page
    confirmation: {
      metaTitle: "Confirmation de Réservation | Hôtel Résidence Madadjeu",
      badge: "Réservation Confirmée",
      heading: "Nous avons hâte de vous accueillir",
      title: "Nous avons hâte de vous accueillir",
      subheading:
        "Votre réservation est confirmée. Vous pouvez télécharger dès maintenant votre reçu officiel au format PDF ci-dessous.",
      desc: "Votre réservation a été enregistrée avec succès. Vous pouvez télécharger votre reçu officiel au format PDF ci-dessous et le conserver pour votre arrivée.",
      referenceLabel: "Numéro de Référence",
      refNumber: "Numéro de Référence",
      printReceipt: "Imprimer",
      downloadReceipt: "Télécharger le reçu (PDF)",
      downloadingReceipt: "Génération du PDF...",
      emailSentNotice:
        "Le reçu officiel au format PDF et votre confirmation ont été envoyés à",
      paymentMethodLabel: "Mode de règlement",
      transactionIdLabel: "Réf. Transaction",
      summaryHeading: "Récapitulatif de votre séjour",
      summaryTitle: "Récapitulatif de votre séjour",
      guestLabel: "Client principal",
      mainGuest: "Client principal",
      contactLabel: "Email & Téléphone",
      emailPhone: "Email & Téléphone",
      accommodationLabel: "Hébergement",
      lodging: "Hébergement",
      datesLabel: "Dates du séjour",
      stayDates: "Dates du séjour",
      totalLabel: "Montant Total Réglé / Garanti",
      totalAmount: "Montant Total Réglé / Garanti",
      manageBookingBtn: "Gérer ma réservation",
      homeBtn: "Retour à l’accueil",
      backHomeBtn: "Retour à l’accueil",
    },
    // Manage Booking Page
    manageBooking: {
      metaTitle: "Gérer ma Réservation | Hôtel Résidence Madadjeu",
      metaDesc:
        "Consultez, modifiez ou vérifiez les détails de votre séjour à l’Hôtel Résidence Madadjeu en toute simplicité.",
      badge: "Espace Voyageur",
      heading: "Gérer Ma Réservation",
      subheading:
        "Accédez instantanément aux détails de votre séjour grâce à votre numéro de référence.",
      refLabel: "Numéro de Référence (ex: MDJ-84920)",
      refInputLabel: "Numéro de Référence (ex: MDJ-84920)",
      emailLabel: "Email Utilisé Lors de la Réservation",
      emailInputLabel: "Email Utilisé Lors de la Réservation",
      searchBtn: "Rechercher ma réservation",
      dossierLabel: "Référence de dossier",
      fileRef: "Référence de dossier",
      statusConfirmed: "Confirmée",
      confirmed: "Confirmée",
      statusCancelled: "Annulée",
      cancelled: "Annulée",
      stayInfoTitle: "Informations Séjour",
      guestInfoTitle: "Informations Voyageur & Règlement",
      roomLabel: "Chambre / Suite :",
      checkInLabel: "Date d’Arrivée :",
      checkOutLabel: "Date de Départ :",
      roomsCountLabel: "Nombre de chambres :",
      nameLabel: "Titulaire :",
      phoneLabel: "Téléphone :",
      totalStayLabel: "Total du Séjour :",
      specialRequestsLabel: "Vos demandes spéciales :",
      modifyRequestBtn: "Demande de modification",
      cancelConfirmPrompt:
        "Êtes-vous sûr de vouloir annuler cette réservation ?",
      cancelBookingBtn: "Annuler la réservation",
      guestLabel: "Nom du client :",
      datesLabel: "Dates :",
      durationLabel: "Durée :",
      roomsLabel: "Nombre de chambres :",
      totalLabel: "Total séjour :",
      cancelNotice:
        "Pour toute modification de dates ou demande spéciale, notre conciergerie est joignable 24h/24.",
      callConcierge: "Appeler la Conciergerie",
      printDetails: "Imprimer les détails",
    },
    // Rooms Page
    rooms: {
      metaTitle:
        "Chambres & Appartements de Prestige | Hôtel Résidence Madadjeu Yaoundé",
      metaDesc:
        "Découvrez nos appartements de prestige et chambres de grand confort face à la Garde Présidentielle à Yaoundé. Espaces généreux, sécurité totale et service majordome 24/7.",
      badge: "Hébergement & Résidence de Standing",
      heading: "Nos Appartements & Chambres",
      description:
        "Chaque espace a été minutieusement façonné pour offrir une expérience résidentielle feutrée. Une alliance parfaite entre architecture contemporaine, sécurité maximale et finitions d’ébénisterie artisanale.",
      inclusionsTitle: "Prestations Incluses Dans Tous Nos Logements",
      fiberTitle: "Fibre Optique Dédiée",
      fiberDesc:
        "Wi-Fi très haut débit sécurisé dans tous les appartements et chambres.",
      kitchenTitle: "Cuisine Entièrement Équipée",
      kitchenDesc:
        "Équipements de cuisine premium, cafetière et service en chambre 24/7.",
      securityTitle: "Sécurité Totale 24h/24",
      securityDesc:
        "Face à la Garde Présidentielle, gardiennage professionnel et caméras HD.",
      allCategories: "Toutes les catégories",
      apartmentsCat: "Appartements",
      roomsCat: "Chambres",
      filterCapacity: "Capacité :",
      allGuests: "Tous les voyageurs",
      twoPlusGuests: "2 personnes et plus",
      threePlusGuests: "3 personnes et plus",
      fourPlusGuests: "4 personnes (Familles)",
      noResultsTitle: "Aucun logement ne correspond à vos filtres",
      noResultsDesc: "Essayez de réinitialiser vos critères de recherche.",
      resetFilters: "Réinitialiser les filtres",
    },
    // Room Details Page (rooms/[id])
    roomDetails: {
      fromPrice: "À partir de",
      perNight: "FCFA / nuit",
      specsBadge: "Fiche Technique & Prestations",
      capacity: "Capacité :",
      area: "Superficie :",
      bed: "Literie :",
      view: "Vue :",
      viewDesc: "Vue dégagée sur le domaine résidentiel",
      includedAmenities: "Équipements & Services Inclus",
      bookingWidgetTitle: "Réserver cet hébergement",
      checkIn: "Arrivée",
      checkOut: "Départ",
      roomsCount: "Nombre de Chambres",
      servicesTax: "Services & TVA",
      totalEstimated: "Total estimé",
      continueBooking: "Continuer la réservation",
      secureGuarantee: "Réservation sécurisée et confirmation immédiate",
    },
    // Amenities Page
    amenities: {
      metaTitle:
        "Services & Prestations d’Exception | Hôtel Résidence Madadjeu Yaoundé",
      metaDesc:
        "Découvrez nos prestations exclusives à Yaoundé : Suites privées, Restaurant gastronomique, Salle de sport équipée, Location de voiture et Salles de réception.",
      badge: "Prestations & Services Hôteliers",
      heading: "Nos Services & Prestations",
      description:
        "Nous cultivons l’art de l’hospitalité avec discrétion et excellence face à la Garde Présidentielle. Chaque service a été pensé pour vous offrir confort, sérénité et liberté durant votre séjour.",
      services: [
        {
          id: "suites",
          icon: "king_bed",
          title: "Suites Privées",
          highlight: "Confort Résidentiel",
          description:
            "Chambres privées et spacieuses avec Wi-Fi haut débit, salle de bain privative entièrement équipée, téléviseur compatible avec le casting personnel, chaussons et peignoir pour un confort absolu.",
          ctaText: "Découvrir nos suites",
          ctaLink: "/rooms",
        },
        {
          id: "restaurant",
          icon: "restaurant",
          title: "Restaurant",
          highlight: "Art Culinaire & Saveurs",
          description:
            "Savourez un mélange de cuisine africaine et internationale aux saveurs authentiques, servie sur place ou directement dans votre chambre.",
          ctaText: "Room service & Table",
          ctaLink: "/contact",
        },
        {
          id: "fitness",
          icon: "fitness_center",
          title: "Salle de Sport",
          highlight: "Forme & Vitalité",
          description:
            "Une salle de sport bien équipée pour la musculation et l'entretien physique, ouverte à tous les clients souhaitant rester actifs durant leur séjour.",
          ctaText: "Accès Résidents",
          ctaLink: "/contact",
        },
        {
          id: "car-rental",
          icon: "directions_car",
          title: "Location de Voiture",
          highlight: "Mobilité & Déplacements",
          description:
            "Louez une voiture avec ou sans chauffeur privé pour des visites personnalisées de la ville et des déplacements pratiques.",
          ctaText: "Réserver un véhicule",
          ctaLink:
            "https://wa.me/237691890963?text=Bonjour,%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule%20avec%20ou%20sans%20chauffeur%20Madadjeu.",
        },
        {
          id: "event-halls",
          icon: "celebration",
          title: "Salles de Réception",
          highlight: "Événements & Célébrations",
          description:
            "Des salles polyvalentes pour vos fêtes, réunions et autres événements, adaptables à toute taille de rassemblement.",
          ctaText: "Demander un devis",
          ctaLink: "/contact",
        },
        {
          id: "spa",
          icon: "spa",
          title: "Massage & Spa",
          highlight: "Bien-être & Relaxation",
          description:
            "Des soins de massage relaxants pour vous aider à décompresser et à vous ressourcer pendant votre séjour.",
          ctaText: "Prendre rendez-vous",
          ctaLink: "/contact",
        },
      ],
      spaHighlight: "Bien-être & Relaxation",
      spaTitle: "Massages & Soins Relaxants",
      spaDesc:
        "Une carte complète de massages suédois et relaxants personnalisés, rituels corporels aux huiles précieuses dispensés en cabine privée ou en chambre.",
      fitnessHighlight: "Forme & Vitalité",
      fitnessTitle: "Gym & Salle de Fitness",
      fitnessDesc:
        "Espace d’entraînement complet avec tapis de course, vélos elliptiques, haltères et tapis d’étirements réservé exclusivement aux résidents.",
      diningHighlight: "Gastronomie & Rooftop",
      diningTitle: "Table d’Hôtes & Room Service 24/7",
      diningDesc:
        "Une cuisine gourmande célébrant les saveurs du terroir camerounais et les grands classiques internationaux, servie au restaurant, sur le rooftop ou en chambre.",
      conciergeHighlight: "Discrétion & Anticipation",
      conciergeTitle: "Conciergerie & Majordome 24/7",
      conciergeDesc:
        "De la réservation de vos déplacements diplomatiques à l’intendance privée de votre appartement, notre conciergerie anticipe le moindre de vos souhaits.",
      shuttleHighlight: "Mobilité & Sérénité",
      shuttleTitle: "Chauffeur & Navette Aéroport Nsimalen",
      shuttleDesc:
        "Véhicules premium climatisés avec chauffeurs expérimentés pour vos transferts vers l’aéroport de Yaoundé-Nsimalen et vos déplacements officiels.",
      businessHighlight: "Affaires & Confidentialité",
      businessTitle: "Salons Exécutifs & Visioconférence",
      businessDesc:
        "Espaces insonorisés sous haute sécurité, écrans 4K et connexion très haut débit sécurisée pour vos rendez-vous professionnels et réunions confidentielles.",
      bannerBadge: "Expérience Sur-Mesure",
      bannerTitle: "Un Majordome Dédié Pour Votre Séjour",
      bannerDesc:
        "Pour nos résidents des appartements de prestige, un maître d’hôtel particulier veille personnellement à l’intendance de votre séjour : déballage de bagages, repassage express, service de petit-déjeuner sur mesure et conciergerie personnalisée.",
      bannerBookBtn: "Réserver un appartement",
      bannerContactBtn: "Contacter la conciergerie",
    },
    // Location Page
    location: {
      metaTitle:
        "Localisation Géographique & Accès | Hôtel Résidence Madadjeu Yaoundé",
      metaDesc:
        "Localisation de l’Hôtel Résidence Madadjeu face à la Garde Présidentielle à Etoug-Ebe, Yaoundé. Carte interactive, temps de trajet et transferts aéroport.",
      badge: "Localisation Stratégique",
      title: "Emplacement d’Élite face à la Garde Présidentielle",
      subtitle:
        "Implanté dans le quartier paisible d’Etoug-Ebe, l’Hôtel Résidence Madadjeu bénéficie d’un environnement hautement sécurisé et d’une accessibilité idéale vers les centres d’affaires.",
      strategicPointsTitle: "Temps de Trajet & Points Stratégiques",
      transitTitle: "Points Stratégiques & Temps de Trajet",
      transitDesc:
        "Nous organisons vos transferts depuis et vers l’Aéroport International de Yaoundé-Nsimalen (NSI) en véhicules privés climatisés avec chauffeur professionnel.",
      transitPrompt:
        "Profitez d’un accueil VIP et de transferts sécurisés à toute heure du jour et de la nuit depuis et vers l’Aéroport de Yaoundé-Nsimalen ou vos rendez-vous officiels.",
      transferTitle: "Service Navette & Chauffeur Privé",
      transitCta: "Réserver un transfert privé",
      mapButton: "Ouvrir sur Google Maps",
      addressTitle: "Adresse & Contact",
      addressFull: "Face Garde Présidentielle, Etoug-Ebe, Yaoundé, Cameroun",
      landmarks: [
        {
          id: "garde",
          name: "Garde Présidentielle (Etoug-Ebe)",
          desc: "Directement en face de la Résidence. Environnement diplomatique ultra-sécurisé sous surveillance d’État permanente.",
          time: "1 min",
          icon: "security",
        },
        {
          id: "palais",
          name: "Palais des Congrès de Yaoundé",
          desc: "Sommets internationaux, grandes conférences ministérielles et réceptions d’État.",
          time: "8 min",
          icon: "domain",
        },
        {
          id: "centre",
          name: "Centre-Ville Administratif & Boulevard du 20 Mai",
          desc: "Ministères, banques d’affaires, institutions centrales et galeries marchandes.",
          time: "12 min",
          icon: "location_city",
        },
        {
          id: "bastos",
          name: "Quartier Bastos & Ambassades",
          desc: "Représentations diplomatiques, résidences consulaires, terrasses raffinées et tables gastronomiques.",
          time: "15 min",
          icon: "corporate_fare",
        },
        {
          id: "aeroport",
          name: "Aéroport International de Yaoundé-Nsimalen (NSI)",
          desc: "Liaisons aériennes internationales et vols intérieurs. Transferts privés Madadjeu avec chauffeur sur réservation.",
          time: "30 min",
          icon: "flight",
        },
      ],
    },
    // About Page
    about: {
      metaTitle: "Notre Histoire & Vision | Hôtel Résidence Madadjeu",
      metaDesc:
        "Découvrez l’âme et les fondements de l’Hôtel Résidence Madadjeu. Une hospitalité boutique guidée par la passion du détail et l’amour de la terre camerounaise.",
      badge: "Héritage & Vision",
      heading: "La Maison Madadjeu",
      description:
        "Née du désir profond de célébrer l’élégance hospitalière camerounaise, la Résidence Madadjeu incarne une vision contemporaine du luxe où le calme, la confidentialité et l’artisanat d’exception se rencontrent.",
      signatureBadge: "Une Signature Singulière",
      signatureTitle: "L’Éloge de la Discrétion et du Beau",
      signatureP1:
        "À rebours de l’hôtellerie standardisée, Madadjeu a été conçue comme une demeure de maître privée. Chaque recoin raconte une histoire : celle d’ébénistes locaux ayant façonné des essences de bois précieux, de tailleurs de pierre ayant assemblé des marbres purs, et de créateurs de lumière composant des ambiances enveloppantes.",
      signatureP2:
        "Que vous veniez pour des responsabilités diplomatiques, des négociations d’affaires de haut niveau ou une parenthèse de ressourcement, notre équipe dévouée vous garantit une discrétion absolue et un service sur-mesure.",
      val1Num: "01",
      val1Title: "Sérénité & Sécurité Souveraine",
      val1Desc:
        "Face à la Garde Présidentielle, profitez d’un calme d’exception sous surveillance continue, garantissant une tranquillité sans faille.",
      val2Num: "02",
      val2Title: "Artisanat & Matières Nobles",
      val2Desc:
        "Des essences de bois camerounais taillées à la main, des marbres précieux et un agencement soigné dans le moindre détail.",
      val3Num: "03",
      val3Title: "Majordome & Service Sur-Mesure",
      val3Desc:
        "Un accueil attentif, discret et disponible 24h/24 pour satisfaire vos exigences les plus précises.",
      ctaTitle: "Vivez l’expérience Madadjeu",
      ctaDesc:
        "Réservez votre séjour au cœur de l’élégance résidentielle à Yaoundé.",
      ctaButton: "Découvrir nos disponibilités",
    },
    // Contact Page
    contact: {
      metaTitle: "Contact & Conciergerie 24/7 | Hôtel Résidence Madadjeu",
      metaDesc:
        "Contactez la conciergerie de l’Hôtel Résidence Madadjeu. Réservations, devis séminaires, demandes diplomatiques et transferts aéroport.",
      badge: "Conciergerie & Relations Hôtes",
      heading: "À Votre Entière Disposition",
      description:
        "Que ce soit pour une réservation de séjour, l’organisation d’un événement privé ou une demande sur-mesure, notre équipe vous répond avec diligence et discrétion.",
      formHeading: "Envoyez-nous un Message",
      formTitle: "Envoyez-nous un Message",
      nameLabel: "Nom complet",
      namePlaceholder: "Votre nom et prénom",
      emailLabel: "Adresse email",
      emailPlaceholder: "votre.email@domaine.com",
      phoneLabel: "Numéro de téléphone",
      phonePlaceholder: "+237 6 XX XX XX XX",
      subjectLabel: "Objet de votre demande",
      subjectGeneral: "Renseignement général & Séjour",
      subjectRates: "Tarifs et disponibilités suites",
      subjectDiplomatic: "Accueil diplomatique / Long séjour",
      subjectEvent: "Événement privé ou professionnel",
      subjectTransfer: "Navette aéroport & Transport VIP",
      subjectEvents: "Événement Privé / Séminaire",
      subjectShuttle: "Transfert & Chauffeur Privé",
      subjectPartnership: "Partenariat d’Affaires",
      subjectOther: "Autre Demande",
      messageLabel: "Votre message détaillé",
      messagePlaceholder:
        "Précisez vos dates souhaitées, le nombre d’hôtes ou toute exigence particulière...",
      submitBtn: "Transmettre ma demande",
      sendBtn: "Transmettre ma demande",
      successBadge: "Message transmis avec succès",
      coordinatesTitle: "Coordonnées Directes",
      conciergeDirect: "Ligne directe Conciergerie",
      reservationsDirect: "Service Réservations",
      directPhoneTitle: "Ligne directe Conciergerie 24/7",
      directPhoneDesc:
        "Pour vos réservations urgentes et toute assistance immédiate :",
      chatWhatsapp: "Discuter sur WhatsApp",
      emailTitle: "Adresse Email Directe",
      emailDesc: "Pour vos demandes de devis institutionnels et partenariats :",
      addressTitle: "Adresse Géographique",
      addressText:
        "Face Garde Présidentielle, Quartier Etoug-Ebe, Yaoundé, Cameroun",
      viewMapLink: "Voir le plan d’accès détaillé",
      whatsappBtn: "Écrire sur WhatsApp",
      callBtn: "Appeler la réception",
    },
    // FAQ Page
    faq: {
      metaTitle: "Foire Aux Questions (FAQ) | Hôtel Résidence Madadjeu",
      metaDesc:
        "Toutes les réponses à vos questions concernant les réservations, l’arrivée, les services et la vie à l’Hôtel Résidence Madadjeu.",
      badge: "Centre d’Aide & Informations",
      heading: "Foire Aux Questions",
      description:
        "Retrouvez ci-dessous les réponses aux interrogations les plus fréquentes de nos hôtes pour préparer votre séjour en toute sérénité.",
      allTopics: "Toutes les rubriques",
      allCategories: "Toutes les rubriques",
      supportHeading: "Une demande spécifique ?",
      specificQueryTitle: "Une demande spécifique ?",
      supportDesc:
        "Notre service de conciergerie est à votre entière disposition 24h/24 pour répondre à toutes vos demandes sur-mesure.",
      specificQueryDesc:
        "Notre service de conciergerie est à votre entière disposition 24h/24 pour répondre à toutes vos demandes sur-mesure.",
      contactBtn: "Formulaire de contact",
      contactFormBtn: "Formulaire de contact",
      whatsappBtn: "WhatsApp Direct",
      whatsappDirectBtn: "WhatsApp Direct",
      items: [
        {
          id: 1,
          category: "Réservations & Annulations",
          question: "Quelles sont les conditions d’annulation ?",
          answer:
            "Toute annulation effectuée jusqu’à 48 heures avant l’arrivée prévue est entièrement gratuite. Pour les annulations tardives ou non-présentations, la première nuit sera facturée.",
        },
        {
          id: 2,
          category: "Arrivée & Départ",
          question: "Quelles sont les heures de Check-in et de Check-out ?",
          answer:
            "Le check-in s’effectue à partir de 14h00 et le check-out jusqu’à 12h00. Un service d’arrivée anticipée ou de départ tardif est disponible sur demande auprès de la conciergerie.",
        },
        {
          id: 3,
          category: "Services & Conciergerie",
          question: "Proposez-vous un service de navette aéroport / ville ?",
          answer:
            "Oui, nous mettons à disposition un service de navette privée avec chauffeur depuis l’aéroport international de Yaoundé-Nsimalen ou la gare ferroviaire sur réservation préalable.",
        },
        {
          id: 4,
          category: "Restauration & Petit-déjeuner",
          question: "Le petit-déjeuner est-il inclus dans le séjour ?",
          answer:
            "Un petit-déjeuner gastronomique sous forme de buffet raffiné et de carte à la commande est inclus pour nos Appartements de Prestige et Exécutifs, et disponible en supplément pour les Chambres.",
        },
        {
          id: 5,
          category: "Événements & Séminaires",
          question:
            "Disposez-vous de salles pour des événements privés ou réunions professionnelles ?",
          answer:
            "L’Hôtel Résidence Madadjeu dispose de salons privés équipés d’écrans haute définition et de solutions de visioconférence pour vos réunions jusqu’à 30 personnes.",
        },
      ],
    },
    // Gallery Page
    gallery: {
      metaTitle: "Galerie Photographique | Hôtel Résidence Madadjeu",
      metaDesc:
        "Explorez l’atmosphère feutrée, l’architecture d’exception et le cadre prestigieux de l’Hôtel Résidence Madadjeu.",
      badge: "Immersion Visuelle",
      heading: "L’Écrin Madadjeu en Images",
      description:
        "Découvrez à travers notre objectif l’harmonie des volumes, la noblesse des matériaux et la douceur des lumières qui subliment notre résidence.",
      allPhotos: "Toutes les photos",
      suitesCategory: "Suites & Chambres",
      suitesCat: "Suites & Chambres",
      architectureCategory: "Salons & Architecture",
      architectureCat: "Salons & Architecture",
      excursionsCategory: "Région & Découvertes",
      regionCat: "Région & Découvertes",
      closeLightbox: "Fermer la vue plein écran",
      prevPhoto: "Image précédente",
      nextPhoto: "Image suivante",
      photoOf: "sur",
      ofCount: "sur",
    },
    // Guided Tour Page
    tour: {
      metaTitle:
        "Visite Virtuelle & Espaces | Hôtel Résidence Madadjeu Yaoundé",
      metaDesc:
        "Parcourez la résidence Madadjeu : façade face à la Garde Présidentielle, suites de prestige, salons feutrés et rooftop avec vue.",
      badge: "Visite Guidée des Espaces",
      title: "L’Art de l’Hospitalité à Travers Nos Espaces",
      subtitle:
        "Chaque recoin de la Résidence Madadjeu a été pensé pour offrir une expérience feutrée, sécurisée et profondément attachée aux savoir-faire locaux.",
      viewPhotoBtn: "Agrandir la photo",
      viewPhoto: "Agrandir la photo",
      ctaExploreRooms: "Découvrir les Chambres",
      ctaBook: "Réserver Votre Séjour",
      ctaConcierge: "Contacter la Conciergerie",
      closeLightbox: "Fermer la vue plein écran",
      prevPhoto: "Image précédente",
      nextPhoto: "Image suivante",
      photoOf: "sur",
      locations: [
        {
          id: "facade",
          num: "01",
          tag: "Architecture & Cadre",
          title: "Façade Principale & Accès Sécurisé",
          description:
            "Idéalement érigée face à la Garde Présidentielle à Etoug-Ebe, l’architecture de la Résidence Madadjeu allie lignes contemporaines et surveillance d’État 24h/24.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
          highlights: [
            "Garde Présidentielle en face",
            "Accès sécurisé 24/7",
            "Parking privé clôturé",
          ],
        },
        {
          id: "suites",
          num: "02",
          tag: "Hébergement de Prestige",
          title: "Appartements Résidentiels & Chambres Raffinées",
          description:
            "Des volumes généreux, une insonorisation de pointe, des boiseries locales sur-mesure et une literie de grand hôtel pour un repos absolu.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1",
          highlights: [
            "Salons privatifs",
            "Fibre optique haut débit",
            "Smart TV 4K & Espace Café",
          ],
        },
        {
          id: "lounge",
          num: "03",
          tag: "Salons & Art de Vivre",
          title: "Lounge Exécutif & Espaces Diplomatiques",
          description:
            "Un cadre feutré conçu pour vos entretiens d’affaires, signatures d’accords et moments de lecture au calme.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-",
          highlights: [
            "Confidentialité préservée",
            "Bar à cocktails & cafés d’origine",
            "Service majordome",
          ],
        },
        {
          id: "rooftop",
          num: "04",
          tag: "Terrasse & Gastronomie",
          title: "Rooftop Panoramique & Table Gourmande",
          description:
            "Une vue imprenable sur les collines de Yaoundé pour savourer une cuisine raffinée associant saveurs du terroir camerounais et gastronomie mondiale.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eI6d4BvFff1_1jR1JcW0fMhN0lK4-B83_19k0g8e91uG1c62qKx4yUu3k5v4jL6b8e8f8_2z3g-4h5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2",
          highlights: [
            "Coucher de soleil sur Yaoundé",
            "Carte de vins & spiritueux",
            "Dîners privés sur réservation",
          ],
        },
      ],
    },
    // Footer
    footer: {
      tagline:
        "Élégance feutrée et confort résidentiel de prestige au cœur de Yaoundé face à la Garde Présidentielle.",
      bookOnline: "Réserver en Ligne",
      contactUs: "Nous Contacter",
      addressTitle: "Adresse & Contact",
      navigation: "Plan du Site",
      privacyPolicy: "Politique de Confidentialité",
      termsOfService: "Conditions Générales de Vente",
      copyright: "© 2026 Hôtel Résidence Madadjeu. Tous droits réservés.",
    },
    // Concierge
    concierge: {
      title: "Conciergerie Madadjeu",
      available: "Disponible 24/7",
      prompt:
        "Comment notre équipe peut-elle rendre votre séjour inoubliable à Yaoundé ?",
      whatsapp: "Discuter sur WhatsApp",
      call: "Appeler la Réception (+237 691 89 09 63)",
      specialRequest: "Envoyer une demande spéciale",
      faq: "Foire aux Questions",
    },
  },

  en: {
    // Navigation & Drawer
    nav: {
      home: "Home",
      menu: "Menu",
      close: "Close",
      rooms: "Rooms & Apartments",
      amenities: "Services",
      location: "Location & Travel",
      takeTour: "Guided Tour",
      about: "Our Story",
      contact: "Contact & Concierge",
      manageBooking: "Manage Booking",
      bookNow: "Book Now",
      bookStay: "Book Your Stay",
      discoverRooms: "Discover Rooms",
      language: "Language",
      addressTitle: "Address & Location",
      address: "Opposite Presidential Guard, Etoug-Ebe, Yaounde, Cameroon",
      phone: "+237 6 91 89 09 63",
      conciergeService: "24/7 Concierge",
      followUs: "Follow Us",
    },
    // Hero Section
    hero: {
      locationTag: "YAOUNDE • CAMEROON",
      initialTitle: "MADADJEU HOTEL & RESIDENCE",
      initialSubtitle: "PRESTIGE APARTMENTS & ROOMS • EXCLUSIVE COMFORT",
      locationPill: "Rue Naomi Eto · Opposite the Presidential Guard",
      showcaseTitle: "Hospitality & Residential Excellence",
      showcaseSubtitle: "Ideal for your pleasure",
      ctaRooms: "Explore Rooms",
      scrollDiscover: "Discover",
    },
    // Sub-Hero Section "An Invitation To Unwind"
    invitation: {
      badge: "Residential Experience",
      title: "An Invitation To Unwind",
      description:
        "Ideally situated opposite the Presidential Guard in Etoug-Ebe, Yaounde, Hotel Residence Madadjeu redefines upscale hospitality. Combining prestigious apartments, absolute tranquility, modern luxury amenities, and 24/7 private concierge service, indulge in a serene residential retreat in the heart of the capital.",
      ctaRooms: "View Rooms",
      ctaTour: "Tour the Residence",
      imageAlt:
        "Sophisticated interior of a luxury apartment at Hotel Residence Madadjeu Yaounde",
    },
    // Pillars
    pillars: {
      massageTitle: "Massages & Relaxation",
      massageDesc: "Personalized massage rituals to soothe body and mind.",
      diningTitle: "Haute Gastronomy",
      diningDesc:
        "Delectable cuisine blending local Cameroonian flavors with international cuisine.",
      conciergeTitle: "24/7 Concierge",
      conciergeDesc:
        "Attentive, discreet butler and concierge service tailored to your every wish.",
      fitnessTitle: "Fitness Center",
      fitnessDesc:
        "Modern workout facility equipped with state-of-the-art cardio and strength gear.",
    },
    // "What Sets Us Apart" Full-Width Carousel
    distinction: {
      badge: "Excellence & Distinction",
      title: "What Sets Us Apart",
      subtitle:
        "A unique hospitality signature designed for discerning global travelers and residents",
      exploreBtn: "Explore the Property",
      bookBtn: "Book Your Stay",
      slides: [
        {
          id: "security",
          num: "01",
          tag: "Security & Strategic Location",
          title: "Prime Location & Supreme Peace of Mind",
          description:
            "Directly positioned opposite the Presidential Guard in Etoug-Ebe, Madadjeu offers unrivaled safety, serenity, and 24/7 monitored state security.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
          link: "/location",
        },
        {
          id: "apartments",
          num: "02",
          tag: "Prestigious Apartments & Suites",
          title: "Refined, Contemporary Living Spaces",
          description:
            "Spacious apartments and modern rooms featuring bespoke woodwork, acoustic isolation, premium hotel bedding, and smart technology.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1",
          link: "/rooms",
        },
        {
          id: "service",
          num: "03",
          tag: "Dedicated Butler & 24/7 Concierge",
          title: "Bespoke Assistance Around the Clock",
          description:
            "VIP airport meet-and-greets, private chauffeurs, in-room dining, and discreet concierge support anticipating every detail.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-",
          link: "/amenities",
        },
        {
          id: "rooftop",
          num: "04",
          tag: "Rooftop & Fine Dining",
          title: "Panoramic Capital Views & Gourmet Dining",
          description:
            "Savor gourmet delicacies and signature cocktails on our rooftop terrace overlooking the hills of Yaounde for memorable evenings.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eI6d4BvFff1_1jR1JcW0fMhN0lK4-B83_19k0g8e91uG1c62qKx4yUu3k5v4jL6b8e8f8_2z3g-4h5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2",
          link: "/amenities",
        },
      ],
    },
    // Home Rooms Showcase
    showcase: {
      badge: "Residential Selection",
      heading: "Our Prestigious Accommodations",
      description:
        "Exceptional rooms and fully equipped apartments with private living rooms, contemporary kitchens, and open vistas across Yaounde.",
      exploreAll: "Explore All Rooms",
      from: "From",
      perNight: "FCFA / night",
      details: "Details & Photos",
      book: "Book Now",
      upTo: "Up to",
      guests: "guests",
    },
    // Prime Geographical Location — Neighborhood Carousel (100vw)
    neighborhoods: {
      badge: "Strategic Location",
      title: "In the Heart of Yaounde & Its Iconic Districts",
      subtitle:
        "An elite address in Etoug-Ebe, combining serenity directly facing the Presidential Guard with seamless access to the capital’s central hubs.",
      interactiveMapCta: "View interactive map & all travel routes",
      slides: [
        {
          id: "garde",
          name: "Presidential Guard (Etoug-Ebe)",
          description:
            "Located in immediate proximity to the Residence, the Presidential Guard district offers serene tranquility and 24/7 top-tier state security.",
          distance: "200 m",
          driveTime: "1 min",
          walkTime: "2 min",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
        },
        {
          id: "palais",
          name: "Yaounde Conference Center",
          description:
            "Prestigious venue for international diplomatic summits, state banquets, and major cultural galas set upon a lush hill.",
          distance: "4.2 km",
          driveTime: "8 min",
          walkTime: "35 min",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-",
        },
        {
          id: "centre",
          name: "Administrative Center & Boulevard du 20 Mai",
          description:
            "The political and business center of Cameroon’s capital: key ministries, central banks, corporate headquarters, and commercial centers.",
          distance: "5.5 km",
          driveTime: "12 min",
          walkTime: "45 min",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1",
        },
        {
          id: "bastos",
          name: "Bastos & Diplomatic Enclave",
          description:
            "Prestigious residential district home to embassies, high commissions, art galleries, sophisticated terraces, and fine dining.",
          distance: "6.8 km",
          driveTime: "15 min",
          walkTime: "55 min",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD2wAnr00WSMLfS4u4kwD_Z_X_uI1TMmL8C99ulDfVWorQ3wZ8Jtx038hBtlJZFMCH52zAxeHuJGHeZXYirO7WqpxkYWsyvL-gd4ZtA1fvGUnNERVv--ziiHJ1croF5YKCIRh5OozEQYWxm_XmiIJMnKPz0jdVrN2AtTv4B9xzi0yB2N-r4FP-38NnlnBi6HTsz3eHCT_SblG_ROAwtcgBaDwD6D9_o5I1XUo3_23B6Z2m5PqdM6tsL",
        },
        {
          id: "aeroport",
          name: "Yaounde-Nsimalen International Airport (NSI)",
          description:
            "Yaounde’s primary international air hub with direct Madadjeu private chauffeur transfers and VIP shuttles available.",
          distance: "24 km",
          driveTime: "30 min",
          walkTime: "N/A",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
        },
      ],
    },
    // Testimonials
    testimonials: {
      badge: "Verified Guest Reviews",
      title: "Don’t Just Take Our Word For It!",
      subtitle:
        "Authentic testimonials from our diplomatic, business, and residential guests.",
      sourceLabel: "Verified stay",
      reviews: [
        {
          id: 1,
          author: "Marc-Antoine de V.",
          origin: "Paris, France",
          platform: "TripAdvisor",
          stayType: "Diplomatic Mission",
          date: "August 2026",
          title: "Phenomenal Hotel & Absolute Peace of Mind",
          quote:
            "The location directly facing the Presidential Guard provides unrivaled security. The apartments are spacious, impeccably clean, and the concierge handled every detail with utmost discretion.",
        },
        {
          id: 2,
          author: "Dr. Aminata Kébé",
          origin: "Dakar, Senegal",
          platform: "Booking.com",
          stayType: "Executive Business Stay",
          date: "July 2026",
          title: "Immaculate Living & Magical Rooftop Sunset",
          quote:
            "A haven matching the standards of top international boutique residences. The dedicated fiber Wi-Fi is blazing fast for work, and the rooftop dinner at twilight is simply magical.",
        },
        {
          id: 3,
          author: "David & Sarah Jenkins",
          origin: "London, United Kingdom",
          platform: "Google Maps",
          stayType: "Private Holiday Stay",
          date: "August 2026",
          title: "Warm Sanctuary with Truly Bespoke Hospitality",
          quote:
            "We spent two unforgettable weeks. The staff is wonderfully attentive, the bedding is exceedingly comfortable, and the private chauffeur airport transfer made travel completely effortless.",
        },
        {
          id: 4,
          author: "Jean-Christophe M.",
          origin: "Geneva, Switzerland",
          platform: "Trip.com",
          stayType: "Corporate Trip",
          date: "June 2026",
          title: "The Premier Confidential Address in Yaounde",
          quote:
            "The perfect balance between residential independence and luxury hotel amenities. The quiet soundproof meeting suites made our business discussions in Cameroon seamless.",
        },
      ],
    },
    // Multi-Step Reservation Page
    reserve: {
      metaTitle: "Direct Online Booking | Hotel Residence Madadjeu",
      metaDesc:
        "Book your stay directly at Hotel Residence Madadjeu opposite the Presidential Guard in Yaounde. Best rate guaranteed with instant confirmation.",
      tag: "Secure Direct Booking",
      heading: "Book Your Stay",
      subheading:
        "A tailored welcome awaits you at Hotel Residence Madadjeu in Yaounde.",
      step1Title: "Dates & Room",
      step2Title: "Guest Details",
      step3Title: "Payment & Confirm",
      step1Heading: "1. Select your accommodation, dates & number of rooms",
      step2Heading: "2. Primary Guest Information",
      step3Heading: "3. Payment method & validation",
      selectRoomLabel: "Select Accommodation",
      checkInLabel: "Check-In Date",
      checkOutLabel: "Check-Out Date",
      roomsCountLabel: "Number of Rooms",
      roomOptionSingle: "Room",
      roomOptionPlural: "Rooms",
      nextStepDetails: "Next Step: Guest Details",
      nextStepPayment: "Next Step: Payment",
      prevStep: "Back",
      fullNameLabel: "Full Name *",
      fullNamePlaceholder: "e.g. Paul-Alain Kamga",
      emailLabel: "Email Address *",
      emailPlaceholder: "paul@example.com",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "+237 6 XX XX XX XX",
      specialRequestsLabel:
        "Special Requests or Estimated Arrival Time (Optional)",
      specialRequestsPlaceholder:
        "Late check-in, baby cot, Nsimalen airport transfer, floor preference...",
      paymentTitle: "Select your payment method",
      payOnlineTitle: "Secure Online Payment (CinetPay)",
      payOnlineDesc: "MTN MoMo, Orange Money, Visa & Mastercard.",
      cinetpaySecurityBadge: "256-bit SSL Secure Payment",
      cinetpayModalOpen:
        "CinetPay checkout window is open. Please complete your transaction in the popup.",
      cinetpayVerifying: "Verifying your transaction status with CinetPay...",
      cinetpayPopupNotice:
        'Click "Pay now" to open the secure CinetPay payment window directly on this page.',
      payNowBtn: "Pay now",
      payHotelTitle: "Pay upon arrival at the hotel",
      payHotelDesc:
        "Payment by credit card, cash, or Mobile Money during check-in.",
      payHotelNotice:
        "No immediate charge. Your booking is guaranteed and you will settle the bill at reception upon arrival.",
      payMtnTitle: "MTN Mobile Money",
      payMtnDesc: "Direct and secure debit from your MTN Mobile Money account.",
      payOrangeTitle: "Orange Money",
      payOrangeDesc:
        "Direct and secure debit from your Orange Money Cameroon account.",
      payCardTitle: "Credit Card (Visa / Mastercard)",
      payCardDesc: "Secured via 256-bit SSL encrypted payment gateway.",
      momoPhoneLabel: "Mobile Money Phone Number",
      momoPhonePlaceholder: "6 XX XX XX XX or 2376XXXXXXXX",
      momoSendBtn: "Send Payment Request",
      momoSending: "Sending request...",
      momoPendingInstruction:
        "Check your phone and enter your secret code to confirm the transfer of",
      momoWaitingApproval: "Waiting for your mobile validation...",
      momoTimeoutWarning:
        "Waiting time exceeded (2 min). The transfer was not confirmed.",
      momoRetryBtn: "Retry Payment",
      cardHolderLabel: "Cardholder Name",
      cardHolderPlaceholder: "e.g. Paul-Alain Kamga",
      cardNumberLabel: "Card Number",
      cardNumberPlaceholder: "•••• •••• •••• ••••",
      cardExpiryLabel: "Expiry Date",
      cardExpiryPlaceholder: "MM/YY",
      cardCvcLabel: "CVC / CVV",
      cardCvcPlaceholder: "123",
      cardPayBtn: "Pay",
      cardProcessing: "Processing card payment...",
      paymentSuccess: "Payment successful!",
      paymentFailed:
        "Payment failed. Please check your details or try another payment method.",
      switchPaymentMethod: "Change payment method",
      termsNotice:
        "By confirming this booking, you agree to our terms and conditions and our free cancellation policy up to 48 hours before arrival.",
      confirmSubmit: "Confirm Booking",
      summaryTitle: "Booking Summary",
      summaryCheckIn: "Check-In:",
      summaryCheckOut: "Check-Out:",
      summaryDuration: "Length of stay:",
      summaryRooms: "Reserved rooms:",
      summaryUndefined: "Not defined",
      taxesIncluded: "Taxes & Hotel Service Fees",
      includedLabel: "Included",
      totalAmountLabel: "Total Amount",
      perNight: "FCFA / night",
      conciergeShuttleBadge: "24/7 Concierge & Shuttle Service Available",
    },
    // Confirmation Page
    confirmation: {
      metaTitle: "Booking Confirmation | Hotel Residence Madadjeu",
      badge: "Reservation Confirmed",
      heading: "We Look Forward to Welcoming You",
      title: "We Look Forward to Welcoming You",
      subheading:
        "Your reservation is confirmed. You can now download your official PDF receipt below.",
      desc: "Your reservation has been successfully confirmed. You can download your official PDF receipt below and present it upon arrival.",
      referenceLabel: "Booking Reference Number",
      refNumber: "Booking Reference Number",
      printReceipt: "Print",
      downloadReceipt: "Download Receipt (PDF)",
      downloadingReceipt: "Generating PDF...",
      emailSentNotice:
        "Your official PDF receipt and stay confirmation have been sent to",
      paymentMethodLabel: "Payment Method",
      transactionIdLabel: "Transaction Ref",
      summaryHeading: "Summary of Your Stay",
      summaryTitle: "Summary of Your Stay",
      guestLabel: "Primary Guest",
      mainGuest: "Primary Guest",
      contactLabel: "Email & Phone",
      emailPhone: "Email & Phone",
      accommodationLabel: "Accommodation",
      lodging: "Accommodation",
      datesLabel: "Stay Dates",
      stayDates: "Stay Dates",
      totalLabel: "Total Amount Paid / Guaranteed",
      totalAmount: "Total Amount Paid / Guaranteed",
      manageBookingBtn: "Manage My Booking",
      homeBtn: "Return to Homepage",
      backHomeBtn: "Return to Homepage",
    },
    // Manage Booking Page
    manageBooking: {
      metaTitle: "Manage My Booking | Hotel Residence Madadjeu",
      metaDesc:
        "Easily view, check, or verify your reservation details at Hotel Residence Madadjeu in Yaounde.",
      badge: "Guest Portal",
      heading: "Manage My Booking",
      subheading:
        "Instantly view your stay details using your booking reference number and email.",
      refLabel: "Booking Reference (e.g., MDJ-84920)",
      refInputLabel: "Booking Reference (e.g., MDJ-84920)",
      emailLabel: "Email Used for Booking",
      emailInputLabel: "Email Used for Booking",
      searchBtn: "Find My Booking",
      dossierLabel: "Booking File Reference",
      fileRef: "Booking File Reference",
      statusConfirmed: "Confirmed",
      confirmed: "Confirmed",
      statusCancelled: "Cancelled",
      cancelled: "Cancelled",
      stayInfoTitle: "Stay Information",
      guestInfoTitle: "Guest & Payment Information",
      roomLabel: "Room / Suite:",
      checkInLabel: "Check-in Date:",
      checkOutLabel: "Check-out Date:",
      roomsCountLabel: "Number of Rooms:",
      nameLabel: "Full Name:",
      phoneLabel: "Phone Number:",
      totalStayLabel: "Total Stay Amount:",
      specialRequestsLabel: "Your Special Requests:",
      modifyRequestBtn: "Request Modification",
      cancelConfirmPrompt: "Are you sure you want to cancel this booking?",
      cancelBookingBtn: "Cancel Reservation",
      guestLabel: "Guest Name:",
      datesLabel: "Dates:",
      durationLabel: "Duration:",
      roomsLabel: "Number of Rooms:",
      totalLabel: "Total Amount:",
      cancelNotice:
        "For date modifications or special inquiries, our concierge desk is available 24/7.",
      callConcierge: "Call Concierge",
      printDetails: "Print Details",
    },
    // Rooms Page
    rooms: {
      metaTitle:
        "Prestigious Rooms & Apartments | Hotel Residence Madadjeu Yaounde",
      metaDesc:
        "Discover prestigious apartments and comfortable rooms opposite the Presidential Guard in Yaounde. Generous spaces, total security, and 24/7 butler service.",
      badge: "Accommodations & Residential Living",
      heading: "Our Apartments & Rooms",
      description:
        "Every space has been thoughtfully curated to deliver a serene residential sanctuary. An exquisite blend of contemporary architecture, utmost security, and artisanal craftsmanship.",
      inclusionsTitle: "Key Amenities Included in All Accommodations",
      fiberTitle: "Dedicated Fiber Internet",
      fiberDesc:
        "High-speed secured Wi-Fi throughout all rooms and apartments.",
      kitchenTitle: "Fully Equipped Kitchen",
      kitchenDesc:
        "Premium kitchen appliances, coffee station, and 24/7 in-room dining.",
      securityTitle: "24/7 Total Security",
      securityDesc:
        "Opposite the Presidential Guard, professional guard security and HD monitoring.",
      allCategories: "All Categories",
      apartmentsCat: "Apartments",
      roomsCat: "Rooms",
      filterCapacity: "Capacity:",
      allGuests: "All Guests",
      twoPlusGuests: "2+ Guests",
      threePlusGuests: "3+ Guests",
      fourPlusGuests: "4 Guests (Family)",
      noResultsTitle: "No accommodations match your filter criteria",
      noResultsDesc: "Try resetting your search filters.",
      resetFilters: "Reset Filters",
    },
    // Room Details Page (rooms/[id])
    roomDetails: {
      fromPrice: "From",
      perNight: "FCFA / night",
      specsBadge: "Technical Specs & Inclusions",
      capacity: "Capacity:",
      area: "Area:",
      bed: "Bedding:",
      view: "View:",
      viewDesc: "Open view over the residential grounds",
      includedAmenities: "Included Amenities & Services",
      bookingWidgetTitle: "Book this Accommodation",
      checkIn: "Check-in",
      checkOut: "Check-out",
      roomsCount: "Number of Rooms",
      servicesTax: "Hotel services & taxes",
      totalEstimated: "Estimated Total",
      continueBooking: "Continue Reservation",
      secureGuarantee: "Direct booking • Best rate guaranteed",
    },
    // Amenities Page
    amenities: {
      metaTitle:
        "Services & Boutique Hotel Amenities | Hotel Residence Madadjeu Yaounde",
      metaDesc:
        "Discover high-end services in Yaounde: Private suites, Restaurant dining, Fitness center, Car rental, and Versatile event halls.",
      badge: "Boutique Amenities & Services",
      heading: "Our Services & Amenities",
      description:
        "We cultivate the art of hospitality with discretion and excellence opposite the Presidential Guard. Every service has been designed to provide absolute comfort, tranquility, and convenience during your stay.",
      services: [
        {
          id: "suites",
          icon: "king_bed",
          title: "Private Suites",
          highlight: "Residential Comfort",
          description:
            "Spacious private rooms with high-speed Wi-Fi, a fully equipped en-suite bathroom, a TV with personal casting support, and plush slippers and a bathrobe for total comfort.",
          ctaText: "Discover Suites",
          ctaLink: "/rooms",
        },
        {
          id: "restaurant",
          icon: "restaurant",
          title: "Restaurant",
          highlight: "Culinary Art & Dining",
          description:
            "Enjoy a blend of African and international cuisine crafted with rich, authentic flavors, available in-house or delivered straight to your room.",
          ctaText: "In-Room Dining",
          ctaLink: "/contact",
        },
        {
          id: "fitness",
          icon: "fitness_center",
          title: "Fitness Center",
          highlight: "Fitness & Vitality",
          description:
            "A well-equipped gym for strength training and everyday fitness, open to all guests looking to stay active during their stay.",
          ctaText: "Resident Access",
          ctaLink: "/contact",
        },
        {
          id: "car-rental",
          icon: "directions_car",
          title: "Car Rental",
          highlight: "Mobility & City Travel",
          description:
            "Rent a car with or without a private driver for personalized city tours and convenient travel around town.",
          ctaText: "Book a Car",
          ctaLink:
            "https://wa.me/237691890963?text=Hello,%20I%20would%20like%20to%20inquire%20about%20car%20rental%20with%20or%20without%20driver%20at%20Madadjeu.",
        },
        {
          id: "event-halls",
          icon: "celebration",
          title: "Event Halls",
          highlight: "Events & Gatherings",
          description:
            "Versatile halls for parties, meetings, and other gatherings, adaptable to fit events of any size.",
          ctaText: "Request a Quote",
          ctaLink: "/contact",
        },
        {
          id: "spa",
          icon: "spa",
          title: "Massage & Spa",
          highlight: "Wellness & Relaxation",
          description:
            "Relaxing massage treatments designed to help you unwind and recharge during your stay.",
          ctaText: "Book a Treatment",
          ctaLink: "/contact",
        },
      ],
      spaHighlight: "In-Room Wellness",
      spaTitle: "Relaxation & Spa Rituals",
      spaDesc:
        "Enjoy soothing body treatments and bespoke massages provided directly in the privacy of your suite by licensed wellness practitioners.",
      fitnessHighlight: "Private Fitness",
      fitnessTitle: "Cardio & Strength Training",
      fitnessDesc:
        "Top-of-the-line cardio equipment, free weights, and dedicated yoga spaces to maintain your fitness routine in complete discretion.",
      diningHighlight: "Gourmet Dining",
      diningTitle: "Panels of Flavors & Room Service",
      diningDesc:
        "Contemporary gastronomic menu celebrating local Cameroonian heritage and international classics, available for 24/7 in-room dining.",
      conciergeHighlight: "Diplomatic Standard",
      conciergeTitle: "24/7 Dedicated Concierge Desk",
      conciergeDesc:
        "Secretarial support, VIP airport protocol, restaurant bookings, and private city tours handled with precision and discretion.",
      shuttleHighlight: "Executive Transport",
      shuttleTitle: "Airport Transfers & Private Chauffeur",
      shuttleDesc:
        "Secure private vehicle fleet with professional drivers for your transfers to Yaounde-Nsimalen International Airport (NSI) and city hubs.",
      businessHighlight: "Business & Privacy",
      businessTitle: "Executive Lounges & Conferencing",
      businessDesc:
        "Soundproofed secure lounges, 4K displays, and high-speed encrypted Wi-Fi for diplomatic meetings and business negotiations.",
      bannerBadge: "Tailored Experience",
      bannerTitle: "A Dedicated Butler For Your Stay",
      bannerDesc:
        "For our prestige apartment residents, a dedicated private butler oversees every aspect of your stay: unpacking, express pressing, custom breakfast, and personal concierge requests.",
      bannerBookBtn: "Book an Apartment",
      bannerContactBtn: "Contact Concierge",
    },
    // Location Page
    location: {
      metaTitle:
        "Geographic Location & Access | Hotel Residence Madadjeu Yaounde",
      metaDesc:
        "Location of Hotel Residence Madadjeu opposite the Presidential Guard in Etoug-Ebe, Yaounde. Interactive map, travel times, and airport transfers.",
      badge: "Strategic Location",
      title: "Elite Address Opposite the Presidential Guard",
      subtitle:
        "Nestled in the peaceful Etoug-Ebe district, Hotel Residence Madadjeu enjoys a highly secure environment and prime accessibility to business centers.",
      strategicPointsTitle: "Travel Times & Strategic Landmarks",
      transitTitle: "Strategic Landmarks & Travel Times",
      transitDesc:
        "We organize your transfers to and from Yaounde-Nsimalen International Airport (NSI) in air-conditioned executive vehicles with licensed private drivers.",
      transitPrompt:
        "Enjoy VIP meet-and-greets and secured transfers 24/7 to and from Yaounde-Nsimalen Airport or your official meetings across the capital.",
      transferTitle: "VIP Airport Shuttle & Private Chauffeur",
      transitCta: "Book Private Transfer",
      mapButton: "Open in Google Maps",
      addressTitle: "Address & Contact",
      addressFull: "Opposite Presidential Guard, Etoug-Ebe, Yaounde, Cameroon",
      landmarks: [
        {
          id: "garde",
          name: "Presidential Guard (Etoug-Ebe)",
          desc: "Directly facing the Residence. Ultra-secure diplomatic district under permanent state monitoring.",
          time: "1 min",
          icon: "security",
        },
        {
          id: "palais",
          name: "Yaounde Conference Center",
          desc: "International diplomatic summits, ministerial conferences, and state receptions.",
          time: "8 min",
          icon: "domain",
        },
        {
          id: "centre",
          name: "Administrative Center & Boulevard du 20 Mai",
          desc: "Government ministries, commercial banks, executive headquarters, and shopping galleries.",
          time: "12 min",
          icon: "location_city",
        },
        {
          id: "bastos",
          name: "Bastos & Diplomatic Enclave",
          desc: "Foreign embassies, ambassadorial residences, fine dining, and upscale terraces.",
          time: "15 min",
          icon: "corporate_fare",
        },
        {
          id: "aeroport",
          name: "Yaounde-Nsimalen International Airport (NSI)",
          desc: "International routes and domestic flights. Madadjeu private chauffeur transfers available upon reservation.",
          time: "30 min",
          icon: "flight",
        },
      ],
    },
    // About Page
    about: {
      metaTitle: "Our Story & Vision | Hotel Residence Madadjeu",
      metaDesc:
        "Discover the heart and heritage of Hotel Residence Madadjeu. Boutique hospitality guided by a passion for detail and love for Cameroonian hospitality.",
      badge: "Heritage & Vision",
      heading: "The House of Madadjeu",
      description:
        "Born from a deep desire to celebrate Cameroonian hospitality elegance, Residence Madadjeu embodies a contemporary vision of luxury where tranquility, privacy, and artisanal craftsmanship unite.",
      signatureBadge: "A Singular Signature",
      signatureTitle: "An Homage to Discretion and Beauty",
      signatureP1:
        "In contrast to standardized chain hotels, Madadjeu was conceived as an exclusive private manor. Every corner tells a story: local woodworkers carving precious woods, stonemasons assembling pure marble, and lighting designers crafting welcoming atmospheres.",
      signatureP2:
        "Whether you arrive for diplomatic engagements, high-level business negotiations, or a personal wellness getaway, our dedicated team guarantees complete privacy and bespoke service.",
      val1Num: "01",
      val1Title: "Sovereign Serenity & Security",
      val1Desc:
        "Directly facing the Presidential Guard, enjoy supreme calm under constant state protection for uninterrupted peace of mind.",
      val2Num: "02",
      val2Title: "Artisanship & Noble Materials",
      val2Desc:
        "Hand-carved Cameroonian woods, pure marbles, and bespoke interior finishes crafted with meticulous attention to detail.",
      val3Num: "03",
      val3Title: "Butler & Tailored Service",
      val3Desc:
        "Attentive, discreet, 24/7 guest service ready to accommodate your most exacting requirements.",
      ctaHeading: "Experience Madadjeu",
      ctaTitle: "Experience Madadjeu",
      ctaDesc:
        "Book your stay in the heart of residential elegance in Yaounde.",
      ctaBtn: "Book Now",
      ctaButton: "Check Availability",
    },
    // Contact Page
    contact: {
      metaTitle: "Contact & 24/7 Concierge | Hotel Residence Madadjeu",
      metaDesc:
        "Contact the concierge team at Hotel Residence Madadjeu. Reservations, conference quotes, diplomatic hosting, and airport transfers.",
      badge: "Concierge & Guest Relations",
      heading: "At Your Entire Disposal",
      description:
        "Whether you are planning a stay, organizing a private event, or have a bespoke request, our team will respond with diligence and discretion.",
      formHeading: "Send us a message",
      formTitle: "Send us a Message",
      nameLabel: "Full Name",
      namePlaceholder: "Your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@domain.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+237 6 XX XX XX XX",
      subjectLabel: "Subject of your inquiry",
      subjectGeneral: "General Inquiry & Stay",
      subjectRates: "Suite Rates & Availability",
      subjectDiplomatic: "Diplomatic Hosting / Extended Stay",
      subjectEvent: "Private Event or Meeting",
      subjectTransfer: "Airport Shuttle & VIP Transport",
      subjectEvents: "Private Event / Seminar",
      subjectShuttle: "Airport Shuttle & Private Chauffeur",
      subjectPartnership: "Corporate Partnerships",
      subjectOther: "Other Inquiry",
      messageLabel: "Detailed Message",
      messagePlaceholder:
        "Please specify your preferred dates, number of guests, or special requirements...",
      submitBtn: "Submit Inquiry",
      sendBtn: "Send Message",
      successBadge: "Message sent successfully",
      coordinatesTitle: "Direct Coordinates",
      conciergeDirect: "Concierge Direct Line",
      reservationsDirect: "Reservations Desk",
      directPhoneTitle: "Direct Line 24/7",
      directPhoneDesc:
        "For urgent reservations and immediate concierge assistance:",
      chatWhatsapp: "Chat on WhatsApp",
      emailTitle: "Email Address",
      emailDesc: "For quotes, institutional partnerships, and group inquiries:",
      addressTitle: "Physical Address",
      addressText: "Opposite Presidential Guard, Etoug-Ebe, Yaounde, Cameroon",
      viewMapLink: "View detailed access map",
      whatsappBtn: "Message on WhatsApp",
      callBtn: "Call Reception",
    },
    // FAQ Page
    faq: {
      metaTitle: "Frequently Asked Questions (FAQ) | Hotel Residence Madadjeu",
      metaDesc:
        "All answers to your questions regarding reservations, check-in, amenities, and residential living at Hotel Residence Madadjeu.",
      badge: "Help Center & Information",
      heading: "Frequently Asked Questions",
      description:
        "Find answers below to the most frequent inquiries from our guests to prepare your stay with absolute peace of mind.",
      allTopics: "All topics",
      allCategories: "All topics",
      supportHeading: "Have a specific request?",
      specificQueryTitle: "Have a specific request?",
      supportDesc:
        "Our concierge desk is available 24/7 to attend to all your custom requests.",
      specificQueryDesc:
        "Our concierge desk is available 24/7 to attend to all your custom requests.",
      contactBtn: "Contact Form",
      contactFormBtn: "Contact Form",
      whatsappBtn: "Direct WhatsApp",
      whatsappDirectBtn: "Direct WhatsApp",
      items: [
        {
          id: 1,
          category: "Reservations & Cancellations",
          question: "What are your cancellation policies?",
          answer:
            "Cancellations made up to 48 hours prior to scheduled arrival are completely free of charge. For late cancellations or no-shows, the first night rate will be charged.",
        },
        {
          id: 2,
          category: "Check-in & Check-out",
          question: "What are the check-in and check-out times?",
          answer:
            "Check-in begins from 2:00 PM and check-out is until 12:00 PM. Early check-in or late check-out is available upon request with our concierge.",
        },
        {
          id: 3,
          category: "Services & Concierge",
          question: "Do you offer an airport or city shuttle service?",
          answer:
            "Yes, we provide private chauffeur shuttle services from Yaounde-Nsimalen International Airport or the railway station upon prior booking.",
        },
        {
          id: 4,
          category: "Dining & Breakfast",
          question: "Is breakfast included in the stay?",
          answer:
            "A gourmet breakfast featuring a refined buffet and à la carte selection is included with our Prestige and Executive Apartments, and available as an option for Guest Rooms.",
        },
        {
          id: 5,
          category: "Events & Meetings",
          question:
            "Do you have venues for private events or business meetings?",
          answer:
            "Hotel Residence Madadjeu features private salon suites equipped with high-definition displays and video conferencing solutions for meetings up to 30 attendees.",
        },
      ],
    },
    // Gallery Page
    gallery: {
      metaTitle: "Photo Gallery | Hotel Residence Madadjeu",
      metaDesc:
        "Explore the serene ambiance, exceptional architecture, and prestigious setting of Hotel Residence Madadjeu.",
      badge: "Visual Immersion",
      heading: "Madadjeu in Pictures",
      description:
        "Discover through our lens the harmonious spaces, noble materials, and soft lighting that grace our residence.",
      allPhotos: "All Photos",
      suitesCategory: "Suites & Rooms",
      suitesCat: "Suites & Rooms",
      architectureCategory: "Lounges & Architecture",
      architectureCat: "Lounges & Architecture",
      excursionsCategory: "Region & Discoveries",
      regionCat: "Region & Discoveries",
      closeLightbox: "Close Fullscreen View",
      prevPhoto: "Previous Image",
      nextPhoto: "Next Image",
      photoOf: "of",
      ofCount: "of",
    },
    // Guided Tour Page
    tour: {
      metaTitle: "Guided Property Tour | Hotel Residence Madadjeu Yaounde",
      metaDesc:
        "Explore the ambiance, luxury rooms, rooftop, and concierge of Hotel Residence Madadjeu opposite the Presidential Guard in Yaounde.",
      badge: "Virtual Tour & Immersion",
      title: "Explore Our Exceptional Property",
      subtitle:
        "Journey through the signature spaces of Hotel Residence Madadjeu. Every space has been crafted to blend privacy, residential comfort, and noble artisanal finishes.",
      viewPhotoBtn: "Enlarge Photo",
      viewPhoto: "Enlarge Photo",
      ctaExploreRooms: "Discover Rooms",
      ctaBook: "Book Your Stay",
      ctaConcierge: "Contact Concierge",
      closeLightbox: "Close Tour",
      prevPhoto: "Previous Location",
      nextPhoto: "Next Location",
      photoOf: "of",
      locations: [
        {
          id: "facade",
          num: "01",
          tag: "Architecture & Location",
          title: "Main Facade & Strategic Security",
          description:
            "Ideally situated opposite the Presidential Guard in Etoug-Ebe, Madadjeu’s architecture combines contemporary lines with 24/7 state security.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t",
          highlights: [
            "Opposite Presidential Guard",
            "24/7 Secured Access",
            "Enclosed Private Parking",
          ],
        },
        {
          id: "suites",
          num: "02",
          tag: "Prestigious Accommodations",
          title: "Residential Apartments & Refined Rooms",
          description:
            "Generous dimensions, state-of-the-art soundproofing, custom local woodwork, and grand hotel bedding for absolute rest.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBBGPsJh3GmBgTdqbmMJ1RSGU5jUS2thrqklnqctH-6CwyCH4jIzUqhfMNCF1mPbVKuyE4x8pL5R5L13_0pmWa34qfz-85J_Srsv_tUq6zURhhsvNZhPbaayWF0WesF2JUReQJdrYZ0xRoyNGCHGY_6MSjBaKxHrqyWcZYxnF2ESOsWAOkmXLH61Y2tGynskpfCMXITsgKYWaFAyIxUfJ0XfQPf0RADhrseRt9ebBeEy4M-MxZL_TM1",
          highlights: [
            "Private living rooms",
            "Dedicated high-speed fiber",
            "Smart 4K TV & Coffee Bar",
          ],
        },
        {
          id: "lounge",
          num: "03",
          tag: "Lounges & Art of Living",
          title: "Executive Lounge & Diplomatic Spaces",
          description:
            "A discreet ambiance designed for business meetings, diplomatic signings, and peaceful reading.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-",
          highlights: [
            "Preserved privacy",
            "Cocktail bar & specialty coffee",
            "Butler service",
          ],
        },
        {
          id: "rooftop",
          num: "04",
          tag: "Terrace & Gastronomy",
          title: "Panoramic Rooftop & Gourmet Table",
          description:
            "Breathtaking views of Yaounde’s hills to enjoy refined dining pairing Cameroonian ingredients with world gastronomy.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2eI6d4BvFff1_1jR1JcW0fMhN0lK4-B83_19k0g8e91uG1c62qKx4yUu3k5v4jL6b8e8f8_2z3g-4h5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2",
          highlights: [
            "Sunset views of Yaounde",
            "Curated wine list",
            "Private dining upon reservation",
          ],
        },
      ],
    },
    // Footer
    footer: {
      tagline:
        "Refined elegance and prestigious residential comfort in the heart of Yaounde opposite the Presidential Guard.",
      bookOnline: "Book Online",
      contactUs: "Contact Us",
      addressTitle: "Address & Contact",
      navigation: "Site Map",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      copyright: "© 2026 Hôtel Résidence Madadjeu. All rights reserved.",
    },
    // Concierge
    concierge: {
      title: "Madadjeu Concierge",
      available: "Available 24/7",
      prompt: "How may our team make your stay unforgettable in Yaounde today?",
      whatsapp: "Chat on WhatsApp",
      call: "Call Front Desk (+237)",
      specialRequest: "Send Special Request",
      faq: "Frequently Asked Questions",
    },
  },
};

export type TranslationSchema = typeof translations.fr;

// Internal reactive state manager with persistence
class I18nManager {
  locale = $state<Locale>("fr");

  constructor() {
    if (browser) {
      // 1. Check URL param ?lang=fr | ?lang=en
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang === "fr" || urlLang === "en") {
        this.setLocale(urlLang);
        return;
      }

      // 2. Check localStorage
      const saved = localStorage.getItem("madadjeu_lang") as Locale | null;
      if (saved === "fr" || saved === "en") {
        this.locale = saved;
        document.documentElement.lang = saved;
      }
    }
  }

  setLocale(newLocale: Locale) {
    this.locale = newLocale;
    if (browser) {
      localStorage.setItem("madadjeu_lang", newLocale);
      document.documentElement.lang = newLocale;
    }
  }

  toggleLocale() {
    this.setLocale(this.locale === "fr" ? "en" : "fr");
  }

  get t(): TranslationSchema {
    return translations[this.locale];
  }
}

export const i18n = new I18nManager();
