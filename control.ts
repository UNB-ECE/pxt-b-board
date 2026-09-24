/**
 * Shared UNBdev.board transport and peripheral-routing foundation.
 *
 * This implementation preserves the Brilliant Labs b.Board BLiX wire format as
 * the initial compatibility baseline. Public student blocks are intentionally
 * implemented by feature modules rather than this low-level namespace.
 */
//% color=#9E4894 icon="\uf2db" block="UNBdev.board control"
//% advanced=true
namespace UNBdevBoard {
    /** Physical controller on the integrated UNBdev.board. */
    export enum Board {
        Integrated = 0
    }

    /** Routed peripheral on a board controller. */
    export enum Port {
        BuiltIn = 0,
        ClickA = 1,
        ClickB = 2
    }

    /** mikroBUS signal masks understood by the controller firmware. */
    export enum Pin {
        AN = 0x0001,
        RST = 0x0002,
        CS = 0x0004,
        SCK = 0x0008,
        MISO = 0x0010,
        MOSI = 0x0020,
        SDA = 0x0400,
        SCL = 0x0800,
        TX = 0x1000,
        RX = 0x2000,
        INT = 0x4000,
        PWM = 0x8000
    }

    export enum AnalogPin {
        AN = 0x0001,
        RST = 0x0002,
        PWM = 0x8000
    }

    export enum PwmPin {
        AN = 0x0001,
        RST = 0x0002,
        INT = 0x4000,
        PWM = 0x8000
    }

    export enum PinDirection {
        Output = 2,
        Input = 3
    }

    export enum PullDirection {
        Up = 1,
        Down = 2,
        None = 3
    }

    export enum OpenDrain {
        Disable = 0,
        Enable = 1
    }

    export enum SpiMode {
        Mode0 = 0,
        Mode1 = 1,
        Mode2 = 2,
        Mode3 = 3
    }

    export enum EventMask {
        UartReceive = 1,
        PinHigh = 2,
        PinLow = 4,
        MicrophoneThreshold = 8
    }

    export enum EventIndex {
        UartReceive = 0,
        PinHigh = 1,
        PinLow = 2,
        MicrophoneThreshold = 3
    }

    export enum Module {
        GPIO = 1,
        UART = 2,
        I2C = 4,
        SPI = 5,
        Motor = 6,
        Microphone = 7,
        PWM = 8,
        ADC = 9,
        Music = 10,
        EEPROM = 0x0d,
        BLiXel = 0x0e,
        Status = 0x10
    }

    enum ControllerCommand {
        ClearRx = 0,
        ClearTx = 1,
        ReadTxData = 2,
        ReadTxSize = 3,
        WriteRxData = 4,
        ReadEventPortMask = 6,
        Execute = 7
    }

    enum StatusFunction {
        FirmwareVersion = 2,
        InterruptSource = 0x05,
        InterruptEnableSet = 0x07,
        PinHighSource = 0x09,
        PinHighEnableSet = 0x0b,
        PinHighEnableClear = 0x0c,
        PinLowSource = 0x0d,
        PinLowEnableSet = 0x0f,
        PinLowEnableClear = 0x10
    }

    enum GpioFunction {
        DirectionSet = 2,
        DirectionClear = 3,
        Read = 4,
        Set = 5,
        Clear = 6,
        Pull = 0x0b,
        OpenDrain = 0x0d
    }

    enum UartFunction {
        Status = 0,
        Baud = 4,
        Write = 5,
        ReadBytes = 7,
        ClearRx = 8
    }

    enum I2cFunction {
        Write = 1,
        Read = 2,
        ReadNoMemoryAddress = 4
    }

    enum SpiFunction {
        Write = 1,
        Read = 2,
        Configure = 3,
        WriteBuffer = 4,
        Baud = 7,
        ConfigureChipSelect = 8
    }

    enum PwmFunction {
        Duty = 1,
        Frequency = 2
    }

