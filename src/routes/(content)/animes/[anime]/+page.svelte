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

	async function handleChangeEpisode(e: MouseEvent) {
		didChangeEpisode = true;
		let target = e.target as HTMLButtonElement;
		let episode = target.innerText;
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
						? 'bg-blue-900 hover:bg-blue-800'
						: isFiller(Number(ep.number))
						? 'bg-red-500 hover:bg-red-400'
						: 'bg-slate-700 hover:bg-slate-600'
				} h-full w-full rounded-lg p-2 text-center text-white `}
			>
				{ep.number}
			</button>
		{/each}
	</div>
	<div class="relative top-0 h-fit w-fit text-white">
		{#key videoUrl}
			<Video {didChangeEpisode} src={videoUrl} {changeEpisode} title={data.title} />
		{/key}

		<div class="my-4">
			<Tabs selectedTab="9anime">
				<Tab title="9anime">9anime</Tab>
				<Tab title="Gogoanime">Gogoanime</Tab>
				<Tab title="crunclyroll">crunclyroll</Tab>
			</Tabs>
		</div>

		<h1>Episode: {$episodeStore}</h1>

		<h1>Details: {data.details.description}</h1>
		<h1>Details: {data.details.title}</h1>
	</div>
</div>
