/**
 * Timing shared by the modal's motion, so its parts move together and settle softly. Changes
 * inside the sheet start gently and ease out (`EASE_STANDARD`); the sheet itself comes in along
 * the curve of the Telegram sheets (`EASE_SHEET`).
 */
export const EASE_STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const EASE_SHEET = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** How long the sheet takes to grow or shrink to new content, and the crossfade that goes with it. */
export const RESIZE_DURATION = 420;

/** The press and hover scale of buttons and tiles. */
export const PRESS_TRANSITION = `transform 0.2s ${EASE_STANDARD}`;
