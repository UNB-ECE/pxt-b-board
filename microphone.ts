/**
 * Student-facing controls for the microphone built into UNBdev.board.
 */
//% color=#9E4894 icon="\uf130" block="UNBdev.board microphone"
//% weight=490 advanced=true
namespace UNBdevBoardMic {
    const DEFAULT_THRESHOLD = 50

    enum MicrophoneFunction {
        SoundLevel = 1,
        SetThreshold = 2,
        ThresholdFlag = 3,
        ClearThresholdFlag = 4,
        Enable = 5,
        RmsLevel = 6,
        SetBaseline = 7
    }

    /** Whether the integrated microphone is enabled. */
    export enum State {
        //% block="disabled"
        Disabled = 0,
        //% block="enabled"
        Enabled = 1
    }

    let currentThreshold = DEFAULT_THRESHOLD
    let initialized = false

    function command(functionId: MicrophoneFunction, data: number[] = null): void {
        if (data) {
            UNBdevBoard.sendData(UNBdevBoard.Pin.AN,
                UNBdevBoard.Module.Microphone, functionId, data,
                UNBdevBoard.Board.Integrated, UNBdevBoard.Port.BuiltIn)
        } else {
            UNBdevBoard.sendCommand(UNBdevBoard.Pin.AN,
                UNBdevBoard.Module.Microphone, functionId,
                UNBdevBoard.Board.Integrated, UNBdevBoard.Port.BuiltIn)
        }
    }

    function read(functionId: MicrophoneFunction): number {
        return UNBdevBoard.readData16(UNBdevBoard.Pin.AN,
            UNBdevBoard.Module.Microphone, functionId, null,
            UNBdevBoard.Board.Integrated, UNBdevBoard.Port.BuiltIn)
    }

    function initialize(): void {
        if (initialized) return
        setEnabled(State.Enabled)
        initialized = true
    }

    /** Enable or disable the microphone built into UNBdev.board. */
    //% blockId=unbdev_mic_enable
    //% block="UNBdev.board microphone $state"
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=60 advanced=true
    export function setEnabled(state: State): void {
        setThreshold(currentThreshold)
        command(MicrophoneFunction.Enable, [state])
        updateBaseline()
    }

    /** Recalculate the microphone's ambient-sound baseline. */
    //% blockId=unbdev_mic_baseline
    //% block="update UNBdev.board microphone baseline"
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=50 advanced=true
    export function updateBaseline(): void {
        command(MicrophoneFunction.SetBaseline)
    }

    /** Read the RMS sound level measured by the integrated microphone. */
    //% blockId=unbdev_mic_sound_level
    //% block="UNBdev.board sound level"
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=100
    export function soundLevel(): number {
        initialize()
        return read(MicrophoneFunction.RmsLevel)
    }

    /** Set the sound level that raises a loud-sound event. */
    //% blockId=unbdev_mic_set_threshold
    //% block="set UNBdev.board sound threshold to $threshold"
    //% threshold.defl=50 threshold.min=1 threshold.max=65535
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=80 advanced=true
    export function setThreshold(threshold: number): void {
        threshold = Math.round(Math.constrain(threshold, 1, 65535))
        currentThreshold = threshold
        command(MicrophoneFunction.SetThreshold,
            [threshold & 0xff, (threshold >> 8) & 0xff])
    }

    /** Return true when the firmware's microphone threshold flag is set. */
    //% blockId=unbdev_mic_threshold_flag
    //% block="has UNBdev.board sound threshold been reached?"
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=40 advanced=true
    export function thresholdReached(): boolean {
        return read(MicrophoneFunction.ThresholdFlag) == 1
    }

    /** Clear the firmware's microphone threshold flag. */
    //% blockId=unbdev_mic_clear_threshold_flag
    //% block="clear UNBdev.board sound threshold flag"
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=30 advanced=true
    export function clearThresholdFlag(): void {
        command(MicrophoneFunction.ClearThresholdFlag)
    }

    /** Run a handler when the integrated microphone detects a loud sound. */
    //% blockId=unbdev_mic_on_loud_sound
    //% block="on UNBdev.board loud sound"
    //% blockAllowMultiple=0 afterOnStart=true
    //% blockNamespace=UNBDev group="Microphone"
    //% weight=90
    export function onLoudSound(handler: () => void): void {
        initialize()
        UNBdevBoard.enableEvent(UNBdevBoard.EventMask.MicrophoneThreshold,
            UNBdevBoard.Board.Integrated, UNBdevBoard.Port.BuiltIn)
        control.onEvent(UNBdevBoard.eventBusSource(
            UNBdevBoard.Board.Integrated,
            UNBdevBoard.Port.BuiltIn,
            UNBdevBoard.EventIndex.MicrophoneThreshold), 0, function () {
                handler()
                clearThresholdFlag()
            })
        clearThresholdFlag()
    }
}
