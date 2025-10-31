import { GAME_TITLE } from "../utils/Constants";

export class LoadingScreen
{
    private container: HTMLDivElement;
    private progressBar: HTMLDivElement;
    private progressText: HTMLDivElement;

    constructor()
    {
        this.container = document.createElement('div');
        this.container.id = 'loading-screen';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: 'Arial', sans-serif;
        `;

        const title = document.createElement('h1');
        title.textContent = GAME_TITLE;
        title.style.cssText = `
            color: white;
            font-size: 48px;
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;

        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            height: 30px;
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
            border-radius: 15px;
        `;

        this.progressText = document.createElement('div');
        this.progressText.textContent = '0%';
        this.progressText.style.cssText = `
            color: white;
            font-size: 20px;
            margin-top: 20px;
            font-weight: bold;
        `;

        progressContainer.appendChild(this.progressBar);
        this.container.appendChild(title);
        this.container.appendChild(progressContainer);
        this.container.appendChild(this.progressText);

        document.body.appendChild(this.container);
    }

    updateProgress(progress: number): void
    {
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}%`;
    }

    hide(): void
    {
        this.container.style.opacity = '1';
        this.container.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.container.remove();
            }, 500);
        }, 200);
    }
}
