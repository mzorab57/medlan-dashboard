# Debug Session: variant-image-compress
- **Status**: [OPEN]
- **Issue**: Local variant image upload with a 3.5MB source file did not convert/compress down toward the 500KB target.
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-variant-image-compress.ndjson

## Reproduction Steps
1. Open the local dashboard product variants modal.
2. Upload a variant image around 3.5MB.
3. Watch the saved file name/size after upload completes.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | The local PHP runtime does not have `Imagick` or `GD webp`, so processing falls back to the original file. | High | Low | Pending |
| B | The upload flow enters `FileUpload::save`, but `shouldProcessImage()` returns `false`, so no compression attempt happens. | Medium | Low | Pending |
| C | Processing is attempted, but it fails before saving optimized output and fallback stores the original file. | High | Low | Pending |
| D | Processing succeeds, but the runtime encoder cannot get the image down to the 500KB target with current limits. | Medium | Medium | Pending |
| E | The request path or active backend copy differs from the file we instrumented. | Medium | Medium | Pending |

## Log Evidence
- XAMPP PHP modules:
  - `gd` is enabled.
  - `imagewebp=no`
  - `imagecreatefromwebp=no`
  - `imagick=no`
- This means local PHP cannot encode `.webp`, so any non-webp or >1MB file falls back to the original upload.

## Verification Conclusion
Current strongest evidence confirms **Hypothesis A**.
