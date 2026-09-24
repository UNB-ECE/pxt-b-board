# UNBdev.board motors

The **UNBdev.board motors** entry under **Advanced** controls the two motor-driver outputs on
the integrated board. Use an approved external motor supply and the polarity and
voltage range documented for the physical UNBdev.board; USB power alone is not
an approved motor-power source.

## Examples

Run both motors forward at half speed, then stop:

```typescript
UNBdevMotor.enable(UNBdevMotor.State.Enabled)
UNBdevMotor.runBothFor(50, 1000)
```

Turn in place until the program stops the motors:

```typescript
UNBdevMotor.setSpeed(UNBdevMotor.Motor.Left, -40)
UNBdevMotor.setSpeed(UNBdevMotor.Motor.Right, 40)
basic.pause(500)
UNBdevMotor.stopAll()
```

Signed speed is constrained to `-100..100`; a negative value runs backward, a
positive value runs forward, and zero brakes. Explicit-direction blocks accept
`0..100` percent. Durations below zero are treated as zero. Timed calls wait in
the calling fiber before braking, which makes their completion predictable.

## Compatibility and provenance

This module was migrated from the Brilliant Labs editor's browser-exposed
`core/bBoardMotor.ts` implementation inspected on 2026-09-24. It preserves the
controller protocol: module `6`, enable function `1`, set function `2`, motor
IDs `1` (left) and `2` (right), and direction IDs `0` (brake), `1` (forward),
and `2` (backward).

Intentional differences are UNBdev.board names, explicit public stop and
direction APIs, input clamping, and synchronous timed blocks. The upstream
implementation starts its timers in background fibers, which can make a timed
call return before the motor stops. See `THIRD_PARTY_NOTICES.md` for attribution
and licence information.
