import { CONTROLS } from '../utils/Globals';

export class Input
{
    private static keys?: { [key: string]: boolean };

    static init()
    {
        Input.keys = {
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
        window.addEventListener('keydown', (e) => {
            Input.keys![e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            Input.keys![e.code] = false;
        });

        window.addEventListener('click', () => {

        });

        window.addEventListener('contextmenu', () => {

        });
    }

    static isKeyPressed(key: string): boolean
    {
        return Input.keys![key] || false;
    }
}
