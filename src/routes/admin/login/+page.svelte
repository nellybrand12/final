<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
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
    
    <form class="mt-8 space-y-6" method="POST">
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
          <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal focus:z-10 sm:text-sm" placeholder="Nom d'utilisateur" value={(form as any)?.username ?? ''}>
        </div>
        <div>
          <label for="password" class="sr-only">Mot de passe</label>
          <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal focus:z-10 sm:text-sm" placeholder="Mot de passe">
        </div>
      </div>

      <div>
        <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-deep-charcoal hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-charcoal transition-colors">
          Connexion
        </button>
      </div>
    </form>
  </div>
</div>
