<script lang="ts">
  import { Search, Plus, Filter, MoreVertical, Edit, XCircle, Trash2 } from 'lucide-svelte';

  let { data } = $props();
  let reservations = $derived(data.reservations);
  let rooms = $derived(data.rooms);

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
    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Réservations</h1>
    <button class="bg-deep-charcoal text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
      <Plus size={16} />
      <span>Nouvelle Réservation</span>
    </button>
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-xs">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} class="text-gray-400" />
        </div>
        <input type="text" class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-deep-charcoal focus:border-deep-charcoal" placeholder="Rechercher par nom, référence...">
      </div>
      <div class="flex items-center gap-2">
        <form method="GET" class="flex items-center gap-2">
          <Filter size={16} class="text-gray-400" />
          <select name="status" onchange={(e) => e.currentTarget.form?.submit()} class="pl-2 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-deep-charcoal focus:border-deep-charcoal bg-white">
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
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chambre</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each reservations as res}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{res.bookingReference}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.guestName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.roomName}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {res.checkInDate} <br/> <span class="text-xs text-gray-400">to</span> {res.checkOutDate}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(Number(res.totalPrice))}</td>
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
                      <button type="submit" class="text-red-600 hover:text-red-900" title="Cancel Booking"><XCircle size={18} /></button>
                    {:else if res.status === 'pending' || res.status === 'cancelled'}
                      <input type="hidden" name="status" value="confirmed" />
                      <button type="submit" class="text-green-600 hover:text-green-900" title="Mark as Confirmed">Confirm</button>
                    {/if}
                  </form>
                  <form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cette réservation ? Cela libérera également l\'inventaire lié.')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={res.id} />
                    <button type="submit" class="text-red-400 hover:text-red-600 ml-2" title="Supprimer définitivement"><Trash2 size={18} /></button>
                  </form>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500">Aucune réservation trouvée.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
