// Compile-time and pure framing tests for the shared control layer.

let emptyFrame = UNBdevBoard.buildFrame(
    UNBdevBoard.Board.Integrated,
    UNBdevBoard.Port.ClickA,
    UNBdevBoard.Pin.SDA,
    UNBdevBoard.Module.I2C,
    4
)

control.assert(emptyFrame.length == 6, "empty frame length")
control.assert(emptyFrame.getUint8(0) == 4, "write command")
control.assert(emptyFrame.getUint8(1) == 1, "Click A route")
control.assert(emptyFrame.getUint8(2) == UNBdevBoard.Module.I2C, "I2C module")
control.assert(emptyFrame.getUint8(3) == 4, "function ID")
control.assert(emptyFrame.getUint8(4) == 0, "pin low byte")
control.assert(emptyFrame.getUint8(5) == 4, "pin high byte")

let payload = pins.createBufferFromArray([0xaa, 0x55])
let dataFrame = UNBdevBoard.buildFrame(
    UNBdevBoard.Board.Integrated,
    UNBdevBoard.Port.ClickB,
    UNBdevBoard.Pin.CS,
    UNBdevBoard.Module.SPI,
    1,
    payload
)

control.assert(dataFrame.length == 8, "data frame length")
control.assert(dataFrame.getUint8(1) == 2, "Click B route")
control.assert(dataFrame.getUint8(4) == 4, "chip-select pin")
control.assert(dataFrame.getUint8(6) == 0xaa, "payload byte 0")
control.assert(dataFrame.getUint8(7) == 0x55, "payload byte 1")

UNBdevBoard.setControllerAddress(0x2a)
control.assert(UNBdevBoard.getControllerAddress() == 0x2a, "valid address")
UNBdevBoard.setControllerAddress(0x01)
control.assert(UNBdevBoard.getControllerAddress() == 0x2a, "invalid address ignored")

let forwardMotor = UNBdevMotor.buildPayload(
    UNBdevMotor.Motor.Left,
    UNBdevMotor.Direction.Forward,
    120
)
control.assert(forwardMotor.length == 3, "motor run payload length")
control.assert(forwardMotor.getUint8(0) == 1, "left motor channel")
control.assert(forwardMotor.getUint8(1) == 1, "forward direction")
control.assert(forwardMotor.getUint8(2) == 100, "motor speed clamped")

let stoppedMotor = UNBdevMotor.buildPayload(
    UNBdevMotor.Motor.Right,
    UNBdevMotor.Direction.Brake,
    75
)
control.assert(stoppedMotor.length == 2, "motor stop payload length")
control.assert(stoppedMotor.getUint8(0) == 2, "right motor channel")
control.assert(stoppedMotor.getUint8(1) == 0, "brake direction")
