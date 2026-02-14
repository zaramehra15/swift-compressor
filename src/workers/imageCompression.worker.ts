// Web Worker for image compression
interface CompressionMessage {
  file: File;
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

/**
 * Target compression ranges — ratio of original size to KEEP:
 *   High   → keep 80-90%  (10-20% reduction)
 *   Medium → keep 50-80%  (20-50% reduction)
 *   Low    → keep 20-50%  (50-80% reduction)
 *
 * Uses binary search to reliably land within range regardless of format.
 */
const TARGET_RANGES = {
  high: { min: 0.80, max: 0.90 },
  medium: { min: 0.50, max: 0.80 },
  low: { min: 0.20, max: 0.50 },
} as const;

// Dimension caps per quality level
const MAX_DIM = { high: 4096, medium: 3072, low: 2048 } as const;

// Initial quality guesses for JPEG/WebP (starting point for binary search)
const INITIAL_Q = { high: 0.65, medium: 0.40, low: 0.15 } as const;

// PNG color quantization bit-shift per quality
const PNG_SHIFT = { high: 0, medium: 2, low: 4 } as const;

// Initial PNG scale starting point
const PNG_INITIAL_SCALE = { high: 0.95, medium: 0.75, low: 0.50 } as const;

const BINARY_SEARCH_ITERATIONS = 8;
const MIN_BYTES = 10 * 1024; // Skip files < 10KB

/** Render JPEG/WebP at given quality using OffscreenCanvas */
async function renderLossy(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  q: number
): Promise<Blob> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.convertToBlob({ type: mime, quality: q });
}

/** Render PNG at given scale + color quantization */
async function renderPng(
  bitmap: ImageBitmap,
  origW: number,
  origH: number,
  scale: number,
  shift: number
): Promise<Blob> {
  const w = Math.max(16, Math.round(origW * scale));
  const h = Math.max(16, Math.round(origH * scale));
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);

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

  return canvas.convertToBlob({ type: 'image/png' });
}

self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { file, quality } = e.data;

  try {
    const target = TARGET_RANGES[quality];

    // Skip tiny files
    if (file.size < MIN_BYTES) {
      self.postMessage({
        success: true,
        blob: file,
        originalSize: file.size,
        compressedSize: file.size,
        outputMime: file.type,
      });
      return;
    }

    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;

    // Determine output MIME — preserve original format
    let outputMime = file.type || 'image/jpeg';
    if (outputMime === 'image/jpg') outputMime = 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(outputMime)) {
      outputMime = 'image/jpeg';
    }

    const isPng = outputMime === 'image/png';
    const maxDim = MAX_DIM[quality];

    // Apply dimension cap (for all formats)
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
      // ── JPEG / WebP: binary search on quality parameter ──
      let lo = 0.01;
      let hi = 0.95;

      // Initial attempt
      bestBlob = await renderLossy(bitmap, width, height, outputMime, INITIAL_Q[quality]);
      bestKR = bestBlob.size / file.size;

      // Only search if not already in range
      if (bestKR < target.min || bestKR > target.max) {
        for (let i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
          const midQ = (lo + hi) / 2;
          const blob = await renderLossy(bitmap, width, height, outputMime, midQ);
          const kr = blob.size / file.size;

          // Track best (closest to target midpoint)
          if (Math.abs(kr - targetMid) < Math.abs(bestKR - targetMid)) {
            bestBlob = blob;
            bestKR = kr;
          }

          if (kr >= target.min && kr <= target.max) {
            break; // In range
          } else if (kr > target.max) {
            hi = midQ; // Too large → lower quality
          } else {
            lo = midQ; // Too small → higher quality
          }
        }
      }
    } else {
      // ── PNG: binary search on scale factor ──
      let lo = 0.10;
      let hi = 1.0;
      const shift = PNG_SHIFT[quality];

      // Initial attempt
      bestBlob = await renderPng(bitmap, width, height, PNG_INITIAL_SCALE[quality], shift);
      bestKR = bestBlob.size / file.size;

      if (bestKR < target.min || bestKR > target.max) {
        for (let i = 0; i < BINARY_SEARCH_ITERATIONS; i++) {
          const midScale = (lo + hi) / 2;
          const blob = await renderPng(bitmap, width, height, midScale, shift);
          const kr = blob.size / file.size;

          if (Math.abs(kr - targetMid) < Math.abs(bestKR - targetMid)) {
            bestBlob = blob;
            bestKR = kr;
          }

          if (kr >= target.min && kr <= target.max) {
            break;
          } else if (kr > target.max) {
            hi = midScale; // Too large → smaller scale
          } else {
            lo = midScale; // Too small → larger scale
          }
        }
      }
    }

    bitmap.close();

    self.postMessage({
      success: true,
      blob: bestBlob,
      originalSize: file.size,
      compressedSize: bestBlob.size,
      outputMime,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Compression failed',
    });
  }
};
