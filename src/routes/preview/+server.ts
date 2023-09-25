

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

export async function GET({ url }) {
  const videoUrl = url.searchParams.get('videoURL');

  const args = [
    '-ss',
    '10:23:45',
    '-i',
    videoUrl,
    '-frames:v',
    '1',
    '-q:v',
    '2',
    '-y',
    './src/thumbnails/output.jpg'
  ];

  const ffmpeg = spawn('ffmpeg', args);

  const promise = new Promise<string>((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve("good");
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });


  function nodeBufferToAB(buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  }

  function fileToBlob(filePath, mimeType) {
    const buffer = readFileSync(filePath);
    const ab = nodeBufferToAB(buffer);
    return new Blob([ab], { type: mimeType });
  }

  // const finalBlob = fileToBlob('./output.jpg', 'image/jpeg');
  return new Response(await promise);
}

