## Resizer Status

* Resizer is set: clamps invalid dimensions, uses high-quality scaling, fills white for JPEG outputs, warns on very large sizes. No further changes required.

## Support Cards

* Replicate the existing “Love Compress? → Buy Me a Coffee” card style to other pages.

* Home: insert a support card labeled “Love Finvestech Tools?” near the same area as compress (toward the bottom content section).

* Convert: add a card labeled “Love Convert?” after the conversion UI and info note.

* Resize: add a card labeled “Love Resize?” after settings/results section.

* Use the same button linking to `https://buymeacoffee.com/finvestech`.

* No new components; reuse the markup inline to avoid creating files.

## Ad Gap Placeholders (no explicit ad text)

* Home: add a vertical gap immediately below the three tool icons grid.

* Convert: add a subtle vertical gap below the conversion results section.

* Resize: add a subtle vertical gap below the “Resize & Download” results area.

* Do not modify Compress page; leave as-is.

* Implementation: simple empty containers like `<div className="h-24" />` inside the relevant sections; no “Advertisement” text.

## Files To Update

* `src/pages/Home.tsx`: insert support card and a gap after tool icons.

* `src/pages/Convert.tsx`: insert support card and a gap below results.

* `src/pages/Resize.tsx`: insert support card and a gap below action/results.

## Verification

* Build/preview and visually confirm:

  * Cards render with proper titles and button.

  * Gaps appear in the intended places without labels.

  * No changes to compression behavior or layout.

## Constraints

* No new files; minimal edits to existing pages.

* Keep styles consistent with the Compress page card.

