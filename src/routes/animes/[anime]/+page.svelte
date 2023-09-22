<script lang="ts">
	import { getVideoUrl } from '$lib';
	import Video from '$lib/video.svelte';
	import { onMount } from 'svelte';

	export let data;

	let episodeStore = 1;

	let videoUrl = '';

	onMount(() => {
		videoUrl = data.videoUrl.sources[0]?.url!;
	});

	async function changeEp(e: MouseEvent) {
		let target = e.target as HTMLButtonElement;
		let episode = target.innerText;
		episodeStore = Number(episode);
		videoUrl = ""
		let videoUrlRes = await getVideoUrl(data.title, Number(episode), fetch);
		videoUrl = videoUrlRes.sources[0]?.url!;
	}
</script>

<svelte:head>
	<title>
		{data.title}
	</title>
</svelte:head>

<a href={`/search/${data.search}`}>Go Back</a>
<div class="flex h-fit w-full gap-8">
	<div class="grid h-[80vh] w-fit auto-rows-auto grid-cols-4 gap-2 overflow-y-scroll">
		{#await data.other.details}
			...
		{:then dets}
			{#each dets.episodes.slice(0, 100) as ep}
				<button
					on:click={changeEp}
					type="button"
					class={`${
						Number(ep.number) === episodeStore ? 'bg-blue-900' : 'bg-slate-700'
					} h-full w-full rounded-lg p-2 text-center text-white`}
				>
					{ep.number}
				</button>
			{/each}
		{/await}
	</div>
	<div class="relative top-0 h-fit w-fit text-white">
		{#key videoUrl}
			<Video src={videoUrl} />
		{/key}

		<h1>Episode: {data.episode}</h1>

		{#await data.other.details}
			<h1>Details: ...</h1>
			<h1>Title: ...</h1>
		{:then details}
			<h1>Details: {details.description}</h1>
			<h1>Details: {details.title}</h1>
		{/await}
	</div>
</div>
