<script lang="ts">
	import Hls from 'hls.js';
	import { onMount } from 'svelte';
	import { episodeStore, type VideoUrlType, currentTimeStore } from '$lib';

	import PlayIconSvg from '$lib/assets/svgs/PlayIcon.svelte';
	import PauseIconSvg from '$lib/assets/svgs/PauseIcon.svelte';
	import VolumeHighIcon from '$lib/assets/svgs/VolumeHighIcon.svelte';
	import LowVolumeIcon from '$lib/assets/svgs/LowVolumeIcon.svelte';
	import MuteVolumeIcon from '$lib/assets/svgs/MuteVolumeIcon.svelte';
	import PrevEpIcon from '$lib/assets/svgs/PrevEpIcon.svelte';
	import BackTenSecIcon from '$lib/assets/svgs/BackTenSecIcon.svelte';
	import ForwardTenSecIcon from '$lib/assets/svgs/ForwardTenSecIcon.svelte';
	import NextEpIcon from '$lib/assets/svgs/NextEpIcon.svelte';
	import DownloadIcon from '$lib/assets/svgs/DownloadIcon.svelte';
	import MiniPlayerIcon from '$lib/assets/svgs/MiniPlayerIcon.svelte';
	import SettingsIcon from '$lib/assets/svgs/SettingsIcon.svelte';
	import EnterFullscreenIcon from '$lib/assets/svgs/EnterFullscreenIcon.svelte';
	import ExitFullscreenIcon from '$lib/assets/svgs/ExitFullscreenIcon.svelte';
	import LoadingSpinner from './loadingSpinner.svelte';

	export let src: VideoUrlType | null;
	export let didChangeEpisode: boolean;
	export let title: string;
	export let changeEpisode: (episode: number) => void;

	let backupCurrentTime = 0;
	let qualities = [...(src?.sources || [])].map((x) => x.quality);
	let videoUrl = src?.sources[0]?.url;
	let quality = 'default';
	let isHidden = true;

	function changeVidUrl(video: HTMLVideoElement, params: any) {
		if (params) {
			backupCurrentTime = $currentTimeStore[`${title}-${$episodeStore}`] || 0;
			isHidden = true;
			if (Hls.isSupported()) {
				let hls = new Hls();
				hls.loadSource(params);
				hls.attachMedia(video);
			}
			video.currentTime = backupCurrentTime;
			didChangeEpisode && video.play();
		} else {
			isHidden = false;
		}
		return {
			async update(newParams: any) {
				if (newParams) {
					backupCurrentTime = $currentTimeStore[`${title}-${$episodeStore}`] || 0;
					isHidden = true;
					if (Hls.isSupported()) {
						let hls = new Hls();
						hls.loadSource(newParams);
						hls.attachMedia(video);
					}
					video.currentTime = backupCurrentTime;
					didChangeEpisode && video.play();
				} else {
					isHidden = false;
				}
			}
		};
	}

	let video: HTMLVideoElement;
	let videoContainer: HTMLDivElement;
	let volumneSlider: HTMLInputElement;
	let totalTimeElm: HTMLDivElement;
	let currentTimeElm: HTMLDivElement;
	let timelineContiner: HTMLDivElement;
	let qualitySelectPanel: HTMLDivElement;
	let bufferingIndicator: HTMLDivElement;

	function handleDocuemntKeydown(e: KeyboardEvent) {
		const tagName = document.activeElement?.tagName.toLowerCase();
		if (tagName === 'input') return;
		switch (e.key.toLowerCase()) {
			case ' ':
				if (tagName === 'button') return;
			case 'k':
				togglePlay();
				break;
			case 'i':
				toggleMiniPlayer();
				break;
			case 'f':
				toggleFullscreen();
				break;
			case 'f':
				toggleMute();
				break;
		}
	}
	onMount(() => {
		video.currentTime = $currentTimeStore[`${title}-${$episodeStore}`] || 0;

		video.addEventListener('enterpictureinpicture', () =>
			videoContainer.classList.add('mini-player')
		);

		video.addEventListener('leavepictureinpicture', () =>
			videoContainer.classList.remove('mini-player')
		);
	});
	function onVolumeChange() {
		volumneSlider.value = String(video.volume);
		let volumeLevel;
		if (video.muted || video.volume === 0) {
			volumneSlider.value = '0';
			volumeLevel = 'muted';
		} else if (video.volume >= 0.5) {
			volumeLevel = 'high';
		} else {
			volumeLevel = 'low';
		}

		videoContainer.dataset['volumeLevel'] = volumeLevel;
	}
	function togglePlay() {
		video && video.paused ? video.play() : video.pause();
	}

	function toggleFullscreen() {
		if (document.fullscreenElement === null) {
			videoContainer.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function toggleMiniPlayer() {
		if (videoContainer.classList.contains('mini-player')) {
			document.exitPictureInPicture();
		} else {
			video.requestPictureInPicture();
		}
	}

	function toggleMute() {
		video.muted = !video.muted;
	}

	function changeVolumne(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		video.volume = Number(e.currentTarget.value);
		video.muted = Number(e.currentTarget.value) === 0;
	}

	const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
		minimumIntegerDigits: 2
	});

	function formatDuration(time: number): string {
		const seconds = Math.floor(time % 60);
		const minutes = Math.floor(time / 60) % 60;
		const hours = Math.floor(time / 3600);
		if (hours === 0) {
			return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
		} else {
			return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(
				seconds
			)}`;
		}
	}

	let isScrubbing = false;
	let wasPaused: boolean;

	function toggleScrubbing(e: MouseEvent) {
		const rect = timelineContiner.getBoundingClientRect();
		const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
		isScrubbing = (e.buttons & 1) === 1;
		videoContainer.classList.toggle('scrubbing', isScrubbing);
		if (isScrubbing) {
			wasPaused = video.paused;
			video.pause();
		} else {
			video.currentTime = percent * video.duration;
			$currentTimeStore[`${title}-${$episodeStore}`] = video.currentTime;

			if (!wasPaused) video.play();
		}
		handleTimelineUpdate(e);
	}

	function handleTimelineUpdate(e: MouseEvent) {
		const rect = timelineContiner.getBoundingClientRect();
		const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
		timelineContiner.style.setProperty('--preview-position', String(percent));
		if (isScrubbing) {
			video.currentTime = video.duration * percent;
			timelineContiner.style.setProperty('--progress-position', String(percent));
		}
	}

	function handleOnTimeUpdate() {
		$currentTimeStore[`${title}-${$episodeStore}`] = video.currentTime;
		currentTimeElm.textContent = formatDuration(video.currentTime);
		const percent = video.currentTime / video.duration;
		timelineContiner.style.setProperty('--progress-position', String(percent));
	}

	async function nextEpisode() {
		$episodeStore += 1;
		changeEpisode($episodeStore);
	}

	async function prevEpisode() {
		$episodeStore -= 1;
		changeEpisode($episodeStore);
	}

	function setQuality(qual: string) {
		quality = qual;
		videoUrl = src?.sources.find((x) => x.quality === qual)?.url;
		qualitySelectPanel.classList.add('hidden');
	}

	function handleProgress() {
		const buffered = video.buffered;
		if (buffered.length > 0) {
			const start = buffered.start(0);
			const end = buffered.end(buffered.length - 1);
			const duration = end - start;
			const percent = duration / video.duration;
			bufferingIndicator.style.setProperty('--buffering-progress', String(percent));
		}
	}
</script>

<svelte:document
	on:keydown={handleDocuemntKeydown}
	on:fullscreenchange={() =>
		videoContainer.classList.toggle('full-screen', document.fullscreenElement !== null)}
	on:mouseup={(e) => isScrubbing && toggleScrubbing(e)}
	on:mousemove={(e) => isScrubbing && handleTimelineUpdate(e)}
/>

<div
	bind:this={videoContainer}
	data-volume-level="high"
	class="video-container theatre paused group relative mx-auto aspect-video w-[90%] bg-black"
>
	<LoadingSpinner {isHidden} />
	<video
		on:pause={() => videoContainer.classList.add('paused')}
		on:play={() => videoContainer.classList.remove('paused')}
		on:volumechange={onVolumeChange}
		on:loadeddata={() => (totalTimeElm.textContent = formatDuration(video.duration))}
		on:timeupdate={handleOnTimeUpdate}
		on:progress={handleProgress}
		on:click={togglePlay}
		bind:this={video}
		id="video"
		class="w-full"
		use:changeVidUrl={videoUrl}
	>
		<track src="" kind="captions" srclang="" label="" />
	</video>
	<div
		bind:this={qualitySelectPanel}
		class="absolute bottom-[15%] right-0 z-50 flex hidden h-fit w-fit flex-col rounded-lg bg-gray-700 p-2 text-white"
	>
		{#each qualities as qual}
			<button
				on:click={() => setQuality(qual)}
				type="button"
				class={`hover:bg-slate-400  ${quality === qual ? 'bg-blue-500' : 'bg-gray-500'}`}
				>{qual}</button
			>
		{/each}
	</div>
	<div
		class="video-controls absolute bottom-0 left-0 right-0 z-[100] p-1 opacity-0 duration-[50ms] ease-in-out group-hover:opacity-100"
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			bind:this={timelineContiner}
			on:mousemove|preventDefault={handleTimelineUpdate}
			on:mousedown={toggleScrubbing}
			class="timeline-container group/timeline mx-1 flex h-[7px] cursor-pointer items-center"
		>
			<div
				bind:this={bufferingIndicator}
				class="buffering-indicator absolute h-[3px] bg-violet-300/50 duration-75 ease-in-out group-hover/timeline:h-[7px]"
			></div>
			<div
				class="timeline relative h-[3px] w-full bg-gray-400/50 duration-75 ease-in-out group-hover/timeline:h-full"
			>
				<div class="thumb-indicator"></div>
			</div>
		</div>
		<div class="relative inset-x-0 m-2 mx-auto flex w-full items-center gap-4 px-4">
			<button
				on:click={togglePlay}
				type="button"
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
			>
				<PlayIconSvg />
				<PauseIconSvg />
			</button>
			<div class="volume-container group/volume flex items-center">
				<button
					on:click={toggleMute}
					type="button"
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<VolumeHighIcon />
					<LowVolumeIcon />
					<MuteVolumeIcon />
				</button>
				<input
					bind:this={volumneSlider}
					on:input={changeVolumne}
					type="range"
					min="0"
					max="1"
					step="any"
					value="1"
					class="group-focus-within:/volume:opacity-100 w-0 opacity-0 duration-[25ms] ease-in-out group-focus-within/volume:w-[100px] group-hover/volume:w-[100px] group-hover/volume:opacity-100"
				/>
			</div>
			<div class="duration-container flex items-center gap-1">
				<div class="current-time" bind:this={currentTimeElm}>0:00</div>
				/
				<div class="total-time" bind:this={totalTimeElm}>0:00</div>
			</div>
			<div class="absolute inset-x-0 mx-auto flex h-fit w-fit gap-4">
				<button
					type="button"
					on:click={prevEpisode}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<PrevEpIcon />
				</button>
				<button
					type="button"
					on:click={() => (video.currentTime -= 10)}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<BackTenSecIcon />
				</button>
				<button
					type="button"
					on:click={() => (video.currentTime += 10)}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<ForwardTenSecIcon />
				</button>
				<button
					type="button"
					on:click={nextEpisode}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<NextEpIcon />
				</button>
			</div>

			<a
				download
				href={`/download?url=${videoUrl}&name=${title}-${$episodeStore}`}
				class="ml-auto fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				title="Download video"
			>
				<DownloadIcon />
			</a>
			<!-- ------------------------------------------------------ -->

			<button
				on:click={toggleMiniPlayer}
				type="button"
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				title="Toggle miniplayer"
			>
				<MiniPlayerIcon />
			</button>
			<button
				on:click={toggleFullscreen}
				type="button"
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
			>
				<EnterFullscreenIcon />
				<ExitFullscreenIcon />
			</button>
			<button
				type="button"
				on:click={() => qualitySelectPanel.classList.toggle('hidden')}
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
			>
				<SettingsIcon />
			</button>
		</div>
	</div>
</div>
