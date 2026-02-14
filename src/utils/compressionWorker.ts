export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  outputMime: string;
}

export const compressImageWithWorker = (
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/imageCompression.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = async (e) => {
      worker.terminate();

      if (e.data.success) {
        const result: CompressionResult = {
          blob: e.data.blob,
          originalSize: e.data.originalSize,
          compressedSize: e.data.compressedSize,
          outputMime: e.data.outputMime || file.type,
        };

        // If worker compression didn't reduce size enough, try main thread fallback
        if (result.compressedSize >= result.originalSize * 0.98) {
          try {
            const fallback = await compressOnMainThread(file, options);
            if (fallback.compressedSize < result.compressedSize) {
              resolve(fallback);
              return;
            }
          } catch {
            // Use worker result
          }
        }
        resolve(result);
      } else {
        // Worker failed — try main thread
        try {
          const fallback = await compressOnMainThread(file, options);
          resolve(fallback);
        } catch (fallbackErr) {
          reject(new Error(e.data.error || 'Compression failed'));
        }
      }
    };

    worker.onerror = async (error) => {
      worker.terminate();
      try {
        const fallback = await compressOnMainThread(file, options);
        resolve(fallback);
      } catch {
        reject(error);
      }
    };

    worker.postMessage({ file, ...options });
  });
};

/**
 * Target compression ranges — ratio of original size to KEEP:
 *   High   → keep 80-90%  (10-20% reduction)
 *   Medium → keep 50-80%  (20-50% reduction)
 *   Low    → keep 20-50%  (50-80% reduction)
 */
const TARGET_RANGES = {
  high: { min: 0.80, max: 0.90 },
  medium: { min: 0.50, max: 0.80 },
  low: { min: 0.20, max: 0.50 },
} as const;

const MAX_DIM = { high: 4096, medium: 3072, low: 2048 } as const;
const INITIAL_Q = { high: 0.65, medium: 0.40, low: 0.15 } as const;
const PNG_SHIFT = { high: 0, medium: 2, low: 4 } as const;
const PNG_INITIAL_SCALE = { high: 0.95, medium: 0.75, low: 0.50 } as const;
const BINARY_SEARCH_ITERATIONS = 8;
const MIN_BYTES = 10 * 1024;

/** Render JPEG/WebP at given quality using regular canvas */
function renderLossyCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  mime: string,
  q: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => {
      if (!b) return rej(new Error('Canvas toBlob failed'));
      res(b);
    }, mime, q);
  });
}

/** Render PNG at given scale + color quantization */
function renderPngCanvas(
  img: HTMLImageElement,
  origW: number,
  origH: number,
  scale: number,
  shift: number
): Promise<Blob> {
  const w = Math.max(16, Math.round(origW * scale));
  const h = Math.max(16, Math.round(origH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  if (shift > 0) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const mask = (0xFF >> shift) << shift;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] & mask;
      data[i + 1] = data[i + 1] & mask;
      data[i + 2] = data[i + 2] & mask;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => {
      if (!b) return rej(new Error('Canvas toBlob failed'));
      res(b);
    }, 'image/png');
  });
}

/**
 * Main-thread fallback compression. Uses binary search to land within
 * the target compression range, mirroring the web worker approach.
 */
const compressOnMainThread = async (
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> => {
  const target = TARGET_RANGES[options.quality];

  if (file.size < MIN_BYTES) {
    return { blob: file, originalSize: file.size, compressedSize: file.size, outputMime: file.type };
  }

  let outputMime = file.type || 'image/jpeg';
  if (outputMime === 'image/jpg') outputMime = 'image/jpeg';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(outputMime)) {
    outputMime = 'image/jpeg';
  }

  const isPng = outputMime === 'image/png';
  const imgUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = () => rej(new Error('Failed to load image'));
      el.src = imgUrl;
    });

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    const maxDim = MAX_DIM[options.quality];

    // Apply dimension cap
    if (Math.max(width, height) > maxDim) {
      const s = maxDim / Math.max(width, height);
      width = Math.round(width * s);
      height = Math.round(height * s);
    }
    width = Math.max(16, width);
    height = Math.max(16, height);

    const targetMid = (target.min + target.max) / 2;
    let bestBlob: Blob;
    let bestKR: number;

    if (!isPng) {
      // ── JPEG / WebP: binary search on quality ──
      let lo = 0.01;
      let hi = 0.95;

      bestBlob = await renderLossyCanvas(img, width, height, outputMime, INITIAL_Q[options.quality]);
      bestKR = bestBlob.size / file.size;

      if (bestKR < target.min || bestKR > target.max) {
        for (let i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
          const midQ = (lo + hi) / 2;
          const blob = await renderLossyCanvas(img, width, height, outputMime, midQ);
          const kr = blob.size / file.size;

          if (Math.abs(kr - targetMid) < Math.abs(bestKR - targetMid)) {
            bestBlob = blob;
            bestKR = kr;
          }

          if (kr >= target.min && kr <= target.max) {
            break;
          } else if (kr > target.max) {
            hi = midQ;
          } else {
            lo = midQ;
          }
        }
      }
    } else {
      // ── PNG: binary search on scale factor ──
      let lo = 0.10;
      let hi = 1.0;
      const shift = PNG_SHIFT[options.quality];

      bestBlob = await renderPngCanvas(img, width, height, PNG_INITIAL_SCALE[options.quality], shift);
      bestKR = bestBlob.size / file.size;

      if (bestKR < target.min || bestKR > target.max) {
        for (let i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
          const midScale = (lo + hi) / 2;
          const blob = await renderPngCanvas(img, width, height, midScale, shift);
          const kr = blob.size / file.size;

          if (Math.abs(kr - targetMid) < Math.abs(bestKR - targetMid)) {
            bestBlob = blob;
            bestKR = kr;
          }

          if (kr >= target.min && kr <= target.max) {
            break;
          } else if (kr > target.max) {
            hi = midScale;
          } else {
            lo = midScale;
          }
        }
      }
    }

    return { blob: bestBlob, originalSize: file.size, compressedSize: bestBlob.size, outputMime };
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const calculateCompressionRatio = (
  originalSize: number,
  compressedSize: number
): number => {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};

export const estimateCompressedSize = (
  originalSize: number,
  quality: 'low' | 'medium' | 'high'
): number => {
  // Midpoint of each target range
  const keepMap = {
    high: 0.85,   // keeps ~85% → ~15% reduction
    medium: 0.65, // keeps ~65% → ~35% reduction
    low: 0.35,    // keeps ~35% → ~65% reduction
  };
  return Math.round(originalSize * keepMap[quality]);
};

/**
 * Get the correct file extension for a MIME type
 */
export const getExtensionForMime = (mime: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
  };
  return map[mime] || 'bin';
};
