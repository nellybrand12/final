<script lang="ts">
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import { i18n } from '$lib/i18n.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Wizard Steps: 1 = Dates & Rooms, 2 = Guest Info, 3 = Payment & Confirm
  let currentStep = $state(1);
  let selectedRoomId = $state(0);
  let checkIn = $state('');
  let checkOut = $state('');
  let roomsCount = $state(1);
  let eventType = $state('');
  let expectedAttendees = $state(50);

  $effect(() => {
    if (data.preselectedRoom) selectedRoomId = data.preselectedRoom.id;
    if (data.initialCheckIn) checkIn = data.initialCheckIn;
    if (data.initialCheckOut) checkOut = data.initialCheckOut;
    if (data.initialRooms) roomsCount = data.initialRooms;
  });

  let roomAvailability = $state<Record<number, number | null>>({});

  $effect(() => {
    if (checkIn && checkOut) {
      data.rooms.forEach(async (room) => {
        try {
          const res = await fetch(`/api/availability?roomId=${room.id}&checkInDate=${checkIn}&checkOutDate=${checkOut}`);
          if (res.ok) {
            const result = await res.json();
            roomAvailability[room.id] = result.available;
          }
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      roomAvailability = {};
    }
  });

  // Guest Details
  let guestName = $state('');
  let guestEmail = $state('');
  let guestPhone = $state('');
  let specialRequests = $state('');

  // Guest Details extra fields
  let guestAddress = $state('');
  let guestCity = $state('');

  // Payment Method Selection: 'cinetpay' | 'hotel'
  let paymentMethod = $state<'cinetpay' | 'hotel'>('cinetpay');

  // Payment Processing & Polling State
  let activeBookingRef = $state<string | null>(null);
  let activeTransactionId = $state<string | null>(null);
  let paymentStepState = $state<'idle' | 'initiating' | 'pending_approval' | 'verifying' | 'success' | 'failed'>('idle');
  let paymentErrorMessage = $state<string | null>(null);

  let pollingTimer: any = null;

  const isInFlight = $derived(
    paymentStepState === 'initiating' || 
    paymentStepState === 'pending_approval' || 
    paymentStepState === 'verifying'
  );

  const selectedRoom = $derived(
    data.rooms.find(r => r.id === selectedRoomId) || data.rooms[0]
  );

  const nights = $derived.by(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  });

  const totalPrice = $derived.by(() => {
    const base = parseFloat(selectedRoom.pricePerNight);
    const count = selectedRoom.type === 'hall' ? 1 : roomsCount;
    return base * nights * count;
  });

  function formatPrice(amount: string | number) {
    const num = typeof amount === 'string' ? parseFloat(amount.toString()) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }

  function clearTimers() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  function selectPaymentMethod(method: 'cinetpay' | 'hotel') {
    if (paymentMethod === method) return;

    clearTimers();
    paymentMethod = method;
    paymentStepState = 'idle';
    paymentErrorMessage = null;
    activeTransactionId = null;
  }

  function nextStep() {
    if (currentStep === 1) {
      if (!checkIn || !checkOut) return;
      const selectedAvail = roomAvailability[selectedRoomId];
      const count = selectedRoom.type === 'hall' ? 1 : roomsCount;
      if (selectedAvail !== undefined && selectedAvail !== null && selectedAvail < count) {
        form = { error: i18n.locale === 'fr' ? 'Pas assez de chambres disponibles pour ces dates.' : 'Not enough rooms available for these dates.' } as any;
        return;
      }
      if (form) (form as any).error = null;
      currentStep = 2;
    } else if (currentStep === 2) {
      if (!guestName || !guestEmail) return;
      currentStep = 3;
    }
  }

  function prevStep() {
    if (currentStep > 1 && !isInFlight) {
      clearTimers();
      paymentStepState = 'idle';
      paymentErrorMessage = null;
      currentStep--;
    }
  }

  function pollAuthoritativeStatus(transactionId: string, bookingRef: string, email: string) {
    clearTimers();
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2.5s = 75 seconds max polling

    pollingTimer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/cinetpay/check-status/${encodeURIComponent(transactionId)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'confirmed') {
          clearTimers();
          paymentStepState = 'success';
          setTimeout(() => {
            goto(`/confirmation?ref=${encodeURIComponent(bookingRef)}&email=${encodeURIComponent(email)}`);
          }, 1200);
        } else if (data.status === 'failed') {
          clearTimers();
          paymentStepState = 'failed';
          paymentErrorMessage = i18n.t.reserve.paymentFailed;
        } else if (attempts >= maxAttempts) {
          clearTimers();
          paymentErrorMessage = i18n.locale === 'fr'
            ? 'Votre paiement est en cours de traitement par votre opérateur. Vous pourrez télécharger votre reçu officiel dès confirmation de votre séjour.'
            : 'Your payment is being processed by your provider. You will be able to download your official receipt once your booking is confirmed.';
        }
      } catch (err) {
        console.warn('Polling status error:', err);
      }
    }, 2500);
  }

  async function handlePaymentSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (isInFlight) return;

    paymentErrorMessage = null;

    // 1. HOTEL: Pay on arrival
    if (paymentMethod === 'hotel') {
      paymentStepState = 'initiating';

      try {
        const initRes = await fetch('/api/payments/cinetpay/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: selectedRoomId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
            guestName,
            guestEmail,
            guestPhone,
            guestAddress: guestAddress || 'Bastos, Yaoundé',
            guestCity: guestCity || 'Yaoundé',
            guestCountry: 'CM',
            guestsCount: selectedRoom?.type === 'hall' ? 1 : roomsCount,
            specialRequests,
            eventType,
            bookingReference: activeBookingRef
          })
        });

        const initData = await initRes.json();
        if (!initRes.ok || !initData.success) {
          throw new Error(initData.error || 'Erreur lors de la réservation.');
        }

        const ref = initData.bookingReference;
        activeBookingRef = ref;

        const confirmRes = await fetch('/api/payments/hotel/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingReference: ref })
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.success) {
          throw new Error(confirmData.error || 'Erreur lors de la confirmation.');
        }

        paymentStepState = 'success';
        setTimeout(() => {
          goto(`/confirmation?ref=${ref}&email=${encodeURIComponent(guestEmail)}`);
        }, 600);
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Erreur lors de la confirmation.';
      }
      return;
    }

    // 2. CINETPAY SEAMLESS (Popup)
    if (paymentMethod === 'cinetpay') {
      paymentStepState = 'initiating';

      try {
        // Step 1: Call our backend to initialize and generate transaction_id
        const initRes = await fetch('/api/payments/cinetpay/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: selectedRoomId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
            guestName,
            guestEmail,
            guestPhone,
            guestAddress: guestAddress || 'Bastos, Yaoundé',
            guestCity: guestCity || 'Yaoundé',
            guestCountry: 'CM',
            guestsCount: selectedRoom?.type === 'hall' ? 1 : roomsCount,
            specialRequests,
            eventType,
            bookingReference: activeBookingRef
          })
        });

        const initData = await initRes.json();
        if (!initRes.ok || !initData.success) {
          throw new Error(initData.error || 'Erreur lors de l\'initialisation du paiement CinetPay.');
        }

        activeBookingRef = initData.bookingReference;
        activeTransactionId = initData.transactionId;

        // Check if CinetPay Seamless SDK is loaded
        if (typeof window === 'undefined' || !(window as any).CinetPay) {
          throw new Error(
            i18n.locale === 'fr'
              ? 'Le module CinetPay n\'a pas pu être chargé. Veuillez rafraîchir la page ou vérifier votre connexion.'
              : 'CinetPay module could not be loaded. Please refresh the page or check your connection.'
          );
        }

        const CinetPay = (window as any).CinetPay;

        // Configure CinetPay
        CinetPay.setConfig({
          apikey: initData.apiKey,
          site_id: initData.siteId,
          notify_url: initData.notifyUrl,
          mode: initData.mode || 'PRODUCTION'
        });

        // Launch Seamless Checkout Popup
        CinetPay.getCheckout({
          transaction_id: initData.transactionId,
          amount: initData.amount,
          currency: initData.currency || 'XAF',
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
          customer_zip_code: initData.customer.zipCode
        });

        paymentStepState = 'pending_approval';

        // Listen for client-side feedback (non-authoritative)
        CinetPay.waitResponse(async (response: any) => {
          console.log('[CinetPay waitResponse]:', response);
          paymentStepState = 'verifying';
          // Immediately poll authoritative status from our server
          pollAuthoritativeStatus(initData.transactionId, initData.bookingReference, initData.customer.email);
        });

        if (typeof CinetPay.onError === 'function') {
          CinetPay.onError((err: any) => {
            console.warn('[CinetPay onError]:', err);
            paymentStepState = 'failed';
            paymentErrorMessage = err?.message || 'La session de paiement CinetPay a rencontré une erreur.';
          });
        }
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Impossible d\'ouvrir la fenêtre de paiement CinetPay.';
      }
    }
  }

  function handleRetry() {
    clearTimers();
    paymentStepState = 'idle';
    paymentErrorMessage = null;
    handlePaymentSubmit();
  }

  onDestroy(() => {
    clearTimers();
  });
