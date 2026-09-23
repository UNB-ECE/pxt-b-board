// Compile-time and pure framing tests for the shared control layer.

let emptyFrame = UNBdevBoard.buildFrame(
    UNBdevBoard.Board.Integrated,
    UNBdevBoard.Port.ClickA,
    UNBdevBoard.Pin.SDA,
    UNBdevBoard.Module.I2C,
    4
)

control.assert(emptyFrame.length == 6, 100)
control.assert(emptyFrame.getUint8(0) == 4, 101)
control.assert(emptyFrame.getUint8(1) == 1, 102)
control.assert(emptyFrame.getUint8(2) == UNBdevBoard.Module.I2C, 103)
control.assert(emptyFrame.getUint8(3) == 4, 104)
control.assert(emptyFrame.getUint8(4) == 0, 105)
control.assert(emptyFrame.getUint8(5) == 4, 106)

let payload = pins.createBufferFromArray([0xaa, 0x55])
let dataFrame = UNBdevBoard.buildFrame(
    UNBdevBoard.Board.Integrated,
    UNBdevBoard.Port.ClickB,
    UNBdevBoard.Pin.CS,
    UNBdevBoard.Module.SPI,
    1,
    payload
)

control.assert(dataFrame.length == 8, 110)
control.assert(dataFrame.getUint8(1) == 2, 111)
control.assert(dataFrame.getUint8(4) == 4, 112)
control.assert(dataFrame.getUint8(6) == 0xaa, 113)
control.assert(dataFrame.getUint8(7) == 0x55, 114)

UNBdevBoard.setControllerAddress(0x2a)
control.assert(UNBdevBoard.getControllerAddress() == 0x2a, 120)
UNBdevBoard.setControllerAddress(0x01)
control.assert(UNBdevBoard.getControllerAddress() == 0x2a, 121)
