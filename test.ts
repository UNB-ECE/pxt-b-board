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

let mqttConnect = UNBdevBoardWiFi.buildConnectPacket("1234")
control.assert(mqttConnect.length == 18, "MQTT connect length")
control.assert(mqttConnect.getUint8(0) == 0x10, "MQTT connect header")
control.assert(mqttConnect.getUint8(9) == 2, "MQTT clean session")
control.assert(mqttConnect.getUint8(11) == 60, "MQTT keep alive")

let mqttPublish = UNBdevBoardWiFi.buildPublishPacket("sensors/temp", "21")
control.assert(mqttPublish.getUint8(0) == 0x30, "MQTT publish QoS 0")
control.assert(mqttPublish.getUint8(3) == 12, "MQTT topic length")

let mqttSubscribe = UNBdevBoardWiFi.buildSubscribePacket("sensors/temp")
control.assert(mqttSubscribe.getUint8(0) == 0x82, "MQTT subscribe header")
control.assert(mqttSubscribe.getUint8(mqttSubscribe.length - 1) == 0,
    "MQTT subscribe QoS 0")

let utf8Publish = UNBdevBoardWiFi.buildPublishPacket("temp/°C", "été")
control.assert(utf8Publish.getUint8(3) == control.createBufferFromUTF8("temp/°C").length,
    "UTF-8 topic byte length")
control.assert(utf8Publish.length == 4 + control.createBufferFromUTF8("temp/°C").length +
    control.createBufferFromUTF8("été").length, "UTF-8 publish packet length")

let utf8Subscribe = UNBdevBoardWiFi.buildSubscribePacket("salle/été")
control.assert(utf8Subscribe.getUint8(5) == control.createBufferFromUTF8("salle/été").length,
    "UTF-8 subscribe byte length")

let oversized = ""
for (let i = 0; i < 128; i++) oversized += "x"
control.assert(UNBdevBoardWiFi.buildPublishPacket("topic", oversized).length == 0,
    "oversized packet rejected")

// Representative public API program; deliberately not called because it
// requires physical hardware and project-supplied credentials.
function compileWiFiMqttProgram(ssid: string, password: string, server: string): void {
    if (UNBdevBoardWiFi.connectWiFi(ssid, password)) {
        UNBdevBoardWiFi.connectMQTT(server)
        UNBdevBoardWiFi.onMessage("classroom/status",
            UNBdevBoardWiFi.DataType.Text, function (value: string) {
                serial.writeLine(value)
            })
        UNBdevBoardWiFi.publish("classroom/status", "online")
    }
}
