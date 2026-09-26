/**
 * Unified toolbox category for the integrated UNBdev.board.
 *
 * Feature implementations retain their established TypeScript namespaces;
 * blockNamespace metadata routes their blocks here for one student-facing
 * toolbox entry.
 *
 * `subcategories` \u2014 not `groups` \u2014 is what makes this entry expand into
 * per-feature rows. The toolbox builds nested rows only from `subcategories`
 * (webapp/src/toolboxeditor.tsx), and binds a block to a row when the block's
 * `subcategory` attribute matches the row name (webapp/src/blocks.tsx,
 * `filterBlocks`). `groups` renders flat section headers inside a flyout, so
 * the two are not interchangeable.
 *
 * No `more` row: public blocks are deliberately assigned only to their
 * feature subcategory. Marking a public block as `advanced=true` also makes
 * MakeCode consider it for its generic "more" grouping. That would make the
 * feature layout less predictable, so advanced transport helpers stay hidden
 * and student blocks stay in their named rows.
 *
 * All rows share one icon. Subcategory rows render a fixed icon in the pinned
 * framework (webapp/src/toolbox.tsx, `iconContent` for a `subns` row), so
 * per-row icons are not available without changing the framework.
 */
//% color=#9E4894 icon="\uf2db" block="UNBdev.board"
//% weight=98 subcategories='["Microphone", "BLiXel", "Wi-Fi", "Motors"]'
namespace UNBDev {
    // Keep namespace metadata available without exposing an extra block.
    //% blockHidden=true
    export function categoryMarker(): void { }
}
