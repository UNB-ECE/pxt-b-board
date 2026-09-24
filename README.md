# pxt-unbdev-board

Independently importable Microsoft MakeCode extension for the integrated
UNBdev.board: a micro:bit soldered to a b.Board-derived baseboard with separate
UNBdev.board controller firmware.

## Current status

The repository contains the first control and transport foundation for
`UNB-ECE/unb-platform#40`. It preserves the supervisor-approved b.Board BLiX
wire format as a compatibility baseline while using UNBdev.board names and
isolating the low-level APIs from the student toolbox.

The controller firmware and hardware repositories do not yet contain the
specification or assets needed for physical validation. Until those are added,
the protocol is **not hardware-verified** and must not be described as a stable
UNBdev.board firmware contract.

See [the protocol baseline](docs/protocol.md) and
[third-party notices](THIRD_PARTY_NOTICES.md).

Wi-Fi/MQTT scope, credential safety, limitations, and its remaining firmware
and hardware acceptance gate are in [the Wi-Fi guide](docs/wifi-mqtt.md).

## Planned migration order

1. Control and protocol foundation
2. BLiXel blocks
3. Microphone blocks
4. Motor blocks
5. Wi-Fi blocks
6. Click-board sensors, beginning with IR Thermo 3 Click

The extension remains independently versioned and importable. Bundling it into
the UNB Labs editor is a later platform milestone.
