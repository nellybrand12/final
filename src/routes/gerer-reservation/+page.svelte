<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { i18n } from '$lib/i18n.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let reference = $state('');
  let email = $state('');

  $effect(() => {
    if (data.searchedRef) reference = data.searchedRef;
    if (data.searchedEmail) email = data.searchedEmail;
  });

  const booking = $derived(form?.booking || data.booking);
  const room = $derived(form?.room || data.room);

  function formatPrice(amount: string | number | undefined) {
    if (!amount) return '0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }
</script>

<svelte:head>
  <title>{i18n.t.manageBooking.metaTitle}</title>
  <meta name="description" content={i18n.t.manageBooking.metaDesc} />
</svelte:head>

<div class="w-full bg-surface py-12 md:py-20">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <!-- Header Title -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.manageBooking.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal mb-3">
        {i18n.t.manageBooking.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant">
        {i18n.t.manageBooking.subheading}
      </p>
    </div>

    <!-- Lookup Form Card -->
    <div class="bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-10 shadow-sm mb-12">
      <form method="POST" action="?/lookup" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="refInput" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
              {i18n.t.manageBooking.refInputLabel}
            </label>
            <input
              id="refInput"
              type="text"
              name="reference"
              placeholder="MDJ-XXXXX"
              bind:value={reference}
              class="w-full bg-surface-container border border-outline-variant/50 px-4 py-3 text-sm text-deep-charcoal font-headline font-bold focus:outline-none focus:border-muted-gold uppercase"
              required
            />
          </div>

          <div>
            <label for="emailInput" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
              {i18n.t.manageBooking.emailInputLabel}
            </label>
            <input
              id="emailInput"
              type="email"
              name="email"
              placeholder="votre.email@example.com"
              bind:value={email}
              class="w-full bg-surface-container border border-outline-variant/50 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
              required
            />
          </div>
        </div>

        {#if form?.error}
          <div class="p-4 bg-error-container text-error text-xs font-medium border border-error/20 flex items-center gap-3">
            <span class="material-symbols-outlined">error</span>
            <span>{form.error}</span>
          </div>
        {/if}

        <div class="flex justify-center pt-2">
          <button
            type="submit"
            class="btn-luxury-primary text-xs py-3 px-8"
          >
            {i18n.t.manageBooking.searchBtn}
          </button>
        </div>
      </form>
    </div>

    <!-- Booking Details Result Card -->
    {#if booking}
      <div class="bg-surface-container-lowest border border-outline-variant/40 p-6 md:p-10 shadow-lg space-y-8 animate-fade-up">
        <!-- Status Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <span class="text-xs font-label-caps text-on-surface-variant block uppercase">{i18n.t.manageBooking.fileRef}</span>
            <h3 class="font-headline text-2xl md:text-3xl font-bold text-deep-charcoal">{booking.bookingReference}</h3>
          </div>

          <div class="flex items-center gap-3">
            {#if booking.status === 'confirmed'}
              <span class="px-3.5 py-1.5 bg-green-100 text-green-800 border border-green-200 text-xs font-label-caps font-bold flex items-center gap-1.5 uppercase">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                {i18n.t.manageBooking.confirmed}
              </span>
            {:else if booking.status === 'cancelled'}
              <span class="px-3.5 py-1.5 bg-red-100 text-red-800 border border-red-200 text-xs font-label-caps font-bold flex items-center gap-1.5 uppercase">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                {i18n.t.manageBooking.cancelled}
              </span>
            {:else}
              <span class="px-3.5 py-1.5 bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs font-label-caps font-bold uppercase">
                {booking.status}
              </span>
            {/if}
          </div>
        </div>

        {#if form?.message}
          <div class="p-4 bg-green-50 text-green-800 text-xs font-medium border border-green-200 flex items-center gap-3">
            <span class="material-symbols-outlined">check_circle</span>
            <span>{form.message}</span>
          </div>
        {/if}

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="font-label-caps text-xs text-muted-gold tracking-widest uppercase font-semibold">{i18n.t.manageBooking.stayInfoTitle}</h4>
            <div class="space-y-2 text-sm text-on-surface-variant">
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.roomLabel}</span>
                <strong class="text-deep-charcoal">{room?.name || 'Suite Royale'}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.checkInLabel}</span>
                <strong class="text-deep-charcoal">{booking.checkInDate}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.checkOutLabel}</span>
                <strong class="text-deep-charcoal">{booking.checkOutDate}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.roomsCountLabel}</span>
                <strong class="text-deep-charcoal">{booking.guestsCount} {booking.guestsCount > 1 ? i18n.t.reserve.roomOptionPlural : i18n.t.reserve.roomOptionSingle}</strong>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-label-caps text-xs text-muted-gold tracking-widest uppercase font-semibold">{i18n.t.manageBooking.guestInfoTitle}</h4>
            <div class="space-y-2 text-sm text-on-surface-variant">
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.nameLabel}</span>
                <strong class="text-deep-charcoal">{booking.guestName}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.emailLabel}</span>
                <strong class="text-deep-charcoal">{booking.guestEmail}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.phoneLabel}</span>
                <strong class="text-deep-charcoal">{booking.guestPhone || '—'}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-2">
                <span>{i18n.t.manageBooking.totalStayLabel}</span>
                <strong class="text-deep-charcoal text-base font-headline">{formatPrice(booking.totalPrice)} FCFA</strong>
              </div>
            </div>
          </div>
        </div>

        {#if booking.specialRequests}
          <div class="p-4 bg-surface-container text-xs text-on-surface-variant">
            <strong class="text-deep-charcoal block mb-1">{i18n.t.manageBooking.specialRequestsLabel}</strong>
            {booking.specialRequests}
          </div>
        {/if}

        <!-- Actions -->
        {#if booking.status !== 'cancelled'}
          <div class="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="/contact"
              class="btn-luxury-outline text-xs py-2.5 px-6"
            >
              {i18n.t.manageBooking.modifyRequestBtn}
            </a>

            <form method="POST" action="?/cancel" onsubmit={(e) => { if (!confirm(i18n.t.manageBooking.cancelConfirmPrompt)) e.preventDefault(); }}>
              <input type="hidden" name="reference" value={booking.bookingReference} />
              <input type="hidden" name="email" value={booking.guestEmail} />
              <button
                type="submit"
                class="btn-luxury-dark text-xs py-2.5 px-6"
              >
                {i18n.t.manageBooking.cancelBookingBtn}
              </button>
            </form>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
