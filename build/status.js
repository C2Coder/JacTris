import { SmartLed, LED_WS2812 } from "smartled";
import * as pins from "./pin_config.js";
const count = 5;
const strip = new SmartLed(pins.LED_DISPLAY_PIN, count, LED_WS2812);
// enable power to leds
//gpio.pinMode(pins.LED_PWR_EN, gpio.PinMode.OUTPUT);
//gpio.write(pins.LED_PWR_EN, 0);
// clear the leds
strip.clear();
strip.show();
export function setColor(index, color) {
    if (index < 0) {
        console.error("wrong status index");
        return;
    }
    if (index >= count) {
        console.error("wrong status index");
        return;
    }
    strip.set(index, color);
}
export function show() {
    strip.show();
}
export function clear() {
    strip.clear();
}
export function at(index) {
    return strip.get(index);
}
