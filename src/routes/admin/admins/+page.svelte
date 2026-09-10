<script lang="ts">
  import { ShieldCheck, Plus, Trash2, AlertCircle, CheckCircle2, UserCheck, Shield, KeyRound, Eye, EyeOff } from 'lucide-svelte';

  let { data, form } = $props();

  let showCreateModal = $state(false);
  let showPassword = $state(false);
  let newUsername = $state('');
  let newPassword = $state('');

  function formatDate(date: Date | string) {
    if (!date) return '—';
    const d = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }
</script>

<div class="space-y-6 max-w-5xl">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100 tracking-tight flex items-center gap-2.5">
        <ShieldCheck class="text-[#661f23] dark:text-[#bc9347]" size={28} />
        <span>Gestion des Administrateurs</span>
      </h1>
      <p class="text-sm text-gray-500 dark:text-neutral-400 mt-1">
        Créez et administrez les accès du personnel au tableau de bord.
      </p>
    </div>
    <button
      onclick={() => (showCreateModal = !showCreateModal)}
      class="bg-deep-charcoal text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-black dark:hover:bg-white transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
    >
      <Plus size={16} />
      <span>{showCreateModal ? 'Fermer le formulaire' : 'Nouvel Administrateur'}</span>
    </button>
  </div>

  <!-- Role Notice Banner -->
  <div class="bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 p-4 rounded-xl text-xs text-on-surface-variant dark:text-neutral-300 leading-relaxed flex items-start gap-3">
    <Shield size={18} class="text-[#661f23] dark:text-[#bc9347] shrink-0 mt-0.5" />
    <div>
      <strong class="font-semibold text-deep-charcoal dark:text-neutral-100 block mb-0.5">Hiérarchie des Rôles :</strong>
      Tous les administrateurs bénéficient d'un accès identique aux réservations, chambres, services, paiements et paramètres du site. Seul le <strong class="text-[#661f23] dark:text-[#bc9347]">Super Administrateur</strong> a l'autorisation de créer ou gérer les comptes d’accès.
    </div>
  </div>

  <!-- Feedback Alerts -->
  {#if form?.success && form?.message}
    <div class="rounded-xl bg-green-50 dark:bg-emerald-950/40 p-4 border border-green-200 dark:border-emerald-800 flex items-start gap-3 animate-fade-in">
      <CheckCircle2 class="text-green-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
      <div>
        <h3 class="text-sm font-medium text-green-800 dark:text-emerald-200">{form.message}</h3>
      </div>
    </div>
  {/if}

  {#if form?.error}
    <div class="rounded-xl bg-red-50 dark:bg-rose-950/40 p-4 border border-red-200 dark:border-rose-800 flex items-start gap-3 animate-fade-in">
      <AlertCircle class="text-red-500 dark:text-rose-400 shrink-0 mt-0.5" size={18} />
      <div>
        <h3 class="text-sm font-medium text-red-800 dark:text-rose-200">{form.error}</h3>
      </div>
    </div>
  {/if}

  <!-- New Admin Creation Form -->
  {#if showCreateModal}
    <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-md border-2 border-dashed border-[#bc9347]/40 dark:border-[#bc9347]/40 p-6 animate-fade-in">
      <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
        <UserCheck size={20} class="text-[#661f23] dark:text-[#bc9347]" />
        <h3 class="text-lg font-bold text-gray-900 dark:text-neutral-100">Créer un compte administrateur</h3>
      </div>

      <form method="POST" action="?/createAdmin" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Username -->
          <div>
            <label for="new_username" class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Nom d'utilisateur <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              id="new_username"
              bind:value={newUsername}
              placeholder="ex: marie.reception"
              required
              minlength="3"
              class="mt-1 block w-full border border-gray-300 dark:border-neutral-700 rounded-md py-2 px-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-[#661f23] dark:focus:border-[#bc9347] text-sm"
            />
            <span class="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 block">Identifiant unique utilisé pour la connexion.</span>
          </div>

          <!-- Password -->
          <div>
            <label for="new_password" class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Mot de passe <span class="text-red-500">*</span>
            </label>
            <div class="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="new_password"
                bind:value={newPassword}
                placeholder="Au moins 6 caractères"
                required
                minlength="6"
                class="block w-full border border-gray-300 dark:border-neutral-700 rounded-md py-2 pl-3 pr-10 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-[#661f23] dark:focus:ring-[#bc9347] focus:border-[#661f23] dark:focus:border-[#bc9347] text-sm"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200"
                tabindex="-1"
                aria-label="Afficher/masquer le mot de passe"
              >
                {#if showPassword}
                  <EyeOff size={16} />
                {:else}
                  <Eye size={16} />
                {/if}
              </button>
            </div>
            <span class="text-[11px] text-gray-500 dark:text-neutral-400 mt-1 block">Le mot de passe sera sécurisé et haché (bcrypt).</span>
          </div>
        </div>

        <!-- Role preview note -->
        <div class="bg-gray-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-gray-200/60 dark:border-neutral-700/60 text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-2">
          <KeyRound size={16} class="text-[#bc9347] shrink-0" />
          <span>Rôle attribué : <strong>Administrateur standard</strong> (accès opérationnel complet, sans droit de gestion d'utilisateurs).</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onclick={() => (showCreateModal = false)}
            class="px-4 py-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="bg-[#661f23] hover:bg-[#52191c] text-white dark:bg-[#bc9347] dark:hover:bg-[#a8823b] dark:text-neutral-950 px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Créer le compte
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Admins List -->
  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
    <div class="p-5 sm:p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-neutral-100">Comptes enregistrés</h3>
        <p class="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
          {data.admins?.length || 0} administrateur{(data.admins?.length || 0) > 1 ? 's' : ''} au total
        </p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-200 dark:border-neutral-800 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
            <th class="py-3.5 px-6">Utilisateur</th>
            <th class="py-3.5 px-6">Rôle & Permissions</th>
            <th class="py-3.5 px-6">Créé le</th>
            <th class="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-neutral-800 text-gray-700 dark:text-neutral-300">
          {#each data.admins as admin}
            <tr class="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40 transition-colors">
              <!-- Username -->
              <td class="py-4 px-6 font-medium text-gray-900 dark:text-neutral-100">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full {admin.role === 'super-admin' ? 'bg-[#661f23] text-white dark:bg-[#bc9347] dark:text-neutral-950' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-200'} flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {admin.username[0] || 'A'}
                  </div>
                  <div>
                    <span class="block font-semibold">{admin.username}</span>
                    <span class="text-xs text-gray-400 dark:text-neutral-500 font-mono">ID: #{admin.id}</span>
                  </div>
                </div>
              </td>

              <!-- Role & Permissions -->
              <td class="py-4 px-6">
                {#if admin.role === 'super-admin'}
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#661f23]/10 text-[#661f23] dark:bg-[#bc9347]/20 dark:text-[#bc9347] border border-[#661f23]/20 dark:border-[#bc9347]/30">
                    <ShieldCheck size={14} />
                    <span>Super Administrateur</span>
                  </div>
                  <span class="block text-[11px] text-gray-500 dark:text-neutral-400 mt-1">Accès total + gestion des comptes</span>
                {:else}
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                    <UserCheck size={14} />
                    <span>Administrateur</span>
                  </div>
                  <span class="block text-[11px] text-gray-500 dark:text-neutral-400 mt-1">Accès opérationnel complet</span>
                {/if}
              </td>

              <!-- Created At -->
              <td class="py-4 px-6 text-xs text-gray-500 dark:text-neutral-400">
                {formatDate(admin.createdAt)}
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-right">
                {#if admin.role === 'super-admin'}
                  <span class="text-xs text-gray-400 dark:text-neutral-600 italic">Protégé</span>
                {:else}
                  <form method="POST" action="?/deleteAdmin" class="inline-block">
                    <input type="hidden" name="id" value={admin.id} />
                    <button
                      type="submit"
                      onclick={(e) => {
                        if (!confirm(`Confirmez-vous la suppression du compte administrateur "${admin.username}" ?`)) {
                          e.preventDefault();
                        }
                      }}
                      class="text-red-600 dark:text-rose-400 hover:text-red-800 dark:hover:text-rose-300 bg-red-50 dark:bg-rose-950/40 hover:bg-red-100 p-2 rounded-md transition-colors cursor-pointer border border-red-200/60 dark:border-rose-900/40"
                      title="Supprimer ce compte"
                      aria-label="Supprimer ce compte"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="p-8 text-center text-gray-500 dark:text-neutral-400">
                Aucun administrateur trouvé.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
