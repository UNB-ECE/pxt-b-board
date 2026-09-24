/**
 * Motor-driver blocks for the integrated UNBdev.board.
 *
 * The controller commands intentionally retain the Brilliant Labs b.Board
 * motor wire format so they work with the UNBdev.board controller firmware.
 */
//% weight=98 color=#9E4894 icon="\uf013" block="UNBdev.board motors"
//% advanced=true
namespace UNBdevMotor {
    enum MotorFunction {
        Enable = 1,
        Set = 2
    }

    /** Motor-driver power state. */
    export enum State {
        //% block="enabled"
        Enabled = 1,
        //% block="disabled"
        Disabled = 0
    }

    /** Motor output channel. */
    export enum Motor {
        //% block="left"
        Left = 1,
        //% block="right"
        Right = 2
    }

    /** Motor direction. */
    export enum Direction {
        //% block="forward"
        Forward = 1,
        //% block="backward"
        Backward = 2,
        //% block="brake"
        Brake = 0
    }

    function safeSpeed(speed: number): number {
        return Math.round(Math.constrain(speed, 0, 100))
    }

    function safeDuration(duration: number): number {
        return Math.max(0, Math.round(duration))
    }

    /** Build a motor payload for compile-time protocol tests. */
    //% blockHidden=true
    export function buildPayload(motor: Motor, direction: Direction,
        speed: number): Buffer {
        if (direction == Direction.Brake) {
            return pins.createBufferFromArray([motor, Direction.Brake])
        }
        return pins.createBufferFromArray([motor, direction, safeSpeed(speed)])
    }

    function send(motor: Motor, direction: Direction, speed: number): void {
        UNBdevBoard.sendBuffer(
            UNBdevBoard.Pin.PWM,
            UNBdevBoard.Module.Motor,
            MotorFunction.Set,
            buildPayload(motor, direction, speed),
            UNBdevBoard.Board.Integrated,
            UNBdevBoard.Port.BuiltIn
        )
    }

    /** Enable or disable the integrated motor driver. */
    //% block="motor driver $state"
    //% weight=100
    export function enable(state: State): void {
        UNBdevBoard.sendData(
            UNBdevBoard.Pin.PWM,
            UNBdevBoard.Module.Motor,
            MotorFunction.Enable,
            [state],
            UNBdevBoard.Board.Integrated,
            UNBdevBoard.Port.BuiltIn
        )
    }

    /** Run one motor in an explicit direction at 0-100 percent speed. */
    //% block="run $motor motor $direction at $speed %"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% speed.shadow="speedPicker"
    //% weight=95
    export function run(motor: Motor, direction: Direction, speed: number): void {
        send(motor, direction, speed)
    }

    /** Set one motor using signed speed (-100 backward to 100 forward). */
    //% block="set $motor motor speed to $speed %"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% speed.shadow="speedPicker"
    //% weight=90
    export function setSpeed(motor: Motor, speed: number): void {
        speed = Math.round(Math.constrain(speed, -100, 100))
        if (speed == 0) send(motor, Direction.Brake, 0)
        else send(motor, speed > 0 ? Direction.Forward : Direction.Backward,
            Math.abs(speed))
    }

    /** Set both motors using signed speed (-100 backward to 100 forward). */
    //% block="set both motor speeds to $speed %"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% speed.shadow="speedPicker"
    //% weight=85
    export function setBothSpeeds(speed: number): void {
        setSpeed(Motor.Left, speed)
        setSpeed(Motor.Right, speed)
    }

    /** Run one motor for a duration, then brake it. */
    //% block="run $motor motor at $speed % for $duration ms"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% speed.shadow="speedPicker"
    //% duration.min=0 duration.defl=1000
    //% duration.shadow="timePicker"
    //% weight=80
    export function runFor(motor: Motor, speed: number, duration: number): void {
        setSpeed(motor, speed)
        basic.pause(safeDuration(duration))
        stop(motor)
    }

    /** Run both motors for a duration, then brake both. */
    //% block="run both motors at $speed % for $duration ms"
    //% speed.min=-100 speed.max=100 speed.defl=50
    //% speed.shadow="speedPicker"
    //% duration.min=0 duration.defl=1000
    //% duration.shadow="timePicker"
    //% weight=75
    export function runBothFor(speed: number, duration: number): void {
        setBothSpeeds(speed)
        basic.pause(safeDuration(duration))
        stopAll()
    }

    /** Brake one motor. */
    //% block="stop $motor motor"
    //% weight=70
    export function stop(motor: Motor): void {
        send(motor, Direction.Brake, 0)
    }

    /** Brake both motors. */
    //% block="stop all motors"
    //% weight=65
    export function stopAll(): void {
        stop(Motor.Left)
        stop(Motor.Right)
    }
}
