<script lang="ts">
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n.svelte';

  const is404 = $derived($page.status === 404);
</script>

<svelte:head>
  <title>
    {is404
      ? (i18n.locale === 'fr' ? 'Page introuvable (404) | Hôtel Résidence Madadjeu' : 'Page Not Found (404) | Hotel Residence Madadjeu')
      : (i18n.locale === 'fr' ? `Erreur ${$page.status} | Hôtel Résidence Madadjeu` : `Error ${$page.status} | Hotel Residence Madadjeu`)}
  </title>
  <meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="w-full min-h-[75vh] flex items-center justify-center py-16 px-4 md:px-8 bg-surface dark:bg-neutral-950">
  <div class="max-w-2xl w-full mx-auto text-center space-y-8 animate-fade-up">
    
    <!-- Gold Monogram & Badge -->
    <div class="space-y-3">
      <div class="w-20 h-20 mx-auto rounded-full bg-muted-gold/10 dark:bg-muted-gold-dark/10 border border-muted-gold/30 dark:border-muted-gold-dark/30 flex items-center justify-center shadow-inner">
        <span class="material-symbols-outlined text-4xl text-muted-gold dark:text-muted-gold-dark">
          {is404 ? 'explore_off' : 'error_outline'}
        </span>
      </div>
      <span class="font-label-caps text-xs text-muted-gold dark:text-muted-gold-dark tracking-[0.3em] uppercase block font-semibold">
        {is404
          ? (i18n.locale === 'fr' ? 'ERREUR 404 • ÉCRIN INTROUVABLE' : 'ERROR 404 • SANCTUARY NOT FOUND')
          : (i18n.locale === 'fr' ? `ERREUR ${$page.status}` : `ERROR ${$page.status}`)}
      </span>
    </div>

    <!-- Title & Explanation -->
    <div class="space-y-4">
      <h1 class="font-display-lg text-3xl sm:text-4xl md:text-5xl text-deep-charcoal dark:text-neutral-100 font-normal leading-tight">
        {is404
          ? (i18n.locale === 'fr' ? 'Une parenthèse égarée dans nos couloirs' : 'A Moment Lost in Our Corridors')
          : (i18n.locale === 'fr' ? 'Une interruption inattendue' : 'An Unexpected Interruption')}
      </h1>
      <p class="font-body-md text-sm sm:text-base text-on-surface-variant dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
        {is404
          ? (i18n.locale === 'fr'
              ? 'La suite, la chambre ou la page que vous recherchez semble introuvable ou a été déplacée. Notre équipe vous invite à regagner la quiétude de nos espaces.'
              : 'The suite, room, or page you are looking for is unavailable or has moved. Our concierge welcomes you to return to the comfort of our residence.')
          : ($page.error?.message || (i18n.locale === 'fr' ? 'Veuillez nous excuser pour ce désagrément.' : 'Please excuse this temporary inconvenience.'))}
      </p>
    </div>

    <!-- Primary Quick Actions (Home & Reserve) -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
      <a
        href="/"
        class="w-full sm:w-auto btn-luxury-primary text-xs py-3 px-7 flex items-center justify-center gap-2 tracking-widest uppercase font-semibold"
      >
        <span class="material-symbols-outlined text-base">home</span>
        <span>{i18n.locale === 'fr' ? "Retour à l'accueil" : 'Return to Home'}</span>
      </a>

      <a
        href="/reserver"
        class="w-full sm:w-auto btn-luxury-secondary text-xs py-3 px-7 flex items-center justify-center gap-2 tracking-widest uppercase font-semibold"
      >
        <span class="material-symbols-outlined text-base">calendar_month</span>
        <span>{i18n.locale === 'fr' ? 'Réserver un séjour' : 'Book a Stay'}</span>
      </a>
    </div>

    <!-- Secondary Navigation Aids -->
    <div class="pt-8 border-t border-outline-variant/30 dark:border-neutral-800/80">
      <p class="font-label-caps text-[11px] text-on-surface-variant/70 dark:text-neutral-400 tracking-wider uppercase mb-4">
        {i18n.locale === 'fr' ? 'Autres passerelles recommandées' : 'Recommended destinations'}
      </p>
      <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant dark:text-neutral-300">
        <a href="/rooms" class="hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-muted-gold">bed</span>
          <span>{i18n.locale === 'fr' ? 'Chambres & Suites' : 'Rooms & Suites'}</span>
        </a>
        <span>•</span>
        <a href="/amenities" class="hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-muted-gold">room_service</span>
          <span>{i18n.locale === 'fr' ? 'Services & Gastronomie' : 'Amenities & Dining'}</span>
        </a>
        <span>•</span>
        <a href="/contact" class="hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm text-muted-gold">support_agent</span>
          <span>{i18n.locale === 'fr' ? 'Contacter la Conciergerie' : 'Contact Concierge'}</span>
        </a>
      </div>
    </div>

  </div>
</div>
