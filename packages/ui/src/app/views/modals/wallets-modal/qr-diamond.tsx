import { Component } from 'solid-js';
import { Diamond } from 'src/app/components';

// The model leaves room around the diamond, so its box is larger than the space cleared in the code
const QR_DIAMOND_SIZE = 75;
// Small in the code, it swells more than the large one while pressed
const QR_DIAMOND_PRESS_SCALE = 2.75;

/** The diamond in the middle of the universal QR code. */
export const QrDiamond: Component = () => (
    <Diamond size={QR_DIAMOND_SIZE} pressScale={QR_DIAMOND_PRESS_SCALE} />
);
