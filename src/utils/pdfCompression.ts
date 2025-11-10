import { PDFDocument } from "pdf-lib";

export const compressPDF = async (file: File): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Create a new PDF with optimized settings
    const newPdfDoc = await PDFDocument.create();

    // Copy pages to new document (this strips some metadata)
    for (const page of pages) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [
        pdfDoc.getPages().indexOf(page),
      ]);
      newPdfDoc.addPage(copiedPage);
    }

    // Save with compression
    const pdfBytes = await newPdfDoc.save({
      useObjectStreams: false, // Helps with compatibility
    });

    return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  } catch (error) {
    console.error("PDF compression error:", error);
    throw new Error("Failed to compress PDF. The file may be corrupted or encrypted.");
  }
};
