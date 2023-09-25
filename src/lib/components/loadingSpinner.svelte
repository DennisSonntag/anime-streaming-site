<script lang="ts">
	export let isHidden = false;
	export let color = 'gray';
	export let scale = '1';
</script>

<div style:--scale={scale} style:--color={color} class:hidden={isHidden}></div>

<style>
	div {
		width: 65px;
		scale: var(--scale);
		aspect-ratio: 1;
		inset: 0;
		margin: auto;
		position: absolute;
	}
	div:before,
	div:after {
		content: '';
		position: absolute;
		border-radius: 50px;
		box-shadow: 0 0 0 3px inset var(--color);
		animation: sc5 2.5s infinite;
	}
	div:after {
		animation-delay: -1.25s;
		border-radius: 0;
	}
	@keyframes sc5 {
		0% {
			inset: 0 35px 35px 0;
		}
		12.5% {
			inset: 0 35px 0 0;
		}
		25% {
			inset: 35px 35px 0 0;
		}
		37.5% {
			inset: 35px 0 0 0;
		}
		50% {
			inset: 35px 0 0 35px;
		}
		62.5% {
			inset: 0 0 0 35px;
		}
		75% {
			inset: 0 0 35px 35px;
		}
		87.5% {
			inset: 0 0 35px 0;
		}
		100% {
			inset: 0 35px 35px 0;
		}
	}
</style>
