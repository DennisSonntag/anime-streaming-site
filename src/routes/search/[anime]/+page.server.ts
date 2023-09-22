import type { PageServerLoad } from './$types';

type AnimeInfo = {
	currentPage: string
	hasNextPage: boolean
	results: AnimeResult[]
}

type AnimeResult = {
	id: string;
	image: string;
	releaseDate: string;
	subOrDub: string;
	title: string;
	url: string;
};
export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const getAnimes = async (): Promise<AnimeInfo> => {

		const res = await fetch(`http://localhost:3000/anime/gogoanime/${params.anime}?page=1`);

		const cacheControl = res.headers.get("cache-control")
		if (cacheControl) {
			setHeaders({ 'cache-control': cacheControl })
		}

		return await res.json();
	}

	return { animes: getAnimes(), search: params.anime };
};
