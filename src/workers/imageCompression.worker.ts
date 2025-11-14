// Web Worker for image compression
interface CompressionMessage {
  file: File;
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { file, quality, format } = e.data;

  try {
    // Strict, predictable compression targets
    // We target reduction ranges and adjust encoder quality iteratively to avoid over-compression
    const targets = {
      low: { min: 0.65, max: 0.75, initialQ: 0.38 },     // ~65–75% smaller
      medium: { min: 0.45, max: 0.55, initialQ: 0.58 },  // ~45–55% smaller
      high: { min: 0.20, max: 0.30, initialQ: 0.90 },    // ~20–30% smaller
    } as const;

    const { min: targetMin, max: targetMax, initialQ } = targets[quality];

    // Minimal compression check: skip tiny files to avoid visual degradation
    const MIN_BYTES_TO_COMPRESS = 200 * 1024; // 200KB
    if (file.size < MIN_BYTES_TO_COMPRESS) {
      self.postMessage({
        success: true,
        blob: file,
        originalSize: file.size,
        compressedSize: file.size,
      });
      return;
    }

    // Read file
    const bitmap = await createImageBitmap(file);

    // Keep original dimensions to avoid unintended extra size reduction
    const width = bitmap.width;
    const height = bitmap.height;

    // Create canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Determine output format
    let outputFormat: string = 'image/jpeg';
    if (format === 'webp') {
      outputFormat = 'image/webp';
    } else if (format === 'png') {
      outputFormat = 'image/png';
    } else if (format === 'auto') {
      // Auto: prefer WebP for PNG sources (alpha-friendly), otherwise JPEG
      outputFormat = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    }

    const compressAt = async (q: number, type = outputFormat) => {
      const qualityParam = type === 'image/png' ? undefined : Math.max(0.1, Math.min(1, q));
      return await canvas.convertToBlob({
        type,
        quality: qualityParam as any,
      });
    };

    // If PNG is explicitly requested, browser ignores quality, so just re-encode once
    if (outputFormat === 'image/png') {
      const blob = await compressAt(1.0);
      self.postMessage({
        success: true,
        blob,
        originalSize: file.size,
        compressedSize: blob.size,
      });
      return;
    }

    // Iteratively search for a quality that lands within the target reduction range
    let qLow = 0.1;
    let qHigh = 1.0;
    let q: number = Number(initialQ);

    let bestWithin: { blob: Blob; reduction: number } | null = null; // Not exceeding max
    let resultBlob: Blob | null = null;

    const computeReduction = (size: number) => (file.size - size) / file.size; // 0..1

    for (let i = 0; i < 7; i++) {
      const b = await compressAt(q);
      const reduction = computeReduction(b.size);

      // Perfect fit
      if (reduction >= targetMin && reduction <= targetMax) {
        resultBlob = b;
        break;
      }

      // Track best candidate that does not exceed the maximum reduction
      if (reduction <= targetMax) {
        if (!bestWithin || reduction > bestWithin.reduction) {
          bestWithin = { blob: b, reduction };
        }
      }

      if (reduction > targetMax) {
        // Too small (over-compressed): increase quality
        qLow = q;
      } else {
        // Too large (under-compressed): decrease quality
        qHigh = q;
      }

      const nextQ = (qLow + qHigh) / 2;
      if (Math.abs(nextQ - q) < 0.02) {
        // Converged; try one last time at nextQ then exit
        q = nextQ;
        const b2 = await compressAt(q);
        const r2 = computeReduction(b2.size);
        if (r2 >= targetMin && r2 <= targetMax) {
          resultBlob = b2;
        } else if (r2 <= targetMax) {
          if (!bestWithin || r2 > bestWithin.reduction) bestWithin = { blob: b2, reduction: r2 };
        }
        break;
      }
      q = nextQ;
    }

    if (!resultBlob) {
      if (bestWithin) {
        // Use the closest candidate that does not exceed the cap
        resultBlob = bestWithin.blob;
      } else {
        // All attempts exceeded the max target; clamp by using max quality
        const maxQBlob = await compressAt(1.0);
        const maxReduction = computeReduction(maxQBlob.size);
        if (maxReduction > targetMax) {
          // Fall back to lossless PNG to avoid exceeding the reduction cap
          const pngBlob = await compressAt(1.0, 'image/png');
          resultBlob = pngBlob;
        } else {
          resultBlob = maxQBlob;
        }
      }
    }

    // Send back result
    self.postMessage({
      success: true,
      blob: resultBlob,
      originalSize: file.size,
      compressedSize: resultBlob.size,
    });

  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Compression failed',
    });
  }
};
