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
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Passerelle de Paiement CinetPay (Seamless)</h3>
            <p class="text-sm text-gray-500 mt-1">Fournisseur unique pour MTN Mobile Money, Orange Money et Cartes Bancaires (Visa / Mastercard). Sécurisé par code PIN.</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            CinetPay Seamless
          </span>
        </div>
      </div>
      
      <!-- Prerequisite Notice Banner -->
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mx-6 mt-6 rounded-r-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="material-symbols-outlined text-amber-500 text-xl">info</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-amber-800">
              Prérequis obligatoire — Autorisation Seamless
            </p>
            <p class="text-xs text-amber-700 mt-1 leading-relaxed">
              L'intégration Seamless (popup contextuelle sur le site sans redirection externe) nécessite une autorisation préalable accordée par CinetPay. Le marchand doit impérativement faire une demande d'activation pour son <strong>Site ID</strong> auprès de <a href="mailto:support@cinetpay.com" class="underline font-semibold hover:text-amber-900">support@cinetpay.com</a>.
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="cinetpay_api_key" class="block text-sm font-medium text-gray-700">CinetPay API Key (Clé API) *</label>
            <input type="password" name="cinetpay_api_key" id="cinetpay_api_key" value={settings.cinetpay_api_key} placeholder="Ex: 1234567890abcdef..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm font-mono" />
            <p class="text-xs text-gray-500 mt-1">Disponible dans votre espace marchand CinetPay > Paramètres > API.</p>
          </div>
          <div>
            <label for="cinetpay_site_id" class="block text-sm font-medium text-gray-700">CinetPay Site ID (Identifiant du Site) *</label>
            <input type="text" name="cinetpay_site_id" id="cinetpay_site_id" value={settings.cinetpay_site_id} placeholder="Ex: 586940" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm font-mono" />
            <p class="text-xs text-gray-500 mt-1">Numéro unique identifiant votre site chez CinetPay.</p>
          </div>
          <div class="md:col-span-2">
            <label for="cinetpay_secret_key" class="block text-sm font-medium text-gray-700">CinetPay Secret Key (Clé Secrète HMAC pour Webhooks)</label>
            <input type="password" name="cinetpay_secret_key" id="cinetpay_secret_key" value={settings.cinetpay_secret_key} placeholder="Clé secrète pour validation du header X-TOKEN" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm font-mono" />
            <p class="text-xs text-gray-500 mt-1">Utilisé pour vérifier la signature cryptographique des notifications transmises à votre webhook.</p>
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
