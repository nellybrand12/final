<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';
  import { page } from '$app/stores';
  
  let settings = $derived($page.data.settings || {});
</script>

<footer class="w-full bg-deep-charcoal text-soft-cream py-16 md:py-24 border-t border-outline/20">
  <div class="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
      <!-- Brand & Mission -->
      <div class="col-span-1 md:col-span-2 flex flex-col items-start gap-6">
        <a href="/" class="inline-block">
          <img
            src="/images/madadjeu-logo.png"
            alt="Hôtel Résidence Madadjeu"
            width="1899"
            height="412"
            class="site-logo site-logo--footer"
          />
        </a>
        <p class="font-headline-md text-base sm:text-lg text-soft-cream/80 max-w-md font-light italic leading-relaxed">
          {i18n.t.footer.tagline}
        </p>
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <a href="/reserver" class="btn-luxury-primary text-xs py-2 px-5">
            {i18n.t.footer.bookOnline}
          </a>
          <a href="/contact" class="btn-luxury-secondary text-xs py-2 px-5">
            {i18n.t.footer.contactUs}
          </a>
        </div>
      </div>

      <!-- Address & Info -->
      <div class="flex flex-col gap-3">
        <h4 class="font-label-caps text-warm-taupe tracking-widest text-[11px] uppercase">{i18n.t.footer.addressTitle}</h4>
        <p class="font-body-md text-xs sm:text-[13px] text-soft-cream/80 leading-relaxed whitespace-pre-line">
          {#if settings.contact_address}
            {settings.contact_address}
          {:else}
            Face Garde Présidentielle
            Quartier Etoug-Ebe
            Yaoundé, Cameroun
          {/if}
        </p>
        <div class="pt-1 text-xs text-soft-cream/70 flex flex-col gap-1">
          {#if settings.contact_phone}
            <a href="tel:{settings.contact_phone.replace(/\s+/g, '')}" class="hover:text-muted-gold transition-colors">Tél: {settings.contact_phone}</a>
          {:else}
            <a href="tel:+237691890963" class="hover:text-muted-gold transition-colors">Tél: +237 6 91 89 09 63</a>
          {/if}
          
          {#if settings.contact_email}
            <a href="mailto:{settings.contact_email}" class="hover:text-muted-gold transition-colors">Email: {settings.contact_email}</a>
                {:else}
                  <a href="mailto:madadjeuhotel2026@gmail.com" class="hover:text-muted-gold transition-colors">Email: madadjeuhotel2026@gmail.com</a>
          {/if}
        </div>
      </div>

      <!-- Quick Links & Social -->
      <div class="flex flex-col gap-3">
        <h4 class="hidden md:block font-label-caps text-warm-taupe tracking-widest text-[11px] uppercase">{i18n.t.footer.navigation}</h4>
        <ul class="hidden md:flex flex-col gap-1.5 text-xs sm:text-[13px] text-soft-cream/75">
          <li><a href="/" class="hover:text-muted-gold transition-colors">{i18n.t.nav.home}</a></li>
          <li><a href="/rooms" class="hover:text-muted-gold transition-colors">{i18n.t.nav.rooms}</a></li>
          <li><a href="/amenities" class="hover:text-muted-gold transition-colors">{i18n.t.nav.amenities}</a></li>
          <li><a href="/location" class="hover:text-muted-gold transition-colors">{i18n.t.nav.location}</a></li>
          <li><a href="/take-a-tour" class="hover:text-muted-gold transition-colors">{i18n.t.nav.takeTour}</a></li>
          <li><a href="/about" class="hover:text-muted-gold transition-colors">{i18n.t.nav.about}</a></li>
          <li><a href="/contact" class="hover:text-muted-gold transition-colors">{i18n.t.nav.contact}</a></li>
          <li><a href="/gerer-reservation" class="hover:text-muted-gold transition-colors">{i18n.t.nav.manageBooking}</a></li>
        </ul>
        <div class="pt-4 flex gap-4 text-soft-cream/80">
          {#if settings.social_instagram}
            <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="Instagram">
              <span class="material-symbols-outlined text-xl">photo_camera</span>
            </a>
          {/if}
          {#if settings.social_facebook}
            <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="Facebook">
              <span class="material-symbols-outlined text-xl">public</span>
            </a>
          {/if}
          {#if settings.contact_whatsapp}
            <a href="https://wa.me/{settings.contact_whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="WhatsApp">
              <span class="material-symbols-outlined text-xl">chat_bubble</span>
            </a>
          {/if}
          {#if settings.social_tripadvisor}
            <a href={settings.social_tripadvisor} target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="TripAdvisor">
              <span class="material-symbols-outlined text-xl">flight_takeoff</span>
            </a>
          {/if}
          {#if settings.social_bookingcom}
            <a href={settings.social_bookingcom} target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="Booking.com">
              <span class="material-symbols-outlined text-xl">hotel</span>
            </a>
          {/if}
          {#if settings.social_tripcom}
            <a href={settings.social_tripcom} target="_blank" rel="noopener noreferrer" class="hover:text-muted-gold transition-colors" aria-label="Trip.com">
              <span class="material-symbols-outlined text-xl">travel_explore</span>
            </a>
          {/if}
        </div>
      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="mt-16 pt-8 border-t border-soft-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-widest text-soft-cream/50">
      <span>{i18n.t.footer.copyright}</span>
      <div class="flex gap-6">
        <a href="/about" class="hover:text-soft-cream transition-colors">{i18n.t.footer.privacyPolicy}</a>
        <span>•</span>
        <a href="/faq" class="hover:text-soft-cream transition-colors">{i18n.t.footer.termsOfService}</a>
      </div>
    </div>
  </div>
</footer>
