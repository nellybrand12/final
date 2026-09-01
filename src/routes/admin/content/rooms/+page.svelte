<script lang="ts">
  import { Save, AlertCircle } from 'lucide-svelte';
  import ImageField from '$lib/components/admin/ImageField.svelte';

  let { data, form } = $props();
  
  let rooms = $derived(data.rooms);
</script>

<div class="space-y-6 max-w-5xl">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Inventaire des Chambres</h1>
  </div>

  {#if form?.success}
    <div class="rounded-md bg-green-50 p-4 border border-green-200 flex items-start">
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Chambre mise à jour avec succès.</h3>
      </div>
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-md bg-red-50 p-4 border border-red-200 flex items-start">
      <AlertCircle class="text-red-400 shrink-0 mt-0.5" size={16} />
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">{form.error}</h3>
      </div>
    </div>
  {/if}

  <div class="space-y-8">
    {#each rooms as room}
      <form method="POST" action="?/updateRoom" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <input type="hidden" name="id" value={room.id} />
        
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{room.name}</h3>
            <p class="text-sm text-gray-500 mt-1">Catégorie: {room.category}</p>
          </div>
          <button type="submit" class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
            <Save size={16} />
            <span>Enregistrer</span>
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Image preview -->
          <div class="col-span-1 space-y-4">
            <div class="mb-4">
              <ImageField 
                id="imageUrl_{room.id}" 
                name="imageUrl" 
                value={room.imageUrl} 
                label="URL de l'image principale" 
              />
            </div>
            <div class="aspect-video w-full rounded-md bg-gray-100 border border-gray-200 overflow-hidden relative">
              {#if room.imageUrl}
                <img src={room.imageUrl} alt={room.name} class="object-cover w-full h-full" />
              {:else}
                <div class="flex items-center justify-center w-full h-full text-gray-400">Aucune image</div>
              {/if}
            </div>
          </div>

          <!-- Fields -->
          <div class="col-span-1 lg:col-span-2 space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label for="pricePerNight_{room.id}" class="block text-sm font-medium text-gray-700">Prix par Nuit (FCFA)</label>
                <input type="number" name="pricePerNight" id="pricePerNight_{room.id}" value={room.pricePerNight} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <label for="totalRooms_{room.id}" class="block text-sm font-medium text-gray-700">Total Chambres</label>
                <input type="number" name="totalRooms" id="totalRooms_{room.id}" value={room.totalRooms} min="0" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
              </div>
              <div>
                <label for="availableRooms_{room.id}" class="block text-sm font-medium text-gray-700">Disponibles</label>
                <input type="number" name="availableRooms" id="availableRooms_{room.id}" value={room.availableRooms} min="0" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
              </div>
              <div>
                <label for="inUseRooms_{room.id}" class="block text-sm font-medium text-gray-700">Occupées</label>
                <input type="number" name="inUseRooms" id="inUseRooms_{room.id}" value={room.inUseRooms} min="0" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label for="descriptionFr_{room.id}" class="block text-sm font-medium text-gray-700">Description (Français)</label>
                <textarea name="descriptionFr" id="descriptionFr_{room.id}" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm">{room.descriptionFr}</textarea>
              </div>
              <div>
                <label for="descriptionEn_{room.id}" class="block text-sm font-medium text-gray-700">Description (English)</label>
                <textarea name="descriptionEn" id="descriptionEn_{room.id}" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm">{room.descriptionEn}</textarea>
              </div>
            </div>
          </div>
          
        </div>
      </form>
    {:else}
      <div class="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 text-gray-500">
        Aucune chambre disponible pour modification.
      </div>
    {/each}
  </div>
</div>
