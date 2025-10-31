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

    isKeyPressed(key: string): boolean
    {
        return this.keys[key.toLowerCase()] || false;
    }
}
