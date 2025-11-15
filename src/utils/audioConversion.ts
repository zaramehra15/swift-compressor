export const decodeToAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await ac.decodeAudioData(arrayBuffer);
  ac.close();
  return audioBuffer;
};

const interleave = (left: Float32Array, right: Float32Array) => {
  const length = left.length + right.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  while (index < length) {
    result[index++] = left[inputIndex];
    result[index++] = right[inputIndex];
    inputIndex++;
  }
  return result;
};

const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
};

export const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  let samples: Float32Array;
  if (numChannels === 2) {
    samples = interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
  } else {
    samples = audioBuffer.getChannelData(0);
  }
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);
  floatTo16BitPCM(view, 44, samples);
  return new Blob([view], { type: 'audio/wav' });
};

export const audioBufferToMp3 = async (audioBuffer: AudioBuffer, kbps = 192): Promise<Blob> => {
  const Lame = await import('lamejs');
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const left = audioBuffer.getChannelData(0);
  const right = numChannels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0);
  const samples = interleave(left, right);
  const mp3encoder = new (Lame as any).Mp3Encoder(2, sampleRate, kbps);
  const maxSamples = 1152;
  const mp3Data: Uint8Array[] = [];
  let i = 0;
  while (i < samples.length) {
    const slice = samples.subarray(i, i + maxSamples * 2);
    const leftSlice = new Int16Array(maxSamples);
    const rightSlice = new Int16Array(maxSamples);
    for (let j = 0, k = 0; j < maxSamples && k < slice.length; j++, k += 2) {
      leftSlice[j] = Math.max(-32768, Math.min(32767, Math.round(slice[k] * 32767)));
      rightSlice[j] = Math.max(-32768, Math.min(32767, Math.round(slice[k + 1] * 32767)));
    }
    const mp3buf = mp3encoder.encodeBuffer(leftSlice, rightSlice);
    if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
    i += maxSamples * 2;
  }
  const enc = mp3encoder.flush();
  if (enc.length > 0) mp3Data.push(new Uint8Array(enc));
  return new Blob(mp3Data, { type: 'audio/mpeg' });
};

export const convertAudio = async (file: File, to: 'mp3' | 'wav'): Promise<Blob> => {
  const buffer = await decodeToAudioBuffer(file);
  if (to === 'mp3') {
    return audioBufferToMp3(buffer, 192);
  }
  return audioBufferToWav(buffer);
};