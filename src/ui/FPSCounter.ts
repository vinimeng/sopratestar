import Stats from 'three/examples/jsm/libs/stats.module.js';

export class FPSCounter
{
    private stats: Stats;
    private appended: boolean = false;

    constructor(showPanel = 0)
    {
        this.stats = new Stats();
        this.stats.showPanel(showPanel); // 0: fps, 1: ms, 2: mb
    }

    append(): void
    {
        document.body.appendChild(this.stats.dom);
        this.appended = true;
    }

    destroy(): void
    {
        this.stats.end();

        if (this.stats.dom.parentElement)
        {
            this.stats.dom.parentElement.removeChild(this.stats.dom);
        }

        this.appended = false;
    }

    begin(): void
    {
        this.stats.begin();
    }

    end(): void
    {
        this.stats.end();
    }

    isAppended(): boolean
    {
        return this.appended;
    }
}
