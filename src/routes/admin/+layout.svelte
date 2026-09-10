<script lang="ts">
  import { page } from '$app/stores';
  import { 
    LayoutDashboard, 
    CalendarCheck, 
    CreditCard, 
    Settings, 
    BedDouble, 
    ConciergeBell,
    Menu,
    LogOut,
    Search,
    User,
    ExternalLink,
    Sun,
    Moon,
    ShieldCheck
  } from 'lucide-svelte';
  import { themeManager } from '$lib/theme.svelte';

  let { data, children } = $props();

  let sidebarOpen = $state(true);

  const navItems = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Réservations', href: '/admin/reservations', icon: CalendarCheck },
    { name: 'Paiements', href: '/admin/payments', icon: CreditCard },
  ];

  const contentItems = [
    { name: 'Chambres & Salles', href: '/admin/content/rooms', icon: BedDouble },
    { name: 'Services', href: '/admin/content/services', icon: ConciergeBell },
    { name: 'Paramètres', href: '/admin/content/settings', icon: Settings },
  ];
</script>

<svelte:head>
  <title>Admin Dashboard - Résidence Madadjeu</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex, nofollow" />
</svelte:head>

<!-- If it's the login page, don't show the dashboard layout -->
{#if $page.url.pathname === '/admin/login'}
  {@render children()}
{:else}
  <div class="flex h-screen bg-gray-50 dark:bg-neutral-950 overflow-hidden font-sans">
    
    <!-- Sidebar -->
    <aside class="{sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transition-all duration-300 ease-in-out flex flex-col z-20 hidden md:flex">
      <!-- Logo area -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-neutral-800 overflow-hidden shrink-0">
        <div class="flex items-center gap-3 w-full">
          <div class="w-8 h-8 rounded bg-deep-charcoal text-white dark:bg-muted-gold dark:text-deep-charcoal flex items-center justify-center font-bold shrink-0">
            M
          </div>
          {#if sidebarOpen}
            <span class="font-bold text-sm truncate uppercase tracking-wider text-deep-charcoal dark:text-soft-cream">Admin Madadjeu</span>
          {/if}
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-4 scrollbar-hide">
        
        <div class="px-3 mb-6">
          {#if sidebarOpen}
            <p class="px-2 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Général</p>
          {/if}
          <div class="space-y-1">
            {#each navItems as item}
              {@const Icon = item.icon}
              <a href={item.href} class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors {$page.url.pathname === item.href ? 'bg-gray-100 text-deep-charcoal dark:bg-neutral-800 dark:text-white font-medium' : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-50 hover:dark:bg-neutral-800/60 hover:text-gray-900 hover:dark:text-white'}">
                <Icon size={20} class="shrink-0" />
                {#if sidebarOpen}
                  <span class="truncate">{item.name}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>

        <div class="px-3">
          {#if sidebarOpen}
            <p class="px-2 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Contenu</p>
          {/if}
          <div class="space-y-1">
            {#each contentItems as item}
              {@const Icon = item.icon}
              <a href={item.href} class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors {$page.url.pathname === item.href ? 'bg-gray-100 text-deep-charcoal dark:bg-neutral-800 dark:text-white font-medium' : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-50 hover:dark:bg-neutral-800/60 hover:text-gray-900 hover:dark:text-white'}">
                <Icon size={20} class="shrink-0" />
                {#if sidebarOpen}
                  <span class="truncate">{item.name}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>

        {#if data.user?.role === 'super-admin'}
          <div class="px-3 mt-6">
            {#if sidebarOpen}
              <p class="px-2 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Accès & Rôles</p>
            {/if}
            <div class="space-y-1">
              <a href="/admin/admins" class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors {$page.url.pathname === '/admin/admins' ? 'bg-gray-100 text-deep-charcoal dark:bg-neutral-800 dark:text-white font-medium' : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-50 hover:dark:bg-neutral-800/60 hover:text-gray-900 hover:dark:text-white'}">
                <ShieldCheck size={20} class="shrink-0 text-[#661f23] dark:text-[#bc9347]" />
                {#if sidebarOpen}
                  <span class="truncate">Administrateurs</span>
                {/if}
              </a>
            </div>
          </div>
        {/if}
      </div>

      <!-- User profile bottom -->
      <div class="p-4 border-t border-gray-200 dark:border-neutral-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full {data.user?.role === 'super-admin' ? 'bg-[#661f23]/10 text-[#661f23] dark:bg-[#bc9347]/20 dark:text-[#bc9347]' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300'} flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          {#if sidebarOpen}
            <div class="flex flex-col flex-1 overflow-hidden">
              <div class="flex items-center gap-1.5 truncate">
                <span class="text-sm font-medium text-gray-900 dark:text-neutral-100 truncate">{data.user?.username || 'Admin'}</span>
                {#if data.user?.role === 'super-admin'}
                  <span class="px-1.5 py-0.2 text-[9px] font-bold bg-[#661f23]/10 text-[#661f23] dark:bg-[#bc9347]/20 dark:text-[#bc9347] rounded uppercase tracking-wider shrink-0">Super</span>
                {:else}
                  <span class="px-1.5 py-0.2 text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300 rounded uppercase tracking-wider shrink-0">Admin</span>
                {/if}
              </div>
              <a href="/admin/logout" class="text-xs text-red-500 hover:text-red-400 truncate">Déconnexion</a>
            </div>
          {/if}
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar -->
      <header class="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div class="flex items-center gap-4">
          <button onclick={() => sidebarOpen = !sidebarOpen} class="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-gray-100 hover:dark:bg-neutral-800 hidden md:block">
            <Menu size={20} />
          </button>
          
          <!-- Breadcrumb (simplified) -->
          <nav class="hidden sm:flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2 text-sm text-gray-500 dark:text-neutral-400">
              <li>Admin</li>
              {#if $page.url.pathname !== '/admin'}
                <li>
                  <svg class="w-4 h-4 text-gray-400 dark:text-neutral-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                </li>
                <li class="capitalize text-gray-900 dark:text-neutral-100 font-medium">
                  {$page.url.pathname.split('/').pop()?.replace(/-/g, ' ')}
                </li>
              {/if}
            </ol>
          </nav>
        </div>

        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Admin Theme Toggle -->
          <button
            type="button"
            onclick={() => themeManager.toggle('admin')}
            class="p-2 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-gray-100 hover:dark:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-muted-gold"
            role="switch"
            aria-checked={themeManager.isDark}
            aria-label={themeManager.isDark ? "Activer le mode clair" : "Activer le mode sombre"}
            title={themeManager.isDark ? "Mode clair" : "Mode sombre"}
          >
            {#if themeManager.isDark}
              <Sun size={20} class="text-muted-gold" />
            {:else}
              <Moon size={20} />
            {/if}
          </button>

          <a href="/" target="_blank" rel="noopener noreferrer" class="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300 hover:text-deep-charcoal hover:dark:text-white font-medium transition-colors border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 hover:dark:bg-neutral-700 rounded-md px-3 py-1.5">
            <ExternalLink size={16} />
            <span>Voir le site public</span>
          </a>
          <div class="relative hidden lg:block">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} class="text-gray-400 dark:text-neutral-500" />
            </div>
            <input type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md leading-5 bg-white dark:bg-neutral-800 placeholder-gray-500 dark:placeholder-neutral-500 text-gray-900 dark:text-neutral-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-muted-gold focus:border-deep-charcoal dark:focus:border-muted-gold sm:text-sm" placeholder="Rechercher...">
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto bg-gray-50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          {@render children()}
        </div>
      </div>

    </main>
  </div>
{/if}
