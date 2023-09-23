import { writable } from "svelte/store";

type SourceType = {
	isM3U8: boolean;
	quality: string;
	url: string;
};
export type VideoUrlType = {
	download: string;
	headers: {
		Referer: string;
	};
	sources: SourceType[];
};

export const episodeStore = writable(1);

export const getVideoUrl = async (
	title: string,
	episode: number,
	fetchFn: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response> = fetch
): Promise<VideoUrlType> => {
	const episodeString = `${title}-episode-${episode}`;
	const videoUrlRaw = await fetchFn(
		`http://localhost:3000/anime/gogoanime/watch/${episodeString}?server=vidstreaming`
	);
	return await videoUrlRaw.json();
};
