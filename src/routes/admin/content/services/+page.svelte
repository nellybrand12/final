<script lang="ts">
  import { Save, AlertCircle, Plus, Trash2 } from 'lucide-svelte';

  let { data, form } = $props();
  
  let services = $derived(data.services);
  let showNewService = $state(false);
</script>

<div class="space-y-6 max-w-5xl">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Services Management</h1>
    <button onclick={() => showNewService = !showNewService} class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
      <Plus size={16} />
      <span>Nouvel Service</span>
    </button>
  </div>

  {#if form?.success}
    <div class="rounded-md bg-green-50 p-4 border border-green-200 flex items-start">
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Service updated successfully.</h3>
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

  
  {#if showNewService}
  <div class="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-6 mb-6">
    <h3 class="text-lg font-bold mb-4">Créer un nouveau service</h3>
    <form method="POST" action="?/createService" class="space-y-4">
      <div>
        <label for="new_id" class="block text-sm font-medium text-gray-700">Slug (ID Unique)</label>
        <input type="text" name="id" id="new_id" placeholder="ex: massage-spa" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="new_nameFr" class="block text-sm font-medium text-gray-700">Nom (Fr)</label>
          <input type="text" name="nameFr" id="new_nameFr" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
        </div>
        <div>
          <label for="new_nameEn" class="block text-sm font-medium text-gray-700">Nom (En)</label>
          <input type="text" name="nameEn" id="new_nameEn" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
        </div>
        <div>
          <label for="new_descFr" class="block text-sm font-medium text-gray-700">Description (Fr)</label>
          <textarea name="descriptionFr" id="new_descFr" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required></textarea>
        </div>
        <div>
          <label for="new_descEn" class="block text-sm font-medium text-gray-700">Description (En)</label>
          <textarea name="descriptionEn" id="new_descEn" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required></textarea>
        </div>
        <div>
          <label for="new_icon" class="block text-sm font-medium text-gray-700">Icon (Material Symbol)</label>
          <input type="text" name="icon" id="new_icon" placeholder="ex: spa" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
        </div>
        <div>
          <label for="new_ctaLink" class="block text-sm font-medium text-gray-700">CTA Link</label>
          <input type="text" name="ctaLink" id="new_ctaLink" placeholder="/contact" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" required />
        </div>
      </div>
      <button type="submit" class="bg-deep-charcoal text-white px-4 py-2 rounded-md mt-4 font-medium">Créer</button>
    </form>
  </div>
  {/if}

  <div class="grid grid-cols-1 gap-6">
    {#each services as service}
      <form method="POST" action="?/updateService" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <input type="hidden" name="id" value={service.id} />
        
        <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-deep-charcoal text-white flex items-center justify-center font-bold">
              {service.nameFr[0] || '?'}
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{service.nameFr}</h3>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button type="submit" class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
              <Save size={16} />
              <span>Save</span>
            </button>
            <button type="submit" formaction="?/deleteService" onclick={(e) => { if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) e.preventDefault(); }} class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Français</h4>
            <div>
              <label for="nameFr_{service.id}" class="block text-sm font-medium text-gray-700">Nom du Service</label>
              <input type="text" name="nameFr" id="nameFr_{service.id}" value={service.nameFr} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
            <div>
              <label for="highlightFr_{service.id}" class="block text-sm font-medium text-gray-700">Surlignage (Highlight)</label>
              <input type="text" name="highlightFr" id="highlightFr_{service.id}" value={service.highlightFr} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
            <div>
              <label for="descriptionFr_{service.id}" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="descriptionFr" id="descriptionFr_{service.id}" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm">{service.descriptionFr}</textarea>
            </div>
            <div>
              <label for="ctaTextFr_{service.id}" class="block text-sm font-medium text-gray-700">Bouton Call-to-Action</label>
              <input type="text" name="ctaTextFr" id="ctaTextFr_{service.id}" value={service.ctaTextFr} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
          </div>
          
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">English</h4>
            <div>
              <label for="nameEn_{service.id}" class="block text-sm font-medium text-gray-700">Service Name</label>
              <input type="text" name="nameEn" id="nameEn_{service.id}" value={service.nameEn} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
            <div>
              <label for="highlightEn_{service.id}" class="block text-sm font-medium text-gray-700">Highlight</label>
              <input type="text" name="highlightEn" id="highlightEn_{service.id}" value={service.highlightEn} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
            <div>
              <label for="descriptionEn_{service.id}" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="descriptionEn" id="descriptionEn_{service.id}" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm">{service.descriptionEn}</textarea>
            </div>
            <div>
              <label for="ctaTextEn_{service.id}" class="block text-sm font-medium text-gray-700">Call-to-Action Button</label>
              <input type="text" name="ctaTextEn" id="ctaTextEn_{service.id}" value={service.ctaTextEn} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
          </div>

          <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label for="icon_{service.id}" class="block text-sm font-medium text-gray-700">Icon Name (Material Symbols)</label>
              <input type="text" name="icon" id="icon_{service.id}" value={service.icon} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
            <div>
              <label for="ctaLink_{service.id}" class="block text-sm font-medium text-gray-700">Call-to-Action Link</label>
              <input type="text" name="ctaLink" id="ctaLink_{service.id}" value={service.ctaLink} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
            </div>
          </div>
          
        </div>
      </form>
    {:else}
      <div class="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 text-gray-500">
        No services available to edit.
      </div>
    {/each}
  </div>
</div>
