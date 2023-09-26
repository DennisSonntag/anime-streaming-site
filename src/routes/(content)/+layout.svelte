<script lang="ts">
	import HomeIcon from '$lib/assets/svgs/HomeIcon.svelte';
	import { page } from '$app/stores';
	import GoBackIcon from '$lib/assets/svgs/GoBackIcon.svelte';
		import { fade } from 'svelte/transition';

	let search = $page.url.searchParams.get('s');
	$: isGoBackVisable = $page.route.id?.includes('animes')!;
</script>

<div class="flex items-center p-4 relative ">
	<a href="/">
		<HomeIcon class="h-8 fill-primary hover:fill-accent" />
	</a>
	{#if isGoBackVisable}
		<a transition:fade href={`/search/${search}`} class="px-4">
			<GoBackIcon  class="h-8 fill-primary hover:fill-accent" />
		</a>
	{/if}

	<form
		action="/"
		method="POST"
		class="absolute inset-0 m-auto  flex h-fit w-fit items-center gap-2"
	>
		<input
			class="rounded-xl bg-primary p-2 text-center text-2xl font-bold text-text outline-none duration-[50ms] ease-in-out hover:bg-accent"
			type="text"
			placeholder="search"
			name="search"
		/>
		<button
			class="h-full w-fit rounded-lg bg-primary p-2 font-bold text-text duration-[50ms] ease-in-out hover:bg-accent"
			type="submit">Submit</button
		>
	</form>
</div>
<slot />
