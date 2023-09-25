<script lang="ts">
	import '../app.css';

	import { navigating } from '$app/stores';
		import { fade } from 'svelte/transition';


	import { loading } from '$lib/index';
	import LoadingSpinner from '$lib/components/loadingSpinner.svelte';

	$: $loading = !!$navigating;
</script>

<main>
	<slot />
	{#if $loading}
		<div transition:fade={{ duration: 300 }} class="fixed inset-0 h-full w-full bg-black/75">
			<LoadingSpinner color="white" scale="2" />
		</div>
	{/if}
</main>
