## Diagnosis
- Low preset targets 80–85% reduction. On some inputs (e.g., PNG→WebP), even q→0.1 may only reach ~40–50%.
- Current loop returns the best candidate under the max window, so Low can match Medium (~42%) when the format cannot reach 80%.

## Fix Strategy
- If Low cannot reach its window with the selected output format, automatically try the alternate lossy format (JPEG↔WebP) and run the same quality search.
- Pick the closest candidate ≤ max; if still below min in both formats, retain the better of the two. Keep overshoot clamp.

## Implementation Steps
1. Worker alternate-format fallback for Low
- After the first loop, if no candidate meets 80–85% and bestWithin.reduction < 0.80, run a second loop using the alternate output type: if current is WebP → retry with JPEG; if current is JPEG → retry with WebP.
- Select the better candidate within ≤ max. If both fail to reach min, take the higher reduction ≤ max.
- Preserve overshoot clamp using PNG lossless when even q=1.0 exceeds max.
- File: `src/workers/imageCompression.worker.ts` in the post-loop section.

2. Main-thread fallback alignment
- Mirror the same alternate-format fallback for Low with the same selection logic.
- File: `src/utils/compressionWorker.ts` in `reencodeOnMainThread` after the quality search.

## Validation
- Build and preview; test PNG with `auto`:
  - High ≈ 20–22%, Medium ≈ 45–50%, Low ≈ 80–85%.
- Test JPG:
  - Low now shows stronger reduction versus Medium.

## Outcome
- Low preset achieves the intended ~80–85% when possible; if one format can’t reach it, the tool automatically tries the other format to get closer without exceeding the cap.