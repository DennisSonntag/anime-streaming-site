<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Search: {data.search}</title>
</svelte:head>

<form action="/" method="POST" class="relative inset-x-0 mx-auto flex h-fit w-fit items-center gap-2 mt-4">
	<input
		class="rounded-xl bg-gray-600 p-2 text-center text-2xl font-bold text-white outline-none"
		type="text"
		placeholder="search"
		name="search"
	/>
	<button class="h-fit w-fit rounded-lg bg-gray-600 p-2 text-white" type="submit">submit</button>
</form>
<div class="absolute inset-x-0 mx-auto grid h-fit w-[95vw] auto-rows-auto grid-cols-5 gap-4 p-4">
	{#each data.animes.results as anime}
		<a href={`/animes/${anime.id}?ep=1&s=${data.search}`}>
			<div
				class="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl bg-gray-700"
			>
				<img src={anime.image} alt="" class="h-[70%] rounded-2xl" />
				<h1 class="text-center text-2xl font-bold text-white">{anime.title}</h1>
			</div>
		</a>
	{/each}
</div>
