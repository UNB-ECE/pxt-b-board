# UNBdev.board microphone

UNBdev.board includes a microphone on its integrated baseboard. Import this
extension and open **Advanced > UNBdev.board microphone** to use its blocks.

## Read the sound level

The first read enables the microphone, restores the current threshold, and
updates its ambient-sound baseline.

```typescript
basic.forever(function () {
    led.plotBarGraph(UNBdevBoardMic.soundLevel(), 255)
})
```

## Detect a loud sound

Set the threshold before registering the event. The extension rounds
TypeScript inputs and constrains them to the firmware's unsigned 16-bit range
of `1` through `65535`; the default is `50`.

```typescript
UNBdevBoardMic.setThreshold(75)
UNBdevBoardMic.onLoudSound(function () {
    basic.showIcon(IconNames.Yes)
})
```

The event uses the shared UNBdev.board event pump. The extension clears the
firmware threshold flag when the handler is registered and after each event.

## Advanced operations

The advanced blocks can enable or disable the microphone, update the ambient
baseline, read the threshold flag directly, and clear that flag. Updating the
baseline is useful after moving the board into an environment with a different
steady background-noise level.

## Firmware mapping

All operations target the built-in peripheral (`route 0`), microphone module
`7`, and analog-pin mask `0x0001`.

| Operation | Function ID | Payload or response |
| --- | ---: | --- |
| Read legacy sound level | 1 | 16-bit response; retained in protocol provenance only |
| Set threshold | 2 | 16-bit little-endian threshold |
| Read threshold flag | 3 | 16-bit response; `1` means set |
| Clear threshold flag | 4 | No payload |
| Enable/disable | 5 | One byte: `1`/`0` |
| Read RMS sound level | 6 | 16-bit response |
| Update baseline | 7 | No payload |

The public sound-level API deliberately uses function `6` (RMS), matching the
deployed Brilliant Labs block. Function `1` is not exposed because the source
does not use it and its intended distinction is undocumented.

## Physical verification still required

Compilation tests do not prove acoustic behavior. On a physical UNBdev.board,
record its hardware revision and controller firmware, then verify:

1. Enable the microphone and update the baseline in a quiet room.
2. Confirm repeated level readings are stable and increase for a clap.
3. Set a threshold above the quiet-room level and confirm the flag changes.
4. Clear the flag and confirm it reads false.
5. Register the loud-sound handler, clap once, and confirm one event fires.
6. Repeat after a baseline update and after disable/enable.

Record the program revision, chosen threshold, observed quiet/loud levels,
expected result, actual result, and serial output on issue `UNB-ECE/unb-platform#42`.
