<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';

  let lightboxIndex = $state<number | null>(null);

  const locations = $derived(i18n.t.tour.locations);

  function openLightbox(index: number) {
    lightboxIndex = index;
  }

  function closeLightbox() {
    lightboxIndex = null;
  }

  function nextPhoto() {
    if (lightboxIndex !== null) {
      lightboxIndex = (lightboxIndex + 1) % locations.length;
    }
  }

  function prevPhoto() {
    if (lightboxIndex !== null) {
      lightboxIndex = (lightboxIndex - 1 + locations.length) % locations.length;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (lightboxIndex === null) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>{i18n.t.tour.metaTitle}</title>
  <meta name="description" content={i18n.t.tour.metaDesc} />
</svelte:head>

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-24">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    
    <!-- ================= 1. HERO HEADER INTRO ================= -->
    <div class="text-center max-w-3xl mx-auto mb-16 md:mb-24">
      <div class="inline-flex items-center gap-3 mb-4">
        <span class="w-8 h-[1px] bg-muted-gold dark:bg-brand-gold-dark/60"></span>
        <span class="font-label-caps text-muted-gold dark:text-brand-gold-dark tracking-[0.25em] text-xs uppercase">
          {i18n.t.tour.badge}
        </span>
        <span class="w-8 h-[1px] bg-muted-gold dark:bg-brand-gold-dark/60"></span>
      </div>

      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-6 leading-tight">
        {i18n.t.tour.title}
      </h1>

      <p class="font-body-lg text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.tour.subtitle}
      </p>
    </div>

    <!-- ================= 2. ALTERNATING TOUR LOCATIONS LIST ================= -->
    <div class="flex flex-col gap-20 md:gap-32">
      {#each locations as location, index}
        {@const isEven = index % 2 === 0}
        
        <article
          class="flex flex-col {isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-14 lg:gap-20"
        >
          <!-- IMAGE COLUMN (Click image to open lightbox, static image with no zoom animations) -->
          <div class="w-full md:w-1/2">
            <button
              type="button"
              onclick={() => openLightbox(index)}
              class="w-full text-left cursor-pointer focus:outline-none block"
              aria-label={location.title}
            >
              <div
                class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-deep-charcoal shadow-lg border border-outline-variant/30 dark:border-neutral-800"
              >
                <img
                  src={location.imageUrl}
                  alt={location.title}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/60 via-transparent to-transparent pointer-events-none"></div>
                
                <!-- Location Index Number Badge -->
                <div class="absolute top-4 left-4 bg-deep-charcoal/80 dark:bg-neutral-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 dark:border-neutral-700 pointer-events-none">
                  <span class="font-mono text-xs text-muted-gold dark:text-brand-gold-dark font-bold tracking-wider">
                    {location.num}
                  </span>
                </div>
              </div>
            </button>
          </div>

          <!-- CONTENT COLUMN -->
          <div class="w-full md:w-1/2 flex flex-col items-start gap-3.5 md:gap-4">
            <!-- Category Tag -->
            <div class="flex items-center gap-2">
              <span class="w-4 h-[1.5px] bg-muted-gold dark:bg-brand-gold-dark"></span>
              <span class="font-label-caps text-muted-gold dark:text-brand-gold-dark text-[10px] sm:text-[11px] tracking-widest uppercase font-semibold">
                {location.tag}
              </span>
            </div>

            <!-- Title -->
            <h2 class="font-headline text-lg sm:text-2xl lg:text-2xl text-deep-charcoal dark:text-neutral-100 font-normal leading-snug">
              {location.title}
            </h2>

            <!-- Body Description -->
            <p class="font-body-md text-on-surface-variant dark:text-neutral-400 leading-relaxed text-xs sm:text-sm">
              {location.description}
            </p>

            <!-- Highlights Chips -->
            <div class="pt-1 flex flex-wrap gap-1.5">
              {#each location.highlights as highlight}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 text-[11px] text-on-surface dark:text-neutral-300 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-muted-gold dark:bg-brand-gold-dark"></span>
                  {highlight}
                </span>
              {/each}
            </div>

            <!-- Action Link in Luxury Double-Bordered Framing -->
            <div class="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="/rooms"
                class="btn-luxury-outline text-xs py-2 px-4"
              >
                <span>{i18n.t.tour.ctaExploreRooms}</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <!-- ================= 3. BOTTOM CTA BANNER ================= -->
    <div class="mt-20 md:mt-28 p-6 md:p-12 bg-deep-charcoal dark:bg-neutral-900/90 text-soft-cream relative overflow-hidden shadow-2xl border border-white/10 dark:border-neutral-800">
      <div class="absolute -right-16 -bottom-16 w-80 h-80 bg-muted-gold/10 dark:bg-brand-gold-dark/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
        <div class="max-w-2xl space-y-2.5">
          <span class="font-label-caps text-muted-gold dark:text-brand-gold-dark tracking-widest text-[10px] uppercase">
            Hôtel Résidence Madadjeu • Yaoundé
          </span>
          <h3 class="font-headline text-xl sm:text-2xl md:text-3xl text-soft-cream font-normal">
            {i18n.locale === 'fr' ? "Prêt à vivre l'expérience par vous-même ?" : 'Ready to experience it in person?'}
          </h3>
          <p class="font-body-md text-xs sm:text-sm text-soft-cream/80 leading-relaxed">
            {i18n.locale === 'fr'
              ? 'Réservez votre séjour en ligne ou contactez notre conciergerie privée pour organiser un accueil sur-mesure à votre arrivée.'
              : 'Book your stay online or contact our private concierge to arrange a tailored VIP welcome upon your arrival.'}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="/reserver"
            class="btn-luxury-primary text-xs py-3 px-7 w-full sm:w-auto text-center"
          >
            {i18n.t.tour.ctaBook}
          </a>
          <a
            href="/contact"
            class="btn-luxury-secondary text-xs py-3 px-6 w-full sm:w-auto text-center"
          >
            {i18n.t.tour.ctaConcierge}
          </a>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ================= 4. FULLSCREEN LIGHTBOX MODAL ================= -->
{#if lightboxIndex !== null && locations[lightboxIndex]}
  {@const current = locations[lightboxIndex]}
  <div
    class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-label={current.title}
  >
    <!-- Close Button -->
    <button
      onclick={closeLightbox}
      type="button"
      class="absolute top-6 right-6 text-soft-cream/80 hover:text-soft-cream p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10 cursor-pointer focus:outline-none"
      aria-label={i18n.t.tour.closeLightbox}
    >
      <span class="material-symbols-outlined text-2xl">close</span>
    </button>

    <!-- Navigation Arrows -->
    <button
      onclick={prevPhoto}
      type="button"
      class="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-soft-cream/80 hover:text-soft-cream p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10 flex items-center justify-center cursor-pointer focus:outline-none"
      aria-label={i18n.t.tour.prevPhoto}
    >
      <span class="material-symbols-outlined text-3xl">chevron_left</span>
    </button>

    <button
      onclick={nextPhoto}
      type="button"
      class="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-soft-cream/80 hover:text-soft-cream p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10 flex items-center justify-center cursor-pointer focus:outline-none"
      aria-label={i18n.t.tour.nextPhoto}
    >
      <span class="material-symbols-outlined text-3xl">chevron_right</span>
    </button>

    <!-- Main Lightbox Image & Info -->
    <div class="max-w-5xl max-h-[90vh] flex flex-col items-center gap-4 text-center">
      <img
        src={current.imageUrl}
        alt={current.title}
        class="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
      />
      <div class="text-soft-cream space-y-1.5 px-4">
        <span class="font-label-caps text-xs text-muted-gold dark:text-brand-gold-dark tracking-widest uppercase block">
          {current.tag} • {lightboxIndex + 1} {i18n.t.tour.photoOf} {locations.length}
        </span>
        <h3 class="font-headline text-xl sm:text-2xl text-soft-cream font-medium">
          {current.title}
        </h3>
        <p class="font-body-md text-xs sm:text-sm text-soft-cream/70 max-w-2xl mx-auto line-clamp-2">
          {current.description}
        </p>
      </div>
    </div>
  </div>
{/if}
