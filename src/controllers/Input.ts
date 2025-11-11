import { Game } from '../game/Game';
import { CONTROLS } from '../utils/Globals';

export class Input
{
    private static commands?: { [command: string]: boolean };
    static lastKeyPressed?: string;
    static mouseMovementCallbacks: Array<(deltaX: number, deltaY: number) => void> = [];

    static init()
    {
        Input.commands = {
            [CONTROLS.FORWARD]: false,
            [CONTROLS.BACKWARD]: false,
            [CONTROLS.LEFT]: false,
            [CONTROLS.RIGHT]: false,
            [CONTROLS.HANDBRAKE]: false,
            [CONTROLS.BOOST]: false,
            [CONTROLS.CHANGE_CAMERA]: false,
            [CONTROLS.EXIT]: false,
            [CONTROLS.PAUSE]: false
        }
        Input.setupEventListeners();
    }

    private static setupEventListeners(): void
    {
        window.addEventListener('keydown', (e) =>
        {
            if (Input.commands && e.code in Input.commands)
            {
                Input.commands[e.code] = true;
            }

            Input.lastKeyPressed = e.code;
        });

        window.addEventListener('keyup', (e) =>
        {
            if (Input.commands && e.code in Input.commands)
            {
                Input.commands[e.code] = false;
            }
        });

        window.addEventListener('mousedown', (e) =>
        {
            if (Input.commands && `Mouse${e.button}` in Input.commands)
            {
                Input.commands[`Mouse${e.button}`] = true;
            }

            Input.lastKeyPressed = `Mouse${e.button}`;

            if (document.pointerLockElement !== document.body && e.button === 0 && Game.state === 'running')
            {
                document.body.requestPointerLock();
            }
        });

        window.addEventListener('mouseup', (e) =>
        {
            if (Input.commands && `Mouse${e.button}` in Input.commands)
            {
                Input.commands[`Mouse${e.button}`] = false;
            }
        });

        window.addEventListener('contextmenu', (e) =>
        {
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) =>
        {
            Input.mouseMovementCallbacks.forEach(callback =>
            {
                callback(e.movementX, e.movementY);
            });
        });
    }

    static isCommandPressed(command: string): boolean
    {
        if (Input.commands && command in Input.commands)
        {
            return Input.commands[command];
        }
        return false;
    }

    static unsetCommand(command: string): void
    {
        if (Input.commands && command in Input.commands)
        {
            Input.commands[command] = false;
        }
    }

    static lockPointer(): void
    {
        if (document.pointerLockElement !== document.body)
        {
            document.body.requestPointerLock();
        }
    }

    static unlockPointer(): void
    {
        if (document.pointerLockElement === document.body)
        {
            document.exitPointerLock();
        }
    }
}
