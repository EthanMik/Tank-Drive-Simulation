import { scale, canvasWidth_px, kPX, fieldWidth_in } from './globals.ts';

export function to_px(inches: number) { return inches / ((canvasWidth_px / scale) / (fieldWidth_in * scale)) * kPX; }
export function to_pxx(inches: number) { return to_px(inches + 72); }
export function to_pxy(inches: number) { return to_px(72 - inches); }
export function to_inertial_rad(deg: number) { return ((deg - 90) * (Math.PI / 180)); }
export function to_rad(deg: number) { return deg * Math.PI / 180; }
export function to_deg(rad: number) { return (rad * 180 / Math.PI); }
export function to_in(px: number) { return px * ((canvasWidth_px / scale) / (fieldWidth_in * scale)) / kPX; }
export function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
export function reduce_0_360(angle: number) { return ((angle % 360) + 360) % 360; }

export function loadImage(src: string) {
    var img = new Image();
    img.src = src;
    return img;
}