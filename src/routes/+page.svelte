<svelte:head>
	<title>anime</title>
</svelte:head>
<form method="POST" class="absolute inset-0 m-auto flex h-fit w-fit flex-col items-center gap-2">
	<h1 class="text-white font-extrabold text-8xl text-center">Anime</h1>
	<input
		class="rounded-xl bg-gray-600 p-2 text-center text-2xl font-bold text-white outline-none"
		type="text"
		placeholder="search"
		name="search"
	/>
	<button class="h-fit w-fit rounded-lg bg-gray-600 p-2 text-white" type="submit">submit</button>
</form>
