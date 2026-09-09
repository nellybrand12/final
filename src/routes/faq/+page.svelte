<script lang="ts">
  import type { PageData } from './$types';
  import FaqAccordion from '$lib/components/FaqAccordion.svelte';
  import { i18n } from '$lib/i18n.svelte';
  import { formatLiveRoomPricing, formatLiveHallPricing } from '$lib/data/bookingKnowledgeBase';

  let { data }: { data: PageData } = $props();

  let selectedCategory = $state('all');

  const faqsList = $derived.by(() => {
    const rawItems = (i18n.t.faq.items && i18n.t.faq.items.length > 0)
      ? i18n.t.faq.items
      : data.faqs;

    return rawItems.map(item => {
      // Room pricing & capacity question (category Chambres & Tarifs / Rooms & Rates or item 2)
      const isRoomPricing = item.category === 'Chambres & Tarifs' || item.category === 'Rooms & Rates' || item.id === 2;
      if (isRoomPricing) {
        const liveAnswer = data.rooms && data.rooms.length > 0
          ? formatLiveRoomPricing(data.rooms, i18n.locale)
          : item.answer;
        return { ...item, answer: liveAnswer };
      }
      // Event halls pricing & capacity question (category Salles d’Événements / Event Halls or item 3)
      const isHallPricing = item.category === 'Salles d’Événements' || item.category === 'Event Halls' || item.id === 3;
      if (isHallPricing) {
        const liveAnswer = data.rooms && data.rooms.length > 0
          ? formatLiveHallPricing(data.rooms, i18n.locale)
          : item.answer;
        return { ...item, answer: liveAnswer };
      }
      return item;
    });
  });

  const categories = $derived.by(() => {
    const set = new Set(faqsList.map(f => f.category));
    return ['all', ...Array.from(set)];
  });

  const filteredFaqs = $derived(
    selectedCategory === 'all'
      ? faqsList
      : faqsList.filter(f => f.category === selectedCategory)
  );
</script>

<svelte:head>
  <title>{i18n.t.faq.metaTitle}</title>
  <meta name="description" content={i18n.t.faq.metaDesc} />
</svelte:head>

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold dark:text-muted-gold-dark tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.faq.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-4">
        {i18n.t.faq.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.faq.description}
      </p>
    </div>

    <!-- Category Filters -->
    {#if categories.length > 1}
      <div class="flex flex-wrap items-center justify-center gap-2 mb-10">
        {#each categories as cat}
          <button
            onclick={() => (selectedCategory = cat)}
            class="px-4 py-1.5 font-label-caps text-xs transition-all {selectedCategory === cat ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-sm font-bold' : 'bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
          >
            {cat === 'all' ? i18n.t.faq.allCategories : cat}
          </button>
        {/each}
      </div>
    {/if}

    <!-- FAQ Accordion List -->
    <div class="bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 p-6 md:p-10 shadow-sm mb-16">
      {#each filteredFaqs as faq, index (faq.id || faq.question)}
        <FaqAccordion {faq} isOpenDefault={index === 0} />
      {/each}
    </div>

    <!-- Assistance Box -->
    <div class="p-8 md:p-12 bg-deep-charcoal dark:bg-neutral-900 text-soft-cream text-center space-y-6 border border-white/10 dark:border-neutral-800">
      <div class="w-14 h-14 bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center mx-auto">
        <span class="material-symbols-outlined text-3xl">support_agent</span>
      </div>
      <div class="max-w-md mx-auto space-y-2">
        <h3 class="font-headline text-2xl font-bold text-soft-cream">{i18n.t.faq.specificQueryTitle}</h3>
        <p class="text-xs text-soft-cream/70 leading-relaxed">
          {i18n.t.faq.specificQueryDesc}
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href="/contact"
          class="btn-luxury-primary text-xs py-2.5 px-6 text-center"
        >
          {i18n.t.faq.contactFormBtn}
        </a>
        <a
          href="https://wa.me/237699000000"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-luxury-secondary text-xs py-2.5 px-6 text-center"
        >
          <span>{i18n.t.faq.whatsappDirectBtn}</span>
          <span class="material-symbols-outlined text-sm">chat</span>
        </a>
      </div>
    </div>
  </div>
</div>
