<script lang="ts">
  import { Search, Download, Filter } from 'lucide-svelte';

  let { data } = $props();
  let payments = $derived(data.payments);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function formatDate(date: string | Date) {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Paiements</h1>
    <button class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
      <Download size={16} />
      <span>Exporter CSV</span>
    </button>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-xs">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} class="text-gray-400" />
        </div>
        <input type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-deep-charcoal focus:border-deep-charcoal" placeholder="Rechercher par ID de transaction...">
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2">
          <Filter size={16} />
          <span>Filtrer</span>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaction</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réf. Réservation</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each payments as payment}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.createdAt)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{payment.paymentTransactionId || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{payment.paymentMethod?.replace('_', ' ')}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href="/admin/reservations?q={payment.bookingReference}" class="text-blue-600 hover:underline">{payment.bookingReference}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.guestName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(Number(payment.totalPrice))}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(payment.status)}">
                  {payment.status === 'confirmed' ? 'Paid' : payment.status === 'pending' ? 'Pending' : payment.status}
                </span>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">Aucun enregistrement de paiement trouvé.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
