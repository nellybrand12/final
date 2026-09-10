<script lang="ts">
  import { page } from "$app/state";
  import { i18n } from "$lib/i18n.svelte";
  import { introManager } from "$lib/introState.svelte";
  import { themeManager } from "$lib/theme.svelte";

  let scrollY = $state(0);
  let isDrawerOpen = $state(false);

  let isScrolled = $derived(scrollY > 50);
  let isHomePage = $derived(page.url.pathname === "/");

  // Center logo is visible if already scrolled, or on other pages, or once hero intro animation finishes docking
  let isLogoVisible = $derived(
    !isHomePage || isScrolled || introManager.state === "docked",
  );

  const navLinks = $derived([
    { name: i18n.t.nav.home, path: "/", num: "01" },
    { name: i18n.t.nav.rooms, path: "/rooms", num: "02" },
    { name: i18n.t.nav.amenities, path: "/amenities", num: "03" },
    { name: i18n.t.nav.location, path: "/location", num: "04" },
    { name: i18n.t.nav.takeTour, path: "/take-a-tour", num: "05" },
    { name: i18n.t.nav.about, path: "/about", num: "06" },
    { name: i18n.t.nav.contact, path: "/contact", num: "07" },
    { name: i18n.t.nav.manageBooking, path: "/gerer-reservation", num: "08" },
  ]);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isDrawerOpen) {
      isDrawerOpen = false;
    }
  }
</script>

<svelte:window bind:scrollY onkeydown={handleKeydown} />

<!-- Main Top Navbar (Strictly 3 Elements: Left Menu, Center Logo, Right CTA + i18n Toggle) -->
<header
  class="fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out {isScrolled ||
  !isHomePage
    ? 'bg-deep-charcoal/92 backdrop-blur-[10px] sm:backdrop-blur-[16px] border-b border-muted-gold/25 shadow-2xl py-0'
    : 'bg-transparent border-b border-transparent py-2 sm:py-3 shadow-none'}"
