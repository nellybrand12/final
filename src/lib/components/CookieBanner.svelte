<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n.svelte';

  let showBanner = $state(false);

  onMount(() => {
    try {
      const consent = localStorage.getItem('madadjeu_cookie_consent');
      if (!consent) {
        // Delay slightly for smooth entrance after page load
        const timer = setTimeout(() => {
          showBanner = true;
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // localStorage may fail in restricted iframe / private browsing
      showBanner = false;
    }
  });

  function handleAccept() {
    try {
      localStorage.setItem('madadjeu_cookie_consent', 'accepted');
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('consent', 'grant');
      }
    } catch (e) {}
    showBanner = false;
  }

  function handleDecline() {
    try {
      localStorage.setItem('madadjeu_cookie_consent', 'rejected');
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('consent', 'revoke');
      }
    } catch (e) {}
    showBanner = false;
  }
</script>

{#if showBanner}
  <div
    class="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-5 bg-surface-container-lowest/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-outline-variant/40 dark:border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-fade-up"
    role="region"
    aria-label={i18n.t.cookie.title}
  >
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <!-- Icon & Text Info -->
      <div class="flex items-start gap-3.5 max-w-4xl">
        <div class="w-10 h-10 rounded-xl bg-muted-gold/15 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-2xl">cookie</span>
        </div>
        <div class="space-y-1">
          <h4 class="font-headline font-bold text-sm text-deep-charcoal dark:text-neutral-100">
            {i18n.t.cookie.title}
          </h4>
          <p class="font-body-md text-xs text-on-surface-variant dark:text-neutral-300 leading-relaxed">
            {i18n.t.cookie.description}
            <a
              href="/politique-de-confidentialite"
              class="ml-1 text-muted-gold dark:text-muted-gold-dark font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {i18n.t.cookie.policyLink}
            </a>
          </p>
        </div>
      </div>

      <!-- Accept / Reject Actions -->
      <div class="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
        <button
          type="button"
          onclick={handleDecline}
          class="flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg border border-outline-variant/50 dark:border-neutral-700 text-on-surface dark:text-neutral-200 hover:bg-surface-variant/40 dark:hover:bg-neutral-800 transition-colors text-center"
        >
          {i18n.t.cookie.decline}
        </button>

        <button
          type="button"
          onclick={handleAccept}
          class="flex-1 md:flex-initial px-5 py-2 text-xs font-bold rounded-lg bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-900 hover:bg-muted-gold dark:hover:bg-muted-gold-dark hover:text-deep-charcoal transition-all shadow-sm text-center"
        >
          {i18n.t.cookie.accept}
        </button>
      </div>
    </div>
  </div>
{/if}
