<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
</script>

<svelte:head>
  <title>Admin Login - Résidence Madadjeu</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
    <div>
      <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
        Administration
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
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
        <div class="rounded-md bg-red-50 p-4 border border-red-200">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
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
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal focus:z-10 sm:text-sm disabled:bg-gray-100"
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
            class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal focus:z-10 sm:text-sm disabled:bg-gray-100"
            placeholder="Mot de passe"
          >
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-deep-charcoal hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-charcoal transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
