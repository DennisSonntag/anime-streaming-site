<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import type { Writable } from 'svelte/store';
	export let title: string;

	let selectedTab = getContext('selectedTab') as Writable<string>;
	const tabTitles = getContext('tabTitles') as {
		registerTab(title: string): void;
		updateTitle(title: string): void;
		unregisterTab(title: string): void;
	};

	$: tabTitles.updateTitle(title);

	tabTitles.registerTab(title);

	onDestroy(() => {
		tabTitles.unregisterTab(title);
	});
</script>

<div>
	{#if $selectedTab === title}
		<slot />
	{/if}
</div>
