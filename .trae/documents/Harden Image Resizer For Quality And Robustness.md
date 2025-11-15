## Findings
- Output format is chosen by input type (`png` → PNG, others → JPEG): Resize.tsx:89–101.
- Transparent sources resized to JPEG can show black background because JPEG has no alpha and canvas defaults to transparent (encoded as black).
- Width/height inputs accept any number; NaN/0/negative values can break canvas (Resize.tsx:255–268, 281–287).
- Large dimensions can cause high memory usage; no clamping or warning.
- Image smoothing quality not set; default may cause jagged edges on downscale.
- SEO mentions “crop” but there’s no cropping tool; we’ll leave feature scope as resize only unless you want cropping.

## Fixes (No scope change)
1. Fill background when outputting JPEG
- Before `drawImage`, if output mimetype is `image/jpeg`, `fillRect` with white to avoid black for transparent images.
- Reference: Resize.tsx:83–99.

2. Validate and clamp width/height
- On change: coerce to integer, clamp to ≥1 and ≤ max (e.g., 8000).
- Before resize: if width/height invalid, show toast and abort.
- References: Resize.tsx:55–69, 255–268, 281–287.

3. Improve scaling quality
- Set `ctx.imageSmoothingEnabled = true` and `ctx.imageSmoothingQuality = 'high'` before `drawImage` for better downscale quality.
- Reference: Resize.tsx:83–89.

4. Minor UX
- Add a small note under settings warning if dimensions exceed a threshold (e.g., >5000px) about memory.
- Keep format rule (PNG stays PNG; others → JPEG) to avoid expanding scope.

## Verification
- Transparent PNG/WebP resized → JPEG shows white background instead of black.
- Invalid inputs (NaN/0/negative) are clamped or rejected with a toast.
- Large dimensions show a warning; resize still works if within limits.
- Downscaled images look smoother compared to before.

## Out of Scope (Optional Later)
- Cropping UI and output format selection for resizer; can be added if requested.