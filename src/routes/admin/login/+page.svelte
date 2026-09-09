<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { themeManager } from '$lib/theme.svelte';
  import { Sun, Moon } from 'lucide-svelte';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Admin Login - Résidence Madadjeu</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 relative">
  <!-- Theme Toggle in Corner -->
  <div class="absolute top-6 right-6">
    <button
      type="button"
      onclick={() => themeManager.toggle('admin')}
      class="p-2.5 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 hover:dark:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-gold shadow-sm"
      role="switch"
      aria-checked={themeManager.isDark}
      aria-label={themeManager.isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={themeManager.isDark ? "Mode clair" : "Mode sombre"}
    >
      {#if themeManager.isDark}
        <Sun size={18} class="text-muted-gold" />
      {:else}
        <Moon size={18} />
      {/if}
    </button>
  </div>

  <div class="max-w-md w-full space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-neutral-800">
    <div>
      <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-neutral-100">
        Administration
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-neutral-400">
        Hôtel Résidence Madadjeu
      </p>
    </div>
    
    <form
      class="mt-8 space-y-6"
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
    >
      {#if form?.error}
        <div class="rounded-md bg-red-50 dark:bg-red-950/60 p-4 border border-red-200 dark:border-red-800/40">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                {form.error}
              </h3>
            </div>
          </div>
        </div>
      {/if}

      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">Nom d'utilisateur</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            disabled={loading}
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-500 text-gray-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 rounded-t-md focus:outline-none focus:ring-deep-charcoal dark:focus:ring-muted-gold focus:border-deep-charcoal dark:focus:border-muted-gold focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:dark:bg-neutral-850"
            placeholder="Nom d'utilisateur"
            value={(form as any)?.username ?? ''}
          >
        </div>
        <div>
          <label for="password" class="sr-only">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={loading}
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-500 text-gray-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 rounded-b-md focus:outline-none focus:ring-deep-charcoal dark:focus:ring-muted-gold focus:border-deep-charcoal dark:focus:border-muted-gold focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:dark:bg-neutral-850"
            placeholder="Mot de passe"
          >
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-deep-charcoal hover:bg-black dark:bg-muted-gold dark:text-deep-charcoal dark:hover:bg-soft-cream focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-charcoal dark:focus:ring-muted-gold transition-colors disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Connexion en cours...</span>
          {:else}
            <span>Connexion</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
