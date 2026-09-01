<script lang="ts">
  import { Save, AlertCircle } from 'lucide-svelte';

  let { data, form } = $props();
  
  let settings = $derived(data.settings);
  let showPinModal = $state(false);
  let enteredPin = $state('');
  let pinError = $state(false);
  let pendingSubmitEvent: Event | null = $state(null);

  function handlePaymentSubmit(e: Event) {
    e.preventDefault();
    pendingSubmitEvent = e;
    showPinModal = true;
    enteredPin = '';
    pinError = false;
  }

  function confirmPin() {
    if (enteredPin === '2006') {
      showPinModal = false;
      if (pendingSubmitEvent && pendingSubmitEvent.target instanceof HTMLFormElement) {
        // Create a hidden input to mark it as verified, or just submit
        pendingSubmitEvent.target.submit();
      }
    } else {
      pinError = true;
    }
  }

  function cancelPin() {
    showPinModal = false;
    pendingSubmitEvent = null;
    enteredPin = '';
    pinError = false;
  }
</script>

<div class="space-y-6 max-w-4xl">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Paramètres du Site</h1>
  </div>

  {#if form?.success}
    <div class="rounded-md bg-green-50 p-4 border border-green-200 flex items-start">
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Paramètres enregistrés avec succès.</h3>
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

  <form method="POST" class="space-y-8">
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Contact & Localisation</h3>
        <p class="text-sm text-gray-500 mt-1">Informations affichées sur la page de contact publique et le pied de page.</p>
      </div>
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="contact_email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="contact_email" id="contact_email" value={settings.contact_email} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="contact_phone" class="block text-sm font-medium text-gray-700">Téléphone</label>
            <input type="text" name="contact_phone" id="contact_phone" value={settings.contact_phone} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="contact_whatsapp" class="block text-sm font-medium text-gray-700">Numéro WhatsApp (ex: +237...)</label>
            <input type="text" name="contact_whatsapp" id="contact_whatsapp" value={settings.contact_whatsapp} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="contact_address" class="block text-sm font-medium text-gray-700">Adresse Physique</label>
            <input type="text" name="contact_address" id="contact_address" value={settings.contact_address} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="contact_map_coords" class="block text-sm font-medium text-gray-700">URL d'intégration Google Maps</label>
            <input type="text" name="contact_map_coords" id="contact_map_coords" value={settings.contact_map_coords} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Réseaux Sociaux & Partenaires</h3>
        <p class="text-sm text-gray-500 mt-1">Liens vers les plateformes sociales (laissez vide pour masquer l'icône).</p>
      </div>
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="social_facebook" class="block text-sm font-medium text-gray-700">Facebook URL</label>
            <input type="text" name="social_facebook" id="social_facebook" value={settings.social_facebook} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="social_instagram" class="block text-sm font-medium text-gray-700">Instagram URL</label>
            <input type="text" name="social_instagram" id="social_instagram" value={settings.social_instagram} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="social_tripadvisor" class="block text-sm font-medium text-gray-700">TripAdvisor URL</label>
            <input type="text" name="social_tripadvisor" id="social_tripadvisor" value={settings.social_tripadvisor} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="social_bookingcom" class="block text-sm font-medium text-gray-700">Booking.com URL</label>
            <input type="text" name="social_bookingcom" id="social_bookingcom" value={settings.social_bookingcom} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="social_tripcom" class="block text-sm font-medium text-gray-700">Trip.com URL</label>
            <input type="text" name="social_tripcom" id="social_tripcom" value={settings.social_tripcom} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="bg-deep-charcoal text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
        <Save size={16} />
        <span>Enregistrer Contact & Réseaux</span>
      </button>
    </div>

    <!-- We separate Payment APIs into its own form to intercept it easily -->
  </form>
  
  <form method="POST" class="space-y-8" onsubmit={handlePaymentSubmit}>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">APIs de Paiement</h3>
        <p class="text-sm text-gray-500 mt-1">Identifiants pour le traitement des paiements. (Sécurisé par code PIN)</p>
      </div>
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="mtn_api_key" class="block text-sm font-medium text-gray-700">MTN MoMo API Key / Token</label>
            <input type="password" name="mtn_api_key" id="mtn_api_key" value={settings.mtn_api_key} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="orange_api_key" class="block text-sm font-medium text-gray-700">Orange Money API Key</label>
            <input type="password" name="orange_api_key" id="orange_api_key" value={settings.orange_api_key} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
          <div>
            <label for="card_api_key" class="block text-sm font-medium text-gray-700">Card Gateway Secret Key (Stripe/Flutterwave)</label>
            <input type="password" name="card_api_key" id="card_api_key" value={settings.card_api_key} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="bg-deep-charcoal text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
        <Save size={16} />
        <span>Enregistrer les Changements</span>
      </button>
    </div>

  </form>
</div>

{#if showPinModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">Code PIN Requis</h3>
      <p class="text-sm text-gray-500 mb-4">Veuillez entrer le code PIN administrateur pour modifier les paramètres de paiement.</p>
      
      <input 
        type="password" 
        bind:value={enteredPin} 
        placeholder="Entrez le PIN" 
        class="block w-full border {pinError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm mb-2"
        onkeydown={(e) => { if (e.key === 'Enter') confirmPin() }}
      />
      {#if pinError}
        <p class="text-xs text-red-500 mb-4">PIN incorrect. L'enregistrement est bloqué.</p>
      {/if}

      <div class="mt-6 flex justify-end gap-3">
        <button onclick={cancelPin} class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
        <button onclick={confirmPin} class="px-4 py-2 text-sm font-medium text-white bg-deep-charcoal rounded-md hover:bg-black">Confirmer</button>
      </div>
    </div>
  </div>
{/if}
