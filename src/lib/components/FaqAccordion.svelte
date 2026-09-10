<script lang="ts">
  interface FaqItem {
    id?: number;
    question: string;
    answer: string;
    category?: string;
  }

  interface Props {
    faq: FaqItem;
    isOpenDefault?: boolean;
  }

  let { faq, isOpenDefault = false }: Props = $props();
  // svelte-ignore state_referenced_locally
  let isOpen = $state(isOpenDefault);
</script>

<div class="border-b border-outline-variant/40 dark:border-neutral-800 py-5 transition-colors">
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    class="w-full flex items-center justify-between gap-4 text-left group cursor-pointer focus:outline-none"
    aria-expanded={isOpen}
  >
    <span
      class="font-headline text-lg md:text-xl text-deep-charcoal dark:text-neutral-100 group-hover:text-muted-gold dark:group-hover:text-muted-gold-dark transition-colors font-medium"
    >
      {faq.question}
    </span>
    <span
      class="w-8 h-8 rounded-full border border-muted-gold/40 dark:border-muted-gold-dark/40 flex items-center justify-center text-muted-gold dark:text-muted-gold-dark group-hover:border-muted-gold dark:group-hover:border-muted-gold-dark group-hover:bg-muted-gold/10 dark:group-hover:bg-muted-gold-dark/15 transition-all duration-200 shrink-0"
    >
      <span class="material-symbols-outlined text-lg">
        {isOpen ? "remove" : "add"}
      </span>
    </span>
  </button>

  {#if isOpen}
    <div
      class="pt-4 pr-12 text-on-surface-variant dark:text-neutral-300 font-body-md text-sm md:text-base leading-relaxed animate-fade-in"
    >
      <p>{faq.answer}</p>
    </div>
  {/if}
</div>
