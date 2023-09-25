<script lang="ts">
	export let data;
	import sadImg from '$lib/assets/sadWebp.webp';
	import HomeIcon from '$lib/assets/svgs/HomeIcon.svelte';
</script>

<svelte:head>
	<title>Search: {data.search}</title>
</svelte:head>

<div class="flex items-center px-4">
	<a href="/">
		<HomeIcon class="h-8 hover:fill-gray-400"/>
	</a>
	<form
		action="/"
		method="POST"
		class="relative inset-x-0 mx-auto mt-4 flex h-fit w-fit items-center gap-2"
	>
		<input
			class="rounded-xl bg-gray-600 p-2 text-center text-2xl font-bold text-white outline-none duration-[50ms] ease-in-out hover:bg-gray-500"
			type="text"
			placeholder="search"
			name="search"
		/>
		<button
			class="h-fit w-fit rounded-lg bg-gray-600 p-2 font-bold text-white duration-[50ms] ease-in-out hover:bg-gray-500"
			type="submit">Submit</button
		>
	</form>
</div>
<div class="absolute inset-x-0 mx-auto grid h-fit w-[95vw] auto-rows-auto grid-cols-5 gap-4 p-4">
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
		<div class="w-fit h-fit absolute inset-x-0 mx-auto flex flex-col items-center">
			<p class="text-center text-4xl font-bold text-white">No results ...</p>
			<img class="w-1/2 rounded-2xl border-2 border-white" src={sadImg} alt="" />
		</div>
	{/each}
</div>
