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

// BLiXel colour helpers and approved bar-graph edge behavior.
let colour = UNBdevBLiXel.rgb(0x12, 0x34, 0x56)
control.assert(colour == 0x123456, "BLiXel RGB packing")
control.assert(UNBdevBLiXel.red(colour) == 0x12, "BLiXel red channel")
control.assert(UNBdevBLiXel.green(colour) == 0x34, "BLiXel green channel")
control.assert(UNBdevBLiXel.blue(colour) == 0x56, "BLiXel blue channel")
control.assert(UNBdevBLiXel.hsl(0, 99, 50) == 0xfe0101, "BLiXel HSL red")

control.assert(UNBdevBLiXel.barGraphCount(-1, 100, 0) == 0, "graph clamps low")
control.assert(UNBdevBLiXel.barGraphCount(50, 100, 0) == 3, "graph rounds midpoint")
control.assert(UNBdevBLiXel.barGraphCount(101, 100, 0) == 5, "graph clamps high")
control.assert(UNBdevBLiXel.barGraphCount(5, 5, 5) == 5, "graph zero range high")
control.assert(UNBdevBLiXel.barGraphCount(4, 5, 5) == 0, "graph zero range low")

// Compile every public display operation without performing hardware I/O.
if (false) {
    UNBdevBLiXel.setAll(UNBdevBLiXel.colour(UNBdevBLiXelColour.Blue))
    UNBdevBLiXel.setPixel(UNBdevBLiXelIndex.Three, 0xff00ff)
    UNBdevBLiXel.clear()
    UNBdevBLiXel.setBrightness(50)
    UNBdevBLiXel.shift(1)
    UNBdevBLiXel.rotate(-1)
    UNBdevBLiXel.showBarGraph(50, 100, 0)
}
