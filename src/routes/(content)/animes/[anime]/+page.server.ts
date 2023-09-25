import { getVideoUrl } from '$lib';
import type { PageServerLoad } from '../$types';

type EpisodeType = {
	id: string;
	number: number;
	url: string;
};

type Details = {
	id: string;
	title: string;
	url: string;
	genres: string[];
	totalEpisodes: number;
	image: string;
	releaseDate: string;
	description: string;
	subOrDub: string;
	type: string;
	status: string;
	otherName: string;
	episodes: EpisodeType[];
};

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const search = url.searchParams.get('s');
	const title = params.anime;
	const getDetails = async (): Promise<Details> => {
		const detailsRaw = await fetch(`http://localhost:3000/anime/gogoanime/info/${title}`);
		return await detailsRaw.json();
	};

	const episode = Number(url.searchParams.get('ep'));

	const jikanRes = await fetch(
		`https://api.jikan.moe/v4/anime?q=${title}&order_by=popularity&limit=1`
	);
	const jikan = await jikanRes.json();

	const mal_id = jikan.data[0].mal_id;

	const fillerRes = await fetch(`https://api.jikan.moe/v4/anime/${mal_id}/episodes`);
	const fillerJson = await fillerRes.json();
	const fillers: { epNum: number; isFiller: boolean }[] = fillerJson.data?.map((ep) => ({
		epNum: ep.mal_id,
		isFiller: ep.filler
	}));

	return {
		videoUrl: getVideoUrl(title, episode, fetch),
		episode,
		title,
		search,
		fillers,
		details: getDetails()
	};
};
