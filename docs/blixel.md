# UNBdev.board BLiXel behavior

UNBdev.board has five integrated RGB BLiXels, numbered 1 through 5 from left
to right. The public MakeCode APIs are in the `UNBdevBLiXel` namespace and use
the hidden `UNBdevBoard` transport from issue #40.

| Operation | Controller function | Behavior |
| --- | ---: | --- |
| show | `0x03` | Apply pending strip data |
| clear | `0x05` | Clear the integrated strip |
| write buffer | `0x07` | Write all five RGB triplets |
| set all | `0x0a` | Set every BLiXel to one colour |
| set pixel | `0x0b` | Set one zero-based pixel |
| brightness | `0x0d` | Set brightness from 0 through 255 |

All public display operations call `show` internally. `shift` moves colours to
the right and clears newly exposed positions. `rotate` moves colours to the
right and wraps them around; negative offsets rotate left.

The bar graph uses the most recently selected all-strip colour, defaults to
purple, clamps the value to its range, and rounds to the nearest one of five
steps. A zero-width range produces an empty graph below the boundary and a
full graph at or above it, avoiding division by zero.

## Compatibility and verification

Command identifiers, payload layouts, named colours, HSL conversion, and the
five-pixel buffer model come from the Brilliant Labs browser-deployed
`core/bBoardBlixel.ts`. UNBdev.board changes names and block labels, adds shift
and rotate behavior where the source had commented placeholders, and defines
the zero-width graph rule above.

Automated tests cover compilation, RGB/HSL conversion, and graph boundaries.
Physical verification is still required on controller firmware 2.17 for set
all, individual pixel selection, clear, brightness, buffer ordering, shift,
rotate, and representative bar-graph values.
