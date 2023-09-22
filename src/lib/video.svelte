<script lang="ts">
	export let src: string;

	import Hls from 'hls.js';
	import { onMount } from 'svelte';

	function changeVidUrl(video: HTMLVideoElement) {
		if (Hls.isSupported()) {
			let hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(video);
		}
	}
	let video: HTMLVideoElement;
	let videoContainer: HTMLDivElement;

	onMount(() => {
		document.addEventListener('keydown', (e) => {
			const key = e.key.toLowerCase();
			if (key == ' ' || key == 'k') {
				togglePlay();
			}
		});
	});

	function togglePlay() {
		video.paused ? video.play() : video.pause();
	}

	console.log();
</script>

<div
	bind:this={videoContainer}
	class="video-container group relative mx-auto aspect-video w-[90%] bg-black paused"
>
	<video
		on:pause={() => videoContainer.classList.add('paused')}
		on:play={() => videoContainer.classList.remove('paused')}
		bind:this={video}
		id="video"
		class="w-full"
		use:changeVidUrl
	>
		<track src="" kind="captions" srclang="" label="" />
	</video>
	<div
		class="absolute bottom-0 left-0 right-0 p-1 opacity-0 duration-[50ms] ease-in-out group-hover:opacity-100 video-controls"
	>
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
	</div>
</div>
