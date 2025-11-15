## Diagnosis
- JPG/JPEG at High can grow in size because re-encoding a well‑compressed JPEG at `q≈1.0` often increases bytes.
- Current percent‑targeting loop reduces when possible, but does not explicitly block “size increase” in explicit output modes.
- PNG pipeline is correct; we must leave it untouched.

## Fix Strategy
- Add a strict “never increase size” rule: if all attempts produce a blob larger than the original, return the original file unchanged (0%).
- Add alternate‑format fallback for High and Medium (not only Low): when the chosen format cannot reach the target window or attempts increase size, try the alternate lossy format (JPEG↔WebP) with the same percent‑targeting loop and pick the best candidate within the target cap.
- Preserve PNG behavior exactly as now; do not alter explicit PNG path.

## Implementation Steps
1. Worker: size‑increase guard and format fallback (JPG/JPEG/WebP only)
- During/after the percent‑targeting loop, track whether any candidate reduces size.
- If none reduce size for selected format and quality, attempt the alternate format:
  - JPEG → try WebP; WebP → try JPEG.
  - Choose the best candidate within `[min,max]`, otherwise take the highest reduction ≤ `max`.
- If still no reduction at all, return the original file (0%).
- Do NOT change PNG branch.
- File: `src/workers/imageCompression.worker.ts` (inside the search and post‑loop selection, near 106–166 and 149–192).

2. Main‑thread fallback: mirror the same rules
- Apply size‑increase guard and alternate format fallback for High/Medium.
- Keep auto mapping (PNG→WebP, others→JPEG) unchanged.
- PNG explicit output remains quality‑ignored and unchanged.
- File: `src/utils/compressionWorker.ts` (`reencodeOnMainThread` quality search and fallback, near 130–208).

3. Constraints & Safety
- PNG path is untouched.
- Always cap overshoot (if `q=1.0` exceeds max window) with lossless output as implemented.
- Always enforce “never increase size”: return original if no candidate reduces size.

## Validation
- Build & preview.
- Test cases:
  - PNG: High ≈ 20%, Medium ≈ 45–50%, Low ≈ 80–85% (unchanged).
  - JPG 154KB: High/Medium/Low produce distinct reductions; High never increases size. If JPEG can’t reduce, fallback to WebP reduces within/under caps.
  - WebP input: High/Medium/Low distinct; if WebP fails, fallback to JPEG seeks target window but never increases size.

## Outcome
- JPG/JPEG/WebP adhere to High/Medium/Low targets as closely as possible, never get larger than the original, and PNG behavior stays exactly as is.