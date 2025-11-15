## Scope
- Only converters: Images, Documents, Audio, Video. Do not change compression.
- Goal: Verify behavior, fix mismatches, ensure predictable success paths and resilient fallbacks.

## Findings
- Images: UI lists GIF/HEIC, but `convertImage` only re-encodes to JPG/PNG/WebP and cannot generate GIF or decode HEIC. No type validation for images; transparency flattened to black when converting to JPEG.
- Documents: Implementations generally OK; PPTX→PDF intentionally unsupported with toast. PDF→DOCX is text-only; acceptable for MVP. PDF→images ZIP is heavy but functional.
- Audio: Decoding and MP3/WAV encode work, 50MB limit enforced. Messaging could be clearer on decode failures.
- Video: ffmpeg.wasm pipeline may fail for MP4 if `libx264`/`aac` not present; needs robust codec fallbacks and graceful fallback to `webm`.

## Changes (Converters Only)
### Images
1. Restrict “To” formats to JPG/PNG/WebP; remove GIF/HEIC as targets.
2. Validate image input type against “From” selection; show toast and skip on mismatch.
3. When converting to JPEG from a source with transparency, fill canvas with white before draw to avoid black backgrounds.
4. Keep quality at 0.9; do not alter compression logic.

### Documents
1. Keep current conversions; improve error messages only where thrown.
2. Ensure pdf.js worker init remains stable; no functional changes.

### Audio
1. Keep 50MB size limit; add clearer error toast when decode fails.
2. No codec/bitrate changes; ensure conversion status messaging is consistent.

### Video
1. Strengthen MP4 pipeline with a resilient codec chain:
   - Try `libx264 + aac` → fallback `mpeg4 + aac` → fallback `mpeg4 + libmp3lame` → fallback `copy` audio if possible.
2. If MP4 fails across the chain, auto-fallback to WebM (`libvpx + libvorbis`) and notify the user.
3. No changes to size limits; keep 200MB.

## Verification
- Images: Convert PNG with alpha → JPEG/WebP and check background; convert GIF/HEIC selections blocked with toast; mismatches properly handled.
- Documents: DOCX→PDF, PDF→DOCX, XLSX→PDF, PDF→PNG/JPG, CSV↔XLSX succeed; PPTX→PDF shows toast.
- Audio: MP3/WAV/M4A/OGG→MP3/WAV succeed; decode failures show clear messages.
- Video: MP4/MOV/AVI/WEBM→MP4/WEBM succeed; if MP4 codecs missing, auto-fallback to WebM.

## Deliverables
- Converter UI and logic fixes (images validation, target restrictions, JPEG background fill).
- Enhanced video codec fallback logic.
- Improved error messaging for audio/document where applicable.
- No changes to compression code.