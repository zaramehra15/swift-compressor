## Diagnosis
- Reduction-window logic tries to “hit” 20/50/80% ranges; browsers’ encoders vary and often converge to similar sizes.
- PNG quality is ignored; when output stays PNG, presets have no effect.
- Auto-format can pick a single output (e.g., WebP) where quality handling may be inconsistent across devices.
- Result: different presets sometimes compress to the same percentage (e.g., ~92%).

## Fix Strategy
- Use deterministic preset→encoder-quality mapping instead of chasing reduction windows.
- Keep smart auto-format: PNG with transparency → WebP, otherwise → JPEG; explicit PNG → PNG (with a user-facing note that quality is ignored).
- Maintain small-file threshold at 50KB to avoid needless degradation, but ensure it doesn’t bypass legitimate JPG cases.

## Implementation Steps
1. Worker: deterministic quality
- Map presets directly to encoder `quality`: `high=0.92`, `medium=0.70`, `low=0.50` (tunable).
- Remove reduction-window search; perform a single `convertToBlob(type, q)` per preset.
- Preserve and use alpha detection to choose `auto` output: WebP for alpha; JPEG otherwise.
- Explicit `png` output returns PNG re-encode and skip quality.
- File refs to update: `src/workers/imageCompression.worker.ts` near lines 20–40 (targets), 63–76 (format selection), 88–140 (search loop → single encode).

2. Main-thread fallback: mirror mapping
- Remove reduction-window validation; if worker fails, re-encode on the main thread with the same preset quality mapping.
- Use identical auto-format + alpha detection logic.
- File refs: `src/utils/compressionWorker.ts` near lines 22–41 (quality map), 92–116 (alpha format), 130–154 (search loop → single encode).

3. UI estimates
- Keep `estimateCompressedSize` but adjust to approximate preset keeps: `high≈80%`, `medium≈50%`, `low≈30–50%` depending on format.
- Optionally annotate FormatSelector to warn: PNG ignores quality; use WebP/JPEG for adjustable compression.
- File refs: `src/components/QualitySelector.tsx` (text), `src/utils/compressionWorker.ts:172–183` (estimate function).

## Verification
- Build and preview; compress these cases and confirm distinct ratios:
- PNG with transparency → WebP: High/Medium/Low show different sizes.
- PNG without transparency → JPEG: High/Medium/Low differ.
- JPG 154KB: compresses (no 0%); presets yield different results.
- Large JPG/PNG: presets still produce visually distinct outcomes.
- Confirm `EnhancedFileItem` shows different percentages and re-compress works when changing preset.

## Notes
- This change prioritizes “respecting user-chosen quality” over “hitting exact reduction windows”. It removes unpredictable behavior across browsers.
- If needed, we can later add an advanced mode to target a percent reduction; the default will remain quality-driven for predictability.