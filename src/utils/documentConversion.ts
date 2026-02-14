import html2canvas from 'html2canvas';
import { ensurePdfWorker } from './pdfWorkerInit';

// Make html2canvas available for jsPDF.html()
(window as Window & { html2canvas?: typeof html2canvas }).html2canvas = html2canvas;

/**
 * Sanitize HTML to prevent XSS from user-uploaded documents.
 * Uses a browser-native allowlist approach — no external dependency needed.
 */
const SAFE_TAGS = new Set([
  'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody',
  'tr', 'td', 'th', 'span', 'div', 'a', 'blockquote', 'pre', 'code',
  'sup', 'sub', 'dl', 'dt', 'dd', 'caption', 'colgroup', 'col',
]);
const SAFE_ATTRS = new Set(['href', 'style', 'class', 'colspan', 'rowspan']);

const sanitizeHTML = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        if (!SAFE_TAGS.has(el.tagName.toLowerCase())) {
          const text = document.createTextNode(el.textContent || '');
          node.replaceChild(text, child);
        } else {
          for (const attr of Array.from(el.attributes)) {
            if (!SAFE_ATTRS.has(attr.name.toLowerCase())) {
              el.removeAttribute(attr.name);
            }
          }
          if (el.hasAttribute('href')) {
            const href = (el.getAttribute('href') || '').trim().toLowerCase();
            if (href.startsWith('javascript:') || href.startsWith('data:')) {
              el.removeAttribute('href');
            }
          }
          walk(el);
        }
      }
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
};

/**
 * DOCX → PDF
 * Uses mammoth to extract HTML, then jsPDF to render it
 */
export const convertDocxToPdf = async (file: File): Promise<Blob> => {
  const mammoth = await import('mammoth');
  const { jsPDF } = await import('jspdf');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.background = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '12pt';
  container.style.lineHeight = '1.5';
  container.style.color = '#000000';
  container.innerHTML = await sanitizeHTML(result.value);
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    await new Promise<void>((resolve) => {
      pdf.html(container, {
        html2canvas: { scale: 2, useCORS: true, logging: false },
        callback: () => resolve(),
        x: 10,
        y: 10,
        windowWidth: 800,
        width: 550,
        autoPaging: 'text',
      });
    });
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * PDF → DOCX
 * Extracts text from each page and creates a Word document
 */
export const convertPdfToDocx = async (file: File): Promise<Blob> => {
  const pdfjsLib = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjsLib as { GlobalWorkerOptions: { workerPort: Worker } });
  const docx = await import('docx');
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const paragraphs: InstanceType<typeof docx.Paragraph>[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const lines: string[] = [];
    let lastY: number | null = null;

    for (const item of textContent.items as Array<unknown>) {
      if (typeof item === 'object' && item) {
        const textItem = item as { str?: string; transform?: number[] };
        const text = typeof textItem.str === 'string' ? textItem.str : '';
        const y = textItem.transform?.[5] ?? 0;

        if (lastY !== null && Math.abs(y - lastY) > 5) {
          lines.push('\n');
        }
        lines.push(text);
        lastY = y;
      }
    }

    const pageText = lines.join('');
    // Split by newlines into paragraphs
    const pageParagraphs = pageText.split('\n').filter(t => t.trim());
    for (const pText of pageParagraphs) {
      paragraphs.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: pText, size: 24 })],
        spacing: { after: 200 },
      }));
    }

    // Page break between pages
    if (i < pdf.numPages) {
      paragraphs.push(new docx.Paragraph({
        children: [],
        pageBreakBefore: true,
      }));
    }
  }

  const d = new docx.Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });
  return await docx.Packer.toBlob(d);
};

/**
 * PDF → Text
 */
export const convertPdfToText = async (file: File): Promise<Blob> => {
  const pdfjsLib = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjsLib as { GlobalWorkerOptions: { workerPort: Worker } });
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items as Array<unknown>)
      .map((t) => {
        if (typeof t === 'object' && t) {
          const maybe = t as { str?: unknown };
          return typeof maybe.str === 'string' ? maybe.str : '';
        }
        return '';
      })
      .join(' ');
    textParts.push(`--- Page ${i} ---\n${pageText}\n`);
  }

  return new Blob([textParts.join('\n')], { type: 'text/plain' });
};

/**
 * PPTX → PDF (basic text extraction)
 */
export const convertPptxToPdf = async (file: File): Promise<Blob> => {
  const JSZip = (await import('jszip')).default;
  const { jsPDF } = await import('jspdf');

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const pdf = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });
  let firstPage = true;

  // Extract text from slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort((a, b) => {
      // Numeric sort: slide2 before slide10
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error('No slides found in PPTX file. The file may be corrupted or empty.');
  }

  for (const slideName of slideFiles) {
    const content = await zip.files[slideName].async('text');
    // Extract text between <a:t> tags
    const textMatches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const texts = textMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

    if (!firstPage) {
      pdf.addPage();
    }
    firstPage = false;

    let y = 40;
    for (const text of texts) {
      if (y > 550) {
        pdf.addPage();
        y = 40;
      }
      pdf.setFontSize(14);
      const lines = pdf.splitTextToSize(text, 750);
      pdf.text(lines, 40, y);
      y += lines.length * 20 + 10;
    }
  }

  return pdf.output('blob');
};

/**
 * XLSX → PDF
 */
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
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '10pt';
  container.innerHTML = await sanitizeHTML(html);

  // Style the table
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
  });
  const cells = container.querySelectorAll('td, th');
  cells.forEach(cell => {
    (cell as HTMLElement).style.border = '1px solid #ddd';
    (cell as HTMLElement).style.padding = '4px 8px';
  });

  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4' });
    await new Promise<void>((resolve) => {
      pdf.html(container, {
        html2canvas: { scale: 1.5, useCORS: true, logging: false },
        callback: () => resolve(),
        x: 10,
        y: 10,
        windowWidth: 1000,
      });
    });
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * PDF → Images (as ZIP)
 */
export const convertPdfToImagesZip = async (
  file: File,
  format: 'png' | 'jpg' = 'png'
): Promise<Blob> => {
  const pdfjsLib = await import('pdfjs-dist');
  await ensurePdfWorker(pdfjsLib as { GlobalWorkerOptions: { workerPort: Worker } });
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'jpg' ? 0.92 : undefined;
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), mime, quality)
    );
    if (!blob) throw new Error(`Failed to render page ${i} as image`);
    zip.file(`page_${i}.${format}`, blob);
    // Free canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }

  return await zip.generateAsync({ type: 'blob' });
};

/**
 * CSV → XLSX
 */
export const convertCsvToXlsx = async (file: File): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const text = await file.text();
  const wb = XLSX.read(text, { type: 'string' });
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

/**
 * XLSX → CSV
 */
export const convertXlsxToCsv = async (file: File): Promise<Blob> => {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: 'text/csv' });
};

/**
 * Text → PDF
 */
export const convertTextToPdf = async (file: File): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const text = await file.text();
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

  pdf.setFont('Courier');
  pdf.setFontSize(10);

  const lines = pdf.splitTextToSize(text, 530);
  const lineHeight = 14;
  const pageHeight = 800;
  let y = 40;

  for (const line of lines) {
    if (y > pageHeight) {
      pdf.addPage();
      y = 40;
    }
    pdf.text(line, 40, y);
    y += lineHeight;
  }

  return pdf.output('blob');
};

/**
 * Word (DOCX) → Text
 */
export const convertDocxToText = async (file: File): Promise<Blob> => {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return new Blob([result.value], { type: 'text/plain' });
};