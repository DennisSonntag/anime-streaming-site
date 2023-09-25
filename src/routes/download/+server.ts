import { json, type RequestHandler } from '@sveltejs/kit';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';

export const GET: RequestHandler = async ({ request, params , url}) => {
	const inputUrl = url.searchParams.get("url")
	const name = url.searchParams.get("name")
	const outputFilePath = `./static/${name}.mp4`;

	const conversionPromise = new Promise((resolve, reject) => {
		ffmpeg(inputUrl)
			.outputOptions('-c', 'copy')
			.outputOptions('-bsf:a', 'aac_adtstoasc')
			.save(outputFilePath)
			.on('end', () => {
				console.log('Conversion complete');
				resolve();
			})
			.on('error', (err: any) => {
				console.log('Error during conversion:', err);
				reject(err);
			});
	});

	await conversionPromise;
	const fileBuffer = await fs.readFile(outputFilePath);
	return new Response(fileBuffer, {
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Disposition': `attachment; filename=${name}.mp4`
		}
	});
}
