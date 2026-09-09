<script lang="ts">
  import type { PageData } from './$types';
  import RoomCard from '$lib/components/RoomCard.svelte';
  import { i18n } from '$lib/i18n.svelte';

  let { data }: { data: PageData } = $props();

  let activeImageIndex = $state(0);
  let checkIn = $state('2026-09-10');
  let checkOut = $state('2026-09-12');
  let roomsCount = $state(1);

  const images = $derived(
    Array.isArray(data.room.galleryImages) && data.room.galleryImages.length > 0
      ? (data.room.galleryImages as string[])
      : [data.room.imageUrl]
  );

  function formatPrice(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }

  // Calculate nights
  const nights = $derived.by(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  });

  const totalPrice = $derived.by(() => {
    const base = parseFloat(data.room.pricePerNight);
    const count = data.room.type === 'hall' ? 1 : roomsCount;
    return base * nights * count;
  });
</script>

<svelte:head>
  <title>{i18n.locale === 'fr' ? (data.room.nameFr || data.room.name) : (data.room.nameEn || data.room.name)} | Hôtel Résidence Madadjeu</title>
  <meta name="description" content="{data.room.name} à l'Hôtel Résidence Madadjeu. {i18n.locale === 'fr' ? data.room.descriptionFr : data.room.descriptionEn}" />
</svelte:head>

