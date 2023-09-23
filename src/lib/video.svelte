<script lang="ts">
	// import type { VideoUrlType } from '$lib/index';
	export let src: VideoUrlType | null;
	export let changeEpFn: (episode: number) => () => Promise<void>;

	import { episodeStore, type VideoUrlType } from '$lib';

	// let qualities = [...src?.sources!].map((x) => x.quality);

	// let quality = 'default';
	// let videoUrl = [...src?.sources!].find((x) => x.quality === quality)?.url;
	let videoUrl = src?.sources[0]?.url;

	import Hls from 'hls.js';
	import { onMount } from 'svelte';

	function changeVidUrl(video: HTMLVideoElement, params: any) {
		if (params) {
			if (Hls.isSupported()) {
				let hls = new Hls();
				hls.loadSource(params);
				hls.attachMedia(video);
			}
		}
		return {
			update(newParams: any) {
				if (newParams) {
					if (Hls.isSupported()) {
						let hls = new Hls();
						hls.loadSource(newParams);
						hls.attachMedia(video);
					}
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

	onMount(() => {
		document.addEventListener('keydown', (e) => {
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
		});

		document.addEventListener('fullscreenchange', () => {
			videoContainer.classList.toggle('full-screen', document.fullscreenElement !== null);
		});

		document.addEventListener('mouseup', (e) => {
			if (isScrubbing) toggleScrubbing(e);
		});

		document.addEventListener('mousemove', (e) => {
			if (isScrubbing) handleTimelineUpdate(e);
		});

		video.addEventListener('enterpictureinpicture', () => {
			videoContainer.classList.add('mini-player');
		});

		video.addEventListener('leavepictureinpicture', () => {
			videoContainer.classList.remove('mini-player');
		});
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
		if (video) {
			video.paused ? video.play() : video.pause();
		}
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

			if (!wasPaused) video.play();
		}
		handleTimelineUpdate(e);
	}

	function handleTimelineUpdate(e: MouseEvent) {
		const rect = timelineContiner.getBoundingClientRect();
		const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
		timelineContiner.style.setProperty('--preview-position', String(percent));
		if (isScrubbing) {
			e.preventDefault();
			video.currentTime = video.duration * percent;
			timelineContiner.style.setProperty('--progress-position', String(percent));
		}
	}

	function handleOnTimeUpdate() {
		currentTimeElm.textContent = formatDuration(video.currentTime);
		const percent = video.currentTime / video.duration;
		timelineContiner.style.setProperty('--progress-position', String(percent));
	}

	function toggleQualitySelect() {
		qualitySelectPanel.classList.toggle('hidden');
	}

	async function nextEpisode() {
		$episodeStore += 1;
		let val = changeEpFn($episodeStore);
		await val();
	}

	function forwardTenSeconds() {
		video.currentTime += 10;
	}

	function backTenSeconds() {
		video.currentTime -= 10;
	}

	async function prevEpisode() {
		$episodeStore -= 1;
		let val = changeEpFn($episodeStore);
		await val();
	}
</script>

<div
	bind:this={videoContainer}
	data-volume-level="high"
	class="video-container theatre paused group relative mx-auto aspect-video w-[90%] bg-black"
>
	<video
		on:pause={() => videoContainer.classList.add('paused')}
		on:play={() => videoContainer.classList.remove('paused')}
		on:volumechange={onVolumeChange}
		on:loadeddata={() => (totalTimeElm.textContent = formatDuration(video.duration))}
		on:timeupdate={handleOnTimeUpdate}
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
		<!-- {#each qualities as qual} -->
		<!-- 	<button -->
		<!-- 		on:click={() => setQuality(qual)} -->
		<!-- 		type="button" -->
		<!-- 		class={`hover:bg-slate-400  ${quality === qual ? 'bg-blue-500' : 'bg-gray-500'}`} -->
		<!-- 		>{qual}</button -->
		<!-- 	> -->
		<!-- {/each} -->
	</div>
	<div
		class="video-controls absolute bottom-0 left-0 right-0 z-[100] p-1 opacity-0 duration-[50ms] ease-in-out group-hover:opacity-100"
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			bind:this={timelineContiner}
			on:mousemove={handleTimelineUpdate}
			on:mousedown={toggleScrubbing}
			class="timeline-container group/timeline mx-1 flex h-[7px] cursor-pointer items-center"
		>
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
				<svg xmlns="http://www.w3.org/2000/svg" class="play-icon h-8" viewBox="0 0 384 512"
					><path
						d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
					/></svg
				>
				<svg xmlns="http://www.w3.org/2000/svg" class="pause-icon h-8" viewBox="0 0 320 512"
					><path
						d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
					/></svg
				>
			</button>
			<div class="volume-container group/volume flex items-center">
				<button
					on:click={toggleMute}
					type="button"
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<svg class="volume-high-icon h-8" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
						/>
					</svg>
					<svg class="volume-low-icon h-8" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
						/>
					</svg>
					<svg class="volume-muted-icon h-8" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
						/>
					</svg>
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
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8" viewBox="0 0 320 512"
						><path
							d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"
						/></svg
					>
				</button>
				<button
					type="button"
					on:click={backTenSeconds}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8" viewBox="0 0 512 512"
						><path
							d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z"
						/></svg
					>
				</button>
				<button
					type="button"
					on:click={forwardTenSeconds}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8" viewBox="0 0 512 512"
						><path
							d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3V256v41.7L52.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29V352z"
						/></svg
					>
				</button>
				<button
					type="button"
					on:click={nextEpisode}
					class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8" viewBox="0 0 320 512"
						><path
							d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"
						/></svg
					>
				</button>
			</div>
			<button
				on:click={toggleMiniPlayer}
				type="button"
				class="ml-auto fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
				><svg viewBox="0 0 24 24" class="h-8">
					<path
						fill="currentColor"
						d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
					/>
				</svg></button
			>
			<button
				on:click={toggleFullscreen}
				type="button"
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="open h-8" viewBox="0 0 448 512"
					><path
						d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
					/></svg
				>
				<svg xmlns="http://www.w3.org/2000/svg" class="close h-8" viewBox="0 0 448 512"
					><path
						d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"
					/></svg
				>
			</button>
			<button
				type="button"
				on:click={toggleQualitySelect}
				class="fill-white opacity-50 duration-75 ease-in-out hover:opacity-100"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-8" viewBox="0 0 512 512"
					><path
						d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
					/></svg
				>
			</button>
		</div>
	</div>
</div>
