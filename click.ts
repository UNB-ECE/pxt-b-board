/**
 * Student-facing Click socket blocks for the integrated UNBdev.board.
 *
 * The transport, routing, and framing live in `control.ts`, which preserves the
 * Brilliant Labs b.Board BLiX wire format. The surface below is ported from
 * Brilliant Labs' bBoard_Control control layer
 * (Brilliant-Labs/pxt-bboard-v2, `libs/core/bBoard.ts`), reused with their
 * permission; the grant is recorded on UNB-ECE/unblabs-platform#87.
 *
 * Only what this hardware actually has is offered. The controller exposes two
 * Click sockets -- A and B -- on the single integrated board. The b.Board's
 * expansion boards (1..20) and its Click sockets C..G are not present, so no
 * blocks are offered for them.
 *
 * Blocks reach the sockets through the controller, never through micro:bit
 * pins directly. That is deliberate: the sockets are wired to the controller,
 * not to the micro:bit, so a package that drives the pins itself would both
 * fail and collide with the controller protocol on the shared I2C bus.
 */
//% color=#9E4894 icon="" block="UNBdev.board Click"
//% weight=300
namespace UNBdevClick {
    /** Click socket on the UNBdev.board. */
    export enum Socket {
        //% block="A"
        A = 1,
        //% block="B"
        B = 2
    }

    /** A mikroBUS signal on a Click socket. */
    export enum ClickPin {
        //% block="AN"
        AN = 0x0001,
        //% block="RST"
        RST = 0x0002,
        //% block="CS"
        CS = 0x0004,
        //% block="SCK"
        SCK = 0x0008,
        //% block="MISO"
        MISO = 0x0010,
        //% block="MOSI"
        MOSI = 0x0020,
        //% block="SDA"
        SDA = 0x0400,
        //% block="SCL"
        SCL = 0x0800,
        //% block="TX"
        TX = 0x1000,
        //% block="RX"
        RX = 0x2000,
        //% block="INT"
        INT = 0x4000,
        //% block="PWM"
        PWM = 0x8000
    }

    /**
     * A Click signal the controller can convert to a number.
     *
     * Separate from ClickPin so the editor offers only signals the ADC module
     * accepts, rather than letting a student pick SDA and get a silent zero.
     */
    export enum AnalogSignal {
        //% block="AN"
        AN = 0x0001,
        //% block="RST"
        RST = 0x0002,
        //% block="PWM"
        PWM = 0x8000
    }

    /** A Click signal the PWM module accepts. */
    export enum PwmSignal {
        //% block="AN"
        AN = 0x0001,
        //% block="RST"
        RST = 0x0002,
        //% block="INT"
        INT = 0x4000,
        //% block="PWM"
        PWM = 0x8000
    }

    /** Direction a Click signal is configured for. */
    export enum PinMode {
        //% block="input"
        Input = 3,
        //% block="output"
        Output = 2
    }

    /** Pull resistor applied to a Click input. */
    export enum PinPull {
        //% block="up"
        Up = 1,
        //% block="down"
        Down = 2,
        //% block="none"
        None = 3
    }

    function portFor(socket: Socket): UNBdevBoard.Port {
        return socket == Socket.B ? UNBdevBoard.Port.ClickB : UNBdevBoard.Port.ClickA
    }

    // ClickPin, AnalogSignal and PwmSignal repeat the controller's mikroBUS
    // signal masks exactly, so routing them is a re-typing, not a translation.
    function asPin(pin: ClickPin): UNBdevBoard.Pin {
        return pin as number as UNBdevBoard.Pin
    }

    function asAnalogPin(pin: AnalogSignal): UNBdevBoard.AnalogPin {
        return pin as number as UNBdevBoard.AnalogPin
    }

    function asPwmPin(pin: PwmSignal): UNBdevBoard.PwmPin {
        return pin as number as UNBdevBoard.PwmPin
    }

    /**
     * Drive a Click signal high or low.
     *
     * The signal must already be an output; set that with "set pin ... to
     * output". Writing does not change the direction.
     */
    //% block="UNBdev.board write pin $pin to $value on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="Pins"
    //% weight=100
    export function writePin(pin: ClickPin, value: number, socket: Socket): void {
        UNBdevBoard.digitalWrite(asPin(pin), value ? 1 : 0,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Read whether a Click signal is high. */
    //% block="UNBdev.board digital read pin $pin on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="Pins"
    //% weight=95
    export function digitalReadPin(pin: ClickPin, socket: Socket): number {
        return UNBdevBoard.digitalRead(asPin(pin),
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Read a Click signal as an analog value. */
    //% block="UNBdev.board read analog pin $pin on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="Pins"
    //% weight=90
    export function analogReadPin(pin: AnalogSignal, socket: Socket): number {
        return UNBdevBoard.analogRead(asAnalogPin(pin),
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Choose whether a Click signal is an input or an output. */
    //% block="UNBdev.board set pin $pin to $mode on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="Pins"
    //% weight=85
    export function setPinMode(pin: ClickPin, mode: PinMode, socket: Socket): void {
        UNBdevBoard.setPinDirection(asPin(pin), mode as number as UNBdevBoard.PinDirection,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Apply a pull resistor to a Click input. */
    //% block="UNBdev.board set pin $pin pull $pull on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="Pins"
    //% weight=80
    export function setPinPull(pin: ClickPin, pull: PinPull, socket: Socket): void {
        UNBdevBoard.setPull(asPin(pin), pull as number as UNBdevBoard.PullDirection,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Set the PWM duty cycle on a Click signal, as a percentage. */
    //% block="UNBdev.board set PWM on pin $pin to $percent % on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="PWM"
    //% percent.defl=50
    //% weight=70
    export function setPwmDuty(pin: PwmSignal, percent: number, socket: Socket): void {
        UNBdevBoard.setPwmDuty(asPwmPin(pin), percent,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Set the PWM frequency on a Click signal, in hertz. */
    //% block="UNBdev.board set PWM frequency on pin $pin to $frequency Hz on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="PWM"
    //% frequency.defl=1000
    //% weight=65
    export function setPwmFrequency(pin: PwmSignal, frequency: number, socket: Socket): void {
        UNBdevBoard.setPwmFrequency(asPwmPin(pin), frequency,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Send text out of a Click socket's UART. */
    //% block="UNBdev.board send string $text on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="UART"
    //% weight=60
    export function uartSendString(text: string, socket: Socket): void {
        UNBdevBoard.uartWriteString(text,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Read whatever text is waiting on a Click socket's UART. */
    //% block="UNBdev.board read string on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="UART"
    //% weight=55
    export function uartReadString(socket: Socket): string {
        return UNBdevBoard.uartReadString(
            UNBdevBoard.Board.Integrated, portFor(socket))
    }

    /** Whether a Click socket's UART has data waiting. */
    //% block="UNBdev.board is UART data available on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="UART"
    //% weight=50
    export function uartDataAvailable(socket: Socket): boolean {
        return UNBdevBoard.uartAvailable(
            UNBdevBoard.Board.Integrated, portFor(socket)) > 0
    }

    /** Set the UART baud rate for a Click socket. */
    //% block="UNBdev.board set UART baud to $baud on Click $socket"
    //% blockNamespace=UNBDev subcategory="Control" group="UART"
    //% baud.defl=115200
    //% weight=45
    export function uartSetBaud(baud: number, socket: Socket): void {
        UNBdevBoard.uartSetBaud(baud,
            UNBdevBoard.Board.Integrated, portFor(socket))
    }
}
