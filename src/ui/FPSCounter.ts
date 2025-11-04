import Stats from 'three/examples/jsm/libs/stats.module.js';

export class FPSCounter
{
    private static stats: Stats | null = null;
    static isAppended: boolean = false;

    static append(showPanel = 0): void
    {
        FPSCounter.stats = new Stats();
        FPSCounter.stats.showPanel(showPanel); // 0: fps, 1: ms, 2: mb
        document.body.appendChild(FPSCounter.stats.dom);
        FPSCounter.isAppended = true;
    }

    static destroy(): void
    {
        if (!FPSCounter.stats) return;

        FPSCounter.stats.end();

        if (FPSCounter.stats.dom.parentElement)
        {
            FPSCounter.stats.dom.parentElement.removeChild(FPSCounter.stats.dom);
        }

        FPSCounter.stats = null;

        FPSCounter.isAppended = false;
    }

    static begin(): void
    {
        if (!FPSCounter.stats) return;

        FPSCounter.stats.begin();
    }

    static end(): void
    {
        if (!FPSCounter.stats) return;

        FPSCounter.stats.end();
    }
}
