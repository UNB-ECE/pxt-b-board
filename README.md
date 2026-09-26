# pxt-unbdev-board

Independently importable Microsoft MakeCode extension for the integrated
UNBdev.board: a micro:bit soldered to a b.Board-derived baseboard with separate
UNBdev.board controller firmware.

The integrated UNBdev.board uses micro:bit V2. The combined extension disables
the legacy `mbdal` (micro:bit V1) build variant so its complete peripheral API
fits and compiles against the board actually supplied for this project.

All student-facing blocks appear under **Advanced** as separate UNBdev.board
category: **UNBdev.board**. Expand it to choose **Microphone**, **BLiXel**,
**Wi-Fi**, or **Motors**. This follows the expandable b.Board interaction
pattern while using UNBdev.board names throughout. Blocks declared
`advanced` inside an entry are collected into that entry's `more` row. Existing
TypeScript namespace names remain available so saved JavaScript projects stay
compatible.

## Current status

The repository contains the control and transport foundation from
`UNB-ECE/unb-platform#40`, the public BLiXel blocks from issue `#41`, and the
integrated microphone API from issue `#42`, and motor APIs from issue `#43`. It
preserves the supervisor-approved b.Board BLiX wire format as a compatibility
baseline while using UNBdev.board names and isolating low-level APIs from the
student toolbox.

Controller request/response transport has been physically verified against
UNBdev.board controller firmware 2.17. BLiXel-specific commands added by issue
`#41` still require physical verification and must not yet be described as a
stable UNBdev.board firmware contract.

## BLiXel blocks

Import the extension, then open **UNBdev.board** under **Advanced** and expand
**BLiXel**. The public
blocks set all five integrated RGB BLiXels, set individual pixels, clear the
strip, adjust brightness, shift or rotate colours, show a five-step bar graph,
and construct RGB or HSL colours. Operations update the physical display
immediately; a separate `show` block is not required.

Bar graphs clamp values to the selected range and light zero or five BLiXels
for values below or above the range. When minimum and maximum are equal, the
graph lights all five BLiXels only when the value is at least that boundary.

```typescript
UNBdevBLiXel.setBrightness(50)
UNBdevBLiXel.setAll(UNBdevBLiXel.rgb(0, 0, 255))
UNBdevBLiXel.setPixel(UNBdevBLiXelIndex.Three, 0xff00ff)
UNBdevBLiXel.rotate(1)
```

## Microphone blocks

The student-facing microphone API covers RMS sound level, baseline updates,
threshold configuration and loud-sound events. Its physical behavior remains
unverified and is deferred to the combined integration gate in
`UNB-ECE/unb-platform#48`.

See [the microphone guide](docs/microphone.md) for usage and protocol details.

See [the protocol baseline](docs/protocol.md) and
[motor guide](docs/motors.md), and [third-party notices](THIRD_PARTY_NOTICES.md).

Wi-Fi/MQTT scope, credential safety, limitations, and its remaining firmware
and hardware acceptance gate are in [the Wi-Fi guide](docs/wifi-mqtt.md).

## Planned migration order

1. Control and protocol foundation
2. BLiXel blocks (implemented; awaiting physical BLiXel verification)
3. Microphone blocks
4. Motor blocks
5. Wi-Fi blocks
6. Click-board sensors, beginning with IR Thermo 3 Click

The extension remains independently versioned and importable. Bundling it into
the UNB Labs editor is a later platform milestone.
