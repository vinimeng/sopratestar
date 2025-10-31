import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
// import { InputController } from '../controllers/InputController';
import { LoadingScreen } from '../ui/LoadingScreen';

export class Game
{
    static GLOBAL_CONFIGURATION = {
        FPSCounter: true
    };
    private renderer: Renderer;
    private physics: PhysicsWorld;
    private gameLoop: GameLoop;
    // private inputController: InputController;

    constructor(canvas: HTMLCanvasElement)
    {
        this.renderer = new Renderer(canvas);
        this.physics = new PhysicsWorld();
        // this.inputController = new InputController();
        this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
    }

    async init(): Promise<void>
    {
        const loadingScreen = new LoadingScreen();

        try
        {
            // Inicializar física
            await this.physics.initialize();

            // Esconder tela de loading
            loadingScreen.hide();

            this.gameLoop.start();
        }
        catch (error)
        {
            console.error('Error loading game:', error);
        }
    }

    private update(deltaTime: number): void
    {
        this.physics.step(deltaTime);
    }

    private render(): void
    {
        this.renderer.render();
    }

    pause(): void
    {
        this.gameLoop.stop();
    }

    resume(): void
    {
        this.gameLoop.start();
    }
}
