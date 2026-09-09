<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';

  const landmarks = $derived(i18n.t.location.landmarks);
</script>

<svelte:head>
  <title>{i18n.t.location.metaTitle}</title>
  <meta name="description" content={i18n.t.location.metaDesc} />
</svelte:head>

<div class="w-full bg-surface py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    
    <!-- ================= HEADER HERO INTRO ================= -->
    <div class="text-center max-w-3xl mx-auto mb-16 md:mb-20">
      <div class="inline-flex items-center gap-3 mb-4">
        <span class="w-8 h-[1px] bg-deep-maroon"></span>
        <span class="font-label-caps text-warm-taupe tracking-[0.25em] text-xs uppercase">
          {i18n.t.location.badge}
        </span>
        <span class="w-8 h-[1px] bg-deep-maroon"></span>
      </div>

      <h1 class="font-display-lg text-deep-charcoal mb-6 leading-tight">
        {i18n.t.location.title}
      </h1>

      <p class="font-body-lg text-on-surface-variant leading-relaxed">
        {i18n.t.location.subtitle}
      </p>
    </div>

    <!-- ================= TWO COLUMN LAYOUT: SCROLLABLE LANDMARKS (LEFT) & STICKY MAP (RIGHT) ================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
      
      <!-- LEFT COLUMN: Scrollable List of Surrounding Points of Interest & Landmarks -->
      <div class="lg:col-span-6 space-y-5">
        <div class="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
          <div>
            <h2 class="font-headline text-xl sm:text-2xl text-deep-charcoal font-bold">
              {i18n.t.location.transitTitle}
            </h2>
            <span class="text-[10px] font-label-caps text-warm-taupe tracking-widest mt-1 block">
              Yaoundé • Secteur Etoug-Ebe
            </span>
          </div>
          <span class="material-symbols-outlined text-muted-gold text-xl">near_me</span>
        </div>

        <!-- Landmarks Cards List -->
        <div class="flex flex-col gap-3.5">
          {#each landmarks as landmark}
            <div class="bg-surface-container-lowest border border-outline-variant/35 p-5 shadow-sm hover:shadow-md hover:border-muted-gold/60 transition-all duration-300 group">
              <div class="flex items-start justify-between gap-3 mb-2.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-surface-container flex items-center justify-center text-muted-gold group-hover:bg-deep-charcoal group-hover:text-soft-cream transition-colors">
                    <span class="material-symbols-outlined text-lg">{landmark.icon}</span>
                  </div>
                  <h3 class="font-headline text-base sm:text-lg text-deep-charcoal font-bold group-hover:text-muted-gold transition-colors">
                    {landmark.name}
                  </h3>
                </div>

                <!-- Drive/Travel Time Tag (Distance removed) -->
                <div class="bg-surface-container px-2.5 py-1 text-right shrink-0">
                  <span class="font-mono text-[11px] font-bold text-muted-gold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">directions_car</span>
                    <span>{landmark.time}</span>
                  </span>
                </div>
              </div>

              <p class="font-body-md text-xs sm:text-[13px] text-on-surface-variant leading-relaxed pl-12">
                {landmark.desc}
              </p>
            </div>
          {/each}
        </div>

        <!-- Transfer Assistance Card -->
        <div class="p-6 md:p-8 bg-deep-charcoal text-soft-cream border border-white/10 space-y-4 shadow-xl">
          <div class="flex items-center gap-3 text-muted-gold">
            <span class="material-symbols-outlined text-2xl">directions_car</span>
            <span class="font-label-caps text-xs tracking-widest uppercase">{i18n.t.location.transferTitle}</span>
          </div>
          <p class="font-body-md text-xs sm:text-sm text-soft-cream/80 leading-relaxed">
            {i18n.t.location.transitPrompt}
          </p>
          <div class="pt-2">
            <a
              href="https://wa.me/237691890963?text=Bonjour,%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule%20avec%20chauffeur%20Madadjeu%20%C3%A0%20Yaound%C3%A9."
              target="_blank"
              rel="noopener noreferrer"
              class="btn-luxury-primary text-xs py-3 w-full text-center"
            >
              <span>{i18n.t.location.transitCta}</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Sticky Interactive Map (sticky top-28) -->
      <div class="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
        
        <!-- Interactive Map Container (Enlarged prominent size ~560-620px on desktop) -->
        <div class="bg-deep-charcoal overflow-hidden shadow-2xl border border-outline-variant/40 relative w-full h-[450px] sm:h-[520px] lg:h-[600px] min-h-[450px] lg:min-h-[600px]">
          <!-- Embedded Google Maps iframe centered at Etoug-Ebe, Yaoundé -->
          <iframe
            title={i18n.locale === 'fr' ? 'Carte interactive Hôtel Résidence Madadjeu - Face Garde Présidentielle, Etoug-Ebe, Yaoundé' : 'Interactive Map Hotel Residence Madadjeu - Opposite Presidential Guard, Etoug-Ebe, Yaounde'}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15923.633519808388!2d11.485!3d3.848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf9a45610db9%3A0xb36f2f25b293d395!2sEtoug-Ebe%2C%20Yaound%C3%A9%2C%20Cameroon!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
            class="w-full h-full border-0 filter contrast-105"
            allowfullscreen={true}
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>

          <!-- Map Coordinates & Details Overlay -->
          <div class="absolute bottom-4 left-4 right-4 bg-deep-charcoal/95 backdrop-blur-md p-4 border border-white/15 text-soft-cream flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl">
            <div>
              <strong class="text-xs font-headline font-bold text-soft-cream block">
                Face Garde Présidentielle
              </strong>
              <span class="text-[11px] text-muted-gold font-sans">
                Etoug-Ebe, Yaoundé, Cameroun
              </span>
            </div>
            <a
              href="https://maps.google.com/?q=Etoug-Ebe+Garde+Presidentielle+Yaounde+Cameroon"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-luxury-primary text-[10px] py-2 px-3.5 shrink-0"
            >
              <span>{i18n.t.location.mapButton}</span>
              <span class="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>

        <!-- Address Card Details -->
        <div class="bg-surface-container-lowest border border-outline-variant/35 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="font-label-caps text-[10px] text-warm-taupe tracking-widest uppercase block">
              {i18n.t.location.addressTitle}
            </span>
            <strong class="font-body-md text-xs sm:text-sm text-deep-charcoal block">
              {i18n.t.location.addressFull}
            </strong>
          </div>
          <a
            href="tel:+237691890963"
            class="btn-luxury-outline text-[11px] py-2 px-4 shrink-0"
          >
            <span class="material-symbols-outlined text-sm">call</span>
            <span>+237 6 91 89 09 63</span>
          </a>
        </div>

      </div>

    </div>

  </div>
</div>
