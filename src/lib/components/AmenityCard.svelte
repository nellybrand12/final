<script lang="ts">
  interface Props {
    icon: string;
    title: string;
    description: string;
    highlight?: string;
    ctaText?: string;
    ctaLink?: string;
  }

  let { icon, title, description, highlight, ctaText, ctaLink }: Props = $props();
</script>

<div class="h-full flex flex-col justify-between p-7 sm:p-8 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 hover:shadow-xl hover:border-muted-gold/50 dark:hover:border-muted-gold-dark/50 transition-all duration-300 group">
  <div>
    <!-- Icon Circle -->
    <div class="w-14 h-14 bg-soft-cream dark:bg-neutral-800 border border-muted-gold/30 dark:border-muted-gold-dark/40 flex items-center justify-center text-muted-gold dark:text-muted-gold-dark group-hover:bg-muted-gold dark:group-hover:bg-muted-gold-dark group-hover:text-deep-charcoal dark:group-hover:text-neutral-900 transition-all duration-300 mb-6">
      <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 0, 'wght' 250;">
        {icon}
      </span>
    </div>
    
    <!-- Highlight Tag -->
    {#if highlight}
      <span class="font-label-caps text-[10px] text-muted-gold tracking-widest uppercase font-semibold block mb-1.5">
        {highlight}
      </span>
    {/if}

    <!-- Service Title -->
    <h3 class="font-headline text-lg sm:text-xl text-deep-charcoal dark:text-neutral-100 font-bold mb-3 group-hover:text-muted-gold dark:group-hover:text-muted-gold-dark transition-colors">
      {title}
    </h3>

    <!-- Service Description -->
    <p class="font-body-md text-xs sm:text-[13px] text-on-surface-variant dark:text-neutral-300 leading-relaxed">
      {description}
    </p>
  </div>

  <!-- Optional Action Link -->
  {#if ctaText && ctaLink}
    <div class="pt-6 mt-6 border-t border-outline-variant/20 dark:border-neutral-800">
      <a
        href={ctaLink}
        target={ctaLink.startsWith('http') ? '_blank' : undefined}
        rel={ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
        class="inline-flex items-center gap-2 font-label-caps text-xs text-deep-charcoal dark:text-neutral-100 hover:text-muted-gold dark:hover:text-muted-gold-dark font-semibold transition-colors group-hover:translate-x-1 duration-300"
      >
        <span>{ctaText}</span>
        <span class="material-symbols-outlined text-xs">arrow_forward</span>
      </a>
    </div>
  {/if}
</div>
