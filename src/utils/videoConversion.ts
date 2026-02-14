/**
 * Video conversion using FFmpeg WASM.
 * FFmpeg is loaded lazily and only when the user actually triggers a video conversion.
 */
export const convertVideo = async (file: File, to: 'mp4' | 'webm'): Promise<Blob> => {
  // Dynamic import to avoid bundling FFmpeg in the main bundle
  let createFFmpeg: (opts: Record<string, unknown>) => {
    isLoaded: () => boolean;
    load: () => Promise<void>;
    run: (...args: string[]) => Promise<void>;
    FS: (cmd: string, name: string, data?: Uint8Array) => Uint8Array;
  };
  let fetchFile: (file: File) => Promise<Uint8Array>;

  try {
    const ffmpegModule = await import('@ffmpeg/ffmpeg');
    createFFmpeg = ffmpegModule.createFFmpeg;
    fetchFile = ffmpegModule.fetchFile;
  } catch {
    throw new Error('FFmpeg could not be loaded. Video conversion requires a modern browser with WebAssembly support.');
  }

  const ffmpeg = createFFmpeg({ log: false });
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const inputName = `input_${Date.now()}`;
  const outputName = `output_${Date.now()}.${to}`;
  ffmpeg.FS('writeFile', inputName, await fetchFile(file));

  try {
    if (to === 'webm') {
      await ffmpeg.run(
        '-i', inputName,
        '-c:v', 'libvpx',
        '-b:v', '2M',
        '-c:a', 'libvorbis',
        outputName
      );
    } else {
      // Try multiple codec combinations for MP4
      const codecs = [
        ['-c:v', 'libx264', '-preset', 'medium', '-b:v', '2.5M', '-c:a', 'aac'],
        ['-c:v', 'mpeg4', '-b:v', '3M', '-c:a', 'aac'],
        ['-c:v', 'mpeg4', '-b:v', '3M', '-c:a', 'libmp3lame'],
        ['-c:v', 'libx264', '-preset', 'medium', '-b:v', '2.5M', '-c:a', 'copy'],
      ];

      let success = false;
      for (const codecArgs of codecs) {
        try {
          await ffmpeg.run('-i', inputName, ...codecArgs, outputName);
          success = true;
          break;
        } catch {
          continue;
        }
      }
      if (!success) {
        throw new Error('All codec combinations failed');
      }
    }

    const data = ffmpeg.FS('readFile', outputName);
    const blob = new Blob([data.buffer], { type: to === 'webm' ? 'video/webm' : 'video/mp4' });
    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputName);
    return blob;
  } catch (e) {
    try { ffmpeg.FS('unlink', inputName); } catch { void 0; }
    try { ffmpeg.FS('unlink', outputName); } catch { void 0; }
    throw new Error('Video conversion failed. This conversion may not be supported in-browser.');
  }
};