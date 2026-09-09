<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';

  let isOpen = $state(false);
</script>

<!-- Floating Concierge Widget -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
  <!-- Interactive Modal / Popup Menu -->
  {#if isOpen}
    <div class="mb-4 w-80 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/40 dark:border-neutral-800 rounded-2xl shadow-2xl p-5 animate-fade-up text-on-surface dark:text-neutral-100">
      <div class="flex items-center justify-between border-b border-outline-variant/30 dark:border-neutral-800 pb-3 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-muted-gold/20 dark:bg-muted-gold-dark/20 flex items-center justify-center text-muted-gold dark:text-muted-gold-dark">
            <span class="material-symbols-outlined text-2xl">room_service</span>
          </div>
          <div>
            <h4 class="font-headline font-bold text-base text-deep-charcoal dark:text-neutral-100">{i18n.t.concierge.title}</h4>
            <span class="text-[11px] text-green-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {i18n.t.concierge.available}
            </span>
          </div>
        </div>
        <button
          onclick={() => (isOpen = false)}
          class="text-on-surface-variant dark:text-neutral-400 hover:text-deep-charcoal dark:hover:text-neutral-100 p-1 rounded-full hover:bg-surface-variant/40 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fermer"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <p class="text-xs text-on-surface-variant dark:text-neutral-300 mb-4 leading-relaxed">
        {i18n.t.concierge.prompt}
      </p>

      <div class="flex flex-col gap-2">
        <a
          href="https://wa.me/237699000000?text=Bonjour%20Madadjeu,%20je%20souhaite%20une%20information."
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container dark:bg-neutral-800 hover:bg-muted-gold/10 dark:hover:bg-muted-gold-dark/15 transition-colors border border-outline-variant/30 dark:border-neutral-700 text-xs font-medium text-deep-charcoal dark:text-neutral-100 group"
        >
          <span class="material-symbols-outlined text-green-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">chat</span>
          <span>{i18n.t.concierge.whatsapp}</span>
        </a>

        <a
          href="tel:+237699000000"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container dark:bg-neutral-800 hover:bg-muted-gold/10 dark:hover:bg-muted-gold-dark/15 transition-colors border border-outline-variant/30 dark:border-neutral-700 text-xs font-medium text-deep-charcoal dark:text-neutral-100 group"
        >
          <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark group-hover:scale-110 transition-transform">call</span>
          <span>{i18n.t.concierge.call}</span>
        </a>

        <a
          href="/contact"
          onclick={() => (isOpen = false)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container dark:bg-neutral-800 hover:bg-muted-gold/10 dark:hover:bg-muted-gold-dark/15 transition-colors border border-outline-variant/30 dark:border-neutral-700 text-xs font-medium text-deep-charcoal dark:text-neutral-100 group"
        >
          <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark group-hover:scale-110 transition-transform">mail</span>
          <span>{i18n.t.concierge.specialRequest}</span>
        </a>

        <a
          href="/faq"
          onclick={() => (isOpen = false)}
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container dark:bg-neutral-800 hover:bg-muted-gold/10 dark:hover:bg-muted-gold-dark/15 transition-colors border border-outline-variant/30 dark:border-neutral-700 text-xs font-medium text-deep-charcoal dark:text-neutral-100 group"
        >
          <span class="material-symbols-outlined text-muted-gold dark:text-muted-gold-dark group-hover:scale-110 transition-transform">help_outline</span>
          <span>{i18n.t.concierge.faq}</span>
        </a>
      </div>
    </div>
  {/if}

  <!-- Toggle Button -->
  <button
    onclick={() => (isOpen = !isOpen)}
    class="w-14 h-14 bg-muted-gold dark:bg-muted-gold-dark text-deep-charcoal dark:text-neutral-900 hover:bg-deep-charcoal dark:hover:bg-neutral-100 hover:text-soft-cream dark:hover:text-neutral-900 rounded-full flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-soft-cream dark:border-neutral-800"
    aria-label="Contacter la conciergerie"
    title="Conciergerie en ligne"
  >
    <span class="material-symbols-outlined text-[26px]">
      {isOpen ? 'close' : 'chat_bubble'}
    </span>
  </button>
</div>
