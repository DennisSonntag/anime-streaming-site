<script lang="ts">
	import { episodeStore, getVideoUrl, type VideoUrlType } from '$lib';
	import Tab from '$lib/components/Tab.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Video from '$lib/components/video.svelte';
	import { onMount } from 'svelte';

	export let data;

	let videoUrl: VideoUrlType | null = data.videoUrl;

	let didChangeEpisode = false;

	const isFiller = (epNum: number): boolean => {
		return data.fillers.find((x) => x.epNum === epNum)?.isFiller!;
	};
	onMount(() => {
		videoUrl = data.videoUrl;
		didChangeEpisode = false;
	});

	async function changeEpisode(episode: number) {
		videoUrl = null;
		let videoUrlRes = await getVideoUrl(data.title, Number(episode), fetch);
		videoUrl = videoUrlRes;
	}

	async function handleChangeEpisode(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) {
		didChangeEpisode = true;
		let episode = e.currentTarget.innerText;
		$episodeStore = Number(episode);
		await changeEpisode(Number(episode));
	}
</script>

<svelte:head>
	<title>
		{data.title}
	</title>
</svelte:head>

<div class="flex h-fit w-full gap-8">
	<div class="grid h-[80vh] w-fit auto-rows-auto grid-cols-4 gap-2 overflow-y-scroll px-4">
		{#each data.details.episodes as ep}
			<button
				on:click={handleChangeEpisode}
				type="button"
				class={`${
					Number(ep.number) === $episodeStore
						? 'bg-accent hover:bg-accent'
						: isFiller(Number(ep.number))
						? 'bg-red-500 hover:bg-red-400'
						: 'bg-secondary hover:bg-secondary'
				} text-text h-full w-full rounded-lg p-2 text-center `}
			>
				{ep.number}
			</button>
		{/each}
	</div>
	<div class="relative top-0 h-fit w-fit text-white">
		{#key videoUrl}
			<Video {didChangeEpisode} src={videoUrl} {changeEpisode} title={data.title} />
		{/key}

		<!-- <div class="my-4"> -->
		<!-- 	<Tabs selectedTab="9anime"> -->
		<!-- 		<Tab title="9anime">9anime</Tab> -->
		<!-- 		<Tab title="Gogoanime">Gogoanime</Tab> -->
		<!-- 		<Tab title="crunclyroll">crunclyroll</Tab> -->
		<!-- 	</Tabs> -->
		<!-- </div> -->

		<div class="bg-primary m-2 w-[95%] rounded-lg p-2">
			<h1 class="text-center font-heading font-bold text-xl">Episode: {$episodeStore}</h1>
			<p  class="text-center font-heading font-bold text-xl">Anime: {data.details.title}</p>
			<hr />

			<p>Details: {data.details.description}</p>
		</div>
	</div>
</div>
