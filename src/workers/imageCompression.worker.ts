// Web Worker for image compression
interface CompressionMessage {
  file: File;
  quality: 'low' | 'medium' | 'high';
  format: 'auto' | 'jpeg' | 'webp' | 'png';
}

self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { file, quality, format } = e.data;

  try {
    // Quality settings - mapped to achieve target compression ratios
    // High: ~30% smaller (0.85 quality)
    // Medium: ~50% smaller (0.70 quality)
    // Low: ~70% smaller (0.50 quality)
    const qualityMap = {
      low: 0.50,
      medium: 0.70,
      high: 0.85,
    };

    const compressionQuality = qualityMap[quality];

    // Read file
    const bitmap = await createImageBitmap(file);
    
    // Calculate dimensions (max 1920px)
    let width = bitmap.width;
    let height = bitmap.height;
    const maxDimension = 1920;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Create canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Determine output format
    let outputFormat = 'image/jpeg';
    if (format === 'webp') {
      outputFormat = 'image/webp';
    } else if (format === 'png') {
      outputFormat = 'image/png';
    } else if (format === 'auto') {
      // Auto: use WebP if original is PNG, otherwise JPEG
      outputFormat = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    }

    // Convert to blob
    const blob = await canvas.convertToBlob({
      type: outputFormat,
      quality: compressionQuality,
    });

    // Send back result
    self.postMessage({
      success: true,
      blob,
      originalSize: file.size,
      compressedSize: blob.size,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Compression failed',
    });
  }
};
