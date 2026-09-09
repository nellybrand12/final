<script lang="ts">
  import { 
    Save, 
    AlertCircle, 
    CheckCircle2, 
    Plus, 
    Trash2, 
    Archive, 
    RotateCcw, 
    Building2, 
    BedDouble, 
    Users, 
    Maximize2, 
    Calendar,
    X,
    Sparkles
  } from 'lucide-svelte';
  import ImageField from '$lib/components/admin/ImageField.svelte';

  let { data, form } = $props();
  
  let rooms = $derived(data.rooms || []);

  let activeTab = $state<'all' | 'room' | 'hall' | 'archived'>('all');
  let isCreateOpen = $state(false);

  // New room/hall form state
  let newType = $state<'room' | 'hall'>('hall');

  let filteredRooms = $derived(
    rooms.filter((r: any) => {
      if (activeTab === 'all') return r.status !== 'archived';
      if (activeTab === 'archived') return r.status === 'archived';
      if (activeTab === 'room') return r.type === 'room' && r.status !== 'archived';
      if (activeTab === 'hall') return r.type === 'hall' && r.status !== 'archived';
      return true;
    })
  );

  let counts = $derived({
    all: rooms.filter((r: any) => r.status !== 'archived').length,
    room: rooms.filter((r: any) => r.type === 'room' && r.status !== 'archived').length,
    hall: rooms.filter((r: any) => r.type === 'hall' && r.status !== 'archived').length,
    archived: rooms.filter((r: any) => r.status === 'archived').length
  });

  function formatPrice(val: any) {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  }
</script>

