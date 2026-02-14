export const decodeToAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  type WinWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = (window as WinWithWebkit).webkitAudioContext ?? window.AudioContext;
  const ac = new Ctor();
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
    const s = Math.max(-1, Math.min(1, input[i]));
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
  type Mp3Enc = { encodeBuffer: (left: Int16Array, right?: Int16Array) => Uint8Array; flush: () => Uint8Array };
  type LameModule = { Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => Mp3Enc };
  const Lame = (await import('lamejs')) as unknown as LameModule;
  const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const left = audioBuffer.getChannelData(0);
  const mp3encoder = new Lame.Mp3Encoder(numChannels, sampleRate, kbps);
  const maxSamples = 1152;
  const mp3Data: Uint8Array[] = [];

  const toInt16 = (samples: Float32Array): Int16Array => {
    const out = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return out;
  };

  if (numChannels === 1) {
    // Mono encoding
    for (let i = 0; i < left.length; i += maxSamples) {
      const chunk = left.subarray(i, i + maxSamples);
      const mp3buf = mp3encoder.encodeBuffer(toInt16(chunk));
      if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
    }
  } else {
    // Stereo encoding
    const right = audioBuffer.getChannelData(1);
    for (let i = 0; i < left.length; i += maxSamples) {
      const leftChunk = toInt16(left.subarray(i, i + maxSamples));
      const rightChunk = toInt16(right.subarray(i, i + maxSamples));
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf));
    }
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