import { jsPDF } from "jspdf";

type PdfJs = typeof import('pdfjs-dist');

export const compressPDF = async (file: File, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Blob> => {
  const SCALE_MAP: Record<'low' | 'medium' | 'high', number> = { low: 1.2, medium: 1.5, high: 2.0 };
  const JPEG_Q_MAP: Record<'low' | 'medium' | 'high', number> = { low: 0.6, medium: 0.75, high: 0.85 };

  try {
    const pdfjsLib = (await import('pdfjs-dist')) as unknown as PdfJs;
    if (!pdfjsLib.GlobalWorkerOptions.workerPort) {
      const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
      pdfjsLib.GlobalWorkerOptions.workerPort = worker;
    }

    const arrayBuffer = await file.arrayBuffer();
    type PdfPage = {
      getViewport: (opts: { scale: number }) => { width: number; height: number };
      render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
    };
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }) as unknown as { promise: Promise<{ numPages: number; getPage: (i: number) => Promise<PdfPage> }>; };
    const pdf = await loadingTask.promise;

    let doc: jsPDF | null = null;
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
      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', jpegQ);
      if (!doc) {
        doc = new jsPDF({ orientation: viewport.width >= viewport.height ? 'l' : 'p', unit: 'px', format: [canvas.width, canvas.height] });
      } else {
        doc.addPage([canvas.width, canvas.height], viewport.width >= viewport.height ? 'l' : 'p');
      }
      doc.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
    }

    if (!doc) throw new Error('Failed to load PDF');
    return doc.output('blob');
  } catch (e) {
    const ab = await file.arrayBuffer();
    return new Blob([ab], { type: 'application/pdf' });
  }
};