>
  <div
    class="h-20 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between relative"
  >
    <!-- 1. LEFT: Hamburger / Sandwich Menu Button (No enclosing border or background capsule) -->
    <div class="flex items-center">
      <button
        onclick={() => (isDrawerOpen = true)}
        type="button"
        class="group flex items-center gap-3 py-2 px-1 text-soft-cream hover:text-muted-gold transition-all duration-300 cursor-pointer focus:outline-none [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.5))]"
        aria-label={i18n.t.nav.menu}
      >
        <!-- Sandwich Icon -->
        <div class="flex flex-col justify-center gap-1.5 w-6 h-5">
          <span
            class="w-full h-[2px] bg-current transition-all duration-300 group-hover:w-4"
          ></span>
          <span
            class="w-full h-[2px] bg-current transition-all duration-300"
          ></span>
          <span
            class="w-3/4 h-[2px] bg-current transition-all duration-300 group-hover:w-full"
          ></span>
        </div>
        <!-- Menu Text -->
        <span
          class="font-label-caps text-xs tracking-[0.25em] font-semibold text-current transition-colors hidden sm:inline-block"
        >
          {i18n.t.nav.menu}
        </span>
      </button>
    </div>

    <!-- 2. CENTER: Hôtel Résidence Madadjeu brand lockup. Absolutely centred
         from `sm` up; on mobile it flows between the menu button and the CTA
         (justify-between) so the wide lockup can't overlap either. -->
    <div
      class="flex items-center justify-center pointer-events-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2"
    >
      <a
        href="/"
        class="block transition-all duration-700 {isLogoVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-90 -translate-y-2 pointer-events-none'}"
      >
        <img
          alt="Hotel Résidence Madadjeu Logo"
          class="h-7 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t"
        />
        <div class="hidden sm:flex flex-col items-start">
          <span
            class="font-headline text-xs sm:text-sm md:text-base font-medium tracking-[0.22em] text-soft-cream uppercase group-hover:text-muted-gold transition-colors"
          >
            Madadjeu
          </span>
          <span
            class="text-[6px] sm:text-[7px] md:text-[8px] uppercase tracking-[0.28em] text-muted-gold font-sans"
          >
            Hôtel & Résidence
          </span>
        </div>
      </a>
    </div>

    <!-- 3. RIGHT: Language Toggle (FR/EN for Desktop) & Réserver / Book Now Button (Ultra-compact for Mobile) -->
    <div class="flex items-center gap-1.5 sm:gap-3">
      <!-- FR / EN Language Toggle Switch (Desktop & Tablet only) -->
      <div
        class="hidden sm:flex items-center bg-white/10 p-1 border border-white/15 text-[11px] font-label-caps tracking-widest text-soft-cream/90"
      >
        <button
          type="button"
          onclick={() => i18n.setLocale("fr")}
          class="px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer {i18n.locale ===
          'fr'
            ? 'bg-muted-gold text-deep-charcoal font-bold shadow-sm'
            : 'text-soft-cream/70 hover:text-soft-cream'}"
          aria-label="Passer en français"
        >
          FR
        </button>
        <span class="text-white/20 text-[9px] px-0.5">•</span>
        <button
          type="button"
          onclick={() => i18n.setLocale("en")}
          class="px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer {i18n.locale ===
          'en'
            ? 'bg-muted-gold text-deep-charcoal font-bold shadow-sm'
            : 'text-soft-cream/70 hover:text-soft-cream'}"
          aria-label="Switch to English"
        >
          EN
        </button>
      </div>

      <!-- Theme Toggle (Desktop & Tablet) -->
      <button
        type="button"
        onclick={() => themeManager.toggle('public')}
        class="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-soft-cream hover:text-muted-gold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-muted-gold"
        role="switch"
        aria-checked={themeManager.isDark}
        aria-label={themeManager.isDark ? (i18n.locale === 'fr' ? 'Passer au thème clair' : 'Switch to light theme') : (i18n.locale === 'fr' ? 'Passer au thème sombre' : 'Switch to dark theme')}
        title={themeManager.isDark ? (i18n.locale === 'fr' ? 'Thème clair' : 'Light theme') : (i18n.locale === 'fr' ? 'Thème sombre' : 'Dark theme')}
      >
        {#if themeManager.isDark}
          <span class="material-symbols-outlined text-[17px]">light_mode</span>
        {:else}
          <span class="material-symbols-outlined text-[17px]">dark_mode</span>
        {/if}
      </button>

      <!-- Action Button (Réserver / Book Now) (Ultra-compact on mobile) -->
      <a
        href="/reserver"
        class="btn-luxury-primary text-[7px] sm:text-[11px] py-0.5 sm:py-2.5 px-2 sm:px-5 tracking-tight sm:tracking-[0.16em]"
      >
        <span
          class="material-symbols-outlined text-[13px] sm:text-[14px] mr-1 hidden sm:inline-block"
          >calendar_today</span
        >
        <span>{i18n.t.nav.bookNow}</span>
      </a>
    </div>
  </div>
</header>

<!-- ================= FLOATING LANGUAGE TOGGLE (Bottom-Left Corner - Mobile View Only) ================= -->
<div
  class="fixed bottom-6 left-5 z-40 sm:hidden flex items-center bg-deep-charcoal/90 backdrop-blur-md p-1 border border-white/20 shadow-2xl"
  role="region"
  aria-label="Sélection de la langue / Language selector"
>
  <button
    type="button"
    onclick={() => i18n.setLocale("fr")}
    class="px-2.5 py-1 text-[9px] font-label-caps font-semibold tracking-wider transition-all duration-200 cursor-pointer {i18n.locale ===
    'fr'
      ? 'bg-muted-gold text-deep-charcoal font-bold shadow-sm'
      : 'text-soft-cream/70 hover:text-soft-cream'}"
    aria-label="Passer en français"
  >
    FR
  </button>
  <span class="text-white/30 text-[8px] px-1">•</span>
  <button
    type="button"
    onclick={() => i18n.setLocale("en")}
    class="px-2.5 py-1 text-[9px] font-label-caps font-semibold tracking-wider transition-all duration-200 cursor-pointer {i18n.locale ===
    'en'
      ? 'bg-muted-gold text-deep-charcoal font-bold shadow-sm'
      : 'text-soft-cream/70 hover:text-soft-cream'}"
    aria-label="Switch to English"
  >
    EN
  </button>
  <span class="text-white/30 text-[8px] px-1">•</span>
  <button
    type="button"
    onclick={() => themeManager.toggle('public')}
    class="px-2 py-1 text-soft-cream hover:text-muted-gold transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
    role="switch"
    aria-checked={themeManager.isDark}
    aria-label={themeManager.isDark ? (i18n.locale === 'fr' ? 'Passer au thème clair' : 'Switch to light theme') : (i18n.locale === 'fr' ? 'Passer au thème sombre' : 'Switch to dark theme')}
    title={themeManager.isDark ? (i18n.locale === 'fr' ? 'Thème clair' : 'Light theme') : (i18n.locale === 'fr' ? 'Thème sombre' : 'Dark theme')}
  >
    {#if themeManager.isDark}
      <span class="material-symbols-outlined text-[14px]">light_mode</span>
    {:else}
      <span class="material-symbols-outlined text-[14px]">dark_mode</span>
    {/if}
  </button>
</div>

<!-- ================= SLIDE-OUT DRAWER / OVERLAY MENU ================= -->
{#if isDrawerOpen}
  <!-- Backdrop Blur overlay -->
  <button
    type="button"
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity duration-500 animate-fade-in w-full h-full border-none cursor-default"
    onclick={() => (isDrawerOpen = false)}
    aria-label={i18n.t.nav.close}
  ></button>

  <!-- Slide-out Drawer Panel -->
  <div
    class="fixed top-0 left-0 bottom-0 w-full sm:w-[420px] md:w-[460px] z-50 bg-deep-charcoal/98 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto transition-transform duration-500 ease-out transform translate-x-0"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation Menu"
  >
    <!-- Drawer Header -->
    <div
      class="flex items-center justify-between border-b border-white/10 pb-5"
    >
      <a
        href="/"
        onclick={() => (isDrawerOpen = false)}
        class="flex items-center gap-3"
      >
        <img
          alt="Hotel Résidence Madadjeu Logo"
          class="h-7 w-auto object-contain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDRdcu8uUN5wGIRfh5vUGwijfogXufOv1BE2m6lWJBkKsWZaoz0jBTPUH8jGV5WMHR8_jPxR5L9-h564W1x3k3z8Wh16qweorvfIFzqZiR6duxv06Xo0sD3j4D3IkTE1mBhp2PzttmQmtkK00f5lJWbgs8SLJsEgyOVs-yODOw1hI6vj26sa7Vf5xm965vU3xD_iVBkxzWcCLkhTAgaGi9eSDIJv8AMjdwGAzs1dcYbhGTrRvV4s5t"
        />
        <span
          class="font-headline text-base tracking-[0.2em] uppercase text-soft-cream"
        >
          Madadjeu
        </span>
      </a>

      <!-- Close Button -->
      <button
        onclick={() => (isDrawerOpen = false)}
        type="button"
        class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-soft-cream hover:text-muted-gold transition-all duration-300 cursor-pointer focus:outline-none"
        aria-label={i18n.t.nav.close}
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <!-- Language Switcher in Menu -->
    <div
      class="py-4 border-b border-white/10 flex items-center justify-between"
    >
      <span
        class="font-label-caps text-[11px] text-soft-cream/60 tracking-widest uppercase"
      >
        {i18n.t.nav.language} :
      </span>
      <div
        class="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10"
      >
        <button
          type="button"
          onclick={() => i18n.setLocale("fr")}
          class="px-3.5 py-1 rounded-full font-label-caps text-[10px] transition-all cursor-pointer {i18n.locale ===
          'fr'
            ? 'bg-muted-gold text-deep-charcoal font-bold shadow-md'
            : 'text-soft-cream/70 hover:text-soft-cream'}"
        >
          Français (FR)
        </button>
        <button
          type="button"
          onclick={() => i18n.setLocale("en")}
          class="px-3.5 py-1 rounded-full font-label-caps text-[10px] transition-all cursor-pointer {i18n.locale ===
          'en'
            ? 'bg-muted-gold text-deep-charcoal font-bold shadow-md'
            : 'text-soft-cream/70 hover:text-soft-cream'}"
        >
          English (EN)
        </button>
      </div>
    </div>

    <!-- Theme Switcher in Menu -->
    <div
      class="py-4 border-b border-white/10 flex items-center justify-between"
    >
      <span
        class="font-label-caps text-[11px] text-soft-cream/60 tracking-widest uppercase"
      >
        {i18n.locale === 'fr' ? 'Thème' : 'Theme'} :
      </span>
      <button
        type="button"
        onclick={() => themeManager.toggle('public')}
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-soft-cream hover:text-muted-gold font-label-caps text-[10px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-muted-gold"
        role="switch"
        aria-checked={themeManager.isDark}
        aria-label={themeManager.isDark ? (i18n.locale === 'fr' ? 'Passer au thème clair' : 'Switch to light theme') : (i18n.locale === 'fr' ? 'Passer au thème sombre' : 'Switch to dark theme')}
      >
        {#if themeManager.isDark}
          <span class="material-symbols-outlined text-sm text-muted-gold">light_mode</span>
          <span>{i18n.locale === 'fr' ? 'Mode Clair' : 'Light Mode'}</span>
        {:else}
          <span class="material-symbols-outlined text-sm text-muted-gold">dark_mode</span>
          <span>{i18n.locale === 'fr' ? 'Mode Sombre' : 'Dark Mode'}</span>
        {/if}
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="my-5 flex flex-col gap-1.5">
      {#each navLinks as link}
        {@const isActive =
          page.url.pathname === link.path ||
          (link.path !== "/" && page.url.pathname.startsWith(link.path))}
        <a
          href={link.path}
          onclick={() => (isDrawerOpen = false)}
          class="group flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-300 {isActive
            ? 'bg-white/10 text-muted-gold font-bold pl-4'
            : 'text-soft-cream/80 hover:text-soft-cream hover:bg-white/5 hover:pl-4'}"
        >
          <div class="flex items-center gap-3.5">
            <span
              class="text-[9px] font-mono text-muted-gold/60 group-hover:text-muted-gold"
            >
              {link.num}
            </span>
            <span
              class="font-headline text-lg sm:text-xl font-light tracking-wide transition-colors"
            >
              {link.name}
            </span>
          </div>
          <span
            class="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-muted-gold transition-all"
          >
            arrow_forward
          </span>
        </a>
      {/each}
    </nav>

    <!-- Drawer Footer Actions & Details -->
    <div class="pt-6 border-t border-white/10 flex flex-col gap-6">
      <a
        href="/reserver"
        onclick={() => (isDrawerOpen = false)}
        class="btn-luxury-primary w-full py-4 text-center"
      >
        {i18n.t.nav.bookStay}
      </a>

      <!-- Contact Info Summary -->
      <div
        class="text-xs text-soft-cream/60 flex flex-col gap-1.5 leading-relaxed"
      >
        <span
          class="font-label-caps text-[10px] text-warm-taupe tracking-widest uppercase"
        >
          {i18n.t.nav.addressTitle}
        </span>
        <span>{i18n.t.nav.address}</span>
        <div class="flex items-center justify-between pt-2 text-soft-cream/80">
          <a
            href="tel:+237691890963"
            class="hover:text-muted-gold transition-colors font-medium"
          >
            {i18n.t.nav.phone}
          </a>
          <span class="text-muted-gold">•</span>
          <span>{i18n.t.nav.conciergeService}</span>
        </div>
      </div>
    </div>
  </div>
{/if}
