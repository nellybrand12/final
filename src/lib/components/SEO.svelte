<script lang="ts">
  import { page } from '$app/stores';
  import { i18n } from '$lib/i18n.svelte';

  interface Props {
    title: string;
    description: string;
    canonicalPath?: string;
    image?: string;
    type?: string;
    noindex?: boolean;
    jsonLd?: any;
  }

  let {
    title,
    description,
    canonicalPath,
    image = 'https://residence-madadjeu.com/images/og-image.jpg',
    type = 'website',
    noindex = false,
    jsonLd
  }: Props = $props();

  const siteOrigin = 'https://residence-madadjeu.com';
  const currentPath = $derived(canonicalPath ?? $page.url.pathname);
  const cleanPath = $derived(currentPath.split('?')[0].replace(/\/$/, '') || '');
  const canonicalUrl = $derived(`${siteOrigin}${cleanPath || '/'}`);
  
  // Ensure image URL is absolute for social crawlers (WhatsApp, Facebook, Twitter)
  const ogImageUrl = $derived(
    image.startsWith('http')
      ? image
      : `${siteOrigin}${image.startsWith('/') ? image : `/${image}`}`
  );
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />

  <!-- Canonical and Multilingual Alternates -->
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="fr" href="{canonicalUrl}?lang=fr" />
  <link rel="alternate" hreflang="en" href="{canonicalUrl}?lang=en" />
  <link rel="alternate" hreflang="x-default" href={canonicalUrl} />

  <!-- Robots Directives -->
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />
  {:else}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  {/if}

  <!-- Open Graph / Facebook -->
  <meta property="og:site_name" content="Hôtel Résidence Madadjeu" />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content={i18n.locale === 'fr' ? 'fr_FR' : 'en_US'} />
  <meta property="og:locale:alternate" content={i18n.locale === 'fr' ? 'en_US' : 'fr_FR'} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={canonicalUrl} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageUrl} />

  <!-- Structured Data JSON-LD -->
  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
