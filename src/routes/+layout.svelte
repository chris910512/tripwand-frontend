<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children } = $props();
	
	injectAnalytics();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<meta name="theme-color" content="#f43f5e" />
	<meta name="msapplication-TileColor" content="#f43f5e" />
	<meta name="msapplication-TileImage" content="/icon-192.png" />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

{@render children?.()}
