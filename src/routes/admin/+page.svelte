<script lang="ts">
  import { Bar } from 'svelte-chartjs';
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
  import { DollarSign, Users, CreditCard, Activity } from 'lucide-svelte';
  import { themeManager } from '$lib/theme.svelte';

  Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  let { data } = $props();
  let stats = $derived(data.stats);
  let recentActivity = $derived(data.recentActivity);
  let chartData = $derived(data.chartData);

  let chartConfig = $derived({
    data: {
      labels: chartData.map(d => d.month),
      datasets: [
        {
          label: 'Revenue (FCFA)',
          data: chartData.map(d => d.revenue),
          backgroundColor: themeManager.isDark ? '#b7a18b' : '#1E293B',
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { color: themeManager.isDark ? '#a3a3a3' : '#6b7280' }
        },
        x: {
          grid: { display: false },
          ticks: { color: themeManager.isDark ? '#a3a3a3' : '#6b7280' }
        }
      }
    }
  });

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }
</script>

<div class="space-y-6">
  <!-- Page header & Tabs -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">Tableau de bord</h1>
    <button onclick={() => window.print()} class="flex items-center gap-2 bg-deep-charcoal text-white dark:bg-muted-gold dark:text-deep-charcoal dark:hover:bg-soft-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors cursor-pointer">
      <span class="material-symbols-outlined text-sm">print</span>
      Télécharger le Rapport
    </button>
  </div>

  <!-- Stat Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">Revenu Total</p>
        <DollarSign size={16} class="text-gray-400 dark:text-neutral-500" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">{formatCurrency(stats.totalRevenue)}</h3>
        <p class="text-xs text-green-600 dark:text-green-400 font-medium mt-1">All-time receipts</p>
      </div>
    </div>
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">Réservations</p>
        <Users size={16} class="text-gray-400 dark:text-neutral-500" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">+{stats.totalReservations}</h3>
        <p class="text-xs text-gray-500 dark:text-neutral-400 font-medium mt-1">Total bookings made</p>
      </div>
    </div>
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">Chambres Occupées</p>
        <CreditCard size={16} class="text-gray-400 dark:text-neutral-500" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">{stats.roomsInUse}</h3>
        <p class="text-xs text-gray-500 dark:text-neutral-400 font-medium mt-1">Active guests today</p>
      </div>
    </div>
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">Chambres Libres</p>
        <Activity size={16} class="text-gray-400 dark:text-neutral-500" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">{stats.freeRooms}</h3>
        <p class="text-xs text-gray-500 dark:text-neutral-400 font-medium mt-1">Available inventory</p>
      </div>
    </div>
  </div>

  <!-- Chart & Recent Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Chart Panel -->
    <div class="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col">
      <h3 class="text-base font-semibold text-gray-900 dark:text-neutral-100 mb-6">Aperçu</h3>
      <div class="flex-1 w-full min-h-[300px]">
        <Bar data={chartConfig.data} options={chartConfig.options} />
      </div>
    </div>

    <!-- Recent Activity Panel -->
    <div class="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 flex flex-col">
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-900 dark:text-neutral-100">Ventes Récentes</h3>
        <p class="text-sm text-gray-500 dark:text-neutral-400 mt-1">Dernières réservations.</p>
      </div>
      
      <div class="space-y-6 overflow-y-auto">
        {#each recentActivity as activity}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-neutral-300 shrink-0">
                {activity.guestName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div class="flex flex-col truncate pr-2">
                <span class="text-sm font-medium text-gray-900 dark:text-neutral-100 truncate">{activity.guestName}</span>
                <span class="text-xs text-gray-500 dark:text-neutral-400 truncate">{activity.guestEmail}</span>
              </div>
            </div>
            <div class="text-sm font-medium text-gray-900 dark:text-neutral-100 shrink-0 text-right">
              +{formatCurrency(Number(activity.totalPrice))}
            </div>
          </div>
        {:else}
          <p class="text-sm text-gray-500 dark:text-neutral-400 text-center py-4">Aucune activité récente.</p>
        {/each}
      </div>
    </div>
  </div>
</div>
