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
    ExternalLink
  } from 'lucide-svelte';

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
</svelte:head>

<!-- If it's the login page, don't show the dashboard layout -->
{#if $page.url.pathname === '/admin/login'}
  {@render children()}
{:else}
  <div class="flex h-screen bg-gray-50 overflow-hidden font-sans">
    
    <!-- Sidebar -->
    <aside class="{sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-20 hidden md:flex">
      <!-- Logo area -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200 overflow-hidden shrink-0">
        <div class="flex items-center gap-3 w-full">
          <div class="w-8 h-8 rounded bg-deep-charcoal text-white flex items-center justify-center font-bold shrink-0">
            M
          </div>
          {#if sidebarOpen}
            <span class="font-bold text-sm truncate uppercase tracking-wider text-deep-charcoal">Admin Madadjeu</span>
          {/if}
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-4 scrollbar-hide">
        
        <div class="px-3 mb-6">
          {#if sidebarOpen}
            <p class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Général</p>
          {/if}
          <div class="space-y-1">
            {#each navItems as item}
              {@const Icon = item.icon}
              <a href={item.href} class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors {$page.url.pathname === item.href ? 'bg-gray-100 text-deep-charcoal font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}">
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
            <p class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contenu</p>
          {/if}
          <div class="space-y-1">
            {#each contentItems as item}
              {@const Icon = item.icon}
              <a href={item.href} class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors {$page.url.pathname === item.href ? 'bg-gray-100 text-deep-charcoal font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}">
                <Icon size={20} class="shrink-0" />
                {#if sidebarOpen}
                  <span class="truncate">{item.name}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      </div>

      <!-- User profile bottom -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-600">
            <User size={18} />
          </div>
          {#if sidebarOpen}
            <div class="flex flex-col flex-1 overflow-hidden">
              <span class="text-sm font-medium text-gray-900 truncate">{data.user?.username || 'Admin'}</span>
              <a href="/admin/logout" class="text-xs text-red-500 hover:text-red-700 truncate">Déconnexion</a>
            </div>
          {/if}
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div class="flex items-center gap-4">
          <button onclick={() => sidebarOpen = !sidebarOpen} class="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 hidden md:block">
            <Menu size={20} />
          </button>
          
          <!-- Breadcrumb (simplified) -->
          <nav class="hidden sm:flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2 text-sm text-gray-500">
              <li>Admin</li>
              {#if $page.url.pathname !== '/admin'}
                <li>
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                </li>
                <li class="capitalize text-gray-900 font-medium">
                  {$page.url.pathname.split('/').pop()?.replace(/-/g, ' ')}
                </li>
              {/if}
            </ol>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <a href="/" target="_blank" rel="noopener noreferrer" class="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-deep-charcoal font-medium transition-colors border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-md px-3 py-1.5">
            <ExternalLink size={16} />
            <span>Voir le site public</span>
          </a>
          <div class="relative hidden lg:block">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} class="text-gray-400" />
            </div>
            <input type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-deep-charcoal focus:border-deep-charcoal sm:text-sm" placeholder="Rechercher...">
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          {@render children()}
        </div>
      </div>

    </main>
  </div>
{/if}
