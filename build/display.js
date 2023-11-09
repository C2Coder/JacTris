import { SmartLed, LED_WS2812 } from "smartled";
import * as pins from "./pin_config.js";
import * as gpio from "gpio";
export const width = 10;
export const height = 10;
const strip = new SmartLed(pins.LED_DISPLAY_PIN, width * height, LED_WS2812);
// enable power to leds
gpio.pinMode(pins.LED_PWR_EN, gpio.PinMode.OUTPUT);
gpio.write(pins.LED_PWR_EN, 1);
// clear the leds
// strip.clear();
// strip.show();
export function xy_to_index(x, y) {
    return y * width + x;
}
export function setColor(x, y, color) {
    strip.set(xy_to_index(x, y), color);
}
export function show() {
    strip.show();
}
export function clear() {
    strip.clear();
}
export function at(x, y) {
    return strip.get(xy_to_index(x, y));
}
