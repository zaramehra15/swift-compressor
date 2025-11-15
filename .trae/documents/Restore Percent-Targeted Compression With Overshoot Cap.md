## Why 95% Happened
- You used High quality with `Output Format: Auto` on a PNG.
- Auto converted PNG → JPEG; even at `q=0.92`, JPEG can be ~90–95% smaller than PNG.
- Because we switched to preset-based quality, it didn’t steer the result back toward ~20%.

## Fix Overview
- Reinstate percent-targeting for JPEG/WebP so High/Medium/Low land in 20/50/80% windows.
- Change Auto format for PNG to prefer WebP (not JPEG) to avoid extreme reductions vs PNG.
- Add an overshoot cap: if even `q=1.0` reduces more than the max target, fall back to PNG (or WebP lossless) to avoid exceeding the preset’s maximum.
- Keep the small-file threshold at 50KB to avoid degrading tiny files.

## Implementation Steps
1. Worker percent-targeting (JPEG/WebP)
- Replace preset-only encode with an iterative search for quality that yields reduction within target window.
- Targets: High 20–22%, Medium 45–50%, Low 80–85%.
- If reduction > max at `q=1.0`, clamp by re-encoding as PNG or WebP lossless to not exceed max.
- Always choose Auto: PNG → WebP; JPG → JPEG.
- File: `src/workers/imageCompression.worker.ts` (restore search loop and clamp logic; set auto WebP for PNG).

2. Main-thread fallback alignment
- Mirror the same percent-targeting + clamp.
- Use identical auto-format rules.
- File: `src/utils/compressionWorker.ts` (restore loop, remove preset-only path, keep 50KB threshold).

3. UI feedback
- Keep current labels but ensure actual outcomes match ranges.
- Optionally add a note: “PNG quality ignored when format is PNG; choose Auto/WebP/JPEG for better control.”
- Files: `src/components/QualitySelector.tsx` (only if you want wording tweaks; no functional dependency).

## Validation
- Build and run preview.
- Test cases:
  - PNG with transparency, Auto: High ≈ 20%, Medium ≈ 50%, Low ≈ 80% smaller.
  - PNG without transparency, Auto: High/Medium/Low land within ranges; no 90%+ at High.
  - JPG ~150KB: percentages differ per preset; no 0% and no 90% at High.
- Confirm `EnhancedFileItem` shows ratios within windows and that switching presets recalculates.

## Outcome
- Presets produce consistent, distinct results that respect the intended ~20/50/80% targets.
- Oversized reductions are capped, eliminating “High → 95% smaller” surprises.
- Auto format avoids PNG→JPEG extreme jumps by preferring WebP for PNG input.