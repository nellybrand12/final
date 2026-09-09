<script lang="ts">
  import type { PageData } from './$types';
  import { i18n } from '$lib/i18n.svelte';

  let { data }: { data: PageData } = $props();

  let isDownloading = $state(false);

  const activeRef = $derived(data.ref || data.booking?.bookingReference || 'MDJ-84920');

  function formatPrice(amount: string | number | undefined) {
    if (!amount) return '0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.locale === 'fr' ? 'fr-FR' : 'en-US').format(num);
  }

  function getPaymentMethodLabel(method: string | null | undefined): string {
    switch (method) {
      case 'hotel':
        return i18n.locale === 'fr' ? "Paiement sur place à l'arrivée" : 'Pay upon arrival at hotel';
      case 'cinetpay':
        return i18n.locale === 'fr' ? 'Paiement en ligne sécurisé (CinetPay)' : 'Secure Online Payment (CinetPay)';
      case 'mtn_momo':
        return 'MTN Mobile Money';
      case 'orange_money':
        return 'Orange Money';
      case 'card':
        return i18n.locale === 'fr' ? 'Carte Bancaire (Visa / Mastercard)' : 'Credit Card (Visa / Mastercard)';
      default:
        return i18n.locale === 'fr' ? 'Paiement garanti' : 'Guaranteed reservation';
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadReceipt() {
    isDownloading = true;
    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(activeRef)}/receipt`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Recu-Madadjeu-${activeRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Receipt download error:', err);
      // Fallback direct navigation
      window.location.href = `/api/reservations/${encodeURIComponent(activeRef)}/receipt`;
    } finally {
      isDownloading = false;
    }
  }
</script>

<svelte:head>
  <title>{i18n.t.confirmation.metaTitle}</title>
</svelte:head>

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-3xl mx-auto px-4 md:px-8">
    <!-- Success Card Container -->
    <div class="bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 p-8 md:p-12 shadow-xl text-center space-y-8 animate-fade-up">
      
      <!-- Gold Success Icon -->
      <div class="w-20 h-20 bg-muted-gold/20 dark:bg-brand-gold-dark/20 text-muted-gold dark:text-brand-gold-dark flex items-center justify-center mx-auto border border-muted-gold/40 dark:border-brand-gold-dark/40">
        <span class="material-symbols-outlined text-4xl">check_circle</span>
      </div>

      <!-- Title & Headline -->
      <div>
        <span class="font-label-caps text-muted-gold dark:text-brand-gold-dark tracking-widest text-xs mb-2 block uppercase font-semibold">
          {i18n.t.confirmation.badge}
        </span>
        <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-3">
          {i18n.t.confirmation.title}
        </h1>
        <p class="font-body-md text-sm text-on-surface-variant dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          {i18n.t.confirmation.desc}
        </p>
      </div>

      <!-- Booking Reference & Actions Card -->
      <div class="p-6 bg-surface-container dark:bg-neutral-950 border border-outline-variant/40 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-left">
          <span class="text-[10px] font-label-caps text-on-surface-variant dark:text-neutral-400 block uppercase">
            {i18n.t.confirmation.refNumber}
          </span>
          <span class="font-headline text-2xl md:text-3xl font-bold tracking-wider text-deep-charcoal dark:text-neutral-100">
            {activeRef}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Download PDF Receipt Button -->
          <button
            onclick={handleDownloadReceipt}
            disabled={isDownloading}
            type="button"
            class="btn-luxury-primary text-[11px] py-2.5 px-4 flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {#if isDownloading}
              <span class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              <span>{i18n.t.confirmation.downloadingReceipt}</span>
            {:else}
              <span class="material-symbols-outlined text-base">download</span>
              <span>{i18n.t.confirmation.downloadReceipt}</span>
            {/if}
          </button>

          <!-- Print Button -->
          <button
            onclick={handlePrint}
            type="button"
            class="btn-luxury-outline text-[11px] py-2.5 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">print</span>
            <span>{i18n.t.confirmation.printReceipt}</span>
          </button>
        </div>
      </div>

      <!-- PDF Receipt Notice Banner -->
      <div class="p-4 bg-muted-gold/10 dark:bg-brand-gold-dark/10 border border-muted-gold/30 dark:border-brand-gold-dark/30 text-deep-charcoal dark:text-neutral-200 text-xs text-left flex items-start gap-3 rounded-sm">
        <span class="material-symbols-outlined text-lg mt-0.5 text-muted-gold dark:text-brand-gold-dark">description</span>
        <div class="space-y-0.5">
          <span class="font-bold block text-deep-charcoal dark:text-neutral-100">
            {i18n.locale === 'fr' ? 'Reçu officiel disponible' : 'Official Receipt Available'}
          </span>
          <span class="text-[11px] text-on-surface-variant dark:text-neutral-400 block">
            {i18n.locale === 'fr' 
              ? 'Votre reçu officiel au format PDF est prêt. Cliquez sur « Télécharger le reçu (PDF) » ci-dessus pour conserver votre justificatif ou le présenter à votre arrivée.' 
              : 'Your official PDF receipt is ready. Click "Download Receipt (PDF)" above to keep your confirmation or present it upon check-in.'}
          </span>
        </div>
      </div>

      <!-- Detailed Receipt Breakdown -->
      {#if data.booking}
        <div class="border-t border-b border-outline-variant/30 dark:border-neutral-800 py-6 text-left space-y-4 text-xs font-body-md">
          <div class="flex items-center justify-between">
            <h3 class="font-headline text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.confirmation.summaryTitle}</h3>
            <span class="text-[10px] font-label-caps text-muted-gold dark:text-brand-gold-dark font-bold bg-muted-gold/10 dark:bg-brand-gold-dark/15 px-2 py-0.5 border border-muted-gold/30 dark:border-brand-gold-dark/30">
              {data.booking.status === 'confirmed' ? 'CONFIRMÉ' : 'EN ATTENTE'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{i18n.t.confirmation.mainGuest}</span>
              <strong class="text-deep-charcoal dark:text-neutral-100 text-sm">{data.booking.guestName}</strong>
            </div>

            <div>
              <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{i18n.t.confirmation.emailPhone}</span>
              <strong class="text-deep-charcoal dark:text-neutral-100 text-sm">{data.booking.guestEmail} {data.booking.guestPhone ? `• ${data.booking.guestPhone}` : ''}</strong>
            </div>

            <div>
              <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{data.room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Salle réservée' : 'Reserved Venue') : i18n.t.confirmation.lodging}</span>
              <strong class="text-deep-charcoal dark:text-neutral-100 text-sm">{data.room?.name || 'Appartement Supérieur'}</strong>
              <span class="text-[11px] text-on-surface-variant dark:text-neutral-400 block">
                {#if data.room?.type === 'hall'}
                  1 salle • {data.booking.eventType || 'Événement'}
                {:else}
                  {data.booking.guestsCount || 1} chambre(s)
                {/if}
              </span>
            </div>

            <div>
              <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{data.room?.type === 'hall' ? (i18n.locale === 'fr' ? 'Dates événement' : 'Event Dates') : i18n.t.confirmation.stayDates}</span>
              <strong class="text-deep-charcoal dark:text-neutral-100 text-sm">{data.booking.checkInDate} → {data.booking.checkOutDate}</strong>
              <span class="text-[11px] text-on-surface-variant dark:text-neutral-400 block">
                {data.room?.type === 'hall' ? 'Accès 08h00 • Clôture 23h00' : 'Arrivée 14h00 • Départ 12h00'}
              </span>
            </div>

            <div>
              <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{i18n.t.confirmation.paymentMethodLabel}</span>
              <strong class="text-deep-charcoal dark:text-neutral-100 text-sm">{getPaymentMethodLabel(data.booking.paymentMethod)}</strong>
            </div>

            {#if data.booking.paymentTransactionId}
              <div>
                <span class="text-on-surface-variant dark:text-neutral-400 block text-[11px]">{i18n.t.confirmation.transactionIdLabel}</span>
                <strong class="text-deep-charcoal dark:text-neutral-100 font-mono text-xs">{data.booking.paymentTransactionId}</strong>
              </div>
            {/if}
          </div>

          <div class="pt-4 border-t border-outline-variant/20 dark:border-neutral-800 flex justify-between items-baseline font-headline text-base font-bold text-deep-charcoal dark:text-neutral-100">
            <span>{i18n.t.confirmation.totalAmount}</span>
            <span class="text-xl text-muted-gold dark:text-brand-gold-dark">{formatPrice(data.booking.totalPrice)} FCFA</span>
          </div>
        </div>
      {/if}

      <!-- Next Actions Navigation -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <a
          href="/gerer-reservation"
          class="btn-luxury-dark text-xs py-3 px-6 w-full sm:w-auto"
        >
          {i18n.t.confirmation.manageBookingBtn}
        </a>
        <a
          href="/"
          class="btn-luxury-outline text-xs py-3 px-6 w-full sm:w-auto"
        >
          {i18n.t.confirmation.backHomeBtn}
        </a>
      </div>
    </div>
  </div>
</div>
