import { ensurePdfWorker } from './pdfWorkerInit';

/**
 * Compress PDF by rendering pages as images and re-assembling.
 * Quality levels control the JPEG quality and render scale.
 */
export const compressPDF = async (
  file: File,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<Blob> => {
  // Scale determines render resolution, JPEG quality controls compression
  const SCALE_MAP: Record<'low' | 'medium' | 'high', number> = {
    low: 0.75,   // Lower resolution = smaller file
    medium: 1.0,
    high: 1.3,
  };
  const JPEG_Q_MAP: Record<'low' | 'medium' | 'high', number> = {
    low: 0.20,   // More aggressive JPEG compression
    medium: 0.40,
    high: 0.60,
  };

  try {
    const pdfjsLib = await import('pdfjs-dist');
    await ensurePdfWorker(pdfjsLib as { GlobalWorkerOptions: { workerPort: Worker } });
    const { jsPDF } = await import('jspdf');

    const arrayBuffer = await file.arrayBuffer();
    type PdfPage = {
      getViewport: (opts: { scale: number }) => { width: number; height: number };
      render: (params: {
        canvasContext: CanvasRenderingContext2D;
        viewport: { width: number; height: number };
      }) => { promise: Promise<void> };
    };
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }) as unknown as {
      promise: Promise<{
        numPages: number;
        getPage: (i: number) => Promise<PdfPage>;
      }>;
    };
    const pdf = await loadingTask.promise;

    let doc: InstanceType<typeof jsPDF> | null = null;
    const scale = SCALE_MAP[quality];
    const jpegQ = JPEG_Q_MAP[quality];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', jpegQ);

      // Calculate page size in points (72 DPI)
      const pageW = (viewport.width / scale) * 0.75; // px to pt at 96dpi
      const pageH = (viewport.height / scale) * 0.75;

      if (!doc) {
        doc = new jsPDF({
          orientation: pageW >= pageH ? 'l' : 'p',
          unit: 'pt',
          format: [pageW, pageH],
        });
      } else {
        doc.addPage([pageW, pageH], pageW >= pageH ? 'l' : 'p');
      }
      doc.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH);
    }

    if (!doc) throw new Error('Failed to load PDF');
    const result = doc.output('blob');

    // Only return compressed version if it's actually smaller
    if (result.size >= file.size) {
      // Try again with more aggressive settings
      if (quality !== 'low') {
        return compressPDF(file, 'low');
      }
      // Can't compress further
      return new Blob([arrayBuffer], { type: 'application/pdf' });
    }

    return result;
  } catch (e) {
    console.error('PDF compression error:', e);
    // Return the original file unmodified
    try {
      const ab = await file.arrayBuffer();
      return new Blob([ab], { type: 'application/pdf' });
    } catch {
      // file.arrayBuffer() itself failed — return the file as-is
      return file;
    }
  }
};
