<script lang="ts">
  interface Props {
    imageUrl?: string | null;
    title: string;
    description: string;
  }

  let { imageUrl = "", title, description }: Props = $props();
</script>

<div
  class="h-full flex flex-col bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 hover:shadow-xl hover:border-[#bc9347]/50 dark:hover:border-[#bc9347]/60 transition-all duration-300 overflow-hidden group"
>
  <!-- 1. Image on top -->
  <div
    class="w-full aspect-[16/10] overflow-hidden bg-surface-container-low dark:bg-neutral-800/80 shrink-0"
  >
    {#if imageUrl}
      <img
        src={imageUrl}
        alt={title}
        class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />
    {:else}
      <div
        class="w-full h-full flex items-center justify-center bg-surface-container-low dark:bg-neutral-800/60 text-muted-gold/60 dark:text-muted-gold-dark/60 font-label-caps text-xs tracking-widest uppercase"
      >
        {title}
      </div>
    {/if}
  </div>

  <!-- Content (Name + Description) -->
  <div class="p-6 sm:p-7 flex flex-col flex-1">
    <!-- 2. Service name -->
    <h3
      class="font-headline text-xl sm:text-2xl text-deep-charcoal dark:text-neutral-100 font-bold mb-3 group-hover:text-[#661f23] dark:group-hover:text-[#bc9347] transition-colors"
    >
      {title}
    </h3>

    <!-- 3. Description below -->
    <p
      class="font-body-md text-xs sm:text-sm text-on-surface-variant dark:text-neutral-300 leading-relaxed"
    >
      {description}
    </p>
  </div>
</div>
