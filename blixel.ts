/**
 * Colours supported by the five integrated UNBdev.board BLiXels.
 */
enum UNBdevBLiXelColour {
    //% block=red
    Red = 0xff0000,
    //% block=orange
    Orange = 0xffa500,
    //% block=yellow
    Yellow = 0xffff00,
    //% block=green
    Green = 0x00ff00,
    //% block=blue
    Blue = 0x0000ff,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xff00ff,
    //% block=white
    White = 0xffffff,
    //% block=black
    Black = 0x000000
}

/** Position of an integrated UNBdev.board BLiXel, from left to right. */
enum UNBdevBLiXelIndex {
    //% block="1"
    One = 0,
    //% block="2"
    Two = 1,
    //% block="3"
    Three = 2,
    //% block="4"
    Four = 3,
    //% block="5"
    Five = 4
}

/**
 * Control the five RGB BLiXels integrated into UNBdev.board.
 */
//% weight=400 color=#9E4894 icon="\uf110" block="UNBdev.board BLiXel"
namespace UNBdevBLiXel {
    const PIXEL_COUNT = 5
    const BYTES_PER_PIXEL = 3
    const STRIP_PIN = UNBdevBoard.Pin.PWM
    const STRIP_PORT = UNBdevBoard.Port.BuiltIn
    const STRIP_BOARD = UNBdevBoard.Board.Integrated

    enum FunctionId {
        Show = 0x03,
        Clear = 0x05,
        WriteBuffer = 0x07,
        SetColour = 0x0a,
        SetPixel = 0x0b,
        SetBrightness = 0x0d
    }

    let pixels = pins.createBuffer(PIXEL_COUNT * BYTES_PER_PIXEL)
    let selectedColour = UNBdevBLiXelColour.Purple
    let brightness = 255

    function show(): void {
        UNBdevBoard.sendCommand(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.Show, STRIP_BOARD, STRIP_PORT)
    }

    function writeBuffer(): void {
        UNBdevBoard.sendBuffer(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.WriteBuffer, pixels, STRIP_BOARD, STRIP_PORT)
    }

    function writePixel(index: number, colour: number): void {
        pixels.setNumber(NumberFormat.UInt8LE, index * 3, red(colour))
        pixels.setNumber(NumberFormat.UInt8LE, index * 3 + 1, green(colour))
        pixels.setNumber(NumberFormat.UInt8LE, index * 3 + 2, blue(colour))
    }

    function readPixel(index: number): number {
        return rgb(
            pixels.getNumber(NumberFormat.UInt8LE, index * 3),
            pixels.getNumber(NumberFormat.UInt8LE, index * 3 + 1),
            pixels.getNumber(NumberFormat.UInt8LE, index * 3 + 2))
    }

    /** Set all five integrated BLiXels to one colour. */
    //% blockId=UNBdevBLiXel_set_all
    //% block="set all UNBdev.board BLiXels to $colour"
    //% colour.shadow="colorNumberPicker"
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=100 blockGap=8
    export function setAll(colour: number): void {
        colour &= 0xffffff
        selectedColour = colour
        for (let i = 0; i < PIXEL_COUNT; i++) writePixel(i, colour)

        const payload = pins.createBuffer(4)
        payload.setNumber(NumberFormat.UInt32LE, 0, colour)
        UNBdevBoard.sendBuffer(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.SetColour, payload, STRIP_BOARD, STRIP_PORT)
        show()
    }

    /** Set one integrated BLiXel to a colour. */
    //% blockId=UNBdevBLiXel_set_pixel
    //% block="set UNBdev.board BLiXel $index to $colour"
    //% colour.shadow="colorNumberPicker"
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=90 blockGap=8
    export function setPixel(index: UNBdevBLiXelIndex, colour: number): void {
        const pixel = Math.clamp(0, PIXEL_COUNT - 1, index)
        colour &= 0xffffff
        writePixel(pixel, colour)

        const payload = pins.createBuffer(5)
        payload.setNumber(NumberFormat.UInt32LE, 0, colour)
        payload.setNumber(NumberFormat.UInt8LE, 4, pixel)
        UNBdevBoard.sendBuffer(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.SetPixel, payload, STRIP_BOARD, STRIP_PORT)
        show()
    }

    /** Turn off all five integrated BLiXels. */
    //% blockId=UNBdevBLiXel_clear
    //% block="clear all UNBdev.board BLiXels"
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=80 blockGap=8
    export function clear(): void {
        pixels.fill(0)
        selectedColour = UNBdevBLiXelColour.Black
        UNBdevBoard.sendCommand(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.Clear, STRIP_BOARD, STRIP_PORT)
        show()
    }

    /** Set BLiXel brightness from 0 to 100 percent. */
    //% blockId=UNBdevBLiXel_set_brightness
    //% block="set UNBdev.board BLiXel brightness to $percent %"
    //% percent.min=0 percent.max=100 percent.defl=50
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=70 blockGap=8
    export function setBrightness(percent: number): void {
        brightness = Math.clamp(0, 255, Math.round(percent * 2.55))
        writeBuffer()
        UNBdevBoard.sendData(STRIP_PIN, UNBdevBoard.Module.BLiXel,
            FunctionId.SetBrightness, [brightness], STRIP_BOARD, STRIP_PORT)
        show()
    }

