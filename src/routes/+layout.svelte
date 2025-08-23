<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children } = $props();
	
	injectAnalytics();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f43f5e" />
	<meta name="msapplication-TileColor" content="#f43f5e" />
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

{@render children?.()}