    const ADC_READ = 16
    const DEFAULT_CONTROLLER_ADDRESS = 0x28
    const MAX_CONTROLLER_PAYLOAD = 122
    const EVENT_BUS_BASE = 0x8000
    const EVENT_INTERRUPT_PIN = DigitalPin.P12
    const STANDARD_DELAY_US = 500
    const COMMAND_DELAY_US = 5000
    const I2C_READ_DELAY_US = 50000

    let controllerAddress = DEFAULT_CONTROLLER_ADDRESS
    let eventsStarted = false

    function oneByte(value: number): Buffer {
        return pins.createBufferFromArray([value & 0xff])
    }

    function writeControllerCommand(command: ControllerCommand): void {
        pins.i2cWriteBuffer(controllerAddress, oneByte(command), false)
    }

    function route(board: Board, port: Port): number {
        return board * 3 + port
    }

    function lowByte(value: number): number {
        return value & 0xff
    }

    function highByte(value: number): number {
        return (value >> 8) & 0xff
    }

    /** Build one BLiX controller frame without performing I/O. */
    //% blockHidden=true
    export function buildFrame(board: Board, port: Port, pin: number,
        moduleId: number, functionId: number, payload: Buffer = null): Buffer {
        const header = pins.createBuffer(6)
        header.setNumber(NumberFormat.UInt8LE, 0, ControllerCommand.WriteRxData)
        header.setNumber(NumberFormat.UInt8LE, 1, route(board, port))
        header.setNumber(NumberFormat.UInt8LE, 2, moduleId)
        header.setNumber(NumberFormat.UInt8LE, 3, functionId)
        header.setNumber(NumberFormat.UInt8LE, 4, lowByte(pin))
        header.setNumber(NumberFormat.UInt8LE, 5, highByte(pin))
        return payload && payload.length ? Buffer.concat([header, payload]) : header
    }

    /** Override the 7-bit controller address for hardware bring-up. */
    //% blockHidden=true
    export function setControllerAddress(address: number): void {
        if (address < 0x08 || address > 0x77) return
        controllerAddress = address
    }

    /** Return the active controller address. */
    //% blockHidden=true
    export function getControllerAddress(): number {
        return controllerAddress
    }

    /** Execute a routed controller command and optionally read its response. */
    //% blockHidden=true
    export function transfer(board: Board, port: Port, pin: number,
        moduleId: number, functionId: number, payload: Buffer = null,
        returnBytes: number = 0): Buffer {
        const frame = buildFrame(board, port, pin, moduleId, functionId, payload)
        writeControllerCommand(ControllerCommand.ClearRx)

        if (returnBytes > 0) {
            control.waitMicros(STANDARD_DELAY_US)
            writeControllerCommand(ControllerCommand.ClearTx)
            control.waitMicros(STANDARD_DELAY_US)
        }

        pins.i2cWriteBuffer(controllerAddress, frame, false)
        control.waitMicros(STANDARD_DELAY_US)
        writeControllerCommand(ControllerCommand.Execute)

        if (returnBytes <= 0) {
            control.waitMicros(COMMAND_DELAY_US + 100 * (frame.length + 1))
            return pins.createBuffer(0)
        }

        const delay = moduleId == Module.I2C
            ? I2C_READ_DELAY_US + 100 * (returnBytes + 1)
            : STANDARD_DELAY_US
        control.waitMicros(delay)
        writeControllerCommand(ControllerCommand.ReadTxData)
        control.waitMicros(STANDARD_DELAY_US)
        return pins.i2cReadBuffer(controllerAddress, returnBytes, false)
    }

    // Compatibility helpers for migrated feature modules. These intentionally
    // have no block annotations and therefore do not add student toolbox blocks.
    //% blockHidden=true
    export function sendCommand(pin: Pin, moduleId: number, functionId: number,
        board: Board, port: Port): void {
        transfer(board, port, pin, moduleId, functionId)
    }

    //% blockHidden=true
    export function sendData(pin: Pin, moduleId: number, functionId: number,
        data: number[], board: Board, port: Port): void {
        transfer(board, port, pin, moduleId, functionId,
            pins.createBufferFromArray(data))
    }

    //% blockHidden=true
    export function sendBuffer(pin: Pin, moduleId: number, functionId: number,
        data: Buffer, board: Board, port: Port): void {
        transfer(board, port, pin, moduleId, functionId, data)
    }

