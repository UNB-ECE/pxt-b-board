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
