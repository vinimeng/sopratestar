import { FPSCounter } from "../ui/FPSCounter";
import { Game } from "./Game";

export class GameLoop
{
    private isRunning = false;
    private lastTime = 0;
    private animationFrameId: number | null = null;
    private updateCallback: (deltaTime: number) => void;
    private renderCallback: () => void;
    private FPSCounter: FPSCounter;

    constructor(
        updateCallback: (deltaTime: number) => void,
        renderCallback: () => void
    ) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.FPSCounter = new FPSCounter();

        if (Game.GLOBAL_CONFIGURATION.FPSCounter)
        {
            this.FPSCounter.append();
        }
    }

    start(): void
    {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    private loop = (): void =>
    {
        if (!this.isRunning) return;

        if (Game.GLOBAL_CONFIGURATION.FPSCounter)
        {
            this.FPSCounter.begin();
        }

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // em segundos
        this.lastTime = currentTime;

        this.updateCallback(deltaTime);
        this.renderCallback();

        if (Game.GLOBAL_CONFIGURATION.FPSCounter)
        {
            this.FPSCounter.end();
        }
        else if (!Game.GLOBAL_CONFIGURATION.FPSCounter && this.FPSCounter.isAppended())
        {
            this.FPSCounter.destroy();
        }

        this.animationFrameId = requestAnimationFrame(this.loop);
    };

    stop(): void
    {
        this.isRunning = false;
        if (this.animationFrameId !== null)
        {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
