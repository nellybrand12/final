<script lang="ts">
  import { page } from '$app/stores';
  import './layout.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ConciergeBubble from '$lib/components/ConciergeBubble.svelte';
  import CookieBanner from '$lib/components/CookieBanner.svelte';
  import { themeManager } from '$lib/theme.svelte';

  let { children } = $props();

  $effect(() => {
    themeManager.syncRoute($page.url.pathname);
  });
</script>

<div class="min-h-screen flex flex-col justify-between bg-surface dark:bg-neutral-950 text-on-surface dark:text-neutral-100">
  {#if $page.url.pathname.startsWith('/admin')}
    {@render children()}
  {:else}
    <Navbar />
    
    <main class="w-full flex-grow pt-20">
      {@render children()}
    </main>

    <Footer />
    <ConciergeBubble />
    <CookieBanner />
  {/if}
</div>
