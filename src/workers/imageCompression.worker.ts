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
    // High: ~20-30% smaller (0.92 quality, minimal dimension reduction)
    // Medium: ~45-55% smaller (0.75 quality, moderate dimension reduction)
    // Low: ~65-75% smaller (0.50 quality, aggressive dimension reduction)
    const qualityMap = {
      low: 0.50,
      medium: 0.75,
      high: 0.92,
    };

    // Dimension limits based on quality (to prevent over-compression)
    const maxDimensionMap = {
      low: 1920,      // Allow more dimension reduction for low quality
      medium: 2560,   // Moderate dimension reduction for medium
      high: 3840,     // Minimal dimension reduction for high quality (4K)
    };

    const compressionQuality = qualityMap[quality];
    const maxDimension = maxDimensionMap[quality];

    // Read file
    const bitmap = await createImageBitmap(file);
    
    // Calculate dimensions - only reduce if exceeds the quality-based limit
    let width = bitmap.width;
    let height = bitmap.height;

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
