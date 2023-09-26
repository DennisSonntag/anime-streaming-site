<svelte:head>
	<title>anime</title>
</svelte:head>
<form method="POST" class="absolute inset-0 m-auto flex h-fit w-fit flex-col items-center gap-2">
	<h1 class="text-center font-bold text-5xl font-heading text-text">Anime</h1>
	<input
		class="rounded-xl bg-primary p-2 text-center text-2xl font-bold text-text outline-none"
		type="text"
		placeholder="search"
		name="search"
	/>
	<button class="h-fit w-fit rounded-lg bg-secondary p-2 text-text" type="submit">Submit</button>
</form>
