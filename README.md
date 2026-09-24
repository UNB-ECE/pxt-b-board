# pxt-unbdev-board

Independently importable Microsoft MakeCode extension for the integrated
UNBdev.board: a micro:bit soldered to a b.Board-derived baseboard with separate
UNBdev.board controller firmware.

## Current status

The repository contains the control and transport foundation from
`UNB-ECE/unb-platform#40` and the student-facing integrated microphone API from
`UNB-ECE/unb-platform#42`. It preserves the supervisor-approved b.Board BLiX
wire format as a compatibility baseline while using UNBdev.board names.

Controller communication and firmware version `2.17` have been verified on a
physical UNBdev.board. Microphone levels, thresholds, and events still require
the physical verification procedure in
[the microphone guide](docs/microphone.md) before issue #42 is complete.

See [the protocol baseline](docs/protocol.md) and
[third-party notices](THIRD_PARTY_NOTICES.md).

## Planned migration order

1. Control and protocol foundation
2. BLiXel blocks
3. Microphone blocks
4. Motor blocks
5. Wi-Fi blocks
6. Click-board sensors, beginning with IR Thermo 3 Click

The extension remains independently versioned and importable. Bundling it into
the UNB Labs editor is a later platform milestone.
