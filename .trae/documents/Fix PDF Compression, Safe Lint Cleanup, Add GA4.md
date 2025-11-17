## Findings
- ESLint warnings/errors do not affect runtime. They are development-only and can be fixed without changing behavior.
- PDFs are not compressing because `compressPDF` currently copies pages without re-encoding embedded content; this rarely reduces size.
- Image compression, convert, and resize flows must remain untouched.

## PDF Compression (Implement real in-browser compression)
- Approach: Rasterize each PDF page with `pdfjs-dist`, then rebuild a PDF with `jspdf` using JPEG images at tuned quality.
- Quality mapping:
  - high → scale ~2.0, JPEG quality ~0.85
  - medium → scale ~1.5, JPEG quality ~0.75
  - low → scale ~1.2, JPEG quality ~0.6
- Steps:
  1. Load PDF with `pdfjs-dist` (ensure worker set via existing helper).
  2. For each page: render to canvas at selected scale; extract blob/dataURL.
  3. Create `jsPDF` per page size; `addImage` each page as `JPEG` with chosen quality.
  4. Export resulting PDF blob.
- Behavior notes: This strongly reduces size for scanned/image-heavy PDFs; vector/text becomes rasterized (no text selection). For encrypted/unrenderable PDFs, fall back to original and show a user message.
- Scope-limited change: Only update `src/utils/pdfCompression.ts`; no changes to image compression logic or UI.

## Safe Lint Fixes (type-only, no logic changes)
- UI components:
  - `src/components/FormatSelector.tsx`: replace `val as any` with union type cast using a type guard.
  - `src/components/QualitySelector.tsx`: replace `val as any` with union type cast using a type guard.
- Convert page:
  - `src/pages/Convert.tsx:165`: cast `to` to `'png' | 'jpg'` instead of `any`.
- Document utilities:
  - `src/utils/documentConversion.ts`: type `paragraphs` as `docx.Paragraph[]`; narrow `items` using explicit shapes; check `ctx` as `CanvasRenderingContext2D | null` and guard instead of `as any`; replace global window `any` with a minimal typed augmentation.
- Audio utilities:
  - `src/utils/audioConversion.ts`: use a typed fallback for `webkitAudioContext`; isolate `lamejs` `Mp3Encoder` to a single narrow cast variable.
- Worker/compression utils:
  - `src/utils/compressionWorker.ts`: remove unnecessary `any` cast on output type; prefer `const` where suggested.
- Tailwind config:
  - `tailwind.config.ts`: replace `require("tailwindcss-animate")` with ESM import to satisfy lint rule.
- Empty catches:
  - `src/utils/videoConversion.ts`: replace empty catch blocks with minimal comments/log lines, without altering flow.

## Google Analytics (GA4)
- Add GA4 snippet to `index.html` head so it loads on all routes.
- Use Measurement ID `G-59WXT012RW`:
  - `<script async src="https://www.googletagmanager.com/gtag/js?id=G-59WXT012RW"></script>`
  - Initialize `dataLayer`, call `gtag('js', new Date())` and `gtag('config', 'G-59WXT012RW')`.
- Stream ID `13004569779` is not required for the gtag snippet; measurement ID is sufficient for tracking.

## Verification
- Manual checks:
  - Compress a few sample PDFs (image-heavy and text PDFs); confirm noticeable size reductions and expected rasterization behavior.
  - Confirm image compression still behaves identically.
  - Confirm Convert and Resize pages function unchanged.
- Dev checks:
  - Run lint to confirm targeted issues resolved; no logic diff.
  - Load site and verify GA tag loads without console errors.

## Constraints
- Do not modify image compression pipeline or UI flows.
- Only touch files listed above.
- Keep behavior identical except for enabling effective PDF compression and adding GA.

Confirm to proceed, and I will implement these changes and validate end-to-end.