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

    worker.onmessage = (e) => {
      worker.terminate();
      
      if (e.data.success) {
        resolve({
          blob: e.data.blob,
          originalSize: e.data.originalSize,
          compressedSize: e.data.compressedSize,
        });
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