<div class="space-y-6 max-w-6xl">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
        <Building2 class="text-brand-burgundy shrink-0" size={26} />
        Gestion des Chambres & Salles Événementielles
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Configurez l'inventaire, ajustez les prix en temps réel, créez de nouvelles salles de réception et gérez les fiches.
      </p>
    </div>
    
    <button 
      type="button" 
      onclick={() => isCreateOpen = true}
      class="bg-deep-charcoal text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-sm flex items-center gap-2 shrink-0 self-start sm:self-auto"
    >
      <Plus size={18} />
      <span>Ajouter une fiche</span>
    </button>
  </div>

  <!-- Status notifications -->
  {#if form?.success && form?.message}
    <div class="rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3 text-emerald-900 shadow-sm animate-in fade-in">
      <CheckCircle2 class="text-emerald-600 shrink-0 mt-0.5" size={18} />
      <div>
        <p class="text-sm font-medium">{form.message}</p>
      </div>
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3 text-rose-900 shadow-sm animate-in fade-in">
      <AlertCircle class="text-rose-500 shrink-0 mt-0.5" size={18} />
      <div>
        <p class="text-sm font-medium">{form.error}</p>
      </div>
    </div>
  {/if}

  <!-- Filter tabs -->
  <div class="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide">
    <button 
      type="button"
      onclick={() => activeTab = 'all'}
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap {activeTab === 'all' ? 'bg-deep-charcoal text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
    >
      <span>Toutes les fiches actives</span>
      <span class="text-xs px-2 py-0.5 rounded-full {activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'} font-semibold">{counts.all}</span>
    </button>

    <button 
      type="button"
      onclick={() => activeTab = 'room'}
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap {activeTab === 'room' ? 'bg-deep-charcoal text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
    >
      <BedDouble size={16} />
      <span>Chambres & Suites</span>
      <span class="text-xs px-2 py-0.5 rounded-full {activeTab === 'room' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'} font-semibold">{counts.room}</span>
    </button>

    <button 
      type="button"
      onclick={() => activeTab = 'hall'}
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap {activeTab === 'hall' ? 'bg-deep-charcoal text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
    >
      <Building2 size={16} />
      <span>Salles d'Événements</span>
      <span class="text-xs px-2 py-0.5 rounded-full {activeTab === 'hall' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'} font-semibold">{counts.hall}</span>
    </button>

    <button 
      type="button"
      onclick={() => activeTab = 'archived'}
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap {activeTab === 'archived' ? 'bg-amber-800 text-white shadow-sm' : 'text-amber-800 hover:bg-amber-50'}"
    >
      <Archive size={16} />
      <span>Archivées</span>
      <span class="text-xs px-2 py-0.5 rounded-full {activeTab === 'archived' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'} font-semibold">{counts.archived}</span>
    </button>
  </div>

  <!-- Listings List -->
  <div class="space-y-8">
    {#each filteredRooms as room (room.id)}
      <form 
        method="POST" 
        action="?/updateRoom" 
        class="bg-white rounded-2xl shadow-sm border {room.status === 'archived' ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200'} overflow-hidden transition-all hover:shadow-md"
      >
        <input type="hidden" name="id" value={room.id} />
        
        <!-- Card Header -->
        <div class="p-5 sm:px-6 bg-gray-50/75 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center flex-wrap gap-2">
              {#if room.type === 'hall'}
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-burgundy/10 text-brand-burgundy border border-brand-burgundy/20">
                  <Building2 size={12} />
                  Salle d'Événements
                </span>
              {:else}
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <BedDouble size={12} />
                  Chambre / Suite
                </span>
              {/if}

              {#if room.status === 'archived'}
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Archive size={12} />
                  Archivée (Masquée du public)
                </span>
              {:else if room.status === 'maintenance'}
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  En maintenance
                </span>
              {:else}
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Disponible
                </span>
              {/if}

              <span class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                <Calendar size={12} />
                {room.bookingCount} réservation(s)
              </span>
            </div>

            <div class="flex items-baseline gap-2">
              <h3 class="text-lg font-bold text-gray-900">{room.name}</h3>
              <span class="text-xs text-gray-400 font-mono">#{room.id} ({room.slug})</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button 
              type="submit" 
              class="bg-deep-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save size={16} />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Image Section (4 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <div class="aspect-video w-full rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shadow-inner">
              {#if room.imageUrl}
                <img src={room.imageUrl} alt={room.name} class="object-cover w-full h-full" />
              {:else}
                <div class="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                  Aucune photo disponible
                </div>
              {/if}
              <div class="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded text-xs font-bold font-mono">
                {formatPrice(room.pricePerNight)} FCFA {room.type === 'hall' ? '/ évént' : '/ nuit'}
              </div>
            </div>

            <ImageField 
              id="imageUrl_{room.id}" 
              name="imageUrl" 
              value={room.imageUrl} 
              label="Photo principale (Upload ou URL)" 
            />

            <!-- Room Meta pills -->
            <div class="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600">
              <div class="flex items-center gap-1.5">
                <Users size={14} class="text-gray-400" />
                <span>Max: <strong>{room.maxGuests} {room.type === 'hall' ? 'convives' : 'pers.'}</strong></span>
              </div>
              <div class="flex items-center gap-1.5">
                <Maximize2 size={14} class="text-gray-400" />
                <span>Surface: <strong>{room.sizeSqM} m²</strong></span>
              </div>
            </div>
          </div>

          <!-- Fields Section (8 cols) -->
          <div class="lg:col-span-8 space-y-5">
            <!-- Row 1: Titles & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label for="name_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nom de la fiche
                </label>
                <input 
                  type="text" 
                  name="name" 
                  id="name_{room.id}" 
                  value={room.name} 
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
                />
              </div>

              <div>
                <label for="type_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Type d'espace
                </label>
                <select 
                  name="type" 
                  id="type_{room.id}" 
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal bg-white font-medium"
                >
                  <option value="room" selected={room.type === 'room'}>Chambre / Suite</option>
                  <option value="hall" selected={room.type === 'hall'}>Salle d'Événements</option>
                </select>
              </div>
            </div>

            <!-- Row 2: Category & Pricing & Capacity -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div class="sm:col-span-2">
                <label for="category_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Catégorie
                </label>
                <input 
                  type="text" 
                  name="category" 
                  id="category_{room.id}" 
                  value={room.category} 
                  placeholder="Ex: Suite Présidentielle / Salle de Banquet"
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
                />
              </div>

              <div>
                <label for="pricePerNight_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {room.type === 'hall' ? 'Tarif par Événement' : 'Tarif par Nuit'} (FCFA)
                </label>
                <input 
                  type="number" 
                  name="pricePerNight" 
                  id="pricePerNight_{room.id}" 
                  value={room.pricePerNight} 
                  step="1000"
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-semibold text-deep-charcoal focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
                />
              </div>

              <div>
                <label for="status_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Statut
                </label>
                <select 
                  name="status" 
                  id="status_{room.id}" 
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal bg-white"
                >
                  <option value="available" selected={room.status === 'available'}>Disponible</option>
                  <option value="maintenance" selected={room.status === 'maintenance'}>Maintenance</option>
                  <option value="archived" selected={room.status === 'archived'}>Archivé</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Dimensions, Capacity & Inventory -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label for="maxGuests_{room.id}" class="block text-xs font-medium text-gray-600 mb-1">
                  {room.type === 'hall' ? 'Convives max' : 'Hôtes max'}
                </label>
                <input 
                  type="number" 
                  name="maxGuests" 
                  id="maxGuests_{room.id}" 
                  value={room.maxGuests} 
                  min="1"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2.5 text-sm bg-white" 
                />
              </div>

              <div>
                <label for="sizeSqM_{room.id}" class="block text-xs font-medium text-gray-600 mb-1">
                  Superficie (m²)
                </label>
                <input 
                  type="number" 
                  name="sizeSqM" 
                  id="sizeSqM_{room.id}" 
                  value={room.sizeSqM} 
                  min="10"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2.5 text-sm bg-white" 
                />
              </div>

              <div>
                <label for="totalRooms_{room.id}" class="block text-xs font-medium text-gray-600 mb-1">
                  Unités Totales
                </label>
                <input 
                  type="number" 
                  name="totalRooms" 
                  id="totalRooms_{room.id}" 
                  value={room.totalRooms} 
                  min="0"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2.5 text-sm bg-white" 
                />
              </div>

              <div>
                <label for="availableRooms_{room.id}" class="block text-xs font-medium text-gray-600 mb-1">
                  Disponibles
                </label>
                <input 
                  type="number" 
                  name="availableRooms" 
                  id="availableRooms_{room.id}" 
                  value={room.availableRooms} 
                  min="0"
                  class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2.5 text-sm bg-white" 
                />
              </div>

              <div class="flex flex-col items-start justify-center">
                <label for="forceAvailable_{room.id}" class="flex items-center gap-2 cursor-pointer mt-5">
                  <input type="checkbox" id="forceAvailable_{room.id}" name="forceAvailable" class="w-4 h-4 text-deep-charcoal border-gray-300 rounded focus:ring-deep-charcoal" checked={room.forceAvailable} />
                  <span class="text-xs font-semibold text-gray-700">Forcer Dispo. (Override)</span>
                </label>
              </div>
            </div>

            <!-- Row 4: Bed Type / Configuration -->
            <div>
              <label for="bedType_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                {room.type === 'hall' ? 'Configuration & Disposition' : 'Type de Literie'}
              </label>
              <input 
                type="text" 
                name="bedType" 
                id="bedType_{room.id}" 
                value={room.bedType} 
                placeholder={room.type === 'hall' ? 'Ex: Modulable / Banquet, Théâtre & U' : 'Ex: Lit King Size Grand Confort'}
                class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
              />
            </div>

            <!-- Row 5: Descriptions -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="descriptionFr_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description (Français)
                </label>
                <textarea 
                  name="descriptionFr" 
                  id="descriptionFr_{room.id}" 
                  rows="3" 
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs leading-relaxed focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
                >{room.descriptionFr}</textarea>
              </div>

              <div>
                <label for="descriptionEn_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description (English)
                </label>
                <textarea 
                  name="descriptionEn" 
                  id="descriptionEn_{room.id}" 
                  rows="3" 
                  class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs leading-relaxed focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
                >{room.descriptionEn}</textarea>
              </div>
            </div>

            <!-- Row 6: Amenities (Equipment / Services) -->
            <div>
              <label for="amenities_{room.id}" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Équipements & Services (Un élément par ligne)
              </label>
              <textarea 
                name="amenities" 
                id="amenities_{room.id}" 
                rows="3" 
                class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
              >{Array.isArray(room.amenities) ? room.amenities.join('\n') : ''}</textarea>
            </div>
          </div>
        </div>

        <!-- Footer with Safe Delete or Restore action -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs text-gray-500">
            {#if room.bookingCount > 0}
              <span class="text-blue-700 font-medium">ℹ️ {room.bookingCount} réservation(s) liée(s). La suppression archivera automatiquement la fiche sans altérer les factures.</span>
            {:else}
              <span>Fiche sans réservation active. Suppression directe autorisée.</span>
            {/if}
          </div>

          <div class="flex items-center gap-3">
            {#if room.status === 'archived'}
              <button 
                type="submit" 
                formaction="?/restoreRoom" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
                <span>Restaurer la fiche</span>
              </button>
            {:else}
              <button 
                type="submit" 
                formaction="?/deleteRoom" 
                onclick={(e) => {
                  if (room.bookingCount > 0) {
                    if (!confirm(`Cette fiche a ${room.bookingCount} réservation(s). Elle sera archivée et masquée du site tout en préservant l'historique client. Confirmer ?`)) {
                      e.preventDefault();
                    }
                  } else {
                    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${room.name}" ?`)) {
                      e.preventDefault();
                    }
                  }
                }}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                {#if room.bookingCount > 0}
                  <Archive size={14} />
                  <span>Archiver en sécurité</span>
                {:else}
                  <Trash2 size={14} />
                  <span>Supprimer</span>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </form>
    {:else}
      <div class="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-200 text-gray-500 space-y-3">
        <Building2 size={36} class="mx-auto text-gray-300" />
        <p class="text-base font-medium text-gray-800">Aucune fiche ne correspond à ce filtre.</p>
        <p class="text-sm text-gray-400">Cliquez sur « Ajouter une fiche » pour créer une nouvelle chambre ou salle de réception.</p>
      </div>
    {/each}
  </div>
</div>

<!-- Creation Modal -->
{#if isCreateOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/75 sticky top-0 z-10">
        <div>
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} class="text-brand-burgundy" />
            Nouvelle Fiche d'Hébergement ou d'Événement
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Renseignez les détails pour publier une nouvelle offre sur le site.</p>
        </div>
        <button 
          type="button" 
          onclick={() => isCreateOpen = false} 
          class="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Modal Form -->
      <form method="POST" action="?/create" class="p-6 space-y-6">
        
        <!-- Type Selection Toggle -->
        <div>
          <span class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Type d'espace
          </span>
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onclick={() => newType = 'hall'}
              class="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all {newType === 'hall' ? 'border-brand-burgundy bg-brand-burgundy/5 text-brand-burgundy ring-2 ring-brand-burgundy/20' : 'border-gray-200 hover:border-gray-300 text-gray-600'}"
            >
              <Building2 size={18} />
              <span>Salle d'Événements & Banquets</span>
            </button>

            <button 
              type="button" 
              onclick={() => newType = 'room'}
              class="flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all {newType === 'room' ? 'border-deep-charcoal bg-deep-charcoal/5 text-deep-charcoal ring-2 ring-deep-charcoal/20' : 'border-gray-200 hover:border-gray-300 text-gray-600'}"
            >
              <BedDouble size={18} />
              <span>Chambre d'Hôtel ou Suite</span>
            </button>
          </div>
          <input type="hidden" name="type" value={newType} />
        </div>

        <!-- Name & Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="create_name" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nom de la salle ou chambre *
            </label>
            <input 
              type="text" 
              name="name" 
              id="create_name" 
              required 
              placeholder={newType === 'hall' ? 'Ex: Grand Salon Majestueux' : 'Ex: Suite Royale Panoramique'}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>

          <div>
            <label for="create_category" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Catégorie *
            </label>
            <input 
              type="text" 
              name="category" 
              id="create_category" 
              required 
              placeholder={newType === 'hall' ? 'Ex: Salle de Réception & Banquet' : 'Ex: Suite Exécutive'}
              value={newType === 'hall' ? 'Salle de Réception' : 'Suite Luxe'}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>
        </div>

        <!-- Pricing & Capacity -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="create_price" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {newType === 'hall' ? 'Tarif par Événement' : 'Tarif par Nuit'} (FCFA) *
            </label>
            <input 
              type="number" 
              name="pricePerNight" 
              id="create_price" 
              required 
              step="1000"
              placeholder={newType === 'hall' ? '250000' : '85000'}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-semibold focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>

          <div>
            <label for="create_guests" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Capacité max ({newType === 'hall' ? 'convives' : 'hôtes'})
            </label>
            <input 
              type="number" 
              name="maxGuests" 
              id="create_guests" 
              min="1"
              value={newType === 'hall' ? 150 : 2}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>

          <div>
            <label for="create_size" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Superficie (m²)
            </label>
            <input 
              type="number" 
              name="sizeSqM" 
              id="create_size" 
              min="10"
              value={newType === 'hall' ? 200 : 55}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>
        </div>

        <!-- Disposition / Bedding & Inventory -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="create_bed" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {newType === 'hall' ? 'Disposition / Configuration' : 'Type de Literie'}
            </label>
            <input 
              type="text" 
              name="bedType" 
              id="create_bed" 
              value={newType === 'hall' ? 'Modulable / Banquet, U & Conférence' : 'Lit King Size Haute Couture'}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>

          <div>
            <label for="create_total" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nombre d'unités disponibles
            </label>
            <input 
              type="number" 
              name="totalRooms" 
              id="create_total" 
              min="1"
              value={newType === 'hall' ? 1 : 5}
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
            />
          </div>
        </div>

        <!-- Image Upload/URL -->
        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <ImageField 
            id="create_image" 
            name="imageUrl" 
            value="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200" 
            label="Image principale" 
          />
        </div>

        <!-- Tagline & Descriptions -->
        <div>
          <label for="create_tagline" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Accroche / Slogan (Français)
          </label>
          <input 
            type="text" 
            name="taglineFr" 
            id="create_tagline" 
            placeholder="Ex: L'écrin parfait pour vos réceptions d'exception"
            class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal" 
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="create_desc_fr" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description (Français) *
            </label>
            <textarea 
              name="descriptionFr" 
              id="create_desc_fr" 
              rows="3" 
              required
              placeholder="Présentation détaillée de l'espace, ambiance, services..."
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs leading-relaxed focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
            ></textarea>
          </div>

          <div>
            <label for="create_desc_en" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description (English)
            </label>
            <textarea 
              name="descriptionEn" 
              id="create_desc_en" 
              rows="3" 
              placeholder="English description (optional, falls back to French)..."
              class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs leading-relaxed focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
            ></textarea>
          </div>
        </div>

        <!-- Amenities -->
        <div>
          <label for="create_amenities" class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Équipements & Prestations (un par ligne)
          </label>
          <textarea 
            name="amenities" 
            id="create_amenities" 
            rows="3" 
            class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-deep-charcoal focus:border-deep-charcoal"
          >{newType === 'hall' 
            ? "Régie son & micros sans fil\nVidéoprojecteur haute définition 4K\nClimatisation ultra-puissante\nAccès cuisine & office traiteur\nSalon VIP d'attente privé" 
            : "Lit King Size Haute Literie\nWi-Fi fibre ultra-rapide\nSmart TV 65\" 4K\nSalle de bain privative avec douche italienne\nClimatisation silencieuse"}</textarea>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onclick={() => isCreateOpen = false} 
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="bg-deep-charcoal text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-md flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Créer la fiche</span>
          </button>
        </div>

      </form>
    </div>
  </div>
{/if}

