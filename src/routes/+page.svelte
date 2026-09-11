<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  import RoomCard from '$lib/components/RoomCard.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';
  import { introManager } from '$lib/introState.svelte';

  let { data }: { data: PageData } = $props();

  // Full-width "What Sets Us Apart" Carousel State
  let activeApartIndex = $state(0);
  const apartSlides = $derived(i18n.t.distinction.slides);

  function nextApartSlide() {
    activeApartIndex = (activeApartIndex + 1) % apartSlides.length;
  }

  function prevApartSlide() {
    activeApartIndex = (activeApartIndex - 1 + apartSlides.length) % apartSlides.length;
  }

  // Wallace-Style Peeking Neighborhood Strategic Location Carousel State (5s Autoplay + Manual Reset)
  let activeNeighborhoodIndex = $state(0);
  const neighborhoodSlides = $derived(i18n.t.neighborhoods.slides);
  let prevNeighborhoodIndex = $derived((activeNeighborhoodIndex - 1 + neighborhoodSlides.length) % neighborhoodSlides.length);
  let nextNeighborhoodIndex = $derived((activeNeighborhoodIndex + 1) % neighborhoodSlides.length);
  let neighborhoodAutoplayTimer: any;

  function startNeighborhoodAutoplay() {
    stopNeighborhoodAutoplay();
    neighborhoodAutoplayTimer = setInterval(() => {
      activeNeighborhoodIndex = (activeNeighborhoodIndex + 1) % neighborhoodSlides.length;
    }, 5000);
  }

  function stopNeighborhoodAutoplay() {
    if (neighborhoodAutoplayTimer) {
      clearInterval(neighborhoodAutoplayTimer);
      neighborhoodAutoplayTimer = null;
    }
  }

  function nextNeighborhoodSlide() {
    activeNeighborhoodIndex = (activeNeighborhoodIndex + 1) % neighborhoodSlides.length;
    startNeighborhoodAutoplay();
  }

  function prevNeighborhoodSlide() {
    activeNeighborhoodIndex = (activeNeighborhoodIndex - 1 + neighborhoodSlides.length) % neighborhoodSlides.length;
    startNeighborhoodAutoplay();
  }

  function setNeighborhoodIndex(idx: number) {
    activeNeighborhoodIndex = idx;
    startNeighborhoodAutoplay();
  }

  // Testimonials Carousel State (Manual Only — No Autoplay)
  let activeReviewIndex = $state(0);
  const reviews = $derived(i18n.t.testimonials.reviews);

  function nextReview() {
    activeReviewIndex = (activeReviewIndex + 1) % reviews.length;
  }

  function prevReview() {
    activeReviewIndex = (activeReviewIndex - 1 + reviews.length) % reviews.length;
  }

  function setReviewIndex(idx: number) {
    activeReviewIndex = idx;
  }

  // Mobile Swipe Gesture Handlers for "What Sets Us Apart"
  let apartTouchStartX = 0;
  let apartTouchEndX = 0;
  function handleApartTouchStart(e: TouchEvent) {
    apartTouchStartX = e.changedTouches[0].screenX;
  }
  function handleApartTouchEnd(e: TouchEvent) {
    apartTouchEndX = e.changedTouches[0].screenX;
    if (apartTouchStartX - apartTouchEndX > 45) {
      nextApartSlide();
    } else if (apartTouchEndX - apartTouchStartX > 45) {
      prevApartSlide();
    }
  }

  // Mobile Swipe Gesture Handlers for "Strategic Location"
  let neighTouchStartX = 0;
  let neighTouchEndX = 0;
  function handleNeighTouchStart(e: TouchEvent) {
    neighTouchStartX = e.changedTouches[0].screenX;
  }
  function handleNeighTouchEnd(e: TouchEvent) {
    neighTouchEndX = e.changedTouches[0].screenX;
    if (neighTouchStartX - neighTouchEndX > 45) {
      nextNeighborhoodSlide();
    } else if (neighTouchEndX - neighTouchStartX > 45) {
      prevNeighborhoodSlide();
    }
  }

  onMount(() => {
    introManager.init();
    startNeighborhoodAutoplay();
  });

  onDestroy(() => {
    stopNeighborhoodAutoplay();
  });

  const homeTitle = $derived(
    i18n.locale === 'fr'
      ? "Hôtel Résidence Madadjeu | L'élégance résidentielle à Yaoundé"
      : "Hotel Residence Madadjeu | Luxury Residential Hotel in Yaounde"
  );

  const homeDesc = $derived(
    i18n.locale === 'fr'
      ? "Découvrez l'Hôtel Résidence Madadjeu à Yaoundé, face à la Garde Présidentielle. Appartements haut de gamme, restaurant panoramique, rooftop et conciergerie 24/7."
      : "Experience Hotel Residence Madadjeu in Yaounde, opposite the Presidential Guard. Luxury apartments, rooftop restaurant, panoramic views, and 24/7 concierge."
  );

  const hotelSchema = $derived({
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Hôtel Résidence Madadjeu",
    "alternateName": "Résidence Madadjeu Yaoundé",
    "description": homeDesc,
    "url": "https://residence-madadjeu.com",
    "logo": "https://residence-madadjeu.com/images/madadjeu-logo.png",
    "image": "https://residence-madadjeu.com/images/og-image.jpg",
    "telephone": "+237691234567",
    "email": "madadjeuhotel2026@gmail.com",
    "priceRange": "50 000 - 350 000 XAF",
    "currenciesAccepted": "XAF",
    "paymentAccepted": "Cash, Credit Card, Mobile Money (MTN MoMo, Orange Money)",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Face Garde Présidentielle, Quartier Etoug-Ebe",
      "addressLocality": "Yaoundé",
      "addressRegion": "Centre",
      "addressCountry": "CM"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 3.848,
      "longitude": 11.488
    },
    "checkinTime": "14:00",
    "checkoutTime": "12:00",
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Free High-Speed Wi-Fi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "24/7 Security & Concierge", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Restaurant & Room Service", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Fitness Center", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Private Chauffeur & Airport Shuttle", "value": true }
    ]
  });
