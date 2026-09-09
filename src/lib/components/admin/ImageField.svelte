<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-svelte';

  let { 
    id = '', 
    name = '', 
    value = '', 
    label = "URL de l'image" 
  } = $props();

  let mode = $state<'url' | 'upload'>('url');
  let isUploading = $state(false);
  let uploadError = $state('');
  
  let currentValue = $state('');
  
  $effect(() => {
    currentValue = value || '';
  });

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    isUploading = true;
    uploadError = '';

    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      currentValue = publicUrlData.publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      uploadError = err.message || 'Erreur lors du téléversement';
    } finally {
      isUploading = false;
    }
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between">
    <label for={id} class="block text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</label>
    <div class="flex bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-md">
      <button 
        type="button" 
        onclick={() => mode = 'url'} 
        class="px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors {mode === 'url' ? 'bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-neutral-100' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}"
      >
        <LinkIcon size={12} />
        URL
      </button>
      <button 
        type="button" 
        onclick={() => mode = 'upload'} 
        class="px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors {mode === 'upload' ? 'bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-neutral-100' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}"
      >
        <UploadCloud size={12} />
        Upload
      </button>
    </div>
  </div>

  <input type="hidden" {name} {id} bind:value={currentValue} />

  {#if mode === 'url'}
    <input 
      type="text" 
      bind:value={currentValue} 
      placeholder="https://..." 
      class="block w-full border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark sm:text-sm" 
    />
  {:else}
    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-neutral-700 border-dashed rounded-md relative group hover:border-deep-charcoal dark:hover:border-neutral-500 transition-colors bg-gray-50 dark:bg-neutral-800/50">
      <div class="space-y-1 text-center">
        {#if isUploading}
          <Loader2 class="mx-auto h-8 w-8 text-gray-400 dark:text-neutral-500 animate-spin" />
          <p class="text-sm text-gray-500 dark:text-neutral-400">Téléversement...</p>
        {:else}
          <UploadCloud class="mx-auto h-8 w-8 text-gray-400 dark:text-neutral-500 group-hover:text-deep-charcoal dark:group-hover:text-neutral-300 transition-colors" />
          <div class="flex text-sm text-gray-600 dark:text-neutral-400 justify-center">
            <label for="file-upload-{id}" class="relative cursor-pointer bg-white dark:bg-neutral-700 rounded-md font-medium text-deep-charcoal dark:text-neutral-100 hover:text-black dark:hover:text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-deep-charcoal dark:focus-within:ring-brand-burgundy-dark px-2 py-0.5">
              <span>Choisir un fichier</span>
              <input id="file-upload-{id}" type="file" class="sr-only" accept="image/*" onchange={handleFileUpload}>
            </label>
          </div>
          <p class="text-xs text-gray-500 dark:text-neutral-400">PNG, JPG, GIF (Max 5MB)</p>
        {/if}
      </div>
    </div>
    {#if uploadError}
      <p class="text-xs text-red-500 dark:text-rose-400 mt-1">{uploadError}</p>
    {/if}
  {/if}

  {#if currentValue}
    <p class="text-xs text-gray-500 dark:text-neutral-400 truncate mt-1 break-all">URL: {currentValue}</p>
  {/if}
</div>
