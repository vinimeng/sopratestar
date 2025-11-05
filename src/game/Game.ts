import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Camera } from '../entities/Camera';

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

            Camera.init();

            GameLoop.start();
        }
        catch (error)
        {
            console.error('Error loading game:', error);
        }
    }

    static update(deltaTime: number): void
    {
        Camera.update(deltaTime);
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