</script>

<svelte:head>
  <title>{i18n.t.reserve.metaTitle}</title>
  <meta name="description" content={i18n.t.reserve.metaDesc} />
  <script src="https://cdn.cinetpay.com/seamless/main.js"></script>
</svelte:head>

<div class="w-full bg-surface py-10 md:py-16">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Title -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.reserve.tag}
      </span>
      <h1 class="font-display-lg text-deep-charcoal mb-3">
        {i18n.t.reserve.heading}
      </h1>
      <p class="font-body-md text-sm text-on-surface-variant">
        {i18n.t.reserve.subheading}
      </p>
    </div>

    <!-- Stepper Navigation -->
    <div class="max-w-3xl mx-auto mb-12">
      <div class="flex items-center justify-between relative">
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant/30 z-0"></div>
        
        <!-- Step 1 Indicator -->
        <button
          type="button"
          disabled={isInFlight}
          onclick={() => (currentStep = 1)}
          class="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none disabled:opacity-50"
        >
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-label-caps text-xs font-bold transition-all duration-300 {currentStep >= 1 ? 'bg-deep-charcoal text-soft-cream shadow-md' : 'bg-surface-container text-on-surface-variant'}">
            1
          </div>
          <span class="font-label-caps text-[10px] hidden sm:block {currentStep === 1 ? 'text-deep-charcoal font-bold' : 'text-on-surface-variant'}">
            {i18n.t.reserve.step1Title}
          </span>
        </button>

        <!-- Step 2 Indicator -->
        <button
          type="button"
          disabled={isInFlight}
          onclick={() => { if (checkIn && checkOut) currentStep = 2; }}
          class="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none disabled:opacity-50"
        >
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-label-caps text-xs font-bold transition-all duration-300 {currentStep >= 2 ? 'bg-deep-charcoal text-soft-cream shadow-md' : 'bg-surface-container text-on-surface-variant'}">
            2
          </div>
          <span class="font-label-caps text-[10px] hidden sm:block {currentStep === 2 ? 'text-deep-charcoal font-bold' : 'text-on-surface-variant'}">
            {i18n.t.reserve.step2Title}
          </span>
        </button>

        <!-- Step 3 Indicator -->
        <button
          type="button"
          disabled={isInFlight}
          onclick={() => { if (guestName && guestEmail) currentStep = 3; }}
          class="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none disabled:opacity-50"
        >
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-label-caps text-xs font-bold transition-all duration-300 {currentStep >= 3 ? 'bg-deep-charcoal text-soft-cream shadow-md' : 'bg-surface-container text-on-surface-variant'}">
            3
          </div>
          <span class="font-label-caps text-[10px] hidden sm:block {currentStep === 3 ? 'text-deep-charcoal font-bold' : 'text-on-surface-variant'}">
            {i18n.t.reserve.step3Title}
          </span>
        </button>
      </div>
    </div>

    <!-- Error Alert if any -->
    {#if form?.error}
      <div class="max-w-4xl mx-auto mb-8 p-4 bg-error-container text-error rounded-xl text-xs font-medium border border-error/20 flex items-center gap-3">
        <span class="material-symbols-outlined">error</span>
        <span>{form.error}</span>
      </div>
    {/if}

    <!-- Multi-Step Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
      <!-- Left Column: Step Content Form -->
      <div class="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-8 shadow-sm">
        <form onsubmit={handlePaymentSubmit} class="space-y-6">
          
          <!-- STEP 1: Room Selection, Dates & Number of Rooms -->
          {#if currentStep === 1}
            <div class="space-y-6 animate-fade-in">
              <h2 class="font-headline text-xl sm:text-2xl text-deep-charcoal font-bold">
                {i18n.t.reserve.step1Heading}
              </h2>

              <!-- Room Selector -->
              <div>
                <span class="block font-label-caps text-xs text-on-surface-variant mb-2">
                  {i18n.t.reserve.selectRoomLabel}
                </span>
                <div class="grid grid-cols-1 gap-3">
                  {#each data.rooms as room}
                    <button
                      type="button"
                      onclick={() => (selectedRoomId = room.id)}
                      class="flex items-center justify-between p-4 border text-left transition-all cursor-pointer {selectedRoomId === room.id ? 'border-muted-gold bg-muted-gold/10 outline outline-1 outline-muted-gold' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant'}"
                    >
                      <div class="flex items-center gap-4">
                        <img src={room.imageUrl} alt={room.name} class="w-16 h-12 object-cover" />
                        <div>
                          <h4 class="font-headline text-base text-deep-charcoal font-bold">{room.name}</h4>
                          <span class="text-xs text-on-surface-variant">{room.category} • Max {room.maxGuests} pers.</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="font-headline text-base sm:text-lg font-bold text-deep-charcoal">{formatPrice(room.pricePerNight)}</span>
                        <span class="text-[10px] font-label-caps text-muted-gold block">{i18n.t.reserve.perNight}</span>
                        {#if checkIn && checkOut}
                          {#if roomAvailability[room.id] !== undefined && roomAvailability[room.id] !== null}
                            <span class="text-[10px] font-label-caps block mt-1 {roomAvailability[room.id]! >= 3 ? 'text-green-600' : 'text-error'}">
                              {roomAvailability[room.id]} {i18n.locale === 'fr' ? 'chambre(s) dispo' : 'rooms avail'}
                            </span>
                          {/if}
                        {:else}
                          <span class="text-[10px] font-label-caps block mt-1 text-on-surface-variant">
                            {i18n.locale === 'fr' ? 'Dates requises' : 'Dates required'}
                          </span>
                        {/if}
                      </div>
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Date Picker Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label for="step1CheckIn" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    {i18n.t.reserve.checkInLabel}
                  </label>
                  <input
                    id="step1CheckIn"
                    type="date"
                    bind:value={checkIn}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                    required
                  />
                </div>
                <div>
                  <label for="step1CheckOut" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    {i18n.t.reserve.checkOutLabel}
                  </label>
                  <input
                    id="step1CheckOut"
                    type="date"
                    bind:value={checkOut}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                    required
                  />
                </div>
              </div>

              <!-- Number of Rooms Selector (Hidden for Halls) -->
              {#if selectedRoom?.type !== 'hall'}
                <div>
                  <label for="step1RoomsCount" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    {i18n.t.reserve.roomsCountLabel}
                  </label>
                  <select
                    id="step1RoomsCount"
                    bind:value={roomsCount}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                  >
                    <option value={1}>1 {i18n.t.reserve.roomOptionSingle}</option>
                    <option value={2}>2 {i18n.t.reserve.roomOptionPlural}</option>
                    <option value={3}>3 {i18n.t.reserve.roomOptionPlural}</option>
                    <option value={4}>4+ {i18n.t.reserve.roomOptionPlural}</option>
                  </select>
                </div>
              {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label for="eventType" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                      Type d'Événement
                    </label>
                    <input
                      id="eventType"
                      type="text"
                      bind:value={eventType}
                      placeholder="Ex: Mariage, Conférence..."
                      class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                      required
                    />
                  </div>
                  <div>
                    <label for="expectedAttendees" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                      Nombre de Personnes
                    </label>
                    <input
                      id="expectedAttendees"
                      type="number"
                      bind:value={expectedAttendees}
                      min="1"
                      class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                      required
                    />
                  </div>
                </div>
              {/if}

              <div class="pt-4 flex justify-end">
                <button
                  type="button"
                  onclick={nextStep}
                  class="btn-luxury-primary text-xs py-2.5 px-6"
                >
                  <span>{i18n.t.reserve.nextStepDetails}</span>
                  <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          {/if}

          <!-- STEP 2: Guest Details -->
          {#if currentStep === 2}
            <div class="space-y-6 animate-fade-in">
              <h2 class="font-headline text-xl sm:text-2xl text-deep-charcoal font-bold">
                {i18n.t.reserve.step2Heading}
              </h2>

              <div>
                <label for="guestName" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                  {i18n.t.reserve.fullNameLabel}
                </label>
                <input
                  id="guestName"
                  type="text"
                  placeholder={i18n.t.reserve.fullNamePlaceholder}
                  bind:value={guestName}
                  class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                  required
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="guestEmail" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    {i18n.t.reserve.emailLabel}
                  </label>
                  <input
                    id="guestEmail"
                    type="email"
                    placeholder={i18n.t.reserve.emailPlaceholder}
                    bind:value={guestEmail}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                    required
                  />
                </div>
                <div>
                  <label for="guestPhone" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    {i18n.t.reserve.phoneLabel}
                  </label>
                  <input
                    id="guestPhone"
                    type="tel"
                    placeholder={i18n.t.reserve.phonePlaceholder}
                    bind:value={guestPhone}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="guestAddress" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    Adresse de facturation (Optionnel)
                  </label>
                  <input
                    id="guestAddress"
                    type="text"
                    placeholder="Ex: Bastos, Yaoundé"
                    bind:value={guestAddress}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                  />
                </div>
                <div>
                  <label for="guestCity" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                    Ville (Optionnel)
                  </label>
                  <input
                    id="guestCity"
                    type="text"
                    placeholder="Ex: Yaoundé"
                    bind:value={guestCity}
                    class="w-full bg-surface-container border border-outline-variant/40 px-4 py-3 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                  />
                </div>
              </div>

              <div>
                <label for="specialRequests" class="block font-label-caps text-xs text-on-surface-variant mb-1.5">
                  {i18n.t.reserve.specialRequestsLabel}
                </label>
                <textarea
                  id="specialRequests"
                  rows="3"
                  placeholder={i18n.t.reserve.specialRequestsPlaceholder}
                  bind:value={specialRequests}
                  class="w-full bg-surface-container border border-outline-variant/40 p-4 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold resize-none"
                ></textarea>
              </div>

              <div class="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onclick={prevStep}
                  class="btn-luxury-outline text-xs py-2 px-5"
                >
                  ← {i18n.t.reserve.prevStep}
                </button>
                <button
                  type="button"
                  onclick={nextStep}
                  class="btn-luxury-primary text-xs py-2.5 px-6"
                >
                  <span>{i18n.t.reserve.nextStepPayment}</span>
                  <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          {/if}

          <!-- STEP 3: Payment Method & Dynamic Panel & Confirmation -->
          {#if currentStep === 3}
            <div class="space-y-6 animate-fade-in">
              <h2 class="font-headline text-xl sm:text-2xl text-deep-charcoal font-bold">
                {i18n.t.reserve.step3Heading}
              </h2>

              <!-- Payment Method Radio Options -->
              <div class="space-y-3">
                <span class="block font-label-caps text-xs text-on-surface-variant mb-2">
                  {i18n.t.reserve.paymentTitle}
                </span>

                <!-- 1. Online Payment via CinetPay Seamless -->
                <label
                  class="flex items-center justify-between p-4 border transition-all cursor-pointer {paymentMethod === 'cinetpay' ? 'border-muted-gold bg-muted-gold/10 outline outline-1 outline-muted-gold' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant/70'}"
                >
                  <div class="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentRadio"
                      value="cinetpay"
                      disabled={isInFlight}
                      checked={paymentMethod === 'cinetpay'}
                      onchange={() => selectPaymentMethod('cinetpay')}
                      class="accent-muted-gold w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span class="font-headline text-base font-bold text-deep-charcoal block">
                        {i18n.t.reserve.payOnlineTitle}
                      </span>
                      <span class="text-xs text-on-surface-variant">
                        {i18n.t.reserve.payOnlineDesc}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap justify-end">
                    <span class="bg-[#FFCC00] text-black font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">MoMo</span>
                    <span class="bg-[#FF7900] text-white font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">OM</span>
                    <span class="font-bold text-xs tracking-wider text-[#1A1F71] bg-white px-1.5 py-0.5 border border-gray-300">VISA</span>
                    <span class="font-bold text-xs tracking-wider text-[#EB001B] bg-white px-1.5 py-0.5 border border-gray-300">MC</span>
                  </div>
                </label>

                <!-- 2. Pay at Hotel -->
                <label
                  class="flex items-center justify-between p-4 border transition-all cursor-pointer {paymentMethod === 'hotel' ? 'border-muted-gold bg-muted-gold/10 outline outline-1 outline-muted-gold' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant/70'}"
                >
                  <div class="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentRadio"
                      value="hotel"
                      disabled={isInFlight}
                      checked={paymentMethod === 'hotel'}
                      onchange={() => selectPaymentMethod('hotel')}
                      class="accent-muted-gold w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span class="font-headline text-base font-bold text-deep-charcoal block">{i18n.t.reserve.payHotelTitle}</span>
                      <span class="text-xs text-on-surface-variant">{i18n.t.reserve.payHotelDesc}</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-muted-gold text-2xl">hotel</span>
                </label>
              </div>

              <!-- ========================================================================= -->
              <!-- DYNAMIC PAYMENT PANEL -->
              <!-- ========================================================================= -->
              <div class="transition-all duration-300">
                <!-- 1. DYNAMIC PANEL: CINETPAY SEAMLESS -->
                {#if paymentMethod === 'cinetpay'}
                  <div class="p-6 bg-surface-container border border-muted-gold/40 space-y-4 animate-fade-in">
                    <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-muted-gold">lock</span>
                        <h4 class="font-headline text-sm font-bold text-deep-charcoal">
                          CinetPay Seamless • {i18n.t.reserve.cinetpaySecurityBadge}
                        </h4>
                      </div>
                      <span class="font-headline text-sm font-bold text-deep-charcoal">
                        {formatPrice(totalPrice)} FCFA
                      </span>
                    </div>

                    {#if paymentStepState === 'initiating'}
                      <div class="p-5 bg-muted-gold/10 border border-muted-gold text-center space-y-2 rounded-sm animate-fade-in">
                        <div class="w-8 h-8 border-2 border-muted-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p class="text-xs text-deep-charcoal font-medium">Préparation du paiement sécurisé CinetPay...</p>
                      </div>
                    {:else if paymentStepState === 'pending_approval'}
                      <div class="p-5 bg-amber-500/10 border border-amber-400 text-center space-y-2 rounded-sm animate-fade-in">
                        <div class="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
                          <span class="material-symbols-outlined text-2xl">open_in_new</span>
                        </div>
                        <p class="text-xs text-deep-charcoal font-medium">
                          {i18n.t.reserve.cinetpayModalOpen}
                        </p>
                      </div>
                    {:else if paymentStepState === 'verifying'}
                      <div class="p-5 bg-muted-gold/10 border border-muted-gold text-center space-y-2 rounded-sm animate-fade-in">
                        <div class="w-8 h-8 border-2 border-muted-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p class="text-xs text-deep-charcoal font-medium">
                          {i18n.t.reserve.cinetpayVerifying}
                        </p>
                      </div>
                    {:else if paymentStepState === 'success'}
                      <div class="p-5 bg-emerald-500/10 border border-emerald-500 text-center space-y-2 rounded-sm animate-fade-in">
                        <span class="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
                        <h5 class="font-headline text-sm font-bold text-emerald-800">
                          {i18n.t.reserve.paymentSuccess}
                        </h5>
                      </div>
                    {:else if paymentStepState === 'failed'}
                      <div class="p-4 bg-rose-500/10 border border-rose-400 text-left space-y-3 rounded-sm animate-fade-in">
                        <div class="flex items-center gap-2 text-rose-700 font-bold text-xs">
                          <span class="material-symbols-outlined text-lg">error</span>
                          <span>{paymentErrorMessage || i18n.t.reserve.paymentFailed}</span>
                        </div>
                        <button
                          type="button"
                          onclick={handleRetry}
                          class="btn-luxury-primary text-[11px] py-1.5 px-4"
                        >
                          <span class="material-symbols-outlined text-xs">refresh</span>
                          <span>Réessayer le paiement</span>
                        </button>
                      </div>
                    {:else}
                      <p class="text-xs text-on-surface-variant leading-relaxed">
                        {i18n.t.reserve.cinetpayPopupNotice}
                      </p>
                    {/if}
                  </div>
                {:else if paymentMethod === 'hotel'}
                  <div class="p-5 bg-surface-container border border-muted-gold/40 space-y-3 animate-fade-in">
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-muted-gold text-xl mt-0.5">verified_user</span>
                      <div class="space-y-1">
                        <h4 class="font-headline text-sm font-bold text-deep-charcoal">
                          {i18n.t.reserve.payHotelTitle}
                        </h4>
                        <p class="font-body-md text-xs text-on-surface-variant leading-relaxed">
                          {i18n.t.reserve.payHotelNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Cancellation & Terms Notice -->
              <div class="p-4 bg-surface-container text-xs text-on-surface-variant leading-relaxed border-l-2 border-muted-gold">
                {#if selectedRoom?.type === 'hall'}
                  <p class="font-medium text-deep-charcoal mb-1">
                    {i18n.locale === 'fr' ? 'Conditions d’annulation de la salle :' : 'Event Hall Cancellation Policy:'}
                  </p>
                  <p>
                    {i18n.locale === 'fr'
                      ? 'En confirmant cette réservation, vous acceptez nos conditions générales. Les annulations effectuées au moins 36 heures avant l’événement bénéficient d’un remboursement garanti de 95%.'
                      : 'By confirming this booking, you accept our general terms. Cancellations made at least 36 hours before the event receive a guaranteed 95% refund.'}
                  </p>
                {:else}
                  <p class="font-medium text-deep-charcoal mb-1">
                    {i18n.locale === 'fr' ? 'Conditions d’annulation de l’hébergement :' : 'Accommodation Cancellation Policy:'}
                  </p>
                  <p>
                    {i18n.locale === 'fr'
                      ? 'En confirmant cette réservation, vous acceptez nos conditions générales. Les annulations effectuées au moins 20 heures avant l’arrivée (check-in) bénéficient d’un remboursement garanti de 95%.'
                      : 'By confirming this booking, you accept our general terms. Cancellations made at least 20 hours before arrival (check-in) receive a guaranteed 95% refund.'}
                  </p>
                {/if}
              </div>

              <!-- Action Buttons -->
              <div class="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isInFlight}
                  onclick={prevStep}
                  class="btn-luxury-outline text-xs py-2 px-5 disabled:opacity-50"
                >
                  ← {i18n.t.reserve.prevStep}
                </button>

                <button
                  type="submit"
                  disabled={isInFlight}
                  class="btn-luxury-primary text-xs py-2.5 px-7 disabled:opacity-60 flex items-center gap-2"
                >
                  {#if isInFlight}
                    <span class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>
                      {paymentStepState === 'initiating'
                        ? 'Initialisation...'
                        : paymentStepState === 'verifying'
                        ? 'Vérification...'
                        : 'En attente de paiement...'}
                    </span>
                  {:else}
                    <span>
                      {paymentMethod === 'cinetpay'
                        ? `${i18n.t.reserve.payNowBtn} • ${formatPrice(totalPrice)} FCFA`
                        : i18n.t.reserve.confirmSubmit}
                    </span>
                    <span class="material-symbols-outlined text-xs">arrow_forward</span>
                  {/if}
                </button>
              </div>
            </div>
          {/if}
        </form>
      </div>

      <!-- Right Column: Live Booking Summary Sidebar -->
      <div class="lg:col-span-5">
        <div class="bg-surface-container border border-outline-variant/40 p-6 md:p-8 space-y-6 sticky top-28 shadow-sm">
          <div class="flex items-center gap-4 border-b border-outline-variant/30 pb-4">
            <img src={selectedRoom.imageUrl} alt={selectedRoom.name} class="w-20 h-16 object-cover" />
            <div>
              <span class="text-[10px] font-label-caps text-muted-gold block font-semibold">{selectedRoom.category}</span>
              <h3 class="font-headline text-xl text-deep-charcoal font-bold">{selectedRoom.name}</h3>
              <span class="text-xs text-on-surface-variant">
                {selectedRoom.sizeSqM} m² • {selectedRoom.type === 'hall' ? (selectedRoom.bedType || 'Modulable') : selectedRoom.bedType}
              </span>
            </div>
          </div>

          <!-- Summary Items -->
          <div class="space-y-3 text-xs text-on-surface-variant">
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{selectedRoom.type === 'hall' ? (i18n.locale === 'fr' ? 'Début événement' : 'Event Start') : i18n.t.reserve.summaryCheckIn}</span>
              <span>{checkIn || i18n.t.reserve.summaryUndefined}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{selectedRoom.type === 'hall' ? (i18n.locale === 'fr' ? 'Fin événement' : 'Event End') : i18n.t.reserve.summaryCheckOut}</span>
              <span>{checkOut || i18n.t.reserve.summaryUndefined}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryDuration}</span>
              <span>
                {#if selectedRoom.type === 'hall'}
                  {nights} {nights > 1 ? (i18n.locale === 'fr' ? 'jours' : 'days') : (i18n.locale === 'fr' ? 'jour' : 'day')}
                {:else}
                  {nights} {i18n.locale === 'fr' ? (nights > 1 ? 'nuits' : 'nuit') : (nights > 1 ? 'nights' : 'night')}
                {/if}
              </span>
            </div>
            {#if selectedRoom.type === 'hall'}
              <div class="flex justify-between">
                <span class="font-medium text-deep-charcoal">{i18n.locale === 'fr' ? 'Type d’événement' : 'Event Type'}</span>
                <span>{eventType || (i18n.locale === 'fr' ? 'Non spécifié' : 'Not specified')}</span>
              </div>
            {:else}
              <div class="flex justify-between">
                <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryRooms}</span>
                <span>{roomsCount} {roomsCount > 1 ? i18n.t.reserve.roomOptionPlural : i18n.t.reserve.roomOptionSingle}</span>
              </div>
            {/if}
          </div>

          <!-- Pricing Breakdown -->
          <div class="border-t border-outline-variant/30 pt-4 space-y-2 text-xs">
            <div class="flex justify-between text-on-surface-variant">
              {#if selectedRoom.type === 'hall'}
                <span>{formatPrice(selectedRoom.pricePerNight)} FCFA × {nights} {nights > 1 ? (i18n.locale === 'fr' ? 'jours' : 'days') : (i18n.locale === 'fr' ? 'jour' : 'day')}</span>
              {:else}
                <span>{formatPrice(selectedRoom.pricePerNight)} FCFA × {nights} × {roomsCount}</span>
              {/if}
              <span class="font-medium text-deep-charcoal">{formatPrice(totalPrice)} FCFA</span>
            </div>
            <div class="flex justify-between text-on-surface-variant">
              <span>{i18n.t.reserve.taxesIncluded}</span>
              <span class="text-green-600 font-medium">{i18n.t.reserve.includedLabel}</span>
            </div>
            <div class="border-t border-outline-variant/30 pt-3 flex justify-between font-headline text-lg font-bold text-deep-charcoal">
              <span>{i18n.t.reserve.totalAmountLabel}</span>
              <span class="text-muted-gold">{formatPrice(totalPrice)} FCFA</span>
            </div>
          </div>

          <div class="pt-2 flex items-center gap-2 text-[10px] font-label-caps text-on-surface-variant/80">
            <span class="material-symbols-outlined text-sm text-muted-gold">verified</span>
            <span>{i18n.t.reserve.conciergeShuttleBadge}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
