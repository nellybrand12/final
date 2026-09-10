<script lang="ts">
  import type { PageData } from './$types';
  import RoomCard from '$lib/components/RoomCard.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';

  let { data }: { data: PageData } = $props();

  let selectedCategory = $state('all');
  let selectedGuests = $state('all');

  const filteredRooms = $derived(
    data.rooms.filter(room => {
      const matchCat = selectedCategory === 'all' || 
        (selectedCategory === 'prestige' && room.category.toLowerCase().includes('prestige')) ||
        (selectedCategory === 'junior' && room.category.toLowerCase().includes('junior')) ||
        (selectedCategory === 'chambre' && room.category.toLowerCase().includes('chambre')) ||
        (selectedCategory === 'hall' && (room.type === 'hall' || room.category.toLowerCase().includes('salle') || room.category.toLowerCase().includes('salon')));
      
      const matchGuests = selectedGuests === 'all' || 
        room.maxGuests >= parseInt(selectedGuests);

      return matchCat && matchGuests;
    })
  );
</script>

<SEO title={i18n.t.rooms.metaTitle} description={i18n.t.rooms.metaDesc} />

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-3xl mx-auto mb-10 md:mb-12">
      <span class="font-label-caps text-muted-gold dark:text-muted-gold-dark tracking-widest text-xs mb-3 block uppercase font-semibold">
        {i18n.t.rooms.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-4">
        {i18n.t.rooms.heading}
      </h1>
      <p class="font-body-lg text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.rooms.description}
      </p>
    </div>

    <!-- ================= AMENITIES & KEY INCLUSIONS HIGHLIGHTS (Directly beneath description, above filters) ================= -->
    <div class="mb-12 p-6 md:p-8 bg-deep-charcoal dark:bg-neutral-900 text-soft-cream border border-white/10 dark:border-neutral-800 shadow-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-soft-cream/15">
        <div class="flex flex-col items-center gap-2 pt-4 md:pt-0 px-3">
          <span class="material-symbols-outlined text-2xl text-muted-gold dark:text-muted-gold-dark">wifi</span>
          <h4 class="font-headline text-base sm:text-lg font-bold">{i18n.t.rooms.fiberTitle}</h4>
          <p class="text-xs text-soft-cream/75 max-w-xs leading-relaxed">{i18n.t.rooms.fiberDesc}</p>
        </div>
        <div class="flex flex-col items-center gap-2 pt-4 md:pt-0 px-3">
          <span class="material-symbols-outlined text-2xl text-muted-gold dark:text-muted-gold-dark">kitchen</span>
          <h4 class="font-headline text-base sm:text-lg font-bold">{i18n.t.rooms.kitchenTitle}</h4>
          <p class="text-xs text-soft-cream/75 max-w-xs leading-relaxed">{i18n.t.rooms.kitchenDesc}</p>
        </div>
        <div class="flex flex-col items-center gap-2 pt-4 md:pt-0 px-3">
          <span class="material-symbols-outlined text-2xl text-muted-gold dark:text-muted-gold-dark">verified_user</span>
          <h4 class="font-headline text-base sm:text-lg font-bold">{i18n.t.rooms.securityTitle}</h4>
          <p class="text-xs text-soft-cream/75 max-w-xs leading-relaxed">{i18n.t.rooms.securityDesc}</p>
        </div>
      </div>
    </div>

    <!-- Category & Capacity Filters Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 md:p-4 bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 mb-10">
      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          onclick={() => (selectedCategory = 'all')}
          class="px-3.5 py-1.5 font-label-caps text-[10px] sm:text-[11px] transition-all cursor-pointer {selectedCategory === 'all' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-sm font-bold' : 'bg-surface-container-lowest dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
        >
          {i18n.t.rooms.allCategories} ({data.rooms.length})
        </button>
        <button
          onclick={() => (selectedCategory = 'appartement')}
          class="px-3.5 py-1.5 font-label-caps text-[10px] sm:text-[11px] transition-all cursor-pointer {selectedCategory === 'appartement' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-sm font-bold' : 'bg-surface-container-lowest dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
        >
          {i18n.t.rooms.apartmentsCat}
        </button>
        <button
          onclick={() => (selectedCategory = 'chambre')}
          class="px-3.5 py-1.5 font-label-caps text-[10px] sm:text-[11px] transition-all cursor-pointer {selectedCategory === 'chambre' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-sm font-bold' : 'bg-surface-container-lowest dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
        >
          {i18n.t.rooms.roomsCat}
        </button>
        <button
          onclick={() => (selectedCategory = 'hall')}
          class="px-3.5 py-1.5 font-label-caps text-[10px] sm:text-[11px] transition-all cursor-pointer {selectedCategory === 'hall' ? 'bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-950 shadow-sm font-bold' : 'bg-surface-container-lowest dark:bg-neutral-800 text-on-surface dark:text-neutral-300 hover:bg-surface-variant dark:hover:bg-neutral-700'}"
        >
          {i18n.locale === 'fr' ? "Salles d'Événements" : 'Event Halls'}
        </button>
      </div>

      <!-- Capacity Filter -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <span class="text-[11px] font-label-caps text-on-surface-variant dark:text-neutral-400">{i18n.t.rooms.filterCapacity}</span>
        <select
          bind:value={selectedGuests}
          class="bg-surface-container-lowest dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 px-3 py-1.5 text-xs font-body-md text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
        >
          <option value="all">{i18n.t.rooms.allGuests}</option>
          <option value="2">{i18n.t.rooms.twoPlusGuests}</option>
          <option value="3">{i18n.t.rooms.threePlusGuests}</option>
          <option value="4">{i18n.t.rooms.fourPlusGuests}</option>
          <option value="20">20+ {i18n.locale === 'fr' ? 'pers. (Salles)' : 'pers. (Halls)'}</option>
          <option value="50">50+ {i18n.locale === 'fr' ? 'pers. (Grandes salles)' : 'pers. (Grand halls)'}</option>
        </select>
      </div>
    </div>

    <!-- Rooms Grid (2x2 Layout: 2 up, 2 down on desktop/tablet) -->
    {#if filteredRooms.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {#each filteredRooms as room}
          <RoomCard {room} showPrice={true} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-16 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800">
        <span class="material-symbols-outlined text-3xl text-muted-gold dark:text-muted-gold-dark mb-2.5">bed</span>
        <h3 class="font-headline text-xl text-deep-charcoal dark:text-neutral-100 mb-1.5">{i18n.t.rooms.noResultsTitle}</h3>
        <p class="text-xs text-on-surface-variant dark:text-neutral-400 mb-5">{i18n.t.rooms.noResultsDesc}</p>
        <button
          onclick={() => { selectedCategory = 'all'; selectedGuests = 'all'; }}
          class="btn-luxury-dark text-xs py-2 px-5"
        >
          {i18n.t.rooms.resetFilters}
        </button>
      </div>
    {/if}

  </div>
</div>
