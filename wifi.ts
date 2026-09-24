/** ESP32 Wi-Fi and MQTT support over the UNBdev.board built-in UART. */
//% color=#9E4894 icon="\uf1eb" block="UNBdev.board Wi-Fi"
namespace UNBdevBoardWiFi {
    export enum DataType {
        //% block="number"
        Number,
        //% block="text"
        Text
    }

    export enum ErrorCode {
        None, Timeout, Rejected, NotConnected, InvalidArgument,
        MalformedResponse, PacketTooLarge
    }

    class Subscription {
        constructor(public topic: string, public type: DataType,
            public handler: (value: any) => void) { }
    }

    const BOARD = UNBdevBoard.Board.Integrated
    const PORT = UNBdevBoard.Port.BuiltIn
    const TIMEOUT = 30000
    let error = ErrorCode.None
    let response = ""
    let rx = ""
    let connected = false
    let subscriptions: Subscription[] = []
    let eventStarted = false
    let pingStarted = false
    let commandActive = false

    function fail(value: ErrorCode): boolean {
        error = value
        return false
    }

    function valid(value: string): boolean {
        return value != null && value.length > 0 && value.indexOf("\r") < 0 && value.indexOf("\n") < 0
    }

    function available(): string {
        return UNBdevBoard.uartAvailable(BOARD, PORT) > 0
            ? UNBdevBoard.uartReadString(BOARD, PORT) : ""
    }

    function waitFor(expected: string, timeout: number): boolean {
        const start = input.runningTime()
        response = ""
        while (input.runningTime() - start < timeout) {
            response += available()
            if (response.indexOf(expected) >= 0) {
                error = ErrorCode.None
                return true
            }
            if (response.indexOf("ERROR") >= 0 || response.indexOf("FAIL") >= 0)
                return fail(ErrorCode.Rejected)
            basic.pause(20)
        }
        return fail(ErrorCode.Timeout)
    }

    function command(text: string, expected: string, timeout: number): boolean {
        commandActive = true
        UNBdevBoard.uartClear(BOARD, PORT)
        UNBdevBoard.uartWriteString(text + "\r\n", BOARD, PORT)
        const result = waitFor(expected, timeout)
        commandActive = false
        return result
    }

    //% blockHidden=true
    export function buildConnectPacket(clientId: string): Buffer {
        if (!valid(clientId)) return pins.createBuffer(0)
        const clientBytes = control.createBufferFromUTF8(clientId)
        if (clientBytes.length > 115) return pins.createBuffer(0)
        const remaining = clientBytes.length + 12
        const packet = pins.createBuffer(remaining + 2)
        let i = 0
        packet.setUint8(i++, 0x10); packet.setUint8(i++, remaining)
        packet.setUint8(i++, 0); packet.setUint8(i++, 4)
        packet.write(i, control.createBufferFromUTF8("MQTT")); i += 4
        packet.setUint8(i++, 4); packet.setUint8(i++, 2)
        packet.setUint8(i++, 0); packet.setUint8(i++, 60)
        packet.setUint8(i++, 0); packet.setUint8(i++, clientBytes.length)
        packet.write(i, clientBytes)
        return packet
    }

    //% blockHidden=true
    export function buildPublishPacket(topic: string, payload: string): Buffer {
        if (!valid(topic) || payload == null) return pins.createBuffer(0)
        const topicBytes = control.createBufferFromUTF8(topic)
        const payloadBytes = control.createBufferFromUTF8(payload)
        const remaining = 2 + topicBytes.length + payloadBytes.length
        if (remaining >= 127) return pins.createBuffer(0)
        const packet = pins.createBuffer(remaining + 2)
        packet.setUint8(0, 0x30); packet.setUint8(1, remaining)
        packet.setUint8(2, topicBytes.length >> 8); packet.setUint8(3, topicBytes.length & 0xff)
        packet.write(4, topicBytes)
        packet.write(4 + topicBytes.length, payloadBytes)
        return packet
    }

    //% blockHidden=true
    export function buildSubscribePacket(topic: string): Buffer {
        if (!valid(topic)) return pins.createBuffer(0)
        const topicBytes = control.createBufferFromUTF8(topic)
        if (topicBytes.length + 5 >= 127) return pins.createBuffer(0)
        const packet = pins.createBuffer(topicBytes.length + 7)
        packet.setUint8(0, 0x82); packet.setUint8(1, topicBytes.length + 5)
        packet.setUint8(2, 0); packet.setUint8(3, 1)
        packet.setUint8(4, topicBytes.length >> 8); packet.setUint8(5, topicBytes.length & 0xff)
        packet.write(6, topicBytes)
        packet.setUint8(packet.length - 1, 0)
        return packet
    }

    function send(packet: Buffer): boolean {
        if (!packet || packet.length == 0) return fail(ErrorCode.PacketTooLarge)
        if (!command("AT+CIPSEND=0," + packet.length, ">", TIMEOUT)) return false
        commandActive = true
        UNBdevBoard.uartClear(BOARD, PORT)
        UNBdevBoard.uartWriteBuffer(packet, BOARD, PORT)
        const result = waitFor("SEND OK", TIMEOUT)
        commandActive = false
        return result
    }

