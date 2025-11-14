export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
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

    const QUALITY_TARGETS: Record<CompressionOptions['quality'], { min: number; max: number; q: number }> = {
      low: { min: 0.65, max: 0.75, q: 0.36 },     // ~65–75% smaller
      medium: { min: 0.45, max: 0.55, q: 0.58 },  // ~45–55% smaller
      high: { min: 0.20, max: 0.30, q: 0.82 },    // ~20–30% smaller
    };

    const getOutputType = (format: CompressionOptions['format'], inputType: string) => {
      if (format === 'jpeg') return 'image/jpeg';
      if (format === 'webp') return 'image/webp';
      if (format === 'png') return 'image/png';
      // auto
      return inputType === 'image/png' ? 'image/webp' : 'image/jpeg';
    };

    const reencodeOnMainThread = async (
      f: File,
      format: CompressionOptions['format'],
      qTarget: number,
      min: number,
      max: number
    ): Promise<CompressionResult> => {
      // Avoid wasting time on very small files
      const MIN_BYTES_TO_COMPRESS = 200 * 1024; // 200KB
      if (f.size < MIN_BYTES_TO_COMPRESS) {
        return { blob: f, originalSize: f.size, compressedSize: f.size };
      }

      const type = getOutputType(format, f.type);
      // If PNG output is explicitly requested, quality does not apply
      if (type === 'image/png') {
        return { blob: f, originalSize: f.size, compressedSize: f.size };
      }

      const imgUrl = URL.createObjectURL(f);
      try {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const el = new Image();
          el.onload = () => res(el);
          el.onerror = () => rej(new Error('Failed to load image for compression'));
          el.src = imgUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        ctx.drawImage(img, 0, 0);

        const toBlobWithQ = (qual: number) => new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => {
            if (!b) return rej(new Error('Canvas toBlob failed'));
            res(b);
          }, type, Math.max(0.1, Math.min(1, qual)));
        });

        const computeReduction = (size: number) => (f.size - size) / f.size;

        let q = qTarget;
        let bestWithin: { blob: Blob; reduction: number } | null = null;
        let lastBlob: Blob | null = null;

        for (let i = 0; i < 6; i++) {
          const b = await toBlobWithQ(q);
          lastBlob = b;
          const reduction = computeReduction(b.size);

          if (reduction >= min && reduction <= max) {
            URL.revokeObjectURL(imgUrl);
            return { blob: b, originalSize: f.size, compressedSize: b.size };
          }

          if (reduction <= max) {
            if (!bestWithin || reduction > bestWithin.reduction) bestWithin = { blob: b, reduction };
          }

          // Adjust q towards the target window
          if (reduction > max) {
            // Too small → increase quality
            q = Math.min(1, q + 0.12);
          } else {
            // Too large → decrease quality
            q = Math.max(0.1, q - 0.12);
          }
        }

        URL.revokeObjectURL(imgUrl);
        const finalBlob = bestWithin?.blob ?? lastBlob ?? f;
        return { blob: finalBlob, originalSize: f.size, compressedSize: finalBlob.size };
      } finally {
        URL.revokeObjectURL(imgUrl);
      }
    };

    worker.onmessage = async (e) => {
      worker.terminate();

      if (e.data.success) {
        const originalSize = e.data.originalSize as number;
        const compressedSize = e.data.compressedSize as number;
        const reduction = (originalSize - compressedSize) / originalSize;
        const { min, max, q } = QUALITY_TARGETS[options.quality];

        // If worker result is within the target range, use it
        if (reduction >= min && reduction <= max) {
          resolve({
            blob: e.data.blob,
            originalSize,
            compressedSize,
          });
          return;
        }

        // Fallback: do a deterministic main-thread re-encode using HTMLCanvasElement.toBlob
        try {
          const fallback = await reencodeOnMainThread(file, options.format, q, min, max);
          resolve(fallback);
        } catch (fallbackErr) {
          // As a last resort, still resolve with worker result to avoid blocking
          resolve({ blob: e.data.blob, originalSize, compressedSize });
        }
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    worker.postMessage({ file, ...options });
  });
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
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};

export const estimateCompressedSize = (
  originalSize: number,
  quality: 'low' | 'medium' | 'high'
): number => {
  const reductionMap = {
    low: 0.30,   // Target ~70% reduction (keep ~30% of size)
    medium: 0.50, // Target ~50% reduction (keep ~50% of size)
    high: 0.75,   // Target ~25% reduction (keep ~75% of size)
  };

  return Math.round(originalSize * reductionMap[quality]);
};
