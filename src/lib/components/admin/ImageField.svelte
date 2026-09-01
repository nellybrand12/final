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
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
    <div class="flex bg-gray-100 p-0.5 rounded-md">
      <button 
        type="button" 
        onclick={() => mode = 'url'} 
        class="px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors {mode === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}"
      >
        <LinkIcon size={12} />
        URL
      </button>
      <button 
        type="button" 
        onclick={() => mode = 'upload'} 
        class="px-2 py-1 text-xs font-medium rounded-sm flex items-center gap-1 transition-colors {mode === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}"
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
      class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" 
    />
  {:else}
    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group hover:border-deep-charcoal transition-colors bg-gray-50">
      <div class="space-y-1 text-center">
        {#if isUploading}
          <Loader2 class="mx-auto h-8 w-8 text-gray-400 animate-spin" />
          <p class="text-sm text-gray-500">Téléversement...</p>
        {:else}
          <UploadCloud class="mx-auto h-8 w-8 text-gray-400 group-hover:text-deep-charcoal transition-colors" />
          <div class="flex text-sm text-gray-600 justify-center">
            <label for="file-upload-{id}" class="relative cursor-pointer bg-white rounded-md font-medium text-deep-charcoal hover:text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-deep-charcoal px-2 py-0.5">
              <span>Choisir un fichier</span>
              <input id="file-upload-{id}" type="file" class="sr-only" accept="image/*" onchange={handleFileUpload}>
            </label>
          </div>
          <p class="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
        {/if}
      </div>
    </div>
    {#if uploadError}
      <p class="text-xs text-red-500 mt-1">{uploadError}</p>
    {/if}
  {/if}

  {#if currentValue}
    <p class="text-xs text-gray-500 truncate mt-1 break-all">URL: {currentValue}</p>
  {/if}
</div>
