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

// Representative public microphone programs are kept unreachable so the
// package test compiles their APIs without issuing hardware I/O in CI.
if (false) {
    UNBdevBoardMic.setEnabled(UNBdevBoardMic.State.Enabled)
    UNBdevBoardMic.updateBaseline()
    UNBdevBoardMic.setThreshold(50)
    let level = UNBdevBoardMic.soundLevel()
    let reached = UNBdevBoardMic.thresholdReached()
    UNBdevBoardMic.clearThresholdFlag()
    UNBdevBoardMic.onLoudSound(function () {
        basic.showNumber(level)
        basic.showIcon(reached ? IconNames.Yes : IconNames.No)
    })
}
