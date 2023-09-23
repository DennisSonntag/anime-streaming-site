<script lang="ts">
	import { episodeStore, getVideoUrl, type VideoUrlType } from '$lib';
	import Video from '$lib/components/video.svelte';
	import { onMount } from 'svelte';

	export let data;

	let videoUrl: VideoUrlType | null = data.videoUrl;

	onMount(() => {
		videoUrl = data.videoUrl;
	});

	function changeVideoUrlEp(episode: number) {
		return async () => {
			videoUrl = null;
			let videoUrlRes = await getVideoUrl(data.title, Number(episode), fetch);
			videoUrl = videoUrlRes;
		};
	}

	async function changeEp(e: MouseEvent) {
		let target = e.target as HTMLButtonElement;
		let episode = target.innerText;
		$episodeStore = Number(episode);
		let val =changeVideoUrlEp(Number(episode));
		val()
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
			<!-- {#each dets.episodes.slice(0, 100) as ep} -->
			{#each dets.episodes as ep}
				<button
					on:click={changeEp}
					type="button"
					class={`${
						Number(ep.number) === $episodeStore ? 'bg-blue-900' : 'bg-slate-700'
					} h-full w-full rounded-lg p-2 text-center text-white hover:bg-slate-600`}
				>
					{ep.number}
				</button>
			{/each}
		{/await}
	</div>
	<div class="relative top-0 h-fit w-fit text-white">
		{#key videoUrl}
			<Video src={videoUrl} changeEpFn={changeVideoUrlEp} title={data.title} />
		{/key}

		<h1>Episode: {$episodeStore}</h1>

		{#await data.other.details}
			<h1>Details: ...</h1>
			<h1>Title: ...</h1>
		{:then details}
			<h1>Details: {details.description}</h1>
			<h1>Details: {details.title}</h1>
		{/await}
	</div>
</div>
