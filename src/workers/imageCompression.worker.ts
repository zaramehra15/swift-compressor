// Web Worker for image compression
interface CompressionMessage {
  file: File;
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { file, quality, format } = e.data;

  try {
    const targets = {
      low: { min: 0.80, max: 0.85, initialQ: 0.25 },
      medium: { min: 0.45, max: 0.50, initialQ: 0.58 },
      high: { min: 0.20, max: 0.22, initialQ: 0.90 },
    } as const;
    const { min: targetMin, max: targetMax, initialQ } = targets[quality];

    // Minimal compression check: skip tiny files to avoid visual degradation
    const MIN_BYTES_TO_COMPRESS = 50 * 1024;
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

    ctx.drawImage(bitmap, 0, 0, width, height);

    let hasAlpha = false;
    try {
      const stepX = Math.max(1, Math.floor(width / 50));
      const stepY = Math.max(1, Math.floor(height / 50));
      const data = ctx.getImageData(0, 0, width, height).data;
      for (let y = 0; y < height && !hasAlpha; y += stepY) {
        for (let x = 0; x < width; x += stepX) {
          const i = (y * width + x) * 4 + 3;
          if (data[i] < 255) { hasAlpha = true; break; }
        }
      }
    } catch { hasAlpha = false; }

    // Determine output format
    let outputFormat: string = 'image/jpeg';
    if (format === 'webp') {
      outputFormat = 'image/webp';
    } else if (format === 'png') {
      outputFormat = 'image/png';
    } else if (format === 'auto') {
      if (file.type === 'image/png') {
        outputFormat = 'image/webp';
      } else {
        outputFormat = 'image/jpeg';
      }
    }

    const compressAt = async (q: number, type = outputFormat) => {
      const qualityParam = type === 'image/png' ? undefined : Math.max(0.1, Math.min(1, q));
      return await canvas.convertToBlob({
        type,
        quality: qualityParam as number | undefined,
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

    let bestWithin: { blob: Blob; reduction: number } | null = null;
    let resultBlob: Blob | null = null;

    const computeReduction = (size: number) => (file.size - size) / file.size;

    for (let i = 0; i < 10; i++) {
      const b = await compressAt(q);
      const reduction = computeReduction(b.size);

      if (reduction >= targetMin && reduction <= targetMax) {
        resultBlob = b;
        break;
      }

      if (reduction <= targetMax) {
        if (!bestWithin || reduction > bestWithin.reduction) {
          bestWithin = { blob: b, reduction };
        }
      }

      if (reduction > targetMax) {
        qLow = q;
      } else {
        qHigh = q;
      }

      const nextQ = (qLow + qHigh) / 2;
      if (Math.abs(nextQ - q) < 0.02) {
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
      let candidate = bestWithin?.blob ?? null;
      const needAltForHighMedium = (quality === 'high' || quality === 'medium') && (!candidate || (candidate && computeReduction(candidate.size) < targetMin));
      if (quality === 'low' || needAltForHighMedium) {
        const altType = outputFormat === 'image/webp' ? 'image/jpeg' : 'image/webp';
        let qL = 0.1;
        let qH = 1.0;
        let q2: number = Number(initialQ);
        let best2: { blob: Blob; reduction: number } | null = null;
        for (let i = 0; i < 10; i++) {
          const b = await compressAt(q2, altType);
          const r = computeReduction(b.size);
          if (r >= targetMin && r <= targetMax) { resultBlob = b; break; }
          if (r <= targetMax) { if (!best2 || r > best2.reduction) best2 = { blob: b, reduction: r }; }
          if (r > targetMax) { qL = q2; } else { qH = q2; }
          const nq = (qL + qH) / 2;
          if (Math.abs(nq - q2) < 0.02) {
            q2 = nq;
            const b2 = await compressAt(q2, altType);
            const r2 = computeReduction(b2.size);
            if (r2 >= targetMin && r2 <= targetMax) { resultBlob = b2; }
            else if (r2 <= targetMax) { if (!best2 || r2 > best2.reduction) best2 = { blob: b2, reduction: r2 }; }
            break;
          }
          q2 = nq;
        }
        if (!resultBlob && best2) {
          if (!candidate) candidate = best2.blob; else {
            const candR = computeReduction(candidate.size);
            if (best2.reduction > candR) candidate = best2.blob;
          }
        }
      }
      if (!resultBlob) {
        if (candidate) {
          resultBlob = candidate;
        } else {
          const maxQBlob = await compressAt(1.0);
          const maxReduction = computeReduction(maxQBlob.size);
          if (maxReduction > targetMax) {
            const pngBlob = await compressAt(1.0, 'image/png');
            resultBlob = pngBlob;
          } else {
            resultBlob = maxQBlob;
          }
        }
      }
      if (computeReduction(resultBlob.size) <= 0) {
        resultBlob = file;
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
