<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';

  let { data }: { data?: any } = $props();

  let activeFilter = $state('all');
  let lightboxIndex = $state<number | null>(null);

  const galleryItems = $derived(data?.galleryItems ?? []);
  const filteredItems = $derived(
    activeFilter === 'all'
      ? galleryItems
      : galleryItems.filter((item: any) => item.category === activeFilter)
  );

  function openLightbox(index: number) {
    lightboxIndex = index;
  }

  function closeLightbox() {
    lightboxIndex = null;
  }

  function nextImage() {
    if (lightboxIndex !== null) {
      lightboxIndex = (lightboxIndex + 1) % filteredItems.length;
    }
  }

  function prevImage() {
    if (lightboxIndex !== null) {
      lightboxIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    }
  }
</script>

<svelte:head>
  <title>{i18n.t.gallery.metaTitle}</title>
  <meta name="description" content={i18n.t.gallery.metaDesc} />
</svelte:head>

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.gallery.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-4">
        {i18n.t.gallery.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.gallery.description}
      </p>
    </div>

    <!-- Category Filters -->
    <div class="flex flex-wrap items-center justify-center gap-2 mb-12">
      <button
        onclick={() => (activeFilter = 'all')}
        class="px-4 py-1.5 font-label-caps text-xs transition-all {activeFilter === 'all' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-md font-bold' : 'bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
      >
        {i18n.t.gallery.allPhotos} ({galleryItems.length})
      </button>
      <button
        onclick={() => (activeFilter = 'suites')}
        class="px-4 py-1.5 font-label-caps text-xs transition-all {activeFilter === 'suites' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-md font-bold' : 'bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
      >
        {i18n.t.gallery.suitesCat}
      </button>
      <button
        onclick={() => (activeFilter = 'architecture')}
        class="px-4 py-1.5 font-label-caps text-xs transition-all {activeFilter === 'architecture' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-md font-bold' : 'bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
      >
        {i18n.t.gallery.architectureCat}
      </button>
      <button
        onclick={() => (activeFilter = 'excursions')}
        class="px-4 py-1.5 font-label-caps text-xs transition-all {activeFilter === 'excursions' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-md font-bold' : 'bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
      >
        {i18n.t.gallery.regionCat}
      </button>
    </div>

    <!-- Gallery Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredItems as item, index}
        <button
          type="button"
          onclick={() => openLightbox(index)}
          class="group relative aspect-[4/3] overflow-hidden bg-deep-charcoal dark:bg-neutral-900 text-left focus:outline-none cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/30 dark:border-neutral-800"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/90 via-deep-charcoal/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          <div class="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end text-soft-cream">
            <span class="font-label-caps text-[10px] text-muted-gold tracking-widest uppercase mb-1">
              {item.category}
            </span>
            <h3 class="font-headline text-lg sm:text-xl text-soft-cream group-hover:text-muted-gold dark:group-hover:text-muted-gold-dark transition-colors font-bold mb-1">
              {item.title}
            </h3>
            <p class="font-body-md text-xs text-soft-cream/80 line-clamp-2">
              {item.description}
            </p>
          </div>

          <div class="absolute top-3 right-3 w-8 h-8 bg-deep-charcoal/60 backdrop-blur-md text-soft-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="material-symbols-outlined text-base">fullscreen</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Fullscreen Lightbox Modal -->
{#if lightboxIndex !== null && filteredItems[lightboxIndex]}
  {@const currentItem = filteredItems[lightboxIndex]}
  <div class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
    <!-- Close Button -->
    <button
      onclick={closeLightbox}
      class="absolute top-6 right-6 text-soft-cream/80 hover:text-soft-cream p-3 bg-white/10 hover:bg-white/20 transition-all z-10"
      aria-label="Fermer"
    >
      <span class="material-symbols-outlined text-2xl">close</span>
    </button>

    <!-- Navigation Arrows -->
    <button
      onclick={prevImage}
      class="absolute left-6 top-1/2 -translate-y-1/2 text-soft-cream/80 hover:text-soft-cream p-3 bg-white/10 hover:bg-white/20 transition-all z-10 hidden sm:flex items-center justify-center"
      aria-label="Previous image"
    >
      <span class="material-symbols-outlined text-3xl">chevron_left</span>
    </button>

    <button
      onclick={nextImage}
      class="absolute right-6 top-1/2 -translate-y-1/2 text-soft-cream/80 hover:text-soft-cream p-3 bg-white/10 hover:bg-white/20 transition-all z-10 hidden sm:flex items-center justify-center"
      aria-label="Next image"
    >
      <span class="material-symbols-outlined text-3xl">chevron_right</span>
    </button>

    <!-- Main Image Container -->
    <div class="max-w-5xl max-h-[85vh] flex flex-col items-center gap-4 text-center">
      <img
        src={currentItem.imageUrl}
        alt={currentItem.title}
        class="max-h-[70vh] w-auto max-w-full object-contain shadow-2xl"
      />
      <div class="text-soft-cream space-y-1">
        <h3 class="font-headline text-xl sm:text-2xl text-soft-cream font-bold">{currentItem.title}</h3>
        <p class="font-body-md text-xs sm:text-sm text-soft-cream/70 max-w-xl">{currentItem.description}</p>
        <span class="font-label-caps text-xs text-muted-gold tracking-widest block pt-1">
          {lightboxIndex + 1} {i18n.t.gallery.ofCount} {filteredItems.length}
        </span>
      </div>
    </div>
  </div>
{/if}
