import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Camera } from '../entities/Camera';
import { Input } from '../controllers/Input';

export class Game
{
    static state: 'running' | 'paused' = 'running';

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

            Input.init();
        }
        catch (error)
        {
            console.error('Error loading game:', error);
        }
    }

    static update(deltaTime: number): void
    {
        if (Game.state === 'running' && Input.isCommandPressed(window.GLOBALS.CONTROLS.PAUSE))
        {
            Game.state = 'paused';
            Game.pause();
            Input.unsetCommand(window.GLOBALS.CONTROLS.PAUSE);
            Input.unlockPointer();
        }
        else if (Game.state === 'paused' && Input.isCommandPressed(window.GLOBALS.CONTROLS.PAUSE))
        {
            Game.state = 'running';
            Game.resume();
            Input.unsetCommand(window.GLOBALS.CONTROLS.PAUSE);
            Input.lockPointer();
        }
        else if (Game.state === 'running')
        {
            Camera.update(deltaTime);
            PhysicsWorld.step(deltaTime);
            window.GLOBALS.DATETIME = new Date(window.GLOBALS.DATETIME.getTime() + (window.GLOBALS.TIMESCALE * 60) / 60 * deltaTime * 60 * 1000);
            Renderer.skybox.update(window.GLOBALS.DATETIME, deltaTime, Camera.camera.position, Camera.camera);
            Renderer.clouds.update(deltaTime, Camera.camera.position);
        }
    }

    static render(): void
    {
        Renderer.render();
    }

    static pause(): void
    {
        console.log('Game paused');
    }

    static resume(): void
    {
        console.log('Game resumed');
    }
}