    /** Shift colours right, clearing newly exposed BLiXels. */
    //% blockId=UNBdevBLiXel_shift
    //% block="shift UNBdev.board BLiXels by $offset"
    //% offset.min=0 offset.max=5 offset.defl=1
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=60 blockGap=8
    export function shift(offset: number = 1): void {
        const amount = Math.clamp(0, PIXEL_COUNT, Math.round(offset))
        for (let i = PIXEL_COUNT - 1; i >= 0; i--) {
            writePixel(i, i >= amount ? readPixel(i - amount) : 0)
        }
        writeBuffer()
        show()
    }

    /** Rotate colours right, wrapping them around the five BLiXels. */
    //% blockId=UNBdevBLiXel_rotate
    //% block="rotate UNBdev.board BLiXels by $offset"
    //% offset.min=-5 offset.max=5 offset.defl=1
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=50 blockGap=8
    export function rotate(offset: number = 1): void {
        let amount = Math.round(offset) % PIXEL_COUNT
        if (amount < 0) amount += PIXEL_COUNT
        if (amount == 0) return

        const old = pins.createBuffer(pixels.length)
        old.write(0, pixels)
        for (let i = 0; i < PIXEL_COUNT; i++) {
            const source = (i - amount + PIXEL_COUNT) % PIXEL_COUNT
            pixels.setNumber(NumberFormat.UInt8LE, i * 3,
                old.getNumber(NumberFormat.UInt8LE, source * 3))
            pixels.setNumber(NumberFormat.UInt8LE, i * 3 + 1,
                old.getNumber(NumberFormat.UInt8LE, source * 3 + 1))
            pixels.setNumber(NumberFormat.UInt8LE, i * 3 + 2,
                old.getNumber(NumberFormat.UInt8LE, source * 3 + 2))
        }
        writeBuffer()
        show()
    }

    /** Display a five-step bar graph using the last selected colour. */
    //% blockId=UNBdevBLiXel_show_bar_graph
    //% block="show UNBdev.board BLiXel bar graph of $value with max $maximum ||min $minimum"
    //% minimum.defl=0 maximum.defl=100
    //% expandableArgumentMode="toggle"
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=40 blockGap=8
    export function showBarGraph(value: number, maximum: number,
        minimum: number = 0): void {
        const count = barGraphCount(value, maximum, minimum)
        const scaled = rgb(
            (red(selectedColour) * brightness) >> 8,
            (green(selectedColour) * brightness) >> 8,
            (blue(selectedColour) * brightness) >> 8)
        for (let i = 0; i < PIXEL_COUNT; i++) {
            writePixel(i, i < count ? scaled : 0)
        }
        writeBuffer()
        show()
    }

    /** Convert red, green and blue channels into a colour. */
    //% blockId=UNBdevBLiXel_rgb
    //% block="red $redValue green $greenValue blue $blueValue"
    //% redValue.min=0 redValue.max=255
    //% greenValue.min=0 greenValue.max=255
    //% blueValue.min=0 blueValue.max=255
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=30
    export function rgb(redValue: number, greenValue: number,
        blueValue: number): number {
        return ((redValue & 0xff) << 16) |
            ((greenValue & 0xff) << 8) | (blueValue & 0xff)
    }

    /** Convert hue, saturation and luminosity into a colour. */
    //% blockId=UNBdevBLiXel_hsl
    //% block="hue $h saturation $s luminosity $l"
    //% h.min=0 h.max=360 s.min=0 s.max=99 l.min=0 l.max=99
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=20
    export function hsl(h: number, s: number, l: number): number {
        h = ((Math.round(h) % 360) + 360) % 360
        s = Math.clamp(0, 99, Math.round(s))
        l = Math.clamp(0, 99, Math.round(l))
        const c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000)
        const sector = Math.idiv(h, 60)
        const fraction = Math.idiv((h - sector * 60) * 256, 60)
        const x = (c * (256 - Math.abs((((sector % 2) << 8) + fraction) - 256))) >> 8
        let r = 0
        let g = 0
        let b = 0
        if (sector == 0) { r = c; g = x }
        else if (sector == 1) { r = x; g = c }
        else if (sector == 2) { g = c; b = x }
        else if (sector == 3) { g = x; b = c }
        else if (sector == 4) { r = x; b = c }
        else { r = c; b = x }
        const m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2)
        return rgb(r + m, g + m, b + m)
    }

    /** Return a named BLiXel colour. */
    //% blockId=UNBdevBLiXel_colour
    //% block="$colour"
    //% blockNamespace=UNBDev subcategory="BLiXel"
    //% weight=10
    export function colour(colour: UNBdevBLiXelColour): number {
        return colour
    }

    // Pure helpers are hidden so protocol-independent behavior can be tested.
    //% blockHidden=true
    export function barGraphCount(value: number, maximum: number,
        minimum: number = 0): number {
        if (maximum <= minimum) return value >= maximum ? PIXEL_COUNT : 0
        const clamped = Math.clamp(minimum, maximum, value)
        return Math.clamp(0, PIXEL_COUNT,
            Math.round(PIXEL_COUNT * (clamped - minimum) / (maximum - minimum)))
    }

    //% blockHidden=true
    export function red(colour: number): number { return (colour >> 16) & 0xff }
    //% blockHidden=true
    export function green(colour: number): number { return (colour >> 8) & 0xff }
    //% blockHidden=true
    export function blue(colour: number): number { return colour & 0xff }
}
