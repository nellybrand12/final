<script lang="ts">
  import type { Room } from '$lib/server/db/schema';
  import { i18n } from '$lib/i18n.svelte';

  interface Props {
    room: Room;
    showPrice?: boolean;
  }

  let { room, showPrice = false }: Props = $props();

  function formatPrice(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }

  function cleanDescription(desc: string | null | undefined) {
    if (!desc) return '';
    return desc
      .replace(/\s*(?:de\s+)?\d+\s*(?:m²|m2|sqm|sq\s*m)\s*/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
</script>

<div class="group flex flex-col w-full max-w-full bg-surface-container-lowest border border-outline-variant/30 overflow-hidden hover:shadow-2xl transition-all duration-500 h-full">
  <!-- Room Image with Proportional Aspect Ratio & Hover Zoom -->
  <div class="relative aspect-[16/10] w-full overflow-hidden bg-deep-charcoal">
    <img
      src={room.imageUrl}
      alt={room.name}
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

    <!-- Strictly ONLY the "number of guests" capacity indicator badge is kept -->
    <div class="absolute bottom-3.5 left-3.5 flex items-center text-soft-cream font-label-caps text-[11px] sm:text-xs bg-neutral-950/80 backdrop-blur-sm px-3 py-1.5 border border-white/15 shadow-md">
      <span class="flex items-center gap-1.5">
        <span class="material-symbols-outlined text-sm text-muted-gold">group</span>
        <span>{i18n.t.showcase.upTo} {room.maxGuests} {i18n.t.showcase.guests}</span>
      </span>
    </div>
  </div>

  <!-- Room Content -->
  <div class="p-5 sm:p-6 lg:p-7 flex flex-col flex-grow justify-between gap-4 w-full">
    <div>
      <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal group-hover:text-muted-gold transition-colors mb-1.5 font-semibold leading-snug">
        {i18n.locale === 'fr' ? (room.nameFr || room.name) : (room.nameEn || room.name)}
      </h3>
      {#if (i18n.locale === 'fr' ? room.taglineFr : room.taglineEn) || room.taglineFr}
        <p class="font-headline italic text-xs text-on-surface-variant mb-2.5 leading-relaxed">
          {i18n.locale === 'fr' ? (room.taglineFr || room.taglineEn) : (room.taglineEn || room.taglineFr)}
        </p>
      {/if}
      <p class="font-body-md text-xs sm:text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
        {cleanDescription(i18n.locale === 'fr' ? room.descriptionFr : room.descriptionEn)}
      </p>

      <!-- Amenities Highlights -->
      {#if Array.isArray(room.amenities) && room.amenities.length > 0}
        <div class="flex flex-wrap gap-1.5 mt-3.5">
          {#each room.amenities.slice(0, 3) as amenity}
            <span class="text-[10px] font-medium bg-surface-container px-2.5 py-1 text-on-surface-variant border border-outline-variant/20">
              • {amenity}
            </span>
          {/each}
        </div>
      {/if}
    </div>

    <!-- CTA Row (Price omitted on homepage) -->
    <div class="pt-4 border-t border-outline-variant/30 flex items-center {showPrice ? 'justify-between' : 'justify-end'} gap-3 w-full">
      {#if showPrice}
        <div>
          <span class="text-[10px] font-label-caps text-on-surface-variant block">{i18n.t.showcase.from}</span>
          <div class="flex items-baseline gap-1">
            <span class="font-headline text-lg sm:text-xl font-bold text-deep-charcoal">
              {formatPrice(room.pricePerNight)}
            </span>
            <span class="text-[10px] font-label-caps text-muted-gold">{i18n.t.showcase.perNight}</span>
          </div>
        </div>
      {/if}

      <div class="flex items-center gap-2.5 {showPrice ? 'w-auto' : 'w-full justify-between sm:justify-end'}">
        <a
          href="/rooms/{room.slug}"
          class="btn-luxury-outline text-[10px] sm:text-xs py-2 px-3.5 sm:px-4"
        >
          {i18n.t.showcase.details}
        </a>
        <a
          href="/reserver?roomId={room.id}"
          class="btn-luxury-dark text-[10px] sm:text-xs py-2 px-4 sm:px-5"
        >
          {i18n.t.showcase.book}
        </a>
      </div>
    </div>
  </div>
</div>
