<script lang="ts">
  import type { ActionData } from './$types';
  import SEO from '$lib/components/SEO.svelte';
  import { i18n } from '$lib/i18n.svelte';

  let { form }: { form: ActionData } = $props();

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let subject = $state(i18n.t.contact.subjectRates);
  let message = $state('');
</script>

<SEO title={i18n.t.contact.metaTitle} description={i18n.t.contact.metaDesc} />

<div class="w-full bg-surface dark:bg-neutral-950 py-12 md:py-20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <!-- Header Hero Intro -->
    <div class="text-center max-w-3xl mx-auto mb-16">
      <span class="font-label-caps text-muted-gold dark:text-muted-gold-dark tracking-widest text-xs mb-3 block uppercase font-semibold">
        {i18n.t.contact.badge}
      </span>
      <h1 class="font-display-lg text-deep-charcoal dark:text-neutral-100 mb-6">
        {i18n.t.contact.heading}
      </h1>
      <p class="font-body-lg text-on-surface-variant dark:text-neutral-400 leading-relaxed">
        {i18n.t.contact.description}
      </p>
    </div>

    <!-- Contact Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
      <!-- Left Column: Form -->
      <div class="lg:col-span-7 bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 p-6 md:p-10 shadow-sm">
        <h2 class="font-headline text-2xl text-deep-charcoal dark:text-neutral-100 font-bold mb-6">{i18n.t.contact.formTitle}</h2>

        {#if form?.success}
          <div class="p-6 bg-green-50 dark:bg-emerald-950/40 text-green-900 dark:text-emerald-200 border border-green-200 dark:border-emerald-800/40 space-y-3 mb-6 animate-fade-in">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-green-600 dark:text-emerald-400 text-2xl">check_circle</span>
              <strong class="font-headline text-lg">{i18n.t.contact.successBadge}</strong>
            </div>
            <p class="text-sm font-body-md leading-relaxed">{form.message}</p>
          </div>
        {/if}

        {#if form?.error}
          <div class="p-4 bg-error-container dark:bg-rose-950/40 text-error dark:text-rose-300 text-xs font-medium border border-error/20 dark:border-rose-800/40 flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined">error</span>
            <span>{form.error}</span>
          </div>
        {/if}

        <form method="POST" action="/contact" class="space-y-5">
          <div>
            <label for="contactName" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
              {i18n.t.contact.nameLabel} *
            </label>
            <input
              id="contactName"
              type="text"
              name="name"
              placeholder={i18n.t.contact.namePlaceholder}
              bind:value={name}
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="contactEmail" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
                {i18n.t.contact.emailLabel} *
              </label>
              <input
                id="contactEmail"
                type="email"
                name="email"
                placeholder={i18n.t.contact.emailPlaceholder}
                bind:value={email}
                class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
                required
              />
            </div>
            <div>
              <label for="contactPhone" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
                {i18n.t.contact.phoneLabel}
              </label>
              <input
                id="contactPhone"
                type="tel"
                name="phone"
                placeholder={i18n.t.contact.phonePlaceholder}
                bind:value={phone}
                class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
              />
            </div>
          </div>

          <div>
            <label for="contactSubject" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
              {i18n.t.contact.subjectLabel}
            </label>
            <select
              id="contactSubject"
              name="subject"
              bind:value={subject}
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark"
            >
              <option value="Réservation & Tarifs">{i18n.t.contact.subjectRates}</option>
              <option value="Événement Privé / Séminaire">{i18n.t.contact.subjectEvents}</option>
              <option value="Transfert & Chauffeur Privé">{i18n.t.contact.subjectShuttle}</option>
              <option value="Partenariat d'Affaires">{i18n.t.contact.subjectPartnership}</option>
              <option value="Autre Demande">{i18n.t.contact.subjectOther}</option>
            </select>
          </div>

          <div>
            <label for="contactMessage" class="block font-label-caps text-xs text-on-surface-variant dark:text-neutral-400 mb-1.5">
              {i18n.t.contact.messageLabel} *
            </label>
            <textarea
              id="contactMessage"
              name="message"
              rows="5"
              placeholder={i18n.t.contact.messagePlaceholder}
              bind:value={message}
              class="w-full bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 p-4 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark resize-none"
              required
            ></textarea>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              class="btn-luxury-primary text-xs py-3 px-8"
            >
              {i18n.t.contact.sendBtn}
            </button>
          </div>
        </form>
      </div>

      <!-- Right Column: Direct Info Cards -->
      <div class="lg:col-span-5 space-y-5">
        <!-- Direct Phone & WhatsApp Card -->
        <div class="p-6 bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 space-y-3">
          <div class="w-10 h-10 bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">call</span>
          </div>
          <h3 class="font-headline text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.contact.directPhoneTitle}</h3>
          <p class="text-xs text-on-surface-variant dark:text-neutral-400 leading-relaxed">
            {i18n.t.contact.directPhoneDesc}
          </p>
          <div class="space-y-1">
            <a href="tel:+237699000000" class="font-headline text-base font-bold text-deep-charcoal dark:text-neutral-100 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors block">
              +237 6 99 00 00 00
            </a>
            <a href="https://wa.me/237699000000" target="_blank" rel="noopener noreferrer" class="text-xs text-green-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline">
              <span>{i18n.t.contact.chatWhatsapp}</span>
              <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </a>
          </div>
        </div>

        <!-- Direct Email Card -->
        <div class="p-6 bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 space-y-3">
          <div class="w-10 h-10 bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">mail</span>
          </div>
          <h3 class="font-headline text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.contact.emailTitle}</h3>
          <p class="text-xs text-on-surface-variant dark:text-neutral-400 leading-relaxed">
            {i18n.t.contact.emailDesc}
          </p>
          <a href="mailto:contact@residence-madadjeu.com" class="font-headline text-sm font-bold text-deep-charcoal dark:text-neutral-100 hover:text-muted-gold dark:hover:text-muted-gold-dark transition-colors block">
            contact@residence-madadjeu.com
          </a>
        </div>

        <!-- Address Card -->
        <div class="p-6 bg-surface-container dark:bg-neutral-900 border border-outline-variant/30 dark:border-neutral-800 space-y-3">
          <div class="w-10 h-10 bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">location_on</span>
          </div>
          <h3 class="font-headline text-lg text-deep-charcoal dark:text-neutral-100 font-bold">{i18n.t.contact.addressTitle}</h3>
          <p class="text-xs text-on-surface-variant dark:text-neutral-400 leading-relaxed">
            {i18n.t.contact.addressText}
          </p>
          <a href="/location" class="font-label-caps text-[10px] text-muted-gold dark:text-muted-gold-dark hover:text-deep-charcoal dark:hover:text-neutral-100 transition-colors block font-semibold">
            {i18n.t.contact.viewMapLink} →
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