    //% blockHidden=true
    export function readData16(pin: Pin, moduleId: number, functionId: number,
        data: number[], board: Board, port: Port): number {
        const response = transfer(board, port, pin, moduleId, functionId,
            data ? pins.createBufferFromArray(data) : null, 2)
        return response.getNumber(NumberFormat.UInt16LE, 0)
    }

    //% blockHidden=true
    export function setPwmDuty(pin: PwmPin, percent: number,
        board: Board, port: Port): void {
        percent = Math.constrain(percent, 0, 100)
        const duty = Math.round(percent * 10)
        transfer(board, port, pin, Module.PWM, PwmFunction.Duty,
            pins.createBufferFromArray([lowByte(duty), highByte(duty)]))
    }

    //% blockHidden=true
    export function setPwmFrequency(pin: PwmPin, frequency: number,
        board: Board, port: Port): void {
        const data = pins.createBuffer(4)
        data.setNumber(NumberFormat.UInt32LE, 0, frequency)
        transfer(board, port, pin, Module.PWM, PwmFunction.Frequency, data)
    }

    //% blockHidden=true
    export function setPinDirection(pin: Pin, direction: PinDirection,
        board: Board, port: Port): void {
        const fn = direction == PinDirection.Output
            ? GpioFunction.DirectionClear : GpioFunction.DirectionSet
        transfer(board, port, pin, Module.GPIO, fn, oneByte(fn))
    }

    //% blockHidden=true
    export function setOpenDrain(pin: Pin, enabled: OpenDrain,
        board: Board, port: Port): void {
        transfer(board, port, pin, Module.GPIO, GpioFunction.OpenDrain,
            oneByte(enabled))
    }

    //% blockHidden=true
    export function setPull(pin: Pin, direction: PullDirection,
        board: Board, port: Port): void {
        transfer(board, port, pin, Module.GPIO, GpioFunction.Pull,
            oneByte(direction))
    }

    //% blockHidden=true
    export function digitalRead(pin: Pin, board: Board, port: Port): number {
        const value = transfer(board, port, pin, Module.GPIO,
            GpioFunction.Read, null, 2).getNumber(NumberFormat.UInt16LE, 0)
        return value & pin ? 1 : 0
    }

    //% blockHidden=true
    export function digitalWrite(pin: Pin, value: number,
        board: Board, port: Port): void {
        transfer(board, port, pin, Module.GPIO,
            value ? GpioFunction.Set : GpioFunction.Clear)
    }

    //% blockHidden=true
    export function analogRead(pin: AnalogPin, board: Board, port: Port): number {
        return transfer(board, port, pin, Module.ADC, ADC_READ, null, 2)
            .getNumber(NumberFormat.UInt16LE, 0)
    }

    //% blockHidden=true
    export function uartSetBaud(baud: number, board: Board, port: Port): void {
        if (baud <= 0) return
        const divisor = Math.idiv(40000000, baud)
        transfer(board, port, 0, Module.UART, UartFunction.Baud,
            pins.createBufferFromArray([lowByte(divisor), highByte(divisor)]))
    }

    //% blockHidden=true
    export function uartClear(board: Board, port: Port): void {
        transfer(board, port, 0, Module.UART, UartFunction.ClearRx)
    }

    //% blockHidden=true
    export function uartAvailable(board: Board, port: Port): number {
        return transfer(board, port, 0, Module.UART, UartFunction.Status,
            null, 4).getNumber(NumberFormat.UInt16LE, 0)
    }

    //% blockHidden=true
    export function uartWriteBuffer(data: Buffer, board: Board, port: Port): void {
        let offset = 0
        while (offset < data.length) {
            const length = Math.min(MAX_CONTROLLER_PAYLOAD, data.length - offset)
            transfer(board, port, 0, Module.UART, UartFunction.Write,
                data.slice(offset, length))
            offset += length
        }
    }

    //% blockHidden=true
    export function uartWriteString(data: string, board: Board, port: Port): void {
        uartWriteBuffer(control.createBufferFromUTF8(data), board, port)
    }

