import { FPSCounter } from "../ui/FPSCounter";
import { Configuration } from "../utils/Configuration";
import { Game } from "./Game";

export class GameLoop
{
    static isRunning = false;
    static lastTime = 0;
    static animationFrameId: number | null = null;

    static start(): void
    {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    static loop = (): void =>
    {
        if (!this.isRunning) return;

        // Gerenciar anexação/remoção do FPS Counter
        if (Configuration.FPS_COUNTER && !FPSCounter.isAppended)
        {
            FPSCounter.append();
        }
        else if (!Configuration.FPS_COUNTER && FPSCounter.isAppended)
        {
            FPSCounter.destroy();
        }

        // Medir performance se habilitado
        if (Configuration.FPS_COUNTER)
        {
            FPSCounter.begin();
        }

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // em segundos
        this.lastTime = currentTime;

        Game.update(deltaTime);
        Game.render();

        if (Configuration.FPS_COUNTER)
        {
            FPSCounter.end();
        }

        this.animationFrameId = requestAnimationFrame(this.loop);
    };

    static stop(): void
    {
        this.isRunning = false;
        if (this.animationFrameId !== null)
        {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
