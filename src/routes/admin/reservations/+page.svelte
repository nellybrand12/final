<script lang="ts">
  import { Search, Plus, Filter, MoreVertical, Edit, XCircle, Trash2 } from 'lucide-svelte';

  let { data } = $props();
  let reservations = $derived(data.reservations);
  let rooms = $derived(data.rooms);
  let searchQuery = $state('');

  let filteredReservations = $derived(
    (reservations || []).filter((r: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.bookingReference && r.bookingReference.toLowerCase().includes(q)) ||
        (r.guestName && r.guestName.toLowerCase().includes(q)) ||
        (r.guestEmail && r.guestEmail.toLowerCase().includes(q)) ||
        (r.roomName && r.roomName.toLowerCase().includes(q))
      );
    })
  );

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

  function getStatusLabel(status: string) {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight">Réservations</h1>
    <a href="/reserver" target="_blank" class="bg-deep-charcoal text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-2 cursor-pointer">
      <Plus size={16} />
      <span>Nouvelle Réservation</span>
    </a>
  </div>

  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-xs">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} class="text-gray-400 dark:text-neutral-500" />
        </div>
        <input type="text" bind:value={searchQuery} class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark" placeholder="Rechercher par nom, référence...">
      </div>
      <div class="flex items-center gap-2">
        <form method="GET" class="flex items-center gap-2">
          <Filter size={16} class="text-gray-400 dark:text-neutral-500" />
          <select name="status" onchange={(e) => e.currentTarget.form?.submit()} class="pl-2 pr-8 py-2 border border-gray-300 dark:border-neutral-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-deep-charcoal dark:focus:ring-brand-burgundy-dark focus:border-deep-charcoal dark:focus:border-brand-burgundy-dark bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100">
            <option value="all" selected={data.statusFilter === 'all'}>Tous les statuts</option>
            <option value="pending" selected={data.statusFilter === 'pending'}>En attente</option>
            <option value="confirmed" selected={data.statusFilter === 'confirmed'}>Confirmé</option>
            <option value="cancelled" selected={data.statusFilter === 'cancelled'}>Annulé</option>
            <option value="completed" selected={data.statusFilter === 'completed'}>Terminé</option>
          </select>
        </form>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
        <thead class="bg-gray-50 dark:bg-neutral-800/60">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Référence</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Client</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Chambre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Dates</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Montant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Statut</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
          {#each filteredReservations as res}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100">{res.bookingReference}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">{res.guestName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">{res.roomName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                {res.checkInDate} <br/> <span class="text-xs text-gray-400 dark:text-neutral-500">to</span> {res.checkOutDate}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">{formatCurrency(Number(res.totalPrice))}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(res.status)}">
                  {getStatusLabel(res.status)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <form method="POST" action="?/updateStatus">
                    <input type="hidden" name="id" value={res.id} />
                    {#if res.status === 'confirmed'}
                      <input type="hidden" name="status" value="cancelled" />
                      <button type="submit" class="text-red-600 hover:text-red-900 dark:text-rose-400 dark:hover:text-rose-300" title="Cancel Booking"><XCircle size={18} /></button>
                    {:else if res.status === 'pending' || res.status === 'cancelled'}
                      <input type="hidden" name="status" value="confirmed" />
                      <button type="submit" class="text-green-600 hover:text-green-900 dark:text-emerald-400 dark:hover:text-emerald-300" title="Mark as Confirmed">Confirm</button>
                    {/if}
                  </form>
                  <form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cette réservation ? Cela libérera également l\'inventaire lié.')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={res.id} />
                    <button type="submit" class="text-red-400 hover:text-red-600 dark:text-rose-400 dark:hover:text-rose-300 ml-2" title="Supprimer définitivement"><Trash2 size={18} /></button>
                  </form>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 dark:text-neutral-400">Aucune réservation trouvée.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