    //% blockHidden=true
    export function uartReadString(board: Board, port: Port): string {
        const length = uartAvailable(board, port)
        if (length <= 0) return ""
        return transfer(board, port, 0, Module.UART, UartFunction.ReadBytes,
            pins.createBufferFromArray([lowByte(length), highByte(length)]), length)
            .toString()
    }

    //% blockHidden=true
    export function i2cRead(address: number, memoryAddress: number,
        length: number, board: Board, port: Port): Buffer {
        return transfer(board, port, 0, Module.I2C, I2cFunction.Read,
            pins.createBufferFromArray([address, memoryAddress, length]), length)
    }

    //% blockHidden=true
    export function i2cReadNoMemoryAddress(address: number, length: number,
        board: Board, port: Port): Buffer {
        return transfer(board, port, 0, Module.I2C,
            I2cFunction.ReadNoMemoryAddress,
            pins.createBufferFromArray([address, length]), length)
    }

    //% blockHidden=true
    export function i2cWriteNumber(address: number, value: number,
        format: NumberFormat, repeated: boolean, board: Board, port: Port): void {
        const valueBuffer = pins.createBuffer(pins.sizeOf(format))
        valueBuffer.setNumber(format, 0, value)
        const prefix = pins.createBufferFromArray([address, repeated ? 1 : 0])
        transfer(board, port, 0, Module.I2C, I2cFunction.Write,
            Buffer.concat([prefix, valueBuffer]))
    }

    //% blockHidden=true
    export function i2cWriteBuffer(address: number, data: Buffer,
        board: Board, port: Port): void {
        transfer(board, port, 0, Module.I2C, I2cFunction.Write,
            Buffer.concat([pins.createBufferFromArray([address, 0]), data]))
    }

    //% blockHidden=true
    export function spiSetMode(mode: SpiMode, board: Board, port: Port): void {
        let clockEdge = 1
        let clockPolarity = 0
        if (mode == SpiMode.Mode1) clockEdge = 0
        else if (mode == SpiMode.Mode2) clockPolarity = 1
        else if (mode == SpiMode.Mode3) {
            clockEdge = 0
            clockPolarity = 1
        }
        transfer(board, port, 0, Module.SPI, SpiFunction.Configure,
            pins.createBufferFromArray([clockEdge, clockPolarity]))
    }

    //% blockHidden=true
    export function spiSetFrequency(frequency: number,
        board: Board, port: Port): void {
        if (frequency <= 0) return
        const divisor = Math.idiv(40000000, 2 * frequency) - 1
        transfer(board, port, 0, Module.SPI, SpiFunction.Baud,
            pins.createBufferFromArray([lowByte(divisor), highByte(divisor)]))
    }

    //% blockHidden=true
    export function spiSetChipSelect(pin: Pin, board: Board, port: Port): void {
        transfer(board, port, pin, Module.SPI, SpiFunction.ConfigureChipSelect)
    }

    //% blockHidden=true
    export function spiWrite(value: number, board: Board, port: Port): void {
        transfer(board, port, 0, Module.SPI, SpiFunction.Write, oneByte(value))
    }

    //% blockHidden=true
    export function spiWriteBuffer(data: Buffer, board: Board, port: Port): void {
        transfer(board, port, 0, Module.SPI, SpiFunction.WriteBuffer, data)
    }

    //% blockHidden=true
    export function spiRead(length: number, board: Board, port: Port): Buffer {
        return transfer(board, port, 0, Module.SPI, SpiFunction.Read,
            oneByte(length), length)
    }

    //% blockHidden=true
    export function firmwareVersion(board: Board = Board.Integrated): number {
        const response = transfer(board, Port.BuiltIn, 0, Module.Status,
            StatusFunction.FirmwareVersion, null, 2)
        return response.getUint8(1) + response.getUint8(0) / 100
    }

    //% blockHidden=true
    export function eventBusSource(board: Board, port: Port,
        eventIndex: number): number {
        return EVENT_BUS_BASE | (eventIndex << 7) | route(board, port)
    }