<div class="w-full bg-surface dark:bg-neutral-950 py-10 md:py-16">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs font-label-caps text-on-surface-variant dark:text-neutral-400 mb-8">
      <a href="/" class="hover:text-deep-charcoal dark:hover:text-neutral-100 transition-colors">{i18n.locale === 'fr' ? 'Accueil' : 'Home'}</a>
      <span>/</span>
      <a href="/rooms" class="hover:text-deep-charcoal dark:hover:text-neutral-100 transition-colors">{i18n.t.nav.rooms}</a>
      <span>/</span>
      <span class="text-muted-gold dark:text-muted-gold-dark font-bold">{i18n.locale === 'fr' ? (data.room.nameFr || data.room.name) : (data.room.nameEn || data.room.name)}</span>
    </nav>

    <!-- Header Title -->
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <span class="bg-surface-container dark:bg-neutral-800 text-deep-charcoal dark:text-neutral-200 font-label-caps text-[10px] px-3 py-1.5 rounded-full mb-3 inline-block font-semibold">
          {data.room.category}
        </span>
        <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 leading-tight">
          {i18n.locale === 'fr' ? (data.room.nameFr || data.room.name) : (data.room.nameEn || data.room.name)}
        </h1>
        {#if (i18n.locale === 'fr' ? data.room.taglineFr : data.room.taglineEn) || data.room.taglineFr}
          <p class="font-headline italic text-sm sm:text-base text-on-surface-variant dark:text-neutral-400 mt-1.5">
            {i18n.locale === 'fr' ? (data.room.taglineFr || data.room.taglineEn) : (data.room.taglineEn || data.room.taglineFr)}
          </p>
        {/if}
      </div>

      <div class="text-left md:text-right">
        <span class="text-[11px] font-label-caps text-on-surface-variant dark:text-neutral-400 block">{i18n.t.roomDetails.fromPrice}</span>
        <div class="flex items-baseline md:justify-end gap-1.5">
          <span class="font-headline text-2xl sm:text-3xl font-bold text-deep-charcoal dark:text-neutral-100">
            {formatPrice(data.room.pricePerNight)}
          </span>
          <span class="text-xs font-label-caps text-muted-gold dark:text-muted-gold-dark">
            {data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'FCFA / événement' : 'FCFA / event') : 'FCFA'}
          </span>
        </div>
        <span class="text-[10px] text-on-surface-variant dark:text-neutral-400">{i18n.t.roomDetails.servicesTax} {i18n.t.reserve.includedLabel.toLowerCase()}</span>
      </div>
    </div>

    <!-- Gallery Mosaic / Carousel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-14">
      <!-- Main Active Image -->
      <div class="lg:col-span-2 relative aspect-[16/10] overflow-hidden rounded-xl bg-deep-charcoal dark:bg-neutral-900">
        <img
          src={images[activeImageIndex] || data.room.imageUrl}
          alt="{data.room.name} {activeImageIndex + 1}"
          class="w-full h-full object-cover transition-all duration-500"
        />
        <div class="absolute bottom-4 right-4 bg-deep-charcoal/80 dark:bg-neutral-900/80 backdrop-blur-md text-soft-cream px-3 py-1.5 rounded-full font-label-caps text-[10px]">
          {activeImageIndex + 1} / {images.length}
        </div>
      </div>

      <!-- Thumbnail Selection Column -->
      <div class="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
        {#each images as img, i}
          <button
            type="button"
            onclick={() => (activeImageIndex = i)}
            class="relative aspect-[16/10] lg:h-1/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 w-28 lg:w-full {activeImageIndex === i ? 'border-muted-gold dark:border-muted-gold-dark ring-2 ring-muted-gold/30 dark:ring-muted-gold-dark/30' : 'border-transparent opacity-75 hover:opacity-100'}"
          >
            <img src={img} alt="Thumbnail {i + 1}" class="w-full h-full object-cover" />
          </button>
        {/each}
      </div>
    </div>

    <!-- Main Content & Sticky Booking Form Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
      <!-- Left Column: Suite Description & Specs -->
      <div class="lg:col-span-7 flex flex-col gap-10">
        <!-- Highlights Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-surface-container dark:bg-neutral-900 rounded-xl border border-outline-variant/30 dark:border-neutral-800 text-center">
          <div class="flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-lg">square_foot</span>
            <span class="font-headline text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 font-bold">{data.room.sizeSqM} m²</span>
            <span class="text-[9px] font-label-caps text-on-surface-variant dark:text-neutral-400">{i18n.t.roomDetails.area}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-lg">{data.room.type === 'hall' ? 'event_seat' : 'bed'}</span>
            <span class="font-headline text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 font-bold">{data.room.bedType || (data.room.type === 'hall' ? 'Modulable' : 'Standard')}</span>
            <span class="text-[9px] font-label-caps text-on-surface-variant dark:text-neutral-400">{data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'Configuration' : 'Layout') : i18n.t.roomDetails.bed}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-lg">{data.room.type === 'hall' ? 'celebration' : 'group'}</span>
            <span class="font-headline text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 font-bold">
              {data.room.maxGuests} {data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'convives' : 'attendees') : i18n.t.showcase.guests}
            </span>
            <span class="text-[9px] font-label-caps text-on-surface-variant dark:text-neutral-400">{i18n.t.roomDetails.capacity}</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-lg">{data.room.type === 'hall' ? 'mic' : 'visibility'}</span>
            <span class="font-headline text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 font-bold">
              {#if data.room.type === 'hall'}
                {i18n.locale === 'fr' ? 'Régie & Son' : 'AV & Sound'}
              {:else}
                {i18n.locale === 'fr' ? 'Panoramique' : 'Panoramic'}
              {/if}
            </span>
            <span class="text-[9px] font-label-caps text-on-surface-variant dark:text-neutral-400">{data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'Équipement' : 'Equipments') : i18n.t.roomDetails.view}</span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h2 class="font-headline text-xl sm:text-2xl text-deep-charcoal dark:text-neutral-100 mb-3">{i18n.locale === 'fr' ? "L'Art de Vivre Madadjeu" : 'The Madadjeu Art of Living'}</h2>
          <div class="prose max-w-none text-on-surface-variant dark:text-neutral-300 font-body-md text-xs sm:text-sm leading-relaxed space-y-3">
            <p>{i18n.locale === 'fr' ? data.room.descriptionFr : data.room.descriptionEn}</p>
            <p>
              {i18n.locale === 'fr'
                ? 'Conçue pour garantir une intimité absolue, cette demeure met à votre disposition des équipements technologiques de pointe, une insonorisation acoustique optimale et un service d’étage sur mesure face à la Garde Présidentielle.'
                : 'Conceived to guarantee supreme privacy, this residence offers cutting-edge amenities, high-grade acoustic insulation, and tailored in-room service opposite the Presidential Guard.'}
            </p>
          </div>
        </div>

        <!-- Amenities Checklist -->
        <div>
          <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal dark:text-neutral-100 mb-4">{i18n.t.roomDetails.includedAmenities}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {#if Array.isArray(data.room.amenities)}
              {#each data.room.amenities as amenity}
                <div class="flex items-center gap-2.5 p-3 bg-surface-container-lowest dark:bg-neutral-900 rounded-xl border border-outline-variant/30 dark:border-neutral-800">
                  <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-lg">check_circle</span>
                  <span class="font-body-md text-xs text-deep-charcoal dark:text-neutral-200 font-medium">{amenity}</span>
                </div>
              {/each}
            {/if}
          </div>
        </div>

        <!-- Policies -->
        <div class="p-5 bg-surface-container-low dark:bg-neutral-900 rounded-xl border border-outline-variant/30 dark:border-neutral-800 space-y-3">
          <h4 class="font-label-caps text-[11px] text-muted-gold dark:text-muted-gold-dark tracking-widest uppercase">{i18n.locale === 'fr' ? 'Informations Pratiques' : 'Practical Information'}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant dark:text-neutral-400">
            {#if data.room.type === 'hall'}
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Horaires d’accès :' : 'Access Hours:'}</strong>
                {i18n.locale === 'fr' ? 'De 08h00 à 23h00 (Créneaux personnalisables)' : 'From 8:00 AM to 11:00 PM (Custom slots available)'}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Logistique & Traiteur :' : 'Logistics & Catering:'}</strong>
                {i18n.locale === 'fr' ? 'Cuisine relais traiteur & régie technique dédiées' : 'Dedicated catering kitchen & AV technical control'}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Capacité d’accueil :' : 'Capacity:'}</strong>
                {i18n.locale === 'fr' ? `Jusqu'à ${data.room.maxGuests} personnes (Banquet ou Conférence)` : `Up to ${data.room.maxGuests} guests (Banquet or Conference)`}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Annulation & Remboursement :' : 'Cancellation & Refund:'}</strong>
                <span class="text-emerald-700 dark:text-emerald-400 font-semibold">{i18n.locale === 'fr' ? 'Remboursement de 95% jusqu’à 36h avant l’événement' : '95% refund up to 36 hours before the event'}</span>
              </div>
            {:else}
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.t.reserve.summaryCheckIn}</strong>
                {i18n.locale === 'fr' ? 'À partir de 14h00 (Arrivée anticipée sur demande)' : 'From 2:00 PM (Early check-in upon request)'}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.t.reserve.summaryCheckOut}</strong>
                {i18n.locale === 'fr' ? 'Jusqu’à 12h00 (Départ tardif selon disponibilité)' : 'Until 12:00 PM (Late check-out subject to availability)'}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Petit-déjeuner :' : 'Breakfast:'}</strong>
                {i18n.locale === 'fr' ? 'Servi de 06h30 à 10h30 au restaurant ou en appartement' : 'Served from 6:30 AM to 10:30 AM in restaurant or room'}
              </div>
              <div>
                <strong class="text-deep-charcoal dark:text-neutral-200 block mb-0.5">{i18n.locale === 'fr' ? 'Annulation & Remboursement :' : 'Cancellation & Refund:'}</strong>
                <span class="text-emerald-700 dark:text-emerald-400 font-semibold">{i18n.locale === 'fr' ? 'Remboursement de 95% jusqu’à 20h avant l’arrivée' : '95% refund up to 20 hours before arrival date'}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Booking Widget -->
      <div class="lg:col-span-5">
        <div class="sticky top-28 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/40 dark:border-neutral-800 rounded-2xl shadow-xl p-6 md:p-8">
          <div class="border-b border-outline-variant/30 dark:border-neutral-800 pb-6 mb-6">
            <span class="text-xs font-label-caps text-muted-gold dark:text-muted-gold-dark block mb-1 font-semibold">{i18n.t.reserve.tag}</span>
            <h3 class="font-headline text-2xl text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.roomDetails.bookingWidgetTitle}</h3>
            <p class="text-xs text-on-surface-variant dark:text-neutral-400 mt-1">{i18n.t.reserve.subheading}</p>
          </div>

          <form action="/reserver" method="GET" class="flex flex-col gap-4">
            <input type="hidden" name="roomId" value={data.room.id} />

            <!-- Date Selectors -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="checkIn" class="block font-label-caps text-[10px] text-on-surface-variant dark:text-neutral-400 mb-1.5">
                  {data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'Date de début' : 'Start Date') : i18n.t.roomDetails.checkIn}
                </label>
                <input
                  id="checkIn"
                  type="date"
                  name="checkIn"
                  bind:value={checkIn}
                  class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark font-body-md"
                  required
                />
              </div>
              <div>
                <label for="checkOut" class="block font-label-caps text-[10px] text-on-surface-variant dark:text-neutral-400 mb-1.5">
                  {data.room.type === 'hall' ? (i18n.locale === 'fr' ? 'Date de fin' : 'End Date') : i18n.t.roomDetails.checkOut}
                </label>
                <input
                  id="checkOut"
                  type="date"
                  name="checkOut"
                  bind:value={checkOut}
                  class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark font-body-md"
                  required
                />
              </div>
            </div>

            <!-- Number of Rooms Selector (Hidden for Halls) -->
            {#if data.room.type !== 'hall'}
              <div>
                <label for="roomsCount" class="block font-label-caps text-[10px] text-on-surface-variant dark:text-neutral-400 mb-1.5">
                  {i18n.t.roomDetails.roomsCount}
                </label>
                <select
                  id="roomsCount"
                  name="rooms"
                  bind:value={roomsCount}
                  class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark font-body-md"
                >
                  <option value={1}>1 {i18n.t.reserve.roomOptionSingle}</option>
                  <option value={2}>2 {i18n.t.reserve.roomOptionPlural}</option>
                  <option value={3}>3 {i18n.t.reserve.roomOptionPlural}</option>
                  <option value={4}>4+ {i18n.t.reserve.roomOptionPlural}</option>
                </select>
              </div>
            {:else}
              <input type="hidden" name="rooms" value="1" />
              <div class="p-3 bg-surface-container dark:bg-neutral-800 rounded-xl border border-outline-variant/30 dark:border-neutral-700 text-xs text-on-surface-variant dark:text-neutral-300 flex items-center gap-2">
                <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark text-base">celebration</span>
                <span>{i18n.locale === 'fr' ? 'Réservation exclusive de la salle avec régie technique' : 'Exclusive venue rental with technical AV'}</span>
              </div>
            {/if}

            <!-- Pricing Calculation Breakdown -->
            <div class="bg-surface-container dark:bg-neutral-800/60 p-4 rounded-xl space-y-2 text-xs text-on-surface-variant dark:text-neutral-400 mt-2">
              <div class="flex justify-between">
                {#if data.room.type === 'hall'}
                  <span>{formatPrice(data.room.pricePerNight)} FCFA × {nights} {nights > 1 ? (i18n.locale === 'fr' ? 'jours' : 'days') : (i18n.locale === 'fr' ? 'jour' : 'day')}</span>
                {:else}
                  <span>{formatPrice(data.room.pricePerNight)} FCFA × {nights} × {roomsCount}</span>
                {/if}
                <span class="font-medium text-deep-charcoal dark:text-neutral-200">{formatPrice(totalPrice)} FCFA</span>
              </div>
              <div class="flex justify-between">
                <span>{i18n.t.roomDetails.servicesTax}</span>
                <span class="text-green-600 dark:text-emerald-400 font-medium">{i18n.t.reserve.includedLabel}</span>
              </div>
              <div class="border-t border-outline-variant/30 dark:border-neutral-700 pt-2 mt-2 flex justify-between font-headline text-base font-bold text-deep-charcoal dark:text-neutral-100">
                <span>{i18n.t.roomDetails.totalEstimated}</span>
                <span>{formatPrice(totalPrice)} FCFA</span>
              </div>
            </div>

            <!-- Submit CTA -->
            <button
              type="submit"
              class="btn-luxury-primary w-full py-3 text-xs mt-2"
            >
              {i18n.t.roomDetails.continueBooking}
            </button>
          </form>

          <div class="mt-6 flex items-center justify-center gap-2 text-[11px] text-on-surface-variant dark:text-neutral-400">
            <span class="material-symbols-outlined text-base text-muted-gold dark:text-muted-gold-dark">lock</span>
            <span>{i18n.t.roomDetails.secureGuarantee}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Lodgings Suggestions -->
    {#if data.otherRooms.length > 0}
      <div class="mt-24 pt-16 border-t border-outline-variant/30 dark:border-neutral-800">
        <h3 class="font-headline text-2xl sm:text-3xl text-deep-charcoal dark:text-neutral-100 mb-8">{i18n.locale === 'fr' ? 'Découvrez également nos autres logements' : 'Explore Our Other Accommodations'}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each data.otherRooms as otherRoom}
            <RoomCard room={otherRoom} showPrice={true} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
