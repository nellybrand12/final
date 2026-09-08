<script lang="ts">
  import { Bar } from 'svelte-chartjs';
  import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
  import { DollarSign, Users, CreditCard, Activity } from 'lucide-svelte';

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
          backgroundColor: '#14110F', // deep-charcoal
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
          grid: { display: false }
        },
        x: {
          grid: { display: false }
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
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord</h1>
    <button class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors">
      Télécharger le Rapport
    </button>
  </div>

  <div class="flex items-center gap-6 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-hide">
    <button class="text-sm font-medium text-deep-charcoal border-b-2 border-deep-charcoal pb-2 whitespace-nowrap">Aperçu</button>
    <button class="text-sm font-medium text-gray-500 hover:text-gray-700 pb-2 whitespace-nowrap">Analyses</button>
    <button class="text-sm font-medium text-gray-500 hover:text-gray-700 pb-2 whitespace-nowrap">Rapports</button>
    <button class="text-sm font-medium text-gray-500 hover:text-gray-700 pb-2 whitespace-nowrap">Notifications</button>
  </div>

  <!-- Stat Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500">Revenu Total</p>
        <DollarSign size={16} class="text-gray-400" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
        <p class="text-xs text-green-600 font-medium mt-1">All-time receipts</p>
      </div>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500">Réservations</p>
        <Users size={16} class="text-gray-400" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">+{stats.totalReservations}</h3>
        <p class="text-xs text-gray-500 font-medium mt-1">Total bookings made</p>
      </div>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500">Chambres Occupées</p>
        <CreditCard size={16} class="text-gray-400" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{stats.roomsInUse}</h3>
        <p class="text-xs text-gray-500 font-medium mt-1">Active guests today</p>
      </div>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div class="flex justify-between items-start mb-4">
        <p class="text-sm font-medium text-gray-500">Chambres Libres</p>
        <Activity size={16} class="text-gray-400" />
      </div>
      <div>
        <h3 class="text-2xl font-bold text-gray-900">{stats.freeRooms}</h3>
        <p class="text-xs text-gray-500 font-medium mt-1">Available inventory</p>
      </div>
    </div>
  </div>

  <!-- Chart & Recent Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Chart Panel -->
    <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <h3 class="text-base font-semibold text-gray-900 mb-6">Aperçu</h3>
      <div class="flex-1 w-full min-h-[300px]">
        <Bar data={chartConfig.data} options={chartConfig.options} />
      </div>
    </div>

    <!-- Recent Activity Panel -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div class="mb-6">
        <h3 class="text-base font-semibold text-gray-900">Ventes Récentes</h3>
        <p class="text-sm text-gray-500 mt-1">Dernières réservations.</p>
      </div>
      
      <div class="space-y-6 overflow-y-auto">
        {#each recentActivity as activity}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                {activity.guestName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div class="flex flex-col truncate pr-2">
                <span class="text-sm font-medium text-gray-900 truncate">{activity.guestName}</span>
                <span class="text-xs text-gray-500 truncate">{activity.guestEmail}</span>
              </div>
            </div>
            <div class="text-sm font-medium text-gray-900 shrink-0 text-right">
              +{formatCurrency(Number(activity.totalPrice))}
            </div>
          </div>
        {:else}
          <p class="text-sm text-gray-500 text-center py-4">Aucune activité récente.</p>
        {/each}
      </div>
    </div>
  </div>
</div>