    //% blockHidden=true
    export function eventPortMask(): number {
        writeControllerCommand(ControllerCommand.ClearRx)
        writeControllerCommand(ControllerCommand.ClearTx)
        writeControllerCommand(ControllerCommand.ReadEventPortMask)
        const response = pins.i2cReadBuffer(controllerAddress, 4, false)
        control.waitMicros(STANDARD_DELAY_US)
        return response.getNumber(NumberFormat.UInt32LE, 0)
    }

    function interruptSource(board: Board, port: Port): Buffer {
        const request = pins.createBufferFromArray([
            ControllerCommand.WriteRxData,
            route(board, port),
            Module.Status,
            StatusFunction.InterruptSource
        ])
        writeControllerCommand(ControllerCommand.ClearRx)
        writeControllerCommand(ControllerCommand.ClearTx)
        pins.i2cWriteBuffer(controllerAddress, request, false)
        writeControllerCommand(ControllerCommand.Execute)
        control.waitMicros(STANDARD_DELAY_US)
        writeControllerCommand(ControllerCommand.ReadTxData)
        return pins.i2cReadBuffer(controllerAddress, 8, false)
    }

    //% blockHidden=true
    export function enableEvent(event: EventMask, board: Board, port: Port): void {
        transfer(board, port, 0, Module.Status,
            StatusFunction.InterruptEnableSet, oneByte(event))
        startEventPump()
    }

    //% blockHidden=true
    export function pinEventMask(board: Board, port: Port,
        event: EventMask): number {
        const fn = event == EventMask.PinHigh
            ? StatusFunction.PinHighSource : StatusFunction.PinLowSource
        return transfer(board, port, 0xffff, Module.Status, fn, null, 2)
            .getNumber(NumberFormat.UInt16LE, 0)
    }

    //% blockHidden=true
    export function enablePinEvent(board: Board, port: Port, pin: Pin,
        event: EventMask): void {
        const fn = event == EventMask.PinHigh
            ? StatusFunction.PinHighEnableSet
            : StatusFunction.PinLowEnableSet
        transfer(board, port, pin, Module.Status, fn)
        digitalRead(pin, board, port)
        startEventPump()
    }

    //% blockHidden=true
    export function disablePinEvent(board: Board, port: Port, pin: Pin,
        event: EventMask): void {
        const fn = event == EventMask.PinHigh
            ? StatusFunction.PinHighEnableClear
            : StatusFunction.PinLowEnableClear
        transfer(board, port, pin, Module.Status, fn)
    }

    function raisePinEvents(board: Board, port: Port,
        eventIndex: number, activePins: number): void {
        for (let bit = 0; bit < 16; bit++) {
            const pin = 1 << bit
            if (activePins & pin) {
                control.raiseEvent(eventBusSource(board, port, eventIndex), pin)
            }
        }
    }

    function processEvents(): void {
        if (pins.digitalReadPin(EVENT_INTERRUPT_PIN) != 1) return
        let ports = eventPortMask()
        for (let absolutePort = 0; absolutePort < 32 && ports; absolutePort++) {
            const portBit = 1 << absolutePort
            if (!(ports & portBit)) continue
            ports &= ~portBit
            const board = Math.idiv(absolutePort, 3) as Board
            const port = absolutePort % 3 as Port
            const events = interruptSource(board, port)
            for (let eventIndex = 0; eventIndex < 64; eventIndex++) {
                const eventByte = events.getUint8(Math.idiv(eventIndex, 8))
                if (!(eventByte & (1 << (eventIndex % 8)))) continue
                if (eventIndex == EventIndex.PinHigh || eventIndex == EventIndex.PinLow) {
                    const mask = eventIndex == EventIndex.PinHigh
                        ? EventMask.PinHigh : EventMask.PinLow
                    raisePinEvents(board, port, eventIndex,
                        pinEventMask(board, port, mask))
                } else {
                    control.raiseEvent(eventBusSource(board, port, eventIndex), 0)
                }
            }
        }
    }

    function startEventPump(): void {
        if (eventsStarted) return
        eventsStarted = true
        control.runInParallel(function () {
            while (eventsStarted) {
                processEvents()
                basic.pause(20)
            }
        })
    }
}
