# UNBdev.board controller protocol

## Status

Issue `UNB-ECE/unb-platform#40` establishes the control and transport layer used
by later UNBdev.board block categories. The hardware and firmware repositories
did not contain a controller specification or firmware image when this baseline
was created. Consequently, this document records the protocol implemented by
the supervisor-approved Brilliant Labs browser source. Physical UNBdev.board
verification remains required before the protocol can be declared stable.

## Physical architecture

UNBdev.board is an integrated device consisting of a micro:bit soldered to a
b.Board-derived baseboard. The micro:bit runs the student MakeCode program. A
separate controller on the baseboard runs UNBdev.board firmware and handles
base-board peripherals and the two mikroBUS-compatible Click sockets.

## Controller transport

The compatibility baseline uses 7-bit I2C address `0x28`. A routed operation is
written as this byte sequence:

| Offset | Field | Meaning |
|---:|---|---|
| 0 | command | `4`, write controller receive-buffer data |
| 1 | route | `board * 3 + port`; ports are built-in `0`, Click A `1`, Click B `2` |
| 2 | module | Peripheral module identifier |
| 3 | function | Operation within the module |
| 4 | pin low | Low byte of the mikroBUS pin mask |
| 5 | pin high | High byte of the mikroBUS pin mask |
| 6… | payload | Optional operation-specific bytes |

Before a transaction, command `0` clears the receive buffer. A command expecting
a response also uses command `1` to clear the transmit buffer. Command `7`
executes the staged operation. Command `2` selects the response data before the
micro:bit reads it. Command `6` selects the four-byte event-port mask.

## Module identifiers

| Module | ID |
|---|---:|
| GPIO | `0x01` |
| UART | `0x02` |
| I2C routing | `0x04` |
| SPI routing | `0x05` |
| Motor | `0x06` |
| Microphone | `0x07` |
| PWM | `0x08` |
| ADC | `0x09` |
| Music | `0x0A` |
| EEPROM | `0x0D` |
| BLiXel | `0x0E` |
| Status/events | `0x10` |

## Compatibility boundary

- The extension does not include or flash controller firmware.
- The controller address, identifiers, payload formats, timings, interrupt pin,
  and peripheral-clock assumptions require confirmation against the supplied
  UNBdev.board firmware.
- Low-level APIs are hidden from the MakeCode toolbox. Feature modules expose
  the student-facing blocks.
- A firmware compatibility check and explicit protocol version should replace
  implicit compatibility once the firmware contract is available.
- Hardware validation must cover control, events, GPIO, PWM, UART, I2C routing,
  and SPI routing before issue #40 is closed.

## Source provenance

The behavioral source was `core/bBoard.ts`, inspected through the JavaScript
Explorer at `https://code.brilliantlabs.ca/#editor` on 23 September 2026, as
directed by the project supervisor. The public Brilliant Labs
`pxt-bboard-v2` repository contains an earlier `libs/core/bBoard.ts` and an MIT
licence, but the deployed browser source is newer and is therefore recorded
separately. See `THIRD_PARTY_NOTICES.md`.
