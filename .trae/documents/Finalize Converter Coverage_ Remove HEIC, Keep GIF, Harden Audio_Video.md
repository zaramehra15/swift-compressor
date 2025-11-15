## Decision on HEIC
- Browser-native HEIC decoding is not broadly supported; reliable in-browser conversion requires large WASM libraries (libheif) and adds heavy payload and memory use.
- To keep the app lightweight and robust, remove HEIC entirely from image converter options (both From and To).
- Provide a clear toast on attempted HEIC uploads explaining unsupported format.

## Keep GIF Option (Single-Frame)
- Add GIF as a target in image converter (single-frame only). Animated GIF output requires heavy libraries; we will support static image → single-frame GIF.
- Use a lightweight library via dynamic import (e.g., `gifenc`) to encode a single-frame GIF.
- Maintain current PNG/JPG/WEBP conversions; do not change compression logic.

## Image Converter Updates
- UI: Remove HEIC from the Image category lists; show GIF in “To” options.
- Logic: Implement `convertImageToGif(file)` using canvas pixels → `gifenc` encoder for one frame.
- Validation: Keep strict type checks for “From” format; toast on mismatches.

## Audio Converter Scope
- Keep most-used conversions: inputs MP3/WAV/M4A/OGG → outputs MP3/WAV.
- Retain per-file error handling; show clear decoding error messages.
- Do not list outputs other than MP3/WAV.

## Video Converter Scope
- Keep most-used: inputs MP4/MOV/AVI/WEBM → outputs MP4/WEBM.
- Preserve codec fallback chain for MP4 and automatic WEBM fallback on failure.
- Do not list any other outputs.

## Files to Update (Converters Only)
- `src/components/ConversionSelector.tsx`: remove HEIC from lists; add GIF to image To options.
- `src/pages/Convert.tsx`:
  - Image: add GIF path and HEIC unsupported toast; keep white background fill when converting to JPEG.
  - Audio: keep per-file try/catch messaging.
  - Video: no change to UI; codec fallbacks already added.
- Add dynamic import for `gifenc` in image conversion (single-frame).

## Verification
- Images: PNG with transparency → JPEG/WebP/GIF; JPEG shows white background; GIF produced as single-frame.
- HEIC upload: shows unsupported toast; no option present in lists.
- Documents: conversions remain working; PPTX→PDF shows unsupported toast.
- Audio: MP3/WAV/M4A/OGG inputs convert to MP3/WAV; failures show per-file toasts.
- Video: MP4/MOV/AVI/WEBM inputs convert to MP4/WEBM; MP4 failure falls back to WEBM.

## Constraints
- Do not touch compression logic.
- Keep bundle impact minimal via dynamic imports; only add `gifenc` for GIF encoding.