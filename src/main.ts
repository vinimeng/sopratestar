import './style.css';
import { Game } from './game/Game';
import type { CameraType } from './types';

// Inicializa o jogo quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () =>
{
    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.getElementById('app')?.appendChild(canvas);

    window.GLOBALS = {
        GAME_TITLE: 'SOPRATESTAR',
        VERSION: '1.0.0',
        CONTROLS: {
            FORWARD: 'KeyW',
            BACKWARD: 'KeyS',
            LEFT: 'KeyA',
            RIGHT: 'KeyD',
            HANDBRAKE: 'Space',
            BOOST: 'ShiftLeft',
            CHANGE_CAMERA: 'KeyC',
            EXIT: 'Escape',
            PAUSE: 'KeyP'
        },
        CONFIG: {
            CAMERA_TYPE: 'FreeCamera' as CameraType,
            FOV: 90,
            MOUSE_SENSITIVITY: 0.002,
        },
        TIME: {
            HOURS: 9,
            MINUTES: 30,
        }
    }

    Game.init(canvas);
});
