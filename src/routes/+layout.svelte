<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children } = $props();
	
	injectAnalytics();
</script>

<svelte:head>
	<!-- Essential meta tags -->
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
	<meta name="googlebot" content="index, follow" />
	<meta name="format-detection" content="telephone=no" />
	
	<!-- Icons and PWA -->
	<link rel="icon" href={favicon} />
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<meta name="theme-color" content="#f43f5e" />
	<meta name="msapplication-TileColor" content="#f43f5e" />
	<meta name="msapplication-TileImage" content="/icon-192.png" />
	<link rel="manifest" href="/manifest.json" />
	
	<!-- DNS prefetch for performance -->
	<link rel="dns-prefetch" href="https://api.tripwand.online" />
	<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://api.tripwand.online" crossorigin />
	
	<!-- Security headers -->
	<meta http-equiv="X-Content-Type-Options" content="nosniff" />
	<meta name="referrer" content="origin-when-cross-origin" />
</svelte:head>

{@render children?.()}
