import type { CameraType } from "../types";

export const GAME_TITLE = 'SOPRATESTAR';
export const VERSION = '1.0.0';
export const CONTROLS = {
    FORWARD: 'KeyW',
    BACKWARD: 'KeyS',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    HANDBRAKE: 'Space',
    BOOST: 'ShiftLeft',
    CHANGE_CAMERA: 'KeyC',
    EXIT: 'Escape',
    PAUSE: 'KeyP'
}

export const CONFIG = {
    CAMERA_TYPE: 'FreeCamera' as CameraType,
    FOV: 90,
    MOUSE_SENSITIVITY: 0.002,
}