    // Wait for an MQTT acknowledgement wrapped by ESP-AT +IPD. SEND OK alone
    // confirms only UART-to-ESP transmission, not broker acceptance.
    function waitForAck(packetType: number, timeout: number): boolean {
        commandActive = true
        const result = waitForAckExclusive(packetType, timeout)
        commandActive = false
        return result
    }

    // Keep every return inside this helper so the wrapper always releases the
    // UART dispatcher guard, including malformed, rejected, and timeout paths.
    function waitForAckExclusive(packetType: number, timeout: number): boolean {
        let pending = response
        const start = input.runningTime()
        while (input.runningTime() - start < timeout) {
            pending += available()
            const ipd = pending.indexOf("+IPD,0,")
            if (ipd < 0) { basic.pause(20); continue }
            const colon = pending.indexOf(":", ipd)
            if (colon < 0) { basic.pause(20); continue }
            const size = parseInt(pending.substr(ipd + 7, colon - ipd - 7))
            if (isNaN(size) || size <= 0) return fail(ErrorCode.MalformedResponse)
            if (pending.length < colon + 1 + size) { basic.pause(20); continue }
            const packet = pending.substr(colon + 1, size)
            const consumed = colon + 1 + size
            pending = pending.substr(consumed)
            if ((packet.charCodeAt(0) & 0xf0) != packetType) {
                rx += "+IPD,0," + size + ":" + packet
                continue
            }
            if (packetType == 0x20) {
                if (packet.length != 4 || packet.charCodeAt(1) != 2)
                    return fail(ErrorCode.MalformedResponse)
                if (packet.charCodeAt(3) != 0) return fail(ErrorCode.Rejected)
            } else if (packetType == 0x90) {
                if (packet.length < 5 || packet.charCodeAt(packet.length - 1) != 0)
                    return fail(ErrorCode.Rejected)
            }
            if (pending.length > 0) rx += pending
            error = ErrorCode.None
            return true
        }
        return fail(ErrorCode.Timeout)
    }

    /** Connect using credentials supplied by this MakeCode project. */
    //% blockId=unb_wifi_connect
    //% block="UNBdev.board connect to Wi-Fi $ssid with password $password"
    //% group="Wi-Fi" weight=100
    export function connectWiFi(ssid: string, password: string): boolean {
        if (!valid(ssid) || !valid(password) || ssid.indexOf("\"") >= 0 ||
            password.indexOf("\"") >= 0 || ssid.indexOf("\\") >= 0 ||
            password.indexOf("\\") >= 0) return fail(ErrorCode.InvalidArgument)
        UNBdevBoard.setPinDirection(UNBdevBoard.Pin.CS,
            UNBdevBoard.PinDirection.Output, BOARD, PORT)
        UNBdevBoard.digitalWrite(UNBdevBoard.Pin.CS, 0, BOARD, PORT)
        UNBdevBoard.digitalWrite(UNBdevBoard.Pin.CS, 1, BOARD, PORT)
        basic.pause(1000)
        if (!command("AT+CWMODE=1", "OK", TIMEOUT) ||
            !command("AT+CIPMUX=1", "OK", TIMEOUT)) return false
        // This credential-bearing command is neither retained nor logged.
        if (!command("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", "OK", TIMEOUT)) return false
        return isConnected()
    }

    //% blockId=unb_wifi_is_connected
    //% block="UNBdev.board Wi-Fi is connected"
    //% group="Wi-Fi" weight=90
    export function isConnected(): boolean {
        if (!command("AT+CIPSTATUS", "OK", TIMEOUT)) return false
        const marker = response.indexOf("STATUS:")
        if (marker < 0 || marker + 7 >= response.length) return fail(ErrorCode.MalformedResponse)
        const status = parseInt(response.substr(marker + 7, 1))
        if (status == 2 || status == 3) { error = ErrorCode.None; return true }
        return fail(ErrorCode.NotConnected)
    }

    //% blockId=unb_wifi_disconnect
    //% block="UNBdev.board disconnect Wi-Fi"
    //% group="Wi-Fi" weight=80
    export function disconnect(): boolean {
        connected = false
        return command("AT+CWQAP", "OK", TIMEOUT)
    }

    //% blockId=unb_wifi_restart
    //% block="UNBdev.board restart Wi-Fi"
    //% group="Wi-Fi" weight=70
    export function restart(): boolean {
        connected = false
        const result = command("AT+RST", "ready", 10000)
        basic.pause(500)
        return result
    }

