declare global
{
    interface Window
    {
        GLOBALS: {
            GAME_TITLE: string;
            VERSION: string;
            CONTROLS: {
                FORWARD: string;
                BACKWARD: string;
                LEFT: string;
                RIGHT: string;
                HANDBRAKE: string;
                BOOST: string;
                CHANGE_CAMERA: string;
                EXIT: string;
                PAUSE: string;
            };
            CONFIG: {
                CAMERA_TYPE: CameraType;
                FOV: number;
                MOUSE_SENSITIVITY: number;
            };
            TIME: {
                HOURS: number;
                MINUTES: number;
            }
        }
    }
}

export type CameraType = 'ThirdPerson' | 'FirstPerson' | 'FreeCamera';
