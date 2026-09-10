<script lang="ts">
  import { page } from '$app/stores';
  import AmenityCard from '$lib/components/AmenityCard.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let settings = $derived($page.data.settings || {});
  let whatsappNumber = $derived(
    (settings.contact_whatsapp || '237699000000').replace(/[^0-9]/g, '')
  );
  let whatsappText = $derived(
    encodeURIComponent(
      i18n.locale === 'fr'
        ? 'Bonjour, je souhaite en savoir plus sur vos services.'
        : 'Hello, I would like to know more about your services.'
    )
  );
</script>

<SEO title={i18n.t.amenities.metaTitle} description={i18n.t.amenities.metaDesc} />

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-3xl mx-auto mb-16">
      <span class="font-label-caps text-muted-gold tracking-widest text-xs mb-3 block uppercase font-semibold">
        {i18n.t.amenities.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-6">
        {i18n.t.amenities.heading}
      </h1>
      <p class="font-body-lg text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.amenities.description}
      </p>
    </div>

    <!-- 6 Service Entries Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
      {#each data.services as service}
        <AmenityCard
          imageUrl={service.imageUrl}
          title={i18n.locale === 'fr' ? service.nameFr : service.nameEn}
          description={i18n.locale === 'fr' ? service.descriptionFr : service.descriptionEn}
        />
      {/each}
    </div>

    <!-- WhatsApp Invitation Line (Below services grid, separate from cards) -->
    <div class="mb-20 text-center py-6 px-6 sm:px-8 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
      <p class="font-body-md text-sm sm:text-base text-deep-charcoal dark:text-neutral-200">
        {i18n.locale === 'fr' 
          ? 'Vous souhaitez en savoir plus sur nos services ?' 
          : 'Want to know more about our services?'}
      </p>
      <a
        href="https://wa.me/{whatsappNumber}?text={whatsappText}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 font-semibold text-xs sm:text-sm tracking-wider uppercase px-5 py-2.5 bg-[#661f23] hover:bg-[#52191c] text-soft-cream dark:bg-[#bc9347] dark:hover:bg-[#a8823b] dark:text-neutral-950 transition-all duration-300 shadow-sm"
      >
        <span class="material-symbols-outlined text-base">chat_bubble</span>
        <span>{i18n.locale === 'fr' ? 'Contactez-nous sur WhatsApp' : 'Contact us on WhatsApp'}</span>
      </a>
    </div>

    <!-- Immersive Feature Banner -->
    <div class="relative bg-deep-charcoal dark:bg-neutral-900 text-soft-cream p-8 md:p-14 lg:p-16 shadow-2xl border border-white/10 dark:border-neutral-800">
      <div class="relative z-10 max-w-2xl space-y-5">
        <span class="font-label-caps text-muted-gold tracking-widest text-xs block uppercase font-semibold">
          {i18n.t.amenities.bannerBadge}
        </span>
        <h2 class="font-display-lg leading-tight text-soft-cream">
          {i18n.t.amenities.bannerTitle}
        </h2>
        <p class="font-body-md text-xs sm:text-sm text-soft-cream/80 leading-relaxed">
          {i18n.t.amenities.bannerDesc}
        </p>
        <div class="pt-3 flex flex-col sm:flex-row gap-3">
          <a
            href="/reserver"
            class="btn-luxury-primary text-xs py-2.5 px-6 text-center"
          >
            {i18n.t.amenities.bannerBookBtn}
          </a>
          <a
            href="/contact"
            class="btn-luxury-secondary text-xs py-2.5 px-6 text-center"
          >
            {i18n.t.amenities.bannerContactBtn}
          </a>
        </div>
      </div>

      <!-- Decorative Background Pattern -->
      <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-muted-gold/10 dark:bg-muted-gold-dark/10 blur-3xl pointer-events-none"></div>
    </div>
  </div>
</div>
