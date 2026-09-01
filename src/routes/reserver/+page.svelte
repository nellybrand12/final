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

  // Guest Details
  let guestName = $state('');
  let guestEmail = $state('');
  let guestPhone = $state('');
  let specialRequests = $state('');

  // Payment Method Selection: 'hotel' | 'mtn_momo' | 'orange_money' | 'card'
  let paymentMethod = $state<'hotel' | 'mtn_momo' | 'orange_money' | 'card'>('hotel');

  // Specific Payment Method Input States
  let momoPhone = $state('');
  let orangePhone = $state('');
  let cardHolder = $state('');
  let cardNumber = $state('');
  let cardExpiry = $state('');
  let cardCvc = $state('');

  // Payment Processing & Polling State
  let activeBookingRef = $state<string | null>(null);
  let activeTransactionId = $state<string | null>(null);
  let paymentStepState = $state<'idle' | 'initiating' | 'pending_approval' | 'processing_card' | 'success' | 'failed' | 'timeout'>('idle');
  let paymentErrorMessage = $state<string | null>(null);

  let pollingTimer: any = null;
  let countdownTimer: any = null;
  let remainingSeconds = $state(120);

  const formattedCountdown = $derived(
    `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
  );

  const isInFlight = $derived(
    paymentStepState === 'initiating' || 
    paymentStepState === 'pending_approval' || 
    paymentStepState === 'processing_card'
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

  // Detect card brand live
  const detectedCardBrand = $derived.by(() => {
    const digits = cardNumber.replace(/\D/g, '');
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    return null;
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
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function selectPaymentMethod(method: 'hotel' | 'mtn_momo' | 'orange_money' | 'card') {
    if (paymentMethod === method) return;

    clearTimers();
    paymentMethod = method;
    paymentStepState = 'idle';
    paymentErrorMessage = null;
    activeTransactionId = null;

    // Reset previous inputs & prefill appropriate defaults
    if (method === 'mtn_momo') {
      momoPhone = guestPhone || '';
    } else if (method === 'orange_money') {
      orangePhone = guestPhone || '';
    } else if (method === 'card') {
      cardHolder = guestName || '';
      cardNumber = '';
      cardExpiry = '';
      cardCvc = '';
    }
  }

  function handleCardNumberInput(e: Event) {
    const target = e.target as HTMLInputElement;
    let val = target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    cardNumber = formatted;
  }

  function handleCardExpiryInput(e: Event) {
    const target = e.target as HTMLInputElement;
    let val = target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      cardExpiry = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    } else {
      cardExpiry = val;
    }
  }

  function handleCardCvcInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cardCvc = target.value.replace(/\D/g, '').substring(0, 4);
  }

  function nextStep() {
    if (currentStep === 1) {
      if (!checkIn || !checkOut) return;
      currentStep = 2;
    } else if (currentStep === 2) {
      if (!guestName || !guestEmail) return;
      if (!momoPhone) momoPhone = guestPhone;
      if (!orangePhone) orangePhone = guestPhone;
      if (!cardHolder) cardHolder = guestName;
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

  async function createOrUpdatePendingBooking(): Promise<string | null> {
    try {
      const res = await fetch('/api/payments/create-pending-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          guestName,
          guestEmail,
          guestPhone,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          roomsCount: selectedRoom?.type === 'hall' ? 1 : roomsCount,
          guestsCount: expectedAttendees,
          eventType: eventType,
          specialRequests,
          paymentMethod,
          existingBookingReference: activeBookingRef
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Erreur lors de la création de la réservation.');
      }

      activeBookingRef = resData.bookingReference;
      return resData.bookingReference;
    } catch (err: any) {
      paymentStepState = 'failed';
      paymentErrorMessage = err.message || 'Erreur serveur lors de la réservation.';
      return null;
    }
  }

  function startPolling(provider: 'mtn_momo' | 'orange_money', transactionId: string) {
    clearTimers();
    remainingSeconds = 120;

    countdownTimer = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        clearTimers();
        paymentStepState = 'timeout';
        paymentErrorMessage = i18n.t.reserve.momoTimeoutWarning;
      }
    }, 1000);

    const endpoint = provider === 'mtn_momo'
      ? `/api/payments/mtn-momo/status/${transactionId}`
      : `/api/payments/orange-money/status/${transactionId}`;

    pollingTimer = setInterval(async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const statusData = await res.json();

        if (statusData.status === 'successful') {
          clearTimers();
          paymentStepState = 'success';
          setTimeout(() => {
            goto(`/confirmation?ref=${activeBookingRef}&email=${encodeURIComponent(guestEmail)}`);
          }, 1200);
        } else if (statusData.status === 'failed') {
          clearTimers();
          paymentStepState = 'failed';
          paymentErrorMessage = statusData.message || i18n.t.reserve.paymentFailed;
        } else if (statusData.status === 'timeout') {
          clearTimers();
          paymentStepState = 'timeout';
          paymentErrorMessage = i18n.t.reserve.momoTimeoutWarning;
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
    }, 3000);
  }

  async function handlePaymentSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (isInFlight) return;

    paymentErrorMessage = null;

    // 1. HOTEL: Pay on arrival
    if (paymentMethod === 'hotel') {
      paymentStepState = 'initiating';
      const ref = await createOrUpdatePendingBooking();
      if (!ref) return;

      try {
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
        }, 500);
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Erreur lors de la confirmation.';
      }
      return;
    }

    // 2. MTN MOBILE MONEY
    if (paymentMethod === 'mtn_momo') {
      if (!momoPhone.trim()) {
        paymentErrorMessage = i18n.locale === 'fr'
          ? 'Veuillez saisir votre numéro MTN Mobile Money.'
          : 'Please enter your MTN Mobile Money phone number.';
        return;
      }

      paymentStepState = 'initiating';
      const ref = await createOrUpdatePendingBooking();
      if (!ref) return;

      try {
        const reqRes = await fetch('/api/payments/mtn-momo/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingReference: ref,
            phone: momoPhone,
            amount: totalPrice
          })
        });

        const reqData = await reqRes.json();
        if (!reqRes.ok || !reqData.success) {
          throw new Error(reqData.message || reqData.error || 'Échec de la demande MTN MoMo.');
        }

        activeTransactionId = reqData.transactionId;
        paymentStepState = 'pending_approval';
        startPolling('mtn_momo', reqData.transactionId);
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Impossible d’envoyer la demande MTN MoMo.';
      }
      return;
    }

    // 3. ORANGE MONEY
    if (paymentMethod === 'orange_money') {
      if (!orangePhone.trim()) {
        paymentErrorMessage = i18n.locale === 'fr'
          ? 'Veuillez saisir votre numéro Orange Money.'
          : 'Please enter your Orange Money phone number.';
        return;
      }

      paymentStepState = 'initiating';
      const ref = await createOrUpdatePendingBooking();
      if (!ref) return;

      try {
        const reqRes = await fetch('/api/payments/orange-money/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingReference: ref,
            phone: orangePhone,
            amount: totalPrice
          })
        });

        const reqData = await reqRes.json();
        if (!reqRes.ok || !reqData.success) {
          throw new Error(reqData.message || reqData.error || 'Échec de la demande Orange Money.');
        }

        activeTransactionId = reqData.transactionId;
        paymentStepState = 'pending_approval';
        startPolling('orange_money', reqData.transactionId);
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Impossible d’envoyer la demande Orange Money.';
      }
      return;
    }

    // 4. CREDIT CARD (VISA / MASTERCARD)
    if (paymentMethod === 'card') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (!cardHolder.trim() || rawCard.length < 15 || !cardExpiry.includes('/') || cardCvc.length < 3) {
        paymentErrorMessage = i18n.locale === 'fr'
          ? 'Veuillez renseigner tous les champs de la carte bancaire.'
          : 'Please complete all credit card fields.';
        return;
      }

      const [expM, expY] = cardExpiry.split('/');

      paymentStepState = 'processing_card';
      const ref = await createOrUpdatePendingBooking();
      if (!ref) return;

      try {
        const cardRes = await fetch('/api/payments/card/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingReference: ref,
            cardHolder,
            cardNumber: rawCard,
            expiryMonth: expM,
            expiryYear: expY,
            cvc: cardCvc,
            amount: totalPrice
          })
        });

        const cardData = await cardRes.json();
        if (!cardRes.ok || !cardData.success) {
          throw new Error(cardData.message || cardData.error || 'Le paiement par carte bancaire a échoué.');
        }

        paymentStepState = 'success';
        setTimeout(() => {
          goto(`/confirmation?ref=${ref}&email=${encodeURIComponent(guestEmail)}`);
        }, 1000);
      } catch (err: any) {
        paymentStepState = 'failed';
        paymentErrorMessage = err.message || 'Échec du paiement par carte bancaire.';
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

                <!-- 1. Pay at hotel -->
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

                <!-- 2. MTN Mobile Money -->
                <label
                  class="flex items-center justify-between p-4 border transition-all cursor-pointer {paymentMethod === 'mtn_momo' ? 'border-[#FFCC00] bg-[#FFCC00]/10 outline outline-1 outline-[#FFCC00]' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant/70'}"
                >
                  <div class="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentRadio"
                      value="mtn_momo"
                      disabled={isInFlight}
                      checked={paymentMethod === 'mtn_momo'}
                      onchange={() => selectPaymentMethod('mtn_momo')}
                      class="accent-[#FFCC00] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-headline text-base font-bold text-deep-charcoal block">{i18n.t.reserve.payMtnTitle}</span>
                        <span class="bg-[#FFCC00] text-black font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">MoMo</span>
                      </div>
                      <span class="text-xs text-on-surface-variant">{i18n.t.reserve.payMtnDesc}</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-[#E5B800] text-2xl">phone_android</span>
                </label>

                <!-- 3. Orange Money -->
                <label
                  class="flex items-center justify-between p-4 border transition-all cursor-pointer {paymentMethod === 'orange_money' ? 'border-[#FF7900] bg-[#FF7900]/10 outline outline-1 outline-[#FF7900]' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant/70'}"
                >
                  <div class="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentRadio"
                      value="orange_money"
                      disabled={isInFlight}
                      checked={paymentMethod === 'orange_money'}
                      onchange={() => selectPaymentMethod('orange_money')}
                      class="accent-[#FF7900] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-headline text-base font-bold text-deep-charcoal block">{i18n.t.reserve.payOrangeTitle}</span>
                        <span class="bg-[#FF7900] text-white font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">OM</span>
                      </div>
                      <span class="text-xs text-on-surface-variant">{i18n.t.reserve.payOrangeDesc}</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-[#FF7900] text-2xl">contactless</span>
                </label>

                <!-- 4. Credit Card (Visa / Mastercard) -->
                <label
                  class="flex items-center justify-between p-4 border transition-all cursor-pointer {paymentMethod === 'card' ? 'border-muted-gold bg-muted-gold/10 outline outline-1 outline-muted-gold' : 'border-outline-variant/40 bg-surface-container hover:bg-surface-variant/70'}"
                >
                  <div class="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentRadio"
                      value="card"
                      disabled={isInFlight}
                      checked={paymentMethod === 'card'}
                      onchange={() => selectPaymentMethod('card')}
                      class="accent-muted-gold w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span class="font-headline text-base font-bold text-deep-charcoal block">{i18n.t.reserve.payCardTitle}</span>
                      <span class="text-xs text-on-surface-variant">{i18n.t.reserve.payCardDesc}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs tracking-wider text-[#1A1F71] bg-white px-2 py-0.5 border border-gray-300">VISA</span>
                    <span class="font-bold text-xs tracking-wider text-[#EB001B] bg-white px-2 py-0.5 border border-gray-300">MC</span>
                  </div>
                </label>
              </div>

              <!-- ========================================================================= -->
              <!-- DYNAMIC PAYMENT PANEL (Renders in space between Credit Card & Cancellation Notice) -->
              <!-- ========================================================================= -->
              <div class="transition-all duration-300">

                <!-- 1. DYNAMIC PANEL: HOTEL (Pay upon arrival) -->
                {#if paymentMethod === 'hotel'}
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

                <!-- 2. DYNAMIC PANEL: MTN MOBILE MONEY -->
                {#if paymentMethod === 'mtn_momo'}
                  <div class="p-6 bg-surface-container border border-[#FFCC00]/50 space-y-5 animate-fade-in">
                    
                    <!-- Header with MTN Badge -->
                    <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                      <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full bg-[#FFCC00] animate-pulse"></span>
                        <h4 class="font-headline text-sm font-bold text-deep-charcoal">
                          MTN Mobile Money
                        </h4>
                      </div>
                      <span class="font-headline text-sm font-bold text-deep-charcoal">
                        {formatPrice(totalPrice)} FCFA
                      </span>
                    </div>

                    <!-- State A: Pending USSD Approval -->
                    {#if paymentStepState === 'pending_approval'}
                      <div class="p-6 bg-amber-500/10 border border-[#FFCC00] text-center space-y-4 rounded-sm animate-fade-in">
                        <div class="w-12 h-12 rounded-full bg-[#FFCC00]/20 text-[#8F7000] flex items-center justify-center mx-auto animate-bounce">
                          <span class="material-symbols-outlined text-2xl">phonelink_ring</span>
                        </div>

                        <div class="space-y-2">
                          <h5 class="font-headline text-base font-bold text-deep-charcoal">
                            {i18n.t.reserve.momoPendingInstruction}
                          </h5>
                          <p class="font-display-lg text-lg sm:text-xl text-[#8F7000] font-bold">
                            {formatPrice(totalPrice)} FCFA
                          </p>
                          <p class="font-mono text-xs text-on-surface-variant font-medium">
                            Numéro ciblé : <span class="font-bold text-deep-charcoal">{momoPhone}</span>
                          </p>
                        </div>

                        <!-- Countdown timer -->
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant/40 text-xs font-mono text-deep-charcoal">
                          <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          <span>Temps restant : <strong>{formattedCountdown}</strong></span>
                        </div>

                        <p class="text-[11px] text-on-surface-variant italic">
                          {i18n.t.reserve.momoWaitingApproval}
                        </p>
                      </div>

                    <!-- State B: Success Animation -->
                    {:else if paymentStepState === 'success'}
                      <div class="p-6 bg-emerald-500/10 border border-emerald-500 text-center space-y-3 rounded-sm animate-fade-in">
                        <span class="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
                        <h5 class="font-headline text-base font-bold text-emerald-800">
                          {i18n.t.reserve.paymentSuccess}
                        </h5>
                      </div>

                    <!-- State C: Failure / Timeout -->
                    {:else if paymentStepState === 'failed' || paymentStepState === 'timeout'}
                      <div class="p-5 bg-rose-500/10 border border-rose-400 text-left space-y-3 rounded-sm animate-fade-in">
                        <div class="flex items-center gap-2 text-rose-700 font-bold text-xs">
                          <span class="material-symbols-outlined text-lg">error</span>
                          <span>{paymentErrorMessage || i18n.t.reserve.paymentFailed}</span>
                        </div>

                        <div class="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onclick={handleRetry}
                            class="btn-luxury-primary text-[11px] py-1.5 px-4"
                          >
                            <span class="material-symbols-outlined text-xs">refresh</span>
                            <span>{i18n.t.reserve.momoRetryBtn}</span>
                          </button>
                        </div>
                      </div>

                    <!-- State D: Idle / Input Form -->
                    {:else}
                      <div class="space-y-3">
                        <label for="momoPhoneInput" class="block font-label-caps text-xs text-on-surface-variant">
                          {i18n.t.reserve.momoPhoneLabel} *
                        </label>
                        <div class="relative">
                          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant font-bold">
                            +237
                          </span>
                          <input
                            id="momoPhoneInput"
                            type="tel"
                            placeholder="6 XX XX XX XX"
                            bind:value={momoPhone}
                            disabled={isInFlight}
                            class="w-full bg-surface-container-lowest border border-outline-variant/50 pl-14 pr-4 py-3 text-sm font-mono text-deep-charcoal focus:outline-none focus:border-[#FFCC00]"
                          />
                        </div>
                        <span class="text-[11px] text-on-surface-variant block">
                          {i18n.t.reserve.payMtnDesc}
                        </span>
                      </div>
                    {/if}
                  </div>
                {/if}

                <!-- 3. DYNAMIC PANEL: ORANGE MONEY -->
                {#if paymentMethod === 'orange_money'}
                  <div class="p-6 bg-surface-container border border-[#FF7900]/50 space-y-5 animate-fade-in">
                    
                    <!-- Header with Orange Badge -->
                    <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                      <div class="flex items-center gap-2.5">
                        <span class="w-3 h-3 rounded-full bg-[#FF7900] animate-pulse"></span>
                        <h4 class="font-headline text-sm font-bold text-deep-charcoal">
                          Orange Money Cameroun
                        </h4>
                      </div>
                      <span class="font-headline text-sm font-bold text-deep-charcoal">
                        {formatPrice(totalPrice)} FCFA
                      </span>
                    </div>

                    <!-- State A: Pending USSD Approval -->
                    {#if paymentStepState === 'pending_approval'}
                      <div class="p-6 bg-orange-500/10 border border-[#FF7900] text-center space-y-4 rounded-sm animate-fade-in">
                        <div class="w-12 h-12 rounded-full bg-[#FF7900]/20 text-[#D45000] flex items-center justify-center mx-auto animate-bounce">
                          <span class="material-symbols-outlined text-2xl">phonelink_ring</span>
                        </div>

                        <div class="space-y-2">
                          <h5 class="font-headline text-base font-bold text-deep-charcoal">
                            {i18n.t.reserve.momoPendingInstruction}
                          </h5>
                          <p class="font-display-lg text-lg sm:text-xl text-[#D45000] font-bold">
                            {formatPrice(totalPrice)} FCFA
                          </p>
                          <p class="font-mono text-xs text-on-surface-variant font-medium">
                            Numéro ciblé : <span class="font-bold text-deep-charcoal">{orangePhone}</span>
                          </p>
                        </div>

                        <!-- Countdown timer -->
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant/40 text-xs font-mono text-deep-charcoal">
                          <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                          <span>Temps restant : <strong>{formattedCountdown}</strong></span>
                        </div>

                        <p class="text-[11px] text-on-surface-variant italic">
                          {i18n.t.reserve.momoWaitingApproval}
                        </p>
                      </div>

                    <!-- State B: Success Animation -->
                    {:else if paymentStepState === 'success'}
                      <div class="p-6 bg-emerald-500/10 border border-emerald-500 text-center space-y-3 rounded-sm animate-fade-in">
                        <span class="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
                        <h5 class="font-headline text-base font-bold text-emerald-800">
                          {i18n.t.reserve.paymentSuccess}
                        </h5>
                      </div>

                    <!-- State C: Failure / Timeout -->
                    {:else if paymentStepState === 'failed' || paymentStepState === 'timeout'}
                      <div class="p-5 bg-rose-500/10 border border-rose-400 text-left space-y-3 rounded-sm animate-fade-in">
                        <div class="flex items-center gap-2 text-rose-700 font-bold text-xs">
                          <span class="material-symbols-outlined text-lg">error</span>
                          <span>{paymentErrorMessage || i18n.t.reserve.paymentFailed}</span>
                        </div>

                        <div class="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onclick={handleRetry}
                            class="btn-luxury-primary text-[11px] py-1.5 px-4"
                          >
                            <span class="material-symbols-outlined text-xs">refresh</span>
                            <span>{i18n.t.reserve.momoRetryBtn}</span>
                          </button>
                        </div>
                      </div>

                    <!-- State D: Idle / Input Form -->
                    {:else}
                      <div class="space-y-3">
                        <label for="orangePhoneInput" class="block font-label-caps text-xs text-on-surface-variant">
                          {i18n.t.reserve.momoPhoneLabel} *
                        </label>
                        <div class="relative">
                          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant font-bold">
                            +237
                          </span>
                          <input
                            id="orangePhoneInput"
                            type="tel"
                            placeholder="6 XX XX XX XX"
                            bind:value={orangePhone}
                            disabled={isInFlight}
                            class="w-full bg-surface-container-lowest border border-outline-variant/50 pl-14 pr-4 py-3 text-sm font-mono text-deep-charcoal focus:outline-none focus:border-[#FF7900]"
                          />
                        </div>
                        <span class="text-[11px] text-on-surface-variant block">
                          {i18n.t.reserve.payOrangeDesc}
                        </span>
                      </div>
                    {/if}
                  </div>
                {/if}

                <!-- 4. DYNAMIC PANEL: CREDIT CARD (VISA / MASTERCARD) -->
                {#if paymentMethod === 'card'}
                  <div class="p-6 bg-surface-container border border-muted-gold/40 space-y-4 animate-fade-in">
                    
                    <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-muted-gold">credit_card</span>
                        <h4 class="font-headline text-sm font-bold text-deep-charcoal">
                          {i18n.t.reserve.payCardTitle}
                        </h4>
                      </div>
                      <div class="flex items-center gap-1">
                        <span class="text-[10px] font-label-caps text-muted-gold font-bold">{detectedCardBrand || 'SSL SECURE'}</span>
                      </div>
                    </div>

                    <!-- Failure Banner -->
                    {#if paymentStepState === 'failed'}
                      <div class="p-3.5 bg-rose-500/10 border border-rose-400 text-rose-700 text-xs flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">error</span>
                        <span>{paymentErrorMessage || i18n.t.reserve.paymentFailed}</span>
                      </div>
                    {/if}

                    <div class="space-y-4">
                      <!-- Cardholder Name -->
                      <div>
                        <label for="cardHolderInput" class="block font-label-caps text-xs text-on-surface-variant mb-1">
                          {i18n.t.reserve.cardHolderLabel} *
                        </label>
                        <input
                          id="cardHolderInput"
                          type="text"
                          placeholder={i18n.t.reserve.cardHolderPlaceholder}
                          bind:value={cardHolder}
                          disabled={isInFlight}
                          class="w-full bg-surface-container-lowest border border-outline-variant/40 px-4 py-2.5 text-sm text-deep-charcoal focus:outline-none focus:border-muted-gold"
                        />
                      </div>

                      <!-- Card Number -->
                      <div>
                        <label for="cardNumberInput" class="block font-label-caps text-xs text-on-surface-variant mb-1">
                          {i18n.t.reserve.cardNumberLabel} *
                        </label>
                        <div class="relative">
                          <input
                            id="cardNumberInput"
                            type="text"
                            placeholder="4532 •••• •••• ••••"
                            value={cardNumber}
                            oninput={handleCardNumberInput}
                            disabled={isInFlight}
                            class="w-full bg-surface-container-lowest border border-outline-variant/40 px-4 py-2.5 text-sm font-mono text-deep-charcoal focus:outline-none focus:border-muted-gold"
                          />
                          {#if detectedCardBrand}
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-muted-gold/20 text-muted-gold px-2 py-0.5">
                              {detectedCardBrand}
                            </span>
                          {/if}
                        </div>
                      </div>

                      <!-- Expiry & CVC Grid -->
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label for="cardExpiryInput" class="block font-label-caps text-xs text-on-surface-variant mb-1">
                            {i18n.t.reserve.cardExpiryLabel} *
                          </label>
                          <input
                            id="cardExpiryInput"
                            type="text"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            oninput={handleCardExpiryInput}
                            disabled={isInFlight}
                            class="w-full bg-surface-container-lowest border border-outline-variant/40 px-4 py-2.5 text-sm font-mono text-deep-charcoal focus:outline-none focus:border-muted-gold text-center"
                          />
                        </div>
                        <div>
                          <label for="cardCvcInput" class="block font-label-caps text-xs text-on-surface-variant mb-1">
                            {i18n.t.reserve.cardCvcLabel} *
                          </label>
                          <input
                            id="cardCvcInput"
                            type="password"
                            placeholder="•••"
                            value={cardCvc}
                            oninput={handleCardCvcInput}
                            disabled={isInFlight}
                            class="w-full bg-surface-container-lowest border border-outline-variant/40 px-4 py-2.5 text-sm font-mono text-deep-charcoal focus:outline-none focus:border-muted-gold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Cancellation & Terms Notice -->
              <div class="p-4 bg-surface-container text-xs text-on-surface-variant leading-relaxed">
                {i18n.t.reserve.termsNotice}
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
                      {paymentMethod === 'card' 
                        ? i18n.t.reserve.cardProcessing 
                        : (paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money')
                        ? i18n.t.reserve.momoSending
                        : 'Validation...'}
                    </span>
                  {:else}
                    <span>
                      {paymentMethod === 'card'
                        ? `${i18n.t.reserve.cardPayBtn} ${formatPrice(totalPrice)} FCFA`
                        : (paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money')
                        ? i18n.t.reserve.momoSendBtn
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
              <span class="text-xs text-on-surface-variant">{selectedRoom.sizeSqM} m² • {selectedRoom.bedType}</span>
            </div>
          </div>

          <!-- Summary Items -->
          <div class="space-y-3 text-xs text-on-surface-variant">
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryCheckIn}</span>
              <span>{checkIn || i18n.t.reserve.summaryUndefined}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryCheckOut}</span>
              <span>{checkOut || i18n.t.reserve.summaryUndefined}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryDuration}</span>
              <span>{nights} {i18n.locale === 'fr' ? (nights > 1 ? 'nuits' : 'nuit') : (nights > 1 ? 'nights' : 'night')}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium text-deep-charcoal">{i18n.t.reserve.summaryRooms}</span>
              <span>{roomsCount} {roomsCount > 1 ? i18n.t.reserve.roomOptionPlural : i18n.t.reserve.roomOptionSingle}</span>
            </div>
          </div>

          <!-- Pricing Breakdown -->
          <div class="border-t border-outline-variant/30 pt-4 space-y-2 text-xs">
            <div class="flex justify-between text-on-surface-variant">
              <span>{formatPrice(selectedRoom.pricePerNight)} FCFA × {nights} × {roomsCount}</span>
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
