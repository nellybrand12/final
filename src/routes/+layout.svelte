<script lang="ts">
  import { page } from '$app/stores';
  import './layout.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ConciergeBubble from '$lib/components/ConciergeBubble.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
  {#if $page.url.pathname.startsWith('/admin')}
    {@render children()}
  {:else}
    <Navbar />
    
    <main class="w-full flex-grow pt-20">
      {@render children()}
    </main>

    <Footer />
    <ConciergeBubble />
  {/if}
</div>
