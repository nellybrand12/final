<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let name = $state('');
  let phone = $state('');

  $effect(() => {
    if (data.searchedName) name = data.searchedName;
    if (data.searchedPhone) phone = data.searchedPhone;
  });

  const bookings = $derived(form?.bookings || data.bookings || []);
  const roomsMap = $derived((form?.roomsMap || data.roomsMap || {}) as Record<number, any>);

  // Extend-stay state
  let extendModalBooking = $state<any>(null);
  let extendNewCheckOut = $state('');
  let extendState = $state<'idle' | 'submitting' | 'paying' | 'success' | 'failed'>('idle');
  let extendError = $state<string | null>(null);

  $effect(() => {
    const f = form as any;
    if (f?.extendInitiated && f?.extension) {
      initiateExtensionPayment(f.extension);
    }
    if (f?.extendError) {
      extendError = f.extendError;
      extendState = 'idle';
    }
  });

  async function initiateExtensionPayment(extension: any) {
    extendState = 'paying';
    extendError = null;
    try {
      const res = await fetch('/api/payments/cinetpay/initialize-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extensionId: extension.id,
          guestName: extension.guestName,
          guestEmail: extension.guestEmail,
          guestPhone: extension.guestPhone
        })
      });
      const initData = await res.json();
      if (!res.ok || !initData.success) throw new Error(initData.error || 'Erreur initialisation paiement.');

      // Launch CinetPay SDK
      (window as any).CinetPay?.setConfig({
        apikey: initData.apiKey,
        site_id: initData.siteId,
        notify_url: initData.notifyUrl,
        mode: initData.mode
      });
      (window as any).CinetPay?.getCheckout({
        transaction_id: initData.transactionId,
        amount: initData.amount,
        currency: initData.currency,
        channels: 'ALL',
        description: initData.description,
        customer_name: initData.customer.name,
        customer_surname: initData.customer.surname,
        customer_email: initData.customer.email,
        customer_phone_number: initData.customer.phoneNumber,
        customer_address: initData.customer.address,
        customer_city: initData.customer.city,
        customer_country: initData.customer.country,
        customer_state: initData.customer.state,
        customer_zip_code: initData.customer.zipCode,
        onClose: () => {
          extendState = 'idle';
          extendError = i18n.locale === 'fr' ? 'Paiement annulé.' : 'Payment cancelled.';
        },
        onSuccess: () => {
          extendState = 'success';
          extendModalBooking = null;
        },
        onError: (err: any) => {
          extendState = 'failed';
          extendError = err?.message || 'Échec du paiement.';
        }
      });
    } catch (err: any) {
      extendState = 'failed';
      extendError = err.message || 'Erreur lors du paiement.';
    }
  }

  function formatPrice(amount: string | number | undefined) {
    if (!amount) return '0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }
</script>

<SEO title={i18n.t.manageBooking.metaTitle} description={i18n.t.manageBooking.metaDesc} />

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <!-- Header Title -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold dark:text-muted-gold-dark tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.manageBooking.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-3">
        {i18n.t.manageBooking.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant dark:text-neutral-400">
        {i18n.t.manageBooking.subheading}
      </p>
    </div>

    <!-- Lookup Form Card -->
    <div class="bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 p-6 md:p-10 shadow-sm mb-12">
      <form method="POST" action="?/lookup" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="nameInput" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
              Nom Complet / Full Name
            </label>
            <input
              id="nameInput"
              type="text"
              name="name"
              placeholder="Ex: Jean Dupont"
              bind:value={name}
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 font-headline font-bold focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
              required
            />
          </div>

          <div>
            <label for="phoneInput" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
              Téléphone / Phone Number
            </label>
            <input
              id="phoneInput"
              type="text"
              name="phone"
              placeholder="Ex: +237 6 XX XX XX XX"
              bind:value={phone}
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
              required
            />
          </div>
        </div>

        {#if form?.error}
          <div class="p-4 bg-error-container dark:bg-rose-950/40 text-error dark:text-rose-300 text-xs font-medium border border-error/20 dark:border-rose-800/40 flex items-center gap-3">
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
    {#if bookings.length > 0}
      {#each bookings as booking}
        {@const room = roomsMap[booking.roomId]}
      <div class="bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/40 dark:border-neutral-800 p-6 md:p-10 shadow-lg space-y-8 animate-fade-up">
        <!-- Status Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/30 dark:border-neutral-800 pb-6">
          <div>
            <span class="text-xs font-label-caps text-on-surface-variant dark:text-neutral-400 block uppercase">{i18n.t.manageBooking.fileRef}</span>
            <h3 class="font-headline text-2xl md:text-3xl font-bold text-deep-charcoal dark:text-neutral-100">{booking.bookingReference}</h3>
          </div>

          <div class="flex items-center gap-3">
            {#if booking.status === 'confirmed'}
              <span class="px-3.5 py-1.5 bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800/60 text-xs font-label-caps font-bold flex items-center gap-1.5 uppercase">
                <span class="w-2 h-2 rounded-full bg-green-500 dark:bg-emerald-400"></span>
                {i18n.t.manageBooking.confirmed}
              </span>
            {:else if booking.status === 'cancelled'}
              <span class="px-3.5 py-1.5 bg-red-100 dark:bg-rose-950/60 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-800/60 text-xs font-label-caps font-bold flex items-center gap-1.5 uppercase">
                <span class="w-2 h-2 rounded-full bg-red-500 dark:bg-rose-400"></span>
                {i18n.t.manageBooking.cancelled}
              </span>
            {:else}
              <span class="px-3.5 py-1.5 bg-yellow-100 dark:bg-amber-950/60 text-yellow-800 dark:text-amber-300 border border-yellow-200 dark:border-amber-800/60 text-xs font-label-caps font-bold uppercase">
                {booking.status}
              </span>
            {/if}
          </div>
        </div>

        {#if form?.message && form?.cancelled && booking.status === 'cancelled'}
          <div class="p-4 bg-green-50 dark:bg-emerald-950/40 text-green-800 dark:text-emerald-300 text-xs font-medium border border-green-200 dark:border-emerald-800/40 flex items-center gap-3">
            <span class="material-symbols-outlined">check_circle</span>
            <span>{form.message}</span>
          </div>
        {/if}

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h4 class="font-label-caps text-xs text-muted-gold dark:text-muted-gold-dark tracking-widest uppercase font-semibold">{i18n.t.manageBooking.stayInfoTitle}</h4>
            <div class="space-y-2 text-sm text-on-surface-variant dark:text-neutral-400">
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Salle / Espace :' : 'Venue / Hall:') : i18n.t.manageBooking.roomLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{room?.name || 'Suite Royale'}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Début événement :' : 'Event Start:') : i18n.t.manageBooking.checkInLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{booking.checkInDate}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Fin événement :' : 'Event End:') : i18n.t.manageBooking.checkOutLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{booking.checkOutDate}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Type / Configuration :' : 'Event Type / Setup:') : i18n.t.manageBooking.roomsCountLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">
                  {#if room?.type === 'hall'}
                    1 salle • {booking.eventType || 'Événement'}
                  {:else}
                    {booking.guestsCount} {booking.guestsCount > 1 ? i18n.t.reserve.roomOptionPlural : i18n.t.reserve.roomOptionSingle}
                  {/if}
                </strong>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-label-caps text-xs text-muted-gold dark:text-muted-gold-dark tracking-widest uppercase font-semibold">{i18n.t.manageBooking.guestInfoTitle}</h4>
            <div class="space-y-2 text-sm text-on-surface-variant dark:text-neutral-400">
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{i18n.t.manageBooking.nameLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{booking.guestName}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{i18n.t.manageBooking.emailLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{booking.guestEmail}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{i18n.t.manageBooking.phoneLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-200">{booking.guestPhone || '—'}</strong>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 dark:border-neutral-800 py-2">
                <span>{i18n.t.manageBooking.totalStayLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-100 text-base font-headline">{formatPrice(booking.totalPrice)} FCFA</strong>
              </div>
            </div>
          </div>
        </div>

        {#if booking.specialRequests}
          <div class="p-4 bg-surface-container dark:bg-neutral-800 text-xs text-on-surface-variant dark:text-neutral-300">
            <strong class="text-deep-charcoal dark:text-neutral-100 block mb-1">{i18n.t.manageBooking.specialRequestsLabel}</strong>
            {booking.specialRequests}
          </div>
        {/if}

        <!-- Actions -->
        {#if booking.status !== 'cancelled'}
          <div class="pt-6 border-t border-outline-variant/30 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="/contact"
              class="btn-luxury-outline text-xs py-2.5 px-6"
            >
              {i18n.t.manageBooking.modifyRequestBtn}
            </a>

            <div class="flex items-center gap-3">
              {#if booking.status === 'confirmed' && room?.type !== 'hall'}
                <button
                  type="button"
                  class="btn-luxury-primary text-xs py-2.5 px-6"
                  onclick={() => { extendModalBooking = booking; extendNewCheckOut = ''; extendState = 'idle'; extendError = null; }}
                >
                  {i18n.locale === 'fr' ? '📅 Prolonger le séjour' : '📅 Extend Stay'}
                </button>
              {/if}

              <form method="POST" action="?/cancel" onsubmit={(e) => { 
                const promptMsg = i18n.locale === 'fr' 
                  ? (room?.type === 'hall' 
                      ? 'Êtes-vous certain de vouloir annuler cette réservation de salle ? (Remboursement garanti de 95% si annulé au moins 36h avant l’événement).' 
                      : 'Êtes-vous certain de vouloir annuler cette réservation ? (Remboursement garanti de 95% si annulé au moins 20h avant l’arrivée).')
                  : (room?.type === 'hall'
                      ? 'Are you sure you want to cancel this hall reservation? (95% refund if cancelled at least 36h before event).'
                      : 'Are you sure you want to cancel this booking? (95% refund if cancelled at least 20h before arrival).');
                if (!confirm(promptMsg)) e.preventDefault(); 
              }}>
                <input type="hidden" name="reference" value={booking.bookingReference} />
                <input type="hidden" name="email" value={booking.guestEmail} />
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="phone" value={phone} />
                <button
                  type="submit"
                  class="btn-luxury-dark text-xs py-2.5 px-6"
                >
                  {i18n.t.manageBooking.cancelBookingBtn}
                </button>
              </form>
            </div>
          </div>
        {/if}
      </div>
      {/each}
    {/if}
  </div>
</div>

<!-- Extend Stay Modal -->
{#if extendModalBooking}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-surface dark:bg-neutral-900 border dark:border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-up">
      <div class="flex items-center justify-between">
        <h2 class="font-headline text-xl font-bold text-deep-charcoal dark:text-neutral-100">
          {i18n.locale === 'fr' ? 'Prolonger le Séjour' : 'Extend Your Stay'}
        </h2>
        <button type="button" onclick={() => extendModalBooking = null} class="text-on-surface-variant hover:text-deep-charcoal dark:hover:text-neutral-100 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="text-sm text-on-surface-variant dark:text-neutral-400 space-y-1">
        <p>
          <span class="font-semibold text-deep-charcoal dark:text-neutral-200">{i18n.locale === 'fr' ? 'Départ actuel :' : 'Current checkout:'}</span>
          {extendModalBooking.checkOutDate}
        </p>
        <p class="text-xs">
          {i18n.locale === 'fr'
            ? 'Choisissez une nouvelle date de départ. Le surcoût sera calculé au tarif nuitée habituel.'
            : 'Choose a new checkout date. The extra charge will be calculated at the standard nightly rate.'}
        </p>
      </div>

      {#if extendError}
        <div class="p-3 bg-error-container dark:bg-rose-950/50 text-error dark:text-rose-300 text-xs font-medium rounded-lg flex items-center gap-2 border dark:border-rose-900/50">
          <span class="material-symbols-outlined text-base">error</span>
          {extendError}
        </div>
      {/if}

      {#if extendState === 'success'}
        <div class="p-4 bg-green-50 dark:bg-emerald-950/50 text-green-800 dark:text-emerald-300 text-sm font-medium rounded-lg flex items-center gap-2 border dark:border-emerald-900/50">
          <span class="material-symbols-outlined">check_circle</span>
          {i18n.locale === 'fr' ? 'Prolongation confirmée avec succès !' : 'Stay extension confirmed successfully!'}
        </div>
        <button type="button" onclick={() => extendModalBooking = null} class="btn-luxury-primary w-full text-xs py-3">
          {i18n.locale === 'fr' ? 'Fermer' : 'Close'}
        </button>
      {:else}
        <form method="POST" action="?/extendStay" onsubmit={() => extendState = 'submitting'} class="space-y-4">
          <input type="hidden" name="reference" value={extendModalBooking.bookingReference} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="phone" value={phone} />

          <div>
            <label for="newCheckOut" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5 uppercase">
              {i18n.locale === 'fr' ? 'Nouvelle date de départ' : 'New Checkout Date'}
            </label>
            <input
              id="newCheckOut"
              type="date"
              name="newCheckOut"
              bind:value={extendNewCheckOut}
              min={extendModalBooking.checkOutDate}
              required
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/50 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 font-headline font-bold focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              onclick={() => extendModalBooking = null}
              class="btn-luxury-outline flex-1 text-xs py-3"
              disabled={extendState === 'submitting' || extendState === 'paying'}
            >
              {i18n.locale === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              class="btn-luxury-primary flex-1 text-xs py-3"
              disabled={!extendNewCheckOut || extendState === 'submitting' || extendState === 'paying'}
            >
              {#if extendState === 'submitting' || extendState === 'paying'}
                <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              {/if}
              {i18n.locale === 'fr' ? 'Procéder au paiement' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
