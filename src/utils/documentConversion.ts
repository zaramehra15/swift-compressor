export const convertDocxToPdf = async (file: File): Promise<Blob> => {
  const mammoth = await import('mammoth');
  const { jsPDF } = await import('jspdf');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '900px';
  container.style.padding = '16px';
  container.style.background = '#ffffff';
  container.innerHTML = result.value;
  document.body.appendChild(container);
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  await new Promise<void>((resolve) => {
    pdf.html(container, {
      html2canvas: { scale: 2, useCORS: true },
      callback: () => resolve(),
      x: 0,
      y: 0,
      windowWidth: 900,
    });
  });
  document.body.removeChild(container);
  return pdf.output('blob');
};

export const convertPdfToDocx = async (file: File): Promise<Blob> => {
  const pdfjsLib = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjsLib);
  const docx = await import('docx');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const paragraphs: any[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((t: any) => ('str' in t ? t.str : '')).join(' ');
    paragraphs.push(new docx.Paragraph(text));
  }
  const d = new docx.Document({ sections: [{ properties: {}, children: paragraphs }] });
  const blob = await docx.Packer.toBlob(d);
  return blob;
};

export const convertPptxToPdf = async (_file: File): Promise<Blob> => {
  throw new Error('PPTX to PDF is not supported client-side');
};

export const convertXlsxToPdf = async (file: File): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const { jsPDF } = await import('jspdf');
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const html = XLSX.utils.sheet_to_html(ws);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.padding = '16px';
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  await new Promise<void>((resolve) => {
    pdf.html(container, {
      html2canvas: { scale: 2, useCORS: true },
      callback: () => resolve(),
      x: 0,
      y: 0,
      windowWidth: 1000,
    });
  });
  document.body.removeChild(container);
  return pdf.output('blob');
};

export const convertPdfToImagesZip = async (file: File, format: 'png' | 'jpg' = 'png'): Promise<Blob> => {
  const pdfjsLib = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjsLib);
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx as any, viewport }).promise;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), mime, 0.95));
    zip.file(`page_${i}.${format}`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

export const convertCsvToXlsx = async (file: File): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const text = await file.text();
  const wb = XLSX.read(text, { type: 'string' });
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const convertXlsxToCsv = async (file: File): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: 'text/csv' });
};
import html2canvas from 'html2canvas';
const _w: any = window as any;
_w.html2canvas = html2canvas;
let _pdfWorkerInitialized = false;
const ensurePdfWorker = async (pdfjsLib: any) => {
  if (!_pdfWorkerInitialized) {
    const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), { type: 'module' });
    pdfjsLib.GlobalWorkerOptions.workerPort = worker;
    _pdfWorkerInitialized = true;
  }
};