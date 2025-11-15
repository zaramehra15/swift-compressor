import { PDFDocument } from "pdf-lib";

export const compressPDF = async (file: File, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = file.size;
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const newPdfDoc = await PDFDocument.create();
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pdfDoc.getPages().indexOf(page)]);
      newPdfDoc.addPage(copiedPage);
    }

    const TARGETS: Record<'low' | 'medium' | 'high', { min: number; max: number }> = {
      low: { min: 0.80, max: 0.85 },
      medium: { min: 0.45, max: 0.50 },
      high: { min: 0.20, max: 0.22 },
    };

    const { min, max } = TARGETS[quality];

    const saveWith = async (opts: { useObjectStreams: boolean; addDefaultPage: boolean }) => {
      const bytes = await newPdfDoc.save(opts);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const reduction = (originalSize - blob.size) / originalSize;
      return { blob, reduction };
    };

    const variants = [
      await saveWith({ useObjectStreams: true, addDefaultPage: false }),
      await saveWith({ useObjectStreams: false, addDefaultPage: false }),
    ];

    const inRange = variants.find(v => v.reduction >= min && v.reduction <= max);
    if (inRange) return inRange.blob;

    const belowMax = variants
      .filter(v => v.reduction <= max)
      .sort((a, b) => b.reduction - a.reduction)[0];
    if (belowMax) return belowMax.blob;

    const originalBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    return originalBlob;
  } catch (error) {
    throw new Error("Failed to compress PDF. The file may be corrupted or encrypted.");
  }
};