</script>

<SEO title={homeTitle} description={homeDesc} jsonLd={hotelSchema} />

<div class="flex flex-col w-full -mt-20 overflow-x-hidden">
  
  <!-- ================= 1. HERO SECTION ================= -->
  <section class="relative w-full h-[100dvh] min-h-[640px] flex items-center justify-center overflow-hidden">
    
    <!-- Cinematic Background with Luxury Vignette -->
    <div class="absolute inset-0 z-0 bg-deep-charcoal">
      <div
        class="absolute inset-0 bg-cover bg-center opacity-100 scale-105 transform origin-center transition-transform duration-[20s] ease-out hover:scale-100"
        style="background-image: url('/images/Hero-Image.jpg')"
      ></div>
      <div class="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(20,17,15,0.30)_0%,rgba(20,17,15,0.45)_45%,rgba(20,17,15,0.75)_100%)] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(26,26,26,0.18)_100%)]"></div>
    </div>

    <!-- ================= ANIMATED HERO-TO-NAVBAR DOCKING LOGO ================= -->
    {#if introManager.state !== 'docked'}
      <div
        class="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center justify-center transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform {introManager.state === 'centered'
          ? 'top-1/2 -translate-y-1/2 scale-125'
          : 'top-[2.5rem] -translate-y-1/2 scale-100'}"
      >
        <div class="p-2 drop-shadow-2xl">
          <img
            src="/images/madadjeu-logo.png"
            alt=""
            width="1899"
            height="412"
            class="site-logo site-logo--float"
          />
        </div>
      </div>
    {/if}

    <!-- ================= INITIAL CENTERED BRANDING TEXT (Slides Out) ================= -->
    <div
      class="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform {introManager.state === 'centered'
        ? 'opacity-100 translate-y-24 scale-100'
        : 'opacity-0 -translate-y-12 scale-95 pointer-events-none'}"
    >
      <div class="inline-flex items-center gap-3 mb-3">
        <span class="w-8 sm:w-10 h-[1px] bg-deep-maroon/70"></span>
        <span class="font-label-caps text-warm-taupe tracking-[0.28em] text-[10px] sm:text-[11px]">
          {i18n.t.hero.locationTag}
        </span>
        <span class="w-8 sm:w-10 h-[1px] bg-deep-maroon/70"></span>
      </div>

      <h1 class="font-display-lg text-soft-cream uppercase mb-3 max-w-4xl mx-auto leading-[1.15] tracking-wider drop-shadow-2xl text-xl sm:text-2xl md:text-3xl">
        {i18n.t.hero.initialTitle}
      </h1>

      <p class="font-label-caps text-[9px] sm:text-[10px] text-warm-taupe/90 max-w-2xl mx-auto tracking-[0.24em] uppercase font-medium">
        {i18n.t.hero.initialSubtitle}
      </p>
    </div>

    <!-- ================= REVEALED HERO CONTENT ================= -->
    <div
      class="relative z-10 max-w-[1280px] w-full px-4 md:px-8 lg:px-16 text-center pt-20 sm:pt-28 flex flex-col items-center justify-center transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] transform {introManager.state === 'docked'
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 translate-y-16 scale-95 pointer-events-none'}"
    >
      <!-- Headline, tagline and CTA centred as a single block -->
      <div class="hero-text-block">
        <!-- Main Headline -->
        <h1 class="hero-title font-display-lg text-soft-cream mb-3 leading-[1.14] drop-shadow-2xl uppercase">
          {i18n.t.hero.showcaseTitle}
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle font-headline text-soft-cream/90 mb-7 font-light italic">
          {i18n.t.hero.showcaseSubtitle}
        </p>

        <!-- Centered Action Button inside Luxury Double-Bordered Rectangular Frame -->
        <a
          href="/rooms"
          class="btn-luxury-primary text-xs py-2.5 px-6 sm:px-8"
        >
          <span>{i18n.t.hero.ctaRooms}</span>
          <span class="material-symbols-outlined text-xs">arrow_forward</span>
        </a>
      </div>
    </div>

    <!-- Scroll Down Indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-soft-cream/60 pointer-events-none">
      <span class="font-label-caps text-[9px] tracking-[0.25em] uppercase text-soft-cream/50">
        {i18n.t.hero.scrollDiscover}
      </span>
      <div class="w-[1px] h-9 bg-soft-cream/20 relative overflow-hidden rounded-full">
        <div class="absolute top-0 left-0 w-full h-full bg-muted-gold animate-[scrollDown_2s_ease-in-out_infinite]"></div>
      </div>
    </div>
  </section>

  <!-- ================= 2. SUB-HERO SECTION: "AN INVITATION TO UNWIND" ================= -->
  <section class="w-full bg-surface dark:bg-neutral-950 py-16 md:py-24 lg:py-28 relative overflow-hidden border-b border-outline-variant/25 dark:border-neutral-800">
    <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        <!-- Left Column: Headline, Tailored Description & CTA (Order 2 on mobile, Order 1 on desktop) -->
        <div class="lg:col-span-6 order-2 lg:order-1 flex flex-col items-start gap-4 sm:gap-6">
          <div class="flex items-center gap-3">
            <span class="w-8 h-[1.5px] bg-muted-gold"></span>
            <span class="font-label-caps text-muted-gold tracking-[0.25em] text-[10px] sm:text-[11px] uppercase font-semibold">
              {i18n.t.invitation.badge}
            </span>
          </div>

          <h2 class="font-display-lg text-deep-charcoal dark:text-neutral-100 leading-tight">
            {i18n.t.invitation.title}
          </h2>

          <p class="font-body-md text-xs sm:text-sm lg:text-base text-on-surface-variant dark:text-neutral-300 leading-relaxed">
            {i18n.t.invitation.description}
          </p>

          <div class="pt-2 sm:pt-4">
            <a
              href="/rooms"
              class="btn-luxury-dark text-xs py-2.5 px-6 sm:px-7"
            >
              <span>{i18n.t.invitation.ctaRooms}</span>
              <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
          </div>
        </div>

        <!-- Right Column: Portrait Feature Image with Overlapping Background Offset Frame Line (Order 1 on mobile, Order 2 on desktop) -->
        <div class="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end">
          <div class="relative w-full max-w-[420px] lg:max-w-[460px]">
            <!-- Overlapping Background Offset Frame Line Behind Image -->
            <div class="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-full h-full border-2 border-muted-gold/70 dark:border-muted-gold-dark/70 z-0 pointer-events-none"></div>
            
            <!-- Main Portrait Feature Image -->
            <div class="relative z-10 aspect-[4/5] overflow-hidden shadow-2xl bg-deep-charcoal dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 group">
              <img
                src="/images/room-picture.png"
                alt={i18n.t.invitation.imageAlt}
                class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/40 dark:from-neutral-950/60 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- ================= 3. QUICK PILLARS SECTION ================= -->
  <section class="w-full bg-soft-cream dark:bg-neutral-900 py-10 md:py-14 border-b border-outline-variant/20 dark:border-neutral-800 relative z-20">
    <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 lg:divide-x divide-outline-variant/30 dark:divide-neutral-800">
        <!-- Pillar 1: Massages -->
        <div class="flex flex-col items-center gap-2 pt-3 sm:pt-0 px-2">
          <span class="material-symbols-outlined text-[28px] text-muted-gold dark:text-muted-gold-dark">spa</span>
          <h3 class="font-headline text-base sm:text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.pillars.massageTitle}</h3>
          <p class="font-body-md text-xs text-on-surface-variant dark:text-neutral-400 max-w-[220px] leading-relaxed">
            {i18n.t.pillars.massageDesc}
          </p>
        </div>

        <!-- Pillar 2: Gastronomie -->
        <div class="flex flex-col items-center gap-2 pt-5 sm:pt-0 px-2">
          <span class="material-symbols-outlined text-[28px] text-muted-gold dark:text-muted-gold-dark">restaurant</span>
          <h3 class="font-headline text-base sm:text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.pillars.diningTitle}</h3>
          <p class="font-body-md text-xs text-on-surface-variant dark:text-neutral-400 max-w-[220px] leading-relaxed">
            {i18n.t.pillars.diningDesc}
          </p>
        </div>

        <!-- Pillar 3: Conciergerie 24/7 -->
        <div class="flex flex-col items-center gap-2 pt-5 sm:pt-0 px-2">
          <span class="material-symbols-outlined text-[28px] text-muted-gold dark:text-muted-gold-dark">room_service</span>
          <h3 class="font-headline text-base sm:text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.pillars.conciergeTitle}</h3>
          <p class="font-body-md text-xs text-on-surface-variant dark:text-neutral-400 max-w-[220px] leading-relaxed">
            {i18n.t.pillars.conciergeDesc}
          </p>
        </div>

        <!-- Pillar 4: Gym & Fitness -->
        <div class="flex flex-col items-center gap-2 pt-5 sm:pt-0 px-2">
          <span class="material-symbols-outlined text-[28px] text-muted-gold dark:text-muted-gold-dark">fitness_center</span>
          <h3 class="font-headline text-base sm:text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.pillars.fitnessTitle}</h3>
          <p class="font-body-md text-xs text-on-surface-variant dark:text-neutral-400 max-w-[220px] leading-relaxed">
            {i18n.t.pillars.fitnessDesc}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= 4. FULL-WIDTH CAROUSEL: "WHAT SETS US APART" (100vw) ================= -->
  <section class="relative w-screen left-1/2 -translate-x-1/2 bg-deep-charcoal text-soft-cream py-16 md:py-24 overflow-hidden">
    <!-- Header Title Overlay -->
    <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16 text-center mb-10 relative z-20">
      <span class="font-label-caps text-muted-gold tracking-[0.25em] text-[10px] uppercase block mb-2">
        {i18n.t.distinction.badge}
      </span>
      <h2 class="font-display-lg text-soft-cream mb-3">
        {i18n.t.distinction.title}
      </h2>
      <p class="font-headline text-sm sm:text-base text-soft-cream/80 max-w-xl mx-auto font-light italic">
        {i18n.t.distinction.subtitle}
      </p>
    </div>

    <!-- Active Slide Visual & Content Showcase (Full width swipe on mobile, unboxed chevrons on desktop) -->
    {#if apartSlides[activeApartIndex]}
      {@const slide = apartSlides[activeApartIndex]}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="relative w-full h-[480px] sm:h-[520px] md:h-[560px] flex items-center justify-center overflow-hidden touch-pan-y"
        ontouchstart={handleApartTouchStart}
        ontouchend={handleApartTouchEnd}
      >
        <!-- 100vw Background Image with Vignette -->
        <div
          class="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style="background-image: url('{slide.imageUrl}')"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-deep-charcoal/70 to-deep-charcoal/40"></div>
        <div class="absolute inset-0 bg-black/40"></div>

        <!-- Centered Overlay Editorial Content -->
        <div class="relative z-10 max-w-2xl mx-auto px-6 sm:px-10 text-center flex flex-col items-center gap-4 animate-fade-in">
          <!-- Slide Number & Category Tag -->
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 border border-white/20">
            <span class="font-mono text-muted-gold dark:text-muted-gold-dark text-[11px] font-bold">{slide.num}</span>
            <span class="text-white/30 text-xs">•</span>
            <span class="font-label-caps text-[10px] text-soft-cream uppercase tracking-widest">{slide.tag}</span>
          </div>

          <!-- Slide Main Title -->
          <h3 class="font-display-lg text-soft-cream text-lg sm:text-2xl md:text-3xl leading-snug drop-shadow-2xl">
            {slide.title}
          </h3>

          <!-- Slide Description -->
          <p class="font-body-md text-soft-cream/90 text-xs sm:text-sm leading-relaxed max-w-lg">
            {slide.description}
          </p>

          <!-- Slide Action Links in Luxury Double-Bordered Frames -->
          <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
            <a
              href={slide.link}
              class="btn-luxury-primary text-xs py-2 px-5"
            >
              <span>{i18n.t.distinction.exploreBtn}</span>
              <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
            <a
              href="/reserver"
              class="btn-luxury-secondary text-xs py-2 px-5"
            >
              {i18n.t.distinction.bookBtn}
            </a>
          </div>
        </div>

        <!-- Plain Unboxed Left Navigation Arrow (<) - Desktop/Tablet Only, hidden on mobile -->
        <button
          onclick={prevApartSlide}
          type="button"
          class="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 text-soft-cream/70 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-2 focus:outline-none items-center justify-center shrink-0"
          aria-label="Previous Slide"
        >
          <span class="material-symbols-outlined text-3xl lg:text-4xl">chevron_left</span>
        </button>

        <!-- Plain Unboxed Right Navigation Arrow (>) - Desktop/Tablet Only, hidden on mobile -->
        <button
          onclick={nextApartSlide}
          type="button"
          class="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 text-soft-cream/70 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-2 focus:outline-none items-center justify-center shrink-0"
          aria-label="Next Slide"
        >
          <span class="material-symbols-outlined text-3xl lg:text-4xl">chevron_right</span>
        </button>
      </div>

      <!-- Slide Indicator Badges at Bottom of Carousel -->
      <div class="flex items-center justify-center gap-3 mt-6 z-20 relative">
        {#each apartSlides as s, i}
          <button
            onclick={() => (activeApartIndex = i)}
            type="button"
            class="h-1.5 transition-all duration-300 cursor-pointer {activeApartIndex === i ? 'w-8 bg-muted-gold dark:bg-muted-gold-dark' : 'w-2.5 bg-white/30 hover:bg-white/60'}"
            aria-label="Go to slide {i + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ================= 5. ROOMS & APARTMENTS SHOWCASE ================= -->
  <section class="w-full bg-surface dark:bg-neutral-950 py-16 md:py-24">
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      
      <!-- Section Editorial Intro -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div class="max-w-2xl">
          <div class="flex items-center gap-3 mb-2">
            <span class="w-6 h-[1.5px] bg-muted-gold"></span>
            <span class="font-label-caps text-muted-gold tracking-widest text-[10px] uppercase font-semibold">{i18n.t.showcase.badge}</span>
          </div>
          <h2 class="font-display-lg text-deep-charcoal dark:text-neutral-100 leading-tight">
            {i18n.t.showcase.heading}
          </h2>
          <p class="font-body-md text-xs sm:text-sm text-on-surface-variant dark:text-neutral-400 mt-2 leading-relaxed">
            {i18n.t.showcase.description}
          </p>
        </div>

        <a
          href="/rooms"
          class="btn-luxury-outline text-xs self-start md:self-auto shrink-0 py-2.5 px-5"
        >
          <span>{i18n.t.showcase.exploreAll}</span>
          <span class="material-symbols-outlined text-xs">arrow_forward</span>
        </a>
      </div>

      <!-- Responsive Grid Layout: Expands to full container width (3-Column Layout) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
        {#each data.rooms as room}
          <RoomCard {room} showPrice={false} />
        {/each}
      </div>
    </div>
  </section>

  <!-- ================= 6. PRIME GEOGRAPHICAL LOCATION — WALLACE-STYLE PEEKING CAROUSEL ================= -->
  <section class="relative w-full bg-neutral-950 text-soft-cream py-16 md:py-24 overflow-hidden border-t border-outline-variant/30">
    <!-- Header Title Overlay -->
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 md:mb-12 relative z-20">
      <span class="font-label-caps text-muted-gold tracking-[0.25em] text-[10px] uppercase block mb-2 font-semibold">
        {i18n.t.neighborhoods.badge}
      </span>
      <h2 class="font-display-lg text-soft-cream mb-3">
        {i18n.t.neighborhoods.title}
      </h2>
      <p class="font-headline text-xs sm:text-sm md:text-base text-soft-cream/80 max-w-2xl mx-auto font-light italic leading-relaxed">
        {i18n.t.neighborhoods.subtitle}
      </p>
    </div>

    <!-- 3-Image Peeking Carousel Track (Wallace Hotel Style on Desktop, Full-Width Swipe on Mobile) -->
    {#if neighborhoodSlides.length > 0}
      {@const activeSlide = neighborhoodSlides[activeNeighborhoodIndex]}
      {@const prevSlide = neighborhoodSlides[prevNeighborhoodIndex]}
      {@const nextSlide = neighborhoodSlides[nextNeighborhoodIndex]}

      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="relative w-full flex items-center justify-center overflow-hidden py-4 select-none touch-pan-y"
        ontouchstart={handleNeighTouchStart}
        ontouchend={handleNeighTouchEnd}
      >
        <div class="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-[1720px] px-0 md:px-4">
          
          <!-- 1. LEFT PEEK SLIDE (Desktop only, hidden on mobile) -->
          <button
            type="button"
            onclick={prevNeighborhoodSlide}
            class="hidden md:block relative overflow-hidden shrink-0 cursor-pointer transition-all duration-500 ease-out group
                   w-[14vw] md:w-[16vw] lg:w-[18vw]
                   h-[320px] md:h-[380px] lg:h-[430px]
                   opacity-55 hover:opacity-85 filter brightness-75 hover:brightness-100 shadow-xl border border-white/5"
            aria-label="Slide précédente : {prevSlide.name}"
          >
            <img
              src={prevSlide.imageUrl}
              alt={prevSlide.name}
              class="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-deep-charcoal/40 group-hover:bg-deep-charcoal/15 transition-colors"></div>
          </button>

          <!-- PLAIN LEFT CHEVRON ICON (< in gap, Desktop only, hidden on mobile) -->
          <button
            type="button"
            onclick={prevNeighborhoodSlide}
            class="hidden md:flex text-soft-cream/70 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-1 sm:p-2 -mx-1 sm:-mx-2 z-30 focus:outline-none items-center justify-center shrink-0"
            aria-label="Previous Location"
          >
            <span class="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl">chevron_left</span>
          </button>

          <!-- 2. CENTER ACTIVE SLIDE (Full width on mobile, hero crop on desktop) -->
          <div
            class="relative overflow-hidden shrink-0 z-20 transition-all duration-500 ease-out
                   w-full md:w-[60vw] lg:w-[56vw] max-w-[960px]
                   h-[420px] sm:h-[480px] md:h-[540px] lg:h-[590px]
                   shadow-2xl bg-deep-charcoal border border-white/10"
          >
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.name}
              class="w-full h-full object-cover object-center transition-transform duration-1000 scale-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"></div>

            <!-- ANIMATING BOTTOM-CENTER WHITE LUXURY TEXT BOX (Slide Up + Fade In) -->
            {#key activeNeighborhoodIndex}
              <div
                class="absolute bottom-0 left-1/2 w-[92%] sm:w-[86%] md:w-[82%] max-w-[650px]
                       bg-white dark:bg-neutral-900 text-deep-charcoal dark:text-neutral-100 p-5 sm:p-7 md:p-8 shadow-2xl border-t border-x border-neutral-200/60 dark:border-neutral-800
                       text-center animate-slide-up-box z-30 pointer-events-auto"
              >
                <!-- Badge / Category Label -->
                <span class="font-label-caps text-muted-gold tracking-[0.25em] text-[9px] sm:text-[10px] uppercase font-bold block mb-1.5">
                  {i18n.t.neighborhoods.badge}
                </span>

                <!-- Neighborhood Name -->
                <h3 class="font-headline text-lg sm:text-2xl md:text-3xl text-deep-charcoal dark:text-neutral-100 font-semibold leading-snug mb-2">
                  {activeSlide.name}
                </h3>

                <!-- Short Description -->
                <p class="font-body-md text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4 max-w-lg mx-auto">
                  {activeSlide.description}
                </p>

                <!-- Drive Time and Walk Time (Distance removed) -->
                <div class="pt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center gap-3 sm:gap-6 flex-wrap font-mono text-[10px] sm:text-[11px] text-deep-charcoal/80 dark:text-neutral-300 uppercase tracking-wider">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-xs text-muted-gold dark:text-muted-gold-dark">directions_car</span>
                    <span>{i18n.locale === 'fr' ? 'Voiture :' : 'Drive:'} <strong class="text-deep-charcoal dark:text-neutral-100 font-bold">{activeSlide.driveTime}</strong></span>
                  </span>
                  {#if activeSlide.walkTime !== 'N/A'}
                    <span class="text-neutral-300 dark:text-neutral-600">•</span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-xs text-muted-gold dark:text-muted-gold-dark">directions_walk</span>
                      <span>{i18n.locale === 'fr' ? 'À pied :' : 'Walk:'} <strong class="text-deep-charcoal dark:text-neutral-100 font-bold">{activeSlide.walkTime}</strong></span>
                    </span>
                  {/if}
                </div>
              </div>
            {/key}
          </div>

          <!-- PLAIN RIGHT CHEVRON ICON (> in gap, Desktop only, hidden on mobile) -->
          <button
            type="button"
            onclick={nextNeighborhoodSlide}
            class="hidden md:flex text-soft-cream/70 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-1 sm:p-2 -mx-1 sm:-mx-2 z-30 focus:outline-none items-center justify-center shrink-0"
            aria-label="Next Location"
          >
            <span class="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl">chevron_right</span>
          </button>

          <!-- 3. RIGHT PEEK SLIDE (Desktop only, hidden on mobile) -->
          <button
            type="button"
            onclick={nextNeighborhoodSlide}
            class="hidden md:block relative overflow-hidden shrink-0 cursor-pointer transition-all duration-500 ease-out group
                   w-[14vw] md:w-[16vw] lg:w-[18vw]
                   h-[320px] md:h-[380px] lg:h-[430px]
                   opacity-55 hover:opacity-85 filter brightness-75 hover:brightness-100 shadow-xl border border-white/5"
            aria-label="Slide suivante : {nextSlide.name}"
          >
            <img
              src={nextSlide.imageUrl}
              alt={nextSlide.name}
              class="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-deep-charcoal/40 group-hover:bg-deep-charcoal/15 transition-colors"></div>
          </button>

        </div>
      </div>

      <!-- Slide Indicator Dots at Bottom of Carousel -->
      <div class="flex items-center justify-center gap-3 mt-6 z-20 relative">
        {#each neighborhoodSlides as _, i}
          <button
            onclick={() => setNeighborhoodIndex(i)}
            type="button"
            class="h-1.5 transition-all duration-300 cursor-pointer {activeNeighborhoodIndex === i ? 'w-8 bg-muted-gold dark:bg-muted-gold-dark' : 'w-2.5 bg-white/30 hover:bg-white/60'}"
            aria-label="Go to location slide {i + 1}"
          ></button>
        {/each}
      </div>

      <!-- Location Interactive Map CTA Button -->
      <div class="text-center mt-8 relative z-20">
        <a
          href="/location"
          class="btn-luxury-secondary text-xs py-2.5 px-6"
        >
          <span>{i18n.t.neighborhoods.interactiveMapCta}</span>
          <span class="material-symbols-outlined text-xs">map</span>
        </a>
      </div>
    {/if}
  </section>

  <!-- ================= 7. VERIFIED REVIEWS SECTION: "DON'T JUST TAKE OUR WORD FOR IT!" ================= -->
  <section class="w-full bg-soft-cream dark:bg-neutral-950 py-16 md:py-24 lg:py-28 border-t border-outline-variant/30 dark:border-neutral-800 relative z-20">
    <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
      
      <!-- Section Title Prominently at Top Left -->
      <div class="mb-10 md:mb-14">
        <div class="flex items-center gap-3 mb-2">
          <span class="w-8 h-[1.5px] bg-muted-gold"></span>
          <span class="font-label-caps text-muted-gold tracking-[0.25em] text-[10px] sm:text-[11px] uppercase font-semibold">
            {i18n.t.testimonials.badge}
          </span>
        </div>
        <h2 class="font-display-lg text-deep-charcoal dark:text-neutral-100 leading-tight">
          {i18n.t.testimonials.title}
        </h2>
      </div>

      <!-- Split Layout: Controls on the Left & Content Block on the Right -->
      {#if reviews[activeReviewIndex]}
        {@const review = reviews[activeReviewIndex]}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <!-- LEFT: Numeric Index Indicator & Plain Unboxed Chevron Navigation Controls -->
          <div class="lg:col-span-4 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-outline-variant/30 dark:border-neutral-800 pb-6 lg:pb-0 lg:pr-8">
            <div>
              <span class="font-label-caps text-[11px] text-on-surface-variant dark:text-neutral-400 tracking-widest uppercase block mb-1">
                {i18n.locale === 'fr' ? 'Témoignage' : 'Testimonial'}
              </span>
              <div class="font-headline text-4xl sm:text-5xl font-light text-deep-charcoal dark:text-neutral-100 flex items-baseline gap-2">
                <span class="font-bold text-muted-gold dark:text-muted-gold-dark">{String(activeReviewIndex + 1).padStart(2, '0')}</span>
                <span class="text-2xl sm:text-3xl text-outline-variant dark:text-neutral-700">/</span>
                <span class="text-2xl sm:text-3xl text-on-surface-variant/60 dark:text-neutral-500">{String(reviews.length).padStart(2, '0')}</span>
              </div>
            </div>

            <!-- Plain Unboxed Navigation Chevrons (< and >) -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                onclick={prevReview}
                class="text-deep-charcoal/70 dark:text-neutral-300 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-1 -ml-1 focus:outline-none flex items-center justify-center"
                aria-label="Previous Review"
              >
                <span class="material-symbols-outlined text-3xl">chevron_left</span>
              </button>

              <button
                type="button"
                onclick={nextReview}
                class="text-deep-charcoal/70 dark:text-neutral-300 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors duration-200 cursor-pointer p-1 focus:outline-none flex items-center justify-center"
                aria-label="Next Review"
              >
                <span class="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- RIGHT: Content Block (Title, Full Quote, Author, and Platform Badges) -->
          <div class="lg:col-span-8 flex flex-col justify-between gap-5 transition-all duration-500 animate-fade-in bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/35 dark:border-neutral-800 p-6 sm:p-8 md:p-10 shadow-sm">
            <!-- Review Title -->
            {#if review.title}
              <h3 class="font-headline text-lg sm:text-xl md:text-2xl text-deep-charcoal dark:text-neutral-100 font-semibold leading-snug">
                {review.title}
              </h3>
            {/if}

            <!-- Review Full Body Quote -->
            <blockquote class="font-headline italic text-sm sm:text-base md:text-lg text-deep-charcoal/90 dark:text-neutral-200 font-light leading-relaxed my-1">
              “{review.quote}”
            </blockquote>

            <!-- Author & Metadata & Platform Badge -->
            <div class="pt-4 border-t border-outline-variant/30 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <strong class="font-headline text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 block">{review.author}</strong>
                <span class="text-xs text-on-surface-variant dark:text-neutral-400 font-sans">{review.origin} • {review.stayType} ({review.date})</span>
              </div>

              <!-- Platform Badge Tag (strictly NO count numbers) -->
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 self-start sm:self-auto">
                <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-sm">verified</span>
                <span class="font-label-caps text-[10px] sm:text-[11px] text-deep-charcoal dark:text-neutral-200 font-bold tracking-wider uppercase">
                  {review.platform}
                </span>
              </div>
            </div>

          </div>

        </div>
      {/if}

    </div>
  </section>

</div>
