<script lang="ts">
  import type { PageData } from './$types';
  import FaqAccordion from '$lib/components/FaqAccordion.svelte';
  import { i18n } from '$lib/i18n.svelte';

  let { data }: { data: PageData } = $props();

  let selectedCategory = $state('all');

  const faqsList = $derived(
    i18n.t.faq.items && i18n.t.faq.items.length > 0 ? i18n.t.faq.items : data.faqs
  );

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

<div class="w-full bg-surface py-12 md:py-20">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-warm-taupe tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.faq.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal mb-4">
        {i18n.t.faq.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">
        {i18n.t.faq.description}
      </p>
    </div>

    <!-- Category Filters -->
    {#if categories.length > 1}
      <div class="flex flex-wrap items-center justify-center gap-2 mb-10">
        {#each categories as cat}
          <button
            onclick={() => (selectedCategory = cat)}
            class="px-4 py-1.5 font-label-caps text-xs transition-all {selectedCategory === cat ? 'bg-deep-charcoal text-soft-cream shadow-sm font-bold' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}"
          >
            {cat === 'all' ? i18n.t.faq.allCategories : cat}
          </button>
        {/each}
      </div>
    {/if}

    <!-- FAQ Accordion List -->
    <div class="bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-10 shadow-sm mb-16">
      {#each filteredFaqs as faq, index}
        <FaqAccordion {faq} isOpenDefault={index === 0} />
      {/each}
    </div>

    <!-- Assistance Box -->
    <div class="p-8 md:p-12 bg-deep-charcoal text-soft-cream text-center space-y-6 border border-white/10">
      <div class="w-14 h-14 bg-muted-gold/20 text-muted-gold flex items-center justify-center mx-auto">
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
          href="https://wa.me/237691890963"
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
