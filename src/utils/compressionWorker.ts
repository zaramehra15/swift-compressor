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
      low: { min: 0.80, max: 0.85, q: 0.25 },
      medium: { min: 0.45, max: 0.50, q: 0.58 },
      high: { min: 0.20, max: 0.22, q: 0.90 },
    };

    const getOutputType = (format: CompressionOptions['format'], inputType: string) => {
      if (format === 'jpeg') return 'image/jpeg';
      if (format === 'webp') return 'image/webp';
      if (format === 'png') return 'image/png';
      return inputType === 'image/png' ? 'image/webp' : 'image/jpeg';
    };

    const reencodeOnMainThread = async (
      f: File,
      format: CompressionOptions['format'],
      quality: CompressionOptions['quality'],
      qTarget: number,
      min: number,
      max: number
    ): Promise<CompressionResult> => {
      const MIN_BYTES_TO_COMPRESS = 50 * 1024;
      if (f.size < MIN_BYTES_TO_COMPRESS) {
        return { blob: f, originalSize: f.size, compressedSize: f.size };
      }
      let type: 'image/jpeg' | 'image/webp' | 'image/png' = getOutputType(format, f.type) as any;

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

        // Auto already maps PNG → WebP and others → JPEG via getOutputType

        const toBlobWithQ = (qual: number) => new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => {
            if (!b) return rej(new Error('Canvas toBlob failed'));
            res(b);
          }, type, Math.max(0.1, Math.min(1, qual)));
        });

        if (type === 'image/png') {
          const pngBlob = await new Promise<Blob>((res, rej) => {
            canvas.toBlob((b) => {
              if (!b) return rej(new Error('Canvas toBlob failed'));
              res(b);
            }, 'image/png');
          });
          URL.revokeObjectURL(imgUrl);
          return { blob: pngBlob, originalSize: f.size, compressedSize: pngBlob.size };
        }
        const computeReduction = (size: number) => (f.size - size) / f.size;
        let q = qTarget;
        let bestWithin: { blob: Blob; reduction: number } | null = null;
        let lastBlob: Blob | null = null;

        for (let i = 0; i < 6; i++) {
          const b = await new Promise<Blob>((res, rej) => {
            canvas.toBlob((bb) => {
              if (!bb) return rej(new Error('Canvas toBlob failed'));
              res(bb);
            }, type, Math.max(0.1, Math.min(1, q)));
          });
          lastBlob = b;
          const reduction = computeReduction(b.size);
          if (reduction >= min && reduction <= max) {
            URL.revokeObjectURL(imgUrl);
            return { blob: b, originalSize: f.size, compressedSize: b.size };
          }
          if (reduction <= max) {
            if (!bestWithin || reduction > bestWithin.reduction) bestWithin = { blob: b, reduction };
          }
          if (reduction > max) {
            q = Math.min(1, q + 0.12);
          } else {
            q = Math.max(0.1, q - 0.12);
          }
        }
        URL.revokeObjectURL(imgUrl);
        if (bestWithin) {
          return { blob: bestWithin.blob, originalSize: f.size, compressedSize: bestWithin.blob.size };
        }
        const needAltForHighMedium = (quality === 'high' || quality === 'medium') && !bestWithin;
        if (quality === 'low' || needAltForHighMedium) {
          const altType: 'image/jpeg' | 'image/webp' = type === 'image/webp' ? 'image/jpeg' : 'image/webp';
          let qL = 0.1;
          let qH = 1.0;
          let q2 = qTarget;
          let best2: { blob: Blob; reduction: number } | null = null;
          for (let i = 0; i < 6; i++) {
            const b = await new Promise<Blob>((res, rej) => {
              canvas.toBlob((bb) => {
                if (!bb) return rej(new Error('Canvas toBlob failed'));
                res(bb);
              }, altType, Math.max(0.1, Math.min(1, q2)));
            });
            const r = computeReduction(b.size);
            if (r >= min && r <= max) {
              return { blob: b, originalSize: f.size, compressedSize: b.size };
            }
            if (r <= max) { if (!best2 || r > best2.reduction) best2 = { blob: b, reduction: r }; }
            if (r > max) { qL = q2; } else { qH = q2; }
            const nq = (qL + qH) / 2;
            if (Math.abs(nq - q2) < 0.02) {
              q2 = nq;
              const b2 = await new Promise<Blob>((res, rej) => {
                canvas.toBlob((bb) => {
                  if (!bb) return rej(new Error('Canvas toBlob failed'));
                  res(bb);
                }, altType, Math.max(0.1, Math.min(1, q2)));
              });
              const r2 = computeReduction(b2.size);
              if (r2 >= min && r2 <= max) {
                return { blob: b2, originalSize: f.size, compressedSize: b2.size };
              }
              if (r2 <= max) { if (!best2 || r2 > best2.reduction) best2 = { blob: b2, reduction: r2 }; }
              break;
            }
            q2 = nq;
          }
          if (best2) {
            return { blob: best2.blob, originalSize: f.size, compressedSize: best2.blob.size };
          }
        }
        const maxQBlob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((bb) => {
            if (!bb) return rej(new Error('Canvas toBlob failed'));
            res(bb);
          }, type, 1.0);
        });
        const maxReduction = computeReduction(maxQBlob.size);
        if (maxReduction > max) {
          const pngBlob = await new Promise<Blob>((res, rej) => {
            canvas.toBlob((bb) => {
              if (!bb) return rej(new Error('Canvas toBlob failed'));
              res(bb);
            }, 'image/png');
          });
          return { blob: pngBlob, originalSize: f.size, compressedSize: pngBlob.size };
        }
        if ((f.size - maxQBlob.size) / f.size <= 0) {
          return { blob: f, originalSize: f.size, compressedSize: f.size };
        }
        return { blob: maxQBlob, originalSize: f.size, compressedSize: maxQBlob.size };
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
        if (reduction >= min && reduction <= max) {
          resolve({ blob: e.data.blob, originalSize, compressedSize });
          return;
        }
        try {
          const fallback = await reencodeOnMainThread(file, options.format, options.quality, q, min, max);
          resolve(fallback);
        } catch (fallbackErr) {
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
  const keepMap = {
    high: 0.80,
    medium: 0.50,
    low: 0.35,
  };
  return Math.round(originalSize * keepMap[quality]);
};
