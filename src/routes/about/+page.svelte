<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';
</script>

<svelte:head>
  <title>{i18n.t.about.metaTitle}</title>
  <meta name="description" content={i18n.t.about.metaDesc} />
</svelte:head>

<div class="w-full bg-surface py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-3xl mx-auto mb-16">
      <span class="font-label-caps text-warm-taupe tracking-widest text-xs mb-3 block uppercase font-semibold">
        {i18n.t.about.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal mb-6">
        {i18n.t.about.heading}
      </h1>
      <p class="font-body-lg text-on-surface-variant leading-relaxed">
        {i18n.t.about.description}
      </p>
    </div>

    <!-- Visual Story Split 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
      <div class="lg:col-span-6 relative aspect-[4/3] overflow-hidden shadow-2xl bg-deep-charcoal border border-outline-variant/30">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8PUJUNBR7ctKWpwe_9_QigkskPI6qps06I0FcaVikbAK3Iv_KpQsaIMKz9aEZUxPX284hBmQB0GoP7yFx8m2kt70RZCwoalRY7Y51xULlEPBNh7qZSJvZayX3bs4JMOG4Qu2QHHB3iYPjM8dvGSrMvQOSEyZKGZah72lgGWvgsjOC-34RHXbFAJqcM5QVawKLduh8i0JLVv_E5Paxzq5ncpnZ4OQ69PyUWVm22SutoP-qKiycuWh-"
          alt="Lounge Madadjeu"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="lg:col-span-6 space-y-4">
        <span class="font-label-caps text-warm-taupe tracking-widest text-[10px] sm:text-[11px] block uppercase font-semibold">{i18n.t.about.signatureBadge}</span>
        <h2 class="font-display-lg text-deep-charcoal text-xl sm:text-2xl md:text-3xl">
          {i18n.t.about.signatureTitle}
        </h2>
        <p class="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {i18n.t.about.signatureP1}
        </p>
        <p class="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {i18n.t.about.signatureP2}
        </p>
      </div>
    </div>

    <!-- Pillars / Values Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      <div class="p-6 bg-surface-container border border-outline-variant/30 space-y-3">
        <span class="font-headline text-2xl font-bold text-muted-gold block">{i18n.t.about.val1Num}</span>
        <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal font-bold">{i18n.t.about.val1Title}</h3>
        <p class="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {i18n.t.about.val1Desc}
        </p>
      </div>

      <div class="p-6 bg-surface-container border border-outline-variant/30 space-y-3">
        <span class="font-headline text-2xl font-bold text-muted-gold block">{i18n.t.about.val2Num}</span>
        <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal font-bold">{i18n.t.about.val2Title}</h3>
        <p class="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {i18n.t.about.val2Desc}
        </p>
      </div>

      <div class="p-6 bg-surface-container border border-outline-variant/30 space-y-3">
        <span class="font-headline text-2xl font-bold text-muted-gold block">{i18n.t.about.val3Num}</span>
        <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal font-bold">{i18n.t.about.val3Title}</h3>
        <p class="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {i18n.t.about.val3Desc}
        </p>
      </div>
    </div>

    <!-- Final Call to Action -->
    <div class="text-center bg-deep-charcoal text-soft-cream p-8 md:p-12 border border-white/10 space-y-4">
      <h2 class="font-display-lg text-xl sm:text-2xl md:text-3xl">{i18n.t.about.ctaTitle}</h2>
      <p class="font-body-lg text-soft-cream/80 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
        {i18n.t.about.ctaDesc}
      </p>
      <div class="pt-2">
        <a
          href="/reserver"
          class="btn-luxury-primary text-xs py-2.5 px-7"
        >
          {i18n.t.about.ctaButton}
        </a>
      </div>
    </div>
  </div>
</div>
