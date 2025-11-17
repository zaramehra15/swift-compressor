export const convertVideo = async (file: File, to: 'mp4' | 'webm'): Promise<Blob> => {
  const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
  const coreURL = (await import('@ffmpeg/core/dist/ffmpeg-core.js?url')).default as string;
  const ffmpeg = createFFmpeg({ log: false, corePath: coreURL });
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
      try {
        await ffmpeg.run(
          '-i', inputName,
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-b:v', '2.5M',
          '-c:a', 'aac',
          outputName
        );
      } catch {
        try {
          await ffmpeg.run(
            '-i', inputName,
            '-c:v', 'mpeg4',
            '-b:v', '3M',
            '-c:a', 'aac',
            outputName
          );
        } catch {
          try {
            await ffmpeg.run(
              '-i', inputName,
              '-c:v', 'mpeg4',
              '-b:v', '3M',
              '-c:a', 'libmp3lame',
              outputName
            );
          } catch {
            await ffmpeg.run(
              '-i', inputName,
              '-c:v', 'libx264',
              '-preset', 'medium',
              '-b:v', '2.5M',
              '-c:a', 'copy',
              outputName
            );
          }
        }
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
    throw new Error('Video conversion failed');
  }
};