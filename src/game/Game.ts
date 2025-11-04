import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Game
{
    static async init(canvas: HTMLCanvasElement): Promise<void>
    {
        try
        {
            // Inicializar física
            await PhysicsWorld.init();

            // Inicializar renderizador
            Renderer.init(canvas);

            GameLoop.start();
        }
        catch (error)
        {
            console.error('Error loading game:', error);
        }
    }

    static update(deltaTime: number): void
    {
        PhysicsWorld.step(deltaTime);
    }

    static render(): void
    {
        Renderer.render();
    }

    static pause(): void
    {
        GameLoop.stop();
    }

    static resume(): void
    {
        GameLoop.start();
    }
}
