<script lang="ts">
  import { Search, Download, Filter } from 'lucide-svelte';

  let { data } = $props();
  let payments = $derived(data.payments);
  let searchQuery = $state('');
  let statusFilter = $state('all');

  let filteredPayments = $derived(
    (payments || []).filter((p: any) => {
      const matchesSearch = !searchQuery || 
        (p.paymentTransactionId && p.paymentTransactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.bookingReference && p.bookingReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.guestName && p.guestName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  );

  function exportCSV() {
    if (!filteredPayments || filteredPayments.length === 0) return;
    const headers = ['Date', 'ID Transaction', 'Methode', 'Ref Reservation', 'Client', 'Montant (FCFA)', 'Statut'];
    const rows = filteredPayments.map((p: any) => [
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
      `"${(p.paymentTransactionId || '').replace(/"/g, '""')}"`,
      `"${(p.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(p.bookingReference || '').replace(/"/g, '""')}"`,
      `"${(p.guestName || '').replace(/"/g, '""')}"`,
      p.totalPrice || '',
      p.status || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `paiements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/70 dark:text-amber-300';
      case 'failed':
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-rose-950/70 dark:text-rose-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  }
  
  function formatDate(date: string | Date) {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">Paiements</h1>
    <button onclick={exportCSV} class="bg-deep-charcoal text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-2 cursor-pointer">
      <Download size={16} />
      <span>Exporter CSV</span>
    </button>
  </div>

  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-xs">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} class="text-gray-400 dark:text-neutral-500" />
        </div>
        <input type="text" bind:value={searchQuery} class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark" placeholder="Rechercher par ID ou client...">
      </div>
      <div class="flex items-center gap-2">
        <label for="statusFilter" class="sr-only">Filtrer par statut</label>
        <div class="relative">
          <select id="statusFilter" bind:value={statusFilter} class="px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none transition-colors cursor-pointer">
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Payé / Confirmé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué / Annulé</option>
          </select>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
        <thead class="bg-gray-50 dark:bg-neutral-800/60">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">ID Transaction</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Méthode</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Réf. Réservation</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Client</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Montant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
          {#each filteredPayments as payment}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">{formatDate(payment.createdAt)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-neutral-400">{payment.paymentTransactionId || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100 capitalize">{payment.paymentMethod?.replace('_', ' ')}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                <a href="/admin/reservations?q={payment.bookingReference}" class="text-blue-600 dark:text-blue-400 hover:underline">{payment.bookingReference}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">{payment.guestName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100 font-medium">{formatCurrency(Number(payment.totalPrice))}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(payment.status)}">
                  {payment.status === 'confirmed' ? 'Paid' : payment.status === 'pending' ? 'Pending' : payment.status}
                </span>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-neutral-400">Aucun enregistrement de paiement trouvé.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
