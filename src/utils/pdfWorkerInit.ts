/**
 * Shared PDF.js worker initialization.
 * Both pdfCompression.ts and documentConversion.ts import this
 * to ensure the worker is only created once across the entire app.
 */
let _initialized = false;

export const ensurePdfWorker = async (pdfjsLib: { GlobalWorkerOptions: { workerPort: Worker } }) => {
    if (!_initialized) {
        const worker = new Worker(
            new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url),
            { type: 'module' }
        );
        pdfjsLib.GlobalWorkerOptions.workerPort = worker;
        _initialized = true;
    }
};
