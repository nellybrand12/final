<script lang="ts">
  import { Search, Plus, Filter, XCircle, Trash2, X, Check, FileText, Calendar, User, Phone, Banknote, AlertCircle, CheckCircle2, ShieldCheck, Printer } from 'lucide-svelte';
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let reservations = $derived(data.reservations || []);
  let rooms = $derived(data.rooms || []);
  let searchQuery = $state('');

  // Staff role restriction check
  let isStaff = $derived(data.user?.role === 'staff');

  // Walk-in Form Visibility (Always open for staff, toggleable for super_admin)
  let isFormOpen = $state(false);

  $effect(() => {
    if (isStaff) {
      isFormOpen = true;
      initFormDefaults();
    }
  });

  // Walk-in Form Fields
  let guestName = $state('');
  let guestPhone = $state('');
  let selectedRoomId = $state(0);
  let checkInDate = $state('');
  let checkOutDate = $state('');
  let roomsCount = $state(1);
  let attendeesCount = $state(50);
  let specialRequests = $state('');
  let eventType = $state('');

  let isSubmitting = $state(false);
  let availabilityLoading = $state(false);
  let availabilityCount = $state<number | null>(null);
  let availabilityError = $state<string | null>(null);
  let formError = $state<string | null>(null);
  let successBanner = $state<any>(null);

  // Helper date values
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  function initFormDefaults() {
    if (rooms.length > 0 && (!selectedRoomId || !rooms.find((r: any) => r.id === selectedRoomId))) {
      selectedRoomId = rooms[0].id;
    }
    if (!checkInDate) checkInDate = todayStr;
    if (!checkOutDate) checkOutDate = tomorrowStr;
    formError = null;
  }

  function toggleForm() {
    isFormOpen = !isFormOpen;
    if (isFormOpen) {
      initFormDefaults();
    }
  }

  const selectedRoom = $derived(
    rooms.find((r: any) => r.id === selectedRoomId) || rooms[0]
  );

  const isHall = $derived(selectedRoom?.type === 'hall');

  $effect(() => {
    if (isHall && selectedRoom?.capacity) {
      if (attendeesCount > selectedRoom.capacity) {
        attendeesCount = selectedRoom.capacity;
      } else if (attendeesCount < 1) {
        attendeesCount = 1;
      }
    }
  });

  // Pricing calculation matching public flow
  const nights = $derived.by(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  });

  const totalAmount = $derived.by(() => {
    if (!selectedRoom) return 0;
    if (isHall) {
      if (!selectedRoom.pricePerSeat) return 0;
      const perSeat = parseFloat(selectedRoom.pricePerSeat);
      return perSeat * nights * (attendeesCount || 1);
    } else {
      if (!selectedRoom.pricePerNight) return 0;
      const base = parseFloat(selectedRoom.pricePerNight);
      return base * nights * roomsCount;
    }
  });

  // Reactive dynamic availability check
  $effect(() => {
    if (isFormOpen && selectedRoomId && checkInDate && checkOutDate) {
      if (checkInDate < todayStr) {
        availabilityError = "La date d'arrivée ne peut pas être dans le passé.";
        availabilityCount = null;
        return;
      }
      if (checkOutDate < checkInDate) {
        availabilityError = "La date de départ ne peut pas précéder la date d'arrivée.";
        availabilityCount = null;
        return;
      }

      availabilityLoading = true;
      availabilityError = null;

      const currentRoomId = selectedRoomId;
      const cIn = checkInDate;
      const cOut = checkOutDate;

      fetch(`/api/availability?roomId=${currentRoomId}&checkInDate=${cIn}&checkOutDate=${cOut}`)
        .then(res => res.json())
        .then(resData => {
          if (selectedRoomId === currentRoomId && checkInDate === cIn && checkOutDate === cOut) {
            availabilityLoading = false;
            if (resData.available !== undefined) {
              availabilityCount = resData.available;
              const needed = isHall ? 1 : roomsCount;
              if (resData.available < needed) {
                availabilityError = `Capacité insuffisante (${resData.available} disponible(s)) ou dates bloquées par le délai tampon de sécurité.`;
              } else {
                availabilityError = null;
              }
            } else if (resData.error) {
              availabilityError = resData.error;
              availabilityCount = 0;
            }
          }
        })
        .catch(() => {
          if (selectedRoomId === currentRoomId) {
            availabilityLoading = false;
            availabilityCount = null;
          }
        });
    } else {
      availabilityCount = null;
      availabilityError = null;
      availabilityLoading = false;
    }
  });

  let filteredReservations = $derived(
    reservations.filter((r: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.bookingReference && r.bookingReference.toLowerCase().includes(q)) ||
        (r.guestName && r.guestName.toLowerCase().includes(q)) ||
        (r.guestPhone && r.guestPhone.toLowerCase().includes(q)) ||
        (r.roomName && r.roomName.toLowerCase().includes(q)) ||
        (r.paymentTransactionId && r.paymentTransactionId.toLowerCase().includes(q))
      );
    })
  );

  function formatCurrency(amount: number | string) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(num || 0);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
      case 'failed':
      case 'cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }

  function getPaymentBadge(method: string | null | undefined) {
    switch (method) {
      case 'cash':
        return { label: 'Espèces (Comptoir)', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' };
      case 'cinetpay':
        return { label: 'CinetPay en ligne', class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800' };
      case 'hotel':
        return { label: 'Sur place (Arrivée)', class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' };
      default:
        return { label: method || 'Standard', class: 'bg-gray-50 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700' };
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Header with Walk-in Button -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">Réservations</h1>
      <p class="text-xs text-gray-500 dark:text-neutral-400 mt-1">Gestion des réservations en ligne et enregistrement des clients au comptoir.</p>
    </div>

    {#if !isStaff}
      <!-- Toggle Walk-in Reservation Form Button (No redirect link) -->
      <button
        type="button"
        onclick={toggleForm}
        class="bg-deep-charcoal text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black dark:hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
        aria-expanded={isFormOpen}
      >
        {#if isFormOpen}
          <X size={16} />
          <span>Fermer le formulaire</span>
        {:else}
          <Plus size={16} />
          <span>Ajouter une réservation</span>
        {/if}
      </button>
    {/if}
  </div>

  <!-- Success Notification Banner -->
  {#if successBanner}
    <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
      <div class="flex items-start gap-3">
        <CheckCircle2 class="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 class="text-sm font-bold text-emerald-950 dark:text-emerald-200">Réservation enregistrée et confirmée avec succès !</h3>
          <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
            Client : <strong class="font-semibold">{successBanner.guestName}</strong> • Réf. : <span class="font-mono font-bold">{successBanner.bookingReference}</span> • Transaction : <span class="font-mono">{successBanner.paymentTransactionId}</span> • Montant payé en espèces : <strong class="font-semibold">{formatCurrency(successBanner.totalPrice)}</strong>
          </p>
          <span class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">
            ✓ L'inventaire de {successBanner.roomName} a été mis à jour et le paiement comptant a été inscrit dans la vue paiements.
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <a
          href="/api/reservations/{successBanner.bookingReference}/receipt"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors cursor-pointer"
        >
          <Printer size={14} />
          <span>Imprimer le reçu (PDF)</span>
        </a>
        <button
          type="button"
          onclick={() => successBanner = null}
          class="p-1.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
          title="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  {/if}

  <!-- INLINE WALK-IN RESERVATION FORM (Only visible when admin clicks "Ajouter une réservation") -->
  {#if isFormOpen}
    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-md p-6 sm:p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
      <div class="flex items-start justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              Réservation Directe / Comptoir
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              Paiement Espèces
            </span>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-neutral-100 mt-1">
            Enregistrer un client sur place
          </h2>
          <p class="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            Saisie immédiate pour un client physique à la réception. Le statut sera directement « Confirmé » et l'encaissement sera automatiquement consigné dans le journal des paiements.
          </p>
        </div>
        <button
          type="button"
          onclick={toggleForm}
          class="text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fermer le formulaire"
        >
          <X size={20} />
        </button>
      </div>

      {#if formError}
        <div class="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2.5">
          <AlertCircle size={16} class="shrink-0" />
          <span>{formError}</span>
        </div>
      {/if}

      <form
        method="POST"
        action="?/createWalkIn"
        use:enhance={() => {
          isSubmitting = true;
          formError = null;
          return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === 'success' && result.data?.walkInSuccess) {
              successBanner = result.data;
              isFormOpen = false;
              // Reset form inputs
              guestName = '';
              guestPhone = '';
              specialRequests = '';
              eventType = '';
              await update();
            } else if (result.type === 'failure') {
              formError = (result.data as any)?.error ? String((result.data as any).error) : 'Une erreur est survenue lors de l’enregistrement.';
            } else {
              await update();
            }
          };
        }}
        class="space-y-6"
      >
        <!-- Section 1: Guest Information (Name & Phone ONLY) -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
            <User size={14} class="text-[#661f23] dark:text-[#bc9347]" />
            <span>1. Informations du Client</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="walkInName" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                Nom complet du client <span class="text-red-500">*</span>
              </label>
              <input
                id="walkInName"
                type="text"
                name="guestName"
                bind:value={guestName}
                required
                placeholder="Ex: Jean-Paul Kamga"
                class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label for="walkInPhone" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                Numéro de téléphone <span class="text-red-500">*</span>
              </label>
              <input
                id="walkInPhone"
                type="tel"
                name="guestPhone"
                bind:value={guestPhone}
                required
                placeholder="Ex: +237 6 99 00 11 22 ou 699001122"
                class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-neutral-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck size={13} class="text-emerald-600 dark:text-emerald-400" />
            <span>Ces informations serviront d'authentification sur l'espace « Gérer ma réservation » (vérification téléphone + nom).</span>
          </p>
        </div>

        <!-- Section 2: Room / Suite / Event Hall Selection -->
        <div class="pt-2 border-t border-gray-100 dark:border-neutral-800">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
            <Banknote size={14} class="text-[#661f23] dark:text-[#bc9347]" />
            <span>2. Sélection de l'Hébergement ou de la Salle</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="walkInRoomSelect" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                Chambre, Suite ou Salle d'Événement <span class="text-red-500">*</span>
              </label>
              <select
                id="walkInRoomSelect"
                name="roomId"
                bind:value={selectedRoomId}
                required
                class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all cursor-pointer"
              >
                <optgroup label="Chambres & Suites">
                  {#each rooms.filter((r: any) => r.type === 'room') as room}
                    <option value={room.id}>
                      {room.name} — {formatCurrency(room.pricePerNight)} / nuit ({room.availableRooms} dispo)
                    </option>
                  {/each}
                </optgroup>
                <optgroup label="Appartements Résidentiels">
                  {#each rooms.filter((r: any) => r.type === 'apartment') as apt}
                    <option value={apt.id}>
                      {apt.name} — {formatCurrency(apt.pricePerNight)} / nuit ({apt.availableRooms} dispo)
                    </option>
                  {/each}
                </optgroup>
                <optgroup label="Salles d'Événements & Banquets">
                  {#each rooms.filter((r: any) => r.type === 'hall') as hall}
                    <option value={hall.id}>
                      {hall.name} — {formatCurrency(hall.pricePerSeat)} / place (Capacité: {hall.capacity} places)
                    </option>
                  {/each}
                </optgroup>
              </select>
            </div>

            <!-- Number of Rooms (for room/apartment) OR Attendees & Event Type (for halls) -->
            {#if !isHall}
              <div>
                <label for="walkInRoomsCount" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                  Nombre d'hébergements
                </label>
                <select
                  id="walkInRoomsCount"
                  name="roomsCount"
                  bind:value={roomsCount}
                  class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all cursor-pointer"
                >
                  <option value={1}>1 hébergement</option>
                  <option value={2}>2 hébergements</option>
                  <option value={3}>3 hébergements</option>
                  <option value={4}>4 hébergements</option>
                  <option value={5}>5 hébergements</option>
                </select>
                <input type="hidden" name="guestsCount" value={roomsCount} />
              </div>
            {:else}
              <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                <div>
                  <label for="walkInAttendees" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    Places / Convives <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="walkInAttendees"
                    type="number"
                    name="guestsCount"
                    bind:value={attendeesCount}
                    min="1"
                    max={selectedRoom?.capacity || 500}
                    required
                    placeholder="50"
                    class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
                  />
                  <p class="text-[10px] text-gray-500 dark:text-neutral-400 mt-1">
                    Max: {selectedRoom?.capacity || 0} places
                  </p>
                </div>
                <div>
                  <label for="walkInEventType" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                    Type d'événement
                  </label>
                  <input
                    id="walkInEventType"
                    type="text"
                    name="eventType"
                    bind:value={eventType}
                    placeholder="Ex: Conférence, Mariage..."
                    class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section 3: Dates & Availability with Per-Type Buffers -->
        <div class="pt-2 border-t border-gray-100 dark:border-neutral-800">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
            <Calendar size={14} class="text-[#661f23] dark:text-[#bc9347]" />
            <span>3. Dates & Règles de Tampon</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="walkInCheckIn" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                {isHall ? 'Date de l\'événement (Début)' : 'Date d\'arrivée (Check-in)'} <span class="text-red-500">*</span>
              </label>
              <input
                id="walkInCheckIn"
                type="date"
                name="checkInDate"
                bind:value={checkInDate}
                min={todayStr}
                required
                class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label for="walkInCheckOut" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                {isHall ? 'Date de fin de l\'événement' : 'Date de départ (Check-out)'} <span class="text-red-500">*</span>
              </label>
              <input
                id="walkInCheckOut"
                type="date"
                name="checkOutDate"
                bind:value={checkOutDate}
                min={checkInDate || todayStr}
                required
                class="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Buffer Notice & Dynamic Availability Badge -->
          <div class="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-neutral-800/60 rounded-xl border border-gray-200/70 dark:border-neutral-700/70">
            <div class="text-xs text-gray-600 dark:text-neutral-300">
              <span class="font-medium text-gray-900 dark:text-neutral-100">Tampon de sécurité : </span>
              {#if isHall}
                <span class="text-amber-700 dark:text-amber-400 font-medium">48h avant et 24h après</span> l'événement (préparation logistique, sonorisation & nettoyage).
              {:else}
                <span class="text-blue-700 dark:text-blue-400 font-medium">24h avant et 12h après</span> le séjour (aération, ménage et contrôle qualité).
              {/if}
            </div>

            <!-- Dynamic Availability Status Badge -->
            <div class="shrink-0">
              {#if availabilityLoading}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300">
                  <span class="w-2 h-2 rounded-full bg-gray-400 animate-ping"></span>
                  Vérification...
                </span>
              {:else if availabilityError}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                  <XCircle size={14} />
                  Indisponible
                </span>
              {:else if availabilityCount !== null && availabilityCount >= (isHall ? 1 : roomsCount)}
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                  <Check size={14} />
                  Disponible ({availabilityCount} libre(s))
                </span>
              {/if}
            </div>
          </div>

          {#if availabilityError}
            <p class="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{availabilityError}</span>
            </p>
          {/if}
        </div>

        <!-- Section 4: Special Requests (Optional) -->
        <div>
          <label for="walkInSpecialRequests" class="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
            Demandes particulières / Notes de réception (facultatif)
          </label>
          <input
            id="walkInSpecialRequests"
            type="text"
            name="specialRequests"
            bind:value={specialRequests}
            placeholder="Ex: Arrivée tardive, lit bébé supplémentaire, préférence étage..."
            class="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-transparent transition-all"
          />
        </div>

        <!-- Section 5: Computed Price & Instant Confirmation Box -->
        <div class="pt-4 border-t border-gray-100 dark:border-neutral-800 bg-amber-50/50 dark:bg-neutral-800/40 p-4 sm:p-6 rounded-xl border border-amber-200/50 dark:border-neutral-700">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-neutral-400 block">
                Calcul automatique du tarif (Plein tarif comptant)
              </span>
              <div class="text-xs text-gray-600 dark:text-neutral-300 mt-1 space-x-1">
                {#if isHall}
                  <span>{formatCurrency(selectedRoom?.pricePerSeat || 0)}</span>
                  <span>×</span>
                  <span>{attendeesCount} places</span>
                  <span>×</span>
                  <span>{nights} {nights > 1 ? 'jours' : 'jour'}</span>
                {:else}
                  <span>{formatCurrency(selectedRoom?.pricePerNight || 0)}</span>
                  <span>×</span>
                  <span>{nights} {nights > 1 ? 'nuits' : 'nuit'}</span>
                  {#if roomsCount > 1}
                    <span>× {roomsCount} chambres</span>
                  {/if}
                {/if}
              </div>
            </div>

            <div class="text-left sm:text-right">
              <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                Total à encaisser en espèces
              </span>
              <span class="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-neutral-100">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-amber-200/40 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p class="text-[11px] text-gray-500 dark:text-neutral-400">
              ⚡ En cliquant sur <strong>Confirmer</strong>, la réservation sera validée avec le statut <strong>Confirmé</strong> et une transaction de paiement en espèces sera générée dans la base.
            </p>

            <div class="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onclick={() => {
                  if (isStaff) {
                    guestName = '';
                    guestPhone = '';
                    specialRequests = '';
                    eventType = '';
                    initFormDefaults();
                  } else {
                    toggleForm();
                  }
                }}
                disabled={isSubmitting}
                class="px-4 py-2 text-xs font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                {isStaff ? 'Réinitialiser' : 'Annuler'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || availabilityError !== null || (availabilityCount !== null && availabilityCount < (isHall ? 1 : roomsCount))}
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {#if isSubmitting}
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Enregistrement...</span>
                {:else}
                  <Check size={16} />
                  <span>Confirmer la réservation (Espèces)</span>
                {/if}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  {/if}

  {#if !isStaff}
    <!-- RESERVATION LIST TABLE CARD -->
    <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:max-w-xs">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} class="text-gray-400 dark:text-neutral-500" />
          </div>
        <input
          type="text"
          bind:value={searchQuery}
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark"
          placeholder="Rechercher par nom, tél, réf..."
        />
      </div>
      <div class="flex items-center gap-2">
        <form method="GET" class="flex items-center gap-2">
          <Filter size={16} class="text-gray-400 dark:text-neutral-500" />
          <select
            name="status"
            onchange={(e) => e.currentTarget.form?.submit()}
            class="pl-2 pr-8 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 cursor-pointer"
          >
            <option value="all" selected={data.statusFilter === 'all'}>Tous les statuts</option>
            <option value="confirmed" selected={data.statusFilter === 'confirmed'}>Confirmé</option>
            <option value="pending" selected={data.statusFilter === 'pending'}>En attente</option>
            <option value="cancelled" selected={data.statusFilter === 'cancelled'}>Annulé</option>
            <option value="completed" selected={data.statusFilter === 'completed'}>Terminé</option>
          </select>
        </form>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
        <thead class="bg-gray-50 dark:bg-neutral-800/60">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Référence</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Client</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Hébergement / Salle</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Dates</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Règlement</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Statut</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
          {#each filteredReservations as res}
            {@const badge = getPaymentBadge(res.paymentMethod)}
            <tr class="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100">
                <span class="font-mono">{res.bookingReference}</span>
                {#if res.paymentTransactionId}
                  <span class="text-[10px] block font-mono text-gray-400 dark:text-neutral-500">{res.paymentTransactionId}</span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100 font-medium">
                <div>{res.guestName}</div>
                {#if res.guestPhone}
                  <div class="text-xs font-normal text-gray-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                    <Phone size={11} class="text-gray-400" />
                    <span>{res.guestPhone}</span>
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                <div class="font-medium text-gray-800 dark:text-neutral-200">{res.roomName}</div>
                <div class="text-xs text-gray-400 dark:text-neutral-500">
                  {res.roomType === 'hall' ? 'Salle d\'événement' : `${res.guestsCount || 1} chambre(s)`}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                <span class="font-mono text-xs">{res.checkInDate}</span>
                <span class="text-xs text-gray-400 dark:text-neutral-500 mx-1">à</span>
                <span class="font-mono text-xs">{res.checkOutDate}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                <div class="font-semibold text-gray-900 dark:text-neutral-100">{formatCurrency(Number(res.totalPrice))}</div>
                <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold {badge.class}">
                  {badge.label}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full {getStatusColor(res.status)}">
                  {getStatusLabel(res.status)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Print / Download PDF Receipt Link -->
                  <a
                    href="/api/reservations/{res.bookingReference}/receipt"
                    target="_blank"
                    class="p-1.5 text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                    title="Imprimer / Télécharger le reçu PDF"
                  >
                    <FileText size={17} />
                  </a>

                  <!-- Status toggling form -->
                  <form method="POST" action="?/updateStatus">
                    <input type="hidden" name="id" value={res.id} />
                    {#if res.status === 'confirmed'}
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                        title="Annuler la réservation"
                      >
                        <XCircle size={17} />
                      </button>
                    {:else if res.status === 'pending' || res.status === 'cancelled'}
                      <input type="hidden" name="status" value="confirmed" />
                      <button
                        type="submit"
                        class="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors text-xs font-semibold"
                        title="Confirmer"
                      >
                        <Check size={17} />
                      </button>
                    {/if}
                  </form>

                  <!-- Permanent Delete form -->
                  <form
                    method="POST"
                    action="?/delete"
                    onsubmit={(e) => {
                      if (!confirm('Êtes-vous certain de vouloir supprimer DÉFINITIVEMENT cette réservation ? Cela libérera également l\'inventaire lié.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={res.id} />
                    <button
                      type="submit"
                      class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                      title="Supprimer définitivement"
                    >
                      <Trash2 size={17} />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-neutral-400">
                Aucune réservation trouvée.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  {/if}
</div>
