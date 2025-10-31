export class InputController
{
    private keys: { [key: string]: boolean } = {};

    constructor()
    {
        this.setupEventListeners();
    }

    private setupEventListeners(): void
    {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    getInput(): { throttle: number; brake: number; steering: number }
    {
        let throttle = 0;
        let brake = 0;
        let steering = 0;

        // WASD ou Arrow keys
        if (this.keys['w'] || this.keys['arrowup']) throttle = 1;
        if (this.keys['s'] || this.keys['arrowdown']) brake = 1;
        if (this.keys['a'] || this.keys['arrowleft']) steering = -1;
        if (this.keys['d'] || this.keys['arrowright']) steering = 1;

        return { throttle, brake, steering };
    }

    isKeyPressed(key: string): boolean
    {
        return this.keys[key.toLowerCase()] || false;
    }
}
