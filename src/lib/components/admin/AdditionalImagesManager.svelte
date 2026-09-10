<script lang="ts">
  import ImageField from './ImageField.svelte';
  import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-svelte';

  let {
    prefix = 'room',
    initialImages = [] as string[]
  } = $props();

  interface ImageItem {
    id: string;
    url: string;
  }

  function createItems(list: string[]): ImageItem[] {
    return (list || []).map((url, i) => ({
      id: `${prefix}_img_${i}_${Math.random().toString(36).substring(2, 7)}`,
      url: url || ''
    }));
  }

  let items = $state<ImageItem[]>(createItems(initialImages));

  function addImage() {
    items.push({
      id: `${Date.now()}_${items.length}_${Math.random().toString(36).substring(2, 7)}`,
      url: ''
    });
  }

  function removeImage(index: number) {
    items.splice(index, 1);
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  }

  function moveDown(index: number) {
    if (index >= items.length - 1) return;
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }
</script>

<div class="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 space-y-3">
  <input type="hidden" name="hasAdditionalImagesManager" value="true" />
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <ImageIcon size={16} class="text-muted-gold dark:text-muted-gold-dark" />
      <span class="text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider">
        Photos secondaires / Galerie
      </span>
      <span class="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
        {items.length}
      </span>
    </div>

    <button
      type="button"
      onclick={addImage}
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 text-deep-charcoal dark:text-neutral-200 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-xs cursor-pointer"
    >
      <Plus size={13} />
      Ajouter une photo
    </button>
  </div>

  {#if items.length === 0}
    <div class="text-center py-4 px-3 bg-gray-50/60 dark:bg-neutral-900/40 rounded-lg border border-dashed border-gray-200 dark:border-neutral-800">
      <p class="text-xs text-gray-500 dark:text-neutral-400">
        Aucune photo secondaire. Cliquez sur "+ Ajouter une photo" pour enrichir la galerie de cette fiche.
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each items as item, index (item.id)}
        <div class="p-3 bg-gray-50 dark:bg-neutral-900/60 rounded-lg border border-gray-200 dark:border-neutral-800 space-y-2.5 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-gray-500 dark:text-neutral-400">
              Photo #{index + 1}
            </span>

            <div class="flex items-center gap-1">
              <button
                type="button"
                onclick={() => moveUp(index)}
                disabled={index === 0}
                title="Monter d'un rang"
                class="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors cursor-pointer"
              >
                <ArrowUp size={13} />
              </button>

              <button
                type="button"
                onclick={() => moveDown(index)}
                disabled={index === items.length - 1}
                title="Descendre d'un rang"
                class="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors cursor-pointer"
              >
                <ArrowDown size={13} />
              </button>

              <button
                type="button"
                onclick={() => removeImage(index)}
                title="Supprimer cette photo"
                class="p-1 rounded text-red-500 hover:text-red-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors ml-1 cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
            <div class="sm:col-span-3">
              <ImageField
                id="{prefix}_add_img_{item.id}"
                label="URL ou Téléversement"
                bind:value={item.url}
              />
              <!-- Hidden input to submit via standard form post -->
              <input type="hidden" name="additionalImages" value={item.url} />
            </div>

            <div class="sm:col-span-1">
              <span class="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Aperçu</span>
              <div class="aspect-video w-full rounded-md border border-gray-200 dark:border-neutral-700 overflow-hidden bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                {#if item.url}
                  <img src={item.url} alt="Aperçu #{index + 1}" class="w-full h-full object-cover" />
                {:else}
                  <span class="text-[10px] text-gray-400 dark:text-neutral-500">Pas d'image</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
