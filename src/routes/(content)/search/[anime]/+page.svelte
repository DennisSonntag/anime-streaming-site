<script lang="ts">
	export let data;
	import sadImg from '$lib/assets/crying.webp';
</script>

<svelte:head>
	<title>Search: {data.search}</title>
</svelte:head>

<div class="relative inset-x-0 mx-auto grid h-fit w-[95vw] auto-rows-auto grid-cols-5 gap-4 p-4">
	{#each data.animes.results as anime}
		<a href={`/animes/${anime.id}?ep=1&s=${data.search}`}>
			<div
				class="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl bg-gray-700 duration-[50ms] ease-in-out hover:bg-gray-600"
			>
				<img src={anime.image} alt="" class="h-[70%] rounded-2xl" />
				<h1 class="text-center text-2xl font-bold text-white">{anime.title}</h1>
			</div>
		</a>
	{:else}
		<div class="w-fit h-fit absolute inset-x-0 mx-auto flex flex-col items-center my-40 gap-4">
			<p class="text-center text-6xl font-bold text-white">No results :(</p>
			<img class="w-full rounded-2xl border-2 border-white" src={sadImg} alt="" />
		</div>
	{/each}
</div>
