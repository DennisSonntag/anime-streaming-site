<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let selectedTab:string;
	let selectedTabStore = writable(selectedTab);

	$: $selectedTabStore = selectedTab;
	$: updateProps($selectedTabStore);

	function updateProps(value: string) {
		selectedTab = value;
	}

	setContext('selectedTab', selectedTabStore);

	type TitleType = {
		title: string;
	};
	let titles: TitleType[] = [];
	setContext('tabTitles', {
		registerTab(title: string) {
			titles.push({ title });
			titles = titles;
		},
		updateTitle(title: string) {
			const tabIndex = titles.findIndex((item) => item.title === title);
			const obj = titles[tabIndex];
			if (obj) {
				obj.title = title;
			}
		},
		unregisterTab(title: string) {
			const tabIndex = titles.findIndex((item) => item.title === title);
			if (tabIndex > -1) {
				titles.splice(tabIndex, 1);
				titles = titles;
			}
		}
	});
</script>

<div class="flex gap-2">
	{#each titles as { title }}
		<button
			class={`text-text w-fit h-fit p-2 rounded-lg bg-primary font-bold hover:bg-secondary ${$selectedTabStore === title && "bg-accent"}`}
			type="button"
			on:click={() => $selectedTabStore = title }>{title}</button
		>
	{/each}
</div>

<slot {selectedTab} />

