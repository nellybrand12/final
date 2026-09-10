<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';
</script>

<SEO title={i18n.t.terms.metaTitle} description={i18n.t.terms.metaDesc} />

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-4xl mx-auto px-4 md:px-8">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-label-caps text-muted-gold dark:text-muted-gold-dark tracking-widest text-xs mb-2 block uppercase font-semibold">
        {i18n.t.terms.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-4 text-3xl sm:text-4xl md:text-5xl">
        {i18n.t.terms.heading}
      </h1>
      <p class="font-body-md text-xs text-on-surface-variant/70 dark:text-neutral-400 mb-6">
        {i18n.t.terms.lastUpdated}
      </p>
      <p class="font-body-md text-sm md:text-base text-on-surface-variant dark:text-neutral-300 leading-relaxed bg-surface-container-lowest dark:bg-neutral-900 p-5 rounded-xl border border-outline-variant/30 dark:border-neutral-800 shadow-sm text-left">
        {i18n.t.terms.intro}
      </p>
    </div>

    <!-- Quick Highlights Notice Badges -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <div class="p-4 rounded-xl bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-muted-gold/15 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">person_add_disabled</span>
        </div>
        <div>
          <span class="text-[11px] uppercase tracking-wider text-muted-gold dark:text-muted-gold-dark font-bold block">Guest Checkout</span>
          <span class="text-xs text-on-surface dark:text-neutral-200 font-medium">{i18n.locale === 'fr' ? 'Sans création de compte' : 'No account needed'}</span>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">verified</span>
        </div>
        <div>
          <span class="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">{i18n.locale === 'fr' ? 'Remboursement 95%' : '95% Refund'}</span>
          <span class="text-xs text-on-surface dark:text-neutral-200 font-medium">{i18n.locale === 'fr' ? '≥20h (chambres) / ≥36h (salles)' : '≥20h (rooms) / ≥36h (halls)'}</span>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-muted-gold/15 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-xl">payments</span>
        </div>
        <div>
          <span class="text-[11px] uppercase tracking-wider text-muted-gold dark:text-muted-gold-dark font-bold block">{i18n.locale === 'fr' ? 'Modes de Règlement' : 'Payment Options'}</span>
          <span class="text-xs text-on-surface dark:text-neutral-200 font-medium">{i18n.locale === 'fr' ? 'En ligne (CinetPay) ou Arrivée' : 'Online (CinetPay) or Arrival'}</span>
        </div>
      </div>
    </div>

    <!-- Contract Articles List -->
    <div class="space-y-6 mb-16">
      {#each i18n.t.terms.sections as section}
        <article class="p-6 md:p-8 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 rounded-2xl shadow-sm space-y-3">
          <h2 class="font-headline text-lg sm:text-xl font-bold text-deep-charcoal dark:text-neutral-100 flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-muted-gold dark:bg-muted-gold-dark shrink-0"></span>
            <span>{section.title}</span>
          </h2>
          <div class="font-body-md text-xs sm:text-sm text-on-surface-variant dark:text-neutral-300 leading-relaxed whitespace-pre-line pl-4 border-l-2 border-muted-gold/30 dark:border-muted-gold-dark/30">
            {section.content}
          </div>
        </article>
      {/each}
    </div>

    <!-- Action Bar -->
    <div class="p-8 md:p-10 bg-deep-charcoal dark:bg-neutral-900 text-soft-cream text-center space-y-5 rounded-2xl border border-white/10 dark:border-neutral-800 shadow-xl">
      <div class="w-12 h-12 bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center mx-auto rounded-xl">
        <span class="material-symbols-outlined text-2xl">calendar_month</span>
      </div>
      <div class="max-w-md mx-auto space-y-2">
        <h3 class="font-headline text-xl font-bold text-soft-cream">
          {i18n.locale === 'fr' ? 'Prêt à réserver votre séjour d’exception ?' : 'Ready to book your exceptional stay?'}
        </h3>
        <p class="text-xs text-soft-cream/70 leading-relaxed">
          {i18n.locale === 'fr'
            ? 'Consultez les disponibilités en temps réel et réservez en quelques clics sans formalités superflues.'
            : 'Check real-time availability and reserve in just a few clicks without unnecessary formalities.'}
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href="/reserver"
          class="btn-luxury-primary text-xs py-2.5 px-6 text-center"
        >
          {i18n.locale === 'fr' ? 'Réserver une chambre' : 'Book a Room'}
        </a>
        <a
          href="/gerer-reservation"
          class="btn-luxury-secondary text-xs py-2.5 px-6 text-center"
        >
          {i18n.locale === 'fr' ? 'Gérer ma réservation' : 'Manage My Booking'}
        </a>
      </div>
    </div>
  </div>
</div>
