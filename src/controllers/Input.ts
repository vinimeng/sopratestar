import { Game } from '../game/Game';

export class Input
{
    private static commands?: { [command: string]: boolean };
    static lastKeyPressed?: string;
    static mouseMovementCallbacks: Array<(deltaX: number, deltaY: number) => void> = [];

    static init()
    {
        Input.commands = {
            [window.GLOBALS.CONTROLS.FORWARD]: false,
            [window.GLOBALS.CONTROLS.BACKWARD]: false,
            [window.GLOBALS.CONTROLS.LEFT]: false,
            [window.GLOBALS.CONTROLS.RIGHT]: false,
            [window.GLOBALS.CONTROLS.HANDBRAKE]: false,
            [window.GLOBALS.CONTROLS.BOOST]: false,
            [window.GLOBALS.CONTROLS.CHANGE_CAMERA]: false,
            [window.GLOBALS.CONTROLS.EXIT]: false,
            [window.GLOBALS.CONTROLS.PAUSE]: false
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
            if (document.pointerLockElement !== document.body) return;

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