    /** Query the ESP32 AT firmware identification text (`AT+GMR`). */
    //% blockId=unb_wifi_firmware_version
    //% block="UNBdev.board Wi-Fi firmware version"
    //% group="Status" weight=60
    export function firmwareVersion(): string {
        if (!command("AT+GMR", "OK", 3000)) return ""
        let value = response
        const echo = value.indexOf("AT+GMR")
        if (echo >= 0) value = value.substr(echo + 6)
        const ok = value.indexOf("\r\nOK")
        if (ok >= 0) value = value.substr(0, ok)
        while (value.length > 0 && (value.charAt(0) == "\r" || value.charAt(0) == "\n"))
            value = value.substr(1)
        return value
    }

    /** MQTT 3.1.1 anonymous clean session over TCP port 1883. */
    //% blockId=unb_mqtt_connect
    //% block="UNBdev.board MQTT connect to server $server"
    //% group="MQTT" weight=100
    export function connectMQTT(server: string): boolean {
        if (!valid(server) || server.indexOf("\"") >= 0) return fail(ErrorCode.InvalidArgument)
        if (!isConnected()) return false
        if (!command("AT+CIPSTART=0,\"TCP\",\"" + server + "\",1883,30", "OK", TIMEOUT)) return false
        if (!send(buildConnectPacket(control.deviceSerialNumber().toString()))) return false
        if (!waitForAck(0x20, TIMEOUT)) return false
        connected = true
        for (let i = 0; i < subscriptions.length; i++) {
            if (!subscribe(subscriptions[i].topic)) {
                connected = false
                return false
            }
        }
        startPing()
        return true
    }

    //% blockId=unb_mqtt_publish
    //% block="UNBdev.board MQTT publish $data to topic $topic"
    //% group="MQTT" weight=90
    export function publish(topic: string, data: any): boolean {
        if (!connected) return fail(ErrorCode.NotConnected)
        let value = ""
        if (typeof data == "string") value = data
        else if (typeof data == "number") value = data.toString()
        else return fail(ErrorCode.InvalidArgument)
        const result = send(buildPublishPacket(topic, value))
        if (!result) connected = false
        return result
    }

    function subscribe(topic: string): boolean {
        if (!connected) return fail(ErrorCode.NotConnected)
        if (!send(buildSubscribePacket(topic))) return false
        return waitForAck(0x90, TIMEOUT)
    }

    //% blockId=unb_mqtt_on_message
    //% block="on UNBdev.board MQTT $type received $value from topic $topic"
    //% draggableParameters=variable blockAllowMultiple=1 afterOnStart=true
    //% group="MQTT" weight=80
    export function onMessage(topic: string, type: DataType,
        handler: (value: any) => void): void {
        if (!valid(topic) || !handler) { error = ErrorCode.InvalidArgument; return }
        subscriptions.push(new Subscription(topic, type, handler))
        if (!eventStarted) {
            UNBdevBoard.enableEvent(UNBdevBoard.EventMask.UartReceive, BOARD, PORT)
            control.onEvent(UNBdevBoard.eventBusSource(BOARD, PORT,
                UNBdevBoard.EventIndex.UartReceive), 0, dispatch)
            eventStarted = true
        }
        subscribe(topic)
    }

    function dispatch(): void {
        if (commandActive) return
        rx += available()
        if (rx.length > 768) rx = ""
        while (parseOne()) { }
    }

    function parseOne(): boolean {
        const ipd = rx.indexOf("+IPD,0,")
        if (ipd < 0) return false
        const colon = rx.indexOf(":", ipd)
        if (colon < 0) return false
        const size = parseInt(rx.substr(ipd + 7, colon - ipd - 7))
        if (isNaN(size) || size <= 0) {
            rx = rx.substr(colon + 1); error = ErrorCode.MalformedResponse
            return rx.length > 0
        }
        if (rx.length < colon + 1 + size) return false
        const packet = rx.substr(colon + 1, size)
        rx = rx.substr(colon + 1 + size)
        if (packet.length < 4 || (packet.charCodeAt(0) & 0xf0) != 0x30) {
            error = ErrorCode.MalformedResponse; return rx.length > 0
        }
        const length = packet.charCodeAt(2) * 256 + packet.charCodeAt(3)
        if (length <= 0 || 4 + length > packet.length) {
            error = ErrorCode.MalformedResponse; return rx.length > 0
        }
        const topic = packet.substr(4, length)
        const payload = packet.substr(4 + length)
        for (let i = 0; i < subscriptions.length; i++) {
            const item = subscriptions[i]
            if (item.topic == topic)
                item.handler(item.type == DataType.Number ? parseFloat(payload) : payload)
        }
        error = ErrorCode.None
        return rx.length > 0
    }

    function startPing(): void {
        if (pingStarted) return
        pingStarted = true
        control.runInParallel(function () {
            while (pingStarted) {
                basic.pause(30000)
                if (connected && !send(pins.createBufferFromArray([0xc0, 0]))) connected = false
            }
        })
    }

    //% blockId=unb_wifi_last_error
    //% block="UNBdev.board Wi-Fi last error"
    //% group="Status" weight=50
    export function lastError(): ErrorCode { return error }
}
