import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { writable as persistedWritable } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

type CurrentTimeStoreType = Record<string, number>;
export const currentTimeStore = persistedWritable<CurrentTimeStoreType>('time', {});

export const episodeStore = persistedWritable('episode', 1);

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

export const getVideoUrl = async (
	title: string,
	episode: number,
	fetchFn: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response> = fetch
): Promise<VideoUrlType> => {
	const episodeString = `${title}-episode-${episode}`;
	const videoUrlRaw = await fetchFn(
		// `http://localhost:3000/anime/gogoanime/watch/${episodeString}?server=vidstreaming`
		`${PUBLIC_BACKEND_URL}/anime/gogoanime/watch/${episodeString}?server=vidstreaming`
	);
	return await videoUrlRaw.json();
};

export const loading = writable(false);
