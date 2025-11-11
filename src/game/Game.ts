import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Camera } from '../entities/Camera';
import { CONTROLS } from '../utils/Globals';
import { Input } from '../controllers/Input';

export class Game
{
    static state: 'running' | 'paused' = 'running';
    static seconds: number = 0;

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
        if (Game.state === 'running' && Input.isCommandPressed(CONTROLS.PAUSE))
        {
            Game.state = 'paused';
            Game.pause();
            Input.unsetCommand(CONTROLS.PAUSE);
            Input.unlockPointer();
        }
        else if (Game.state === 'paused' && Input.isCommandPressed(CONTROLS.PAUSE))
        {
            Game.state = 'running';
            Game.resume();
            Input.unsetCommand(CONTROLS.PAUSE);
            Input.lockPointer();
        }
        else if (Game.state === 'running')
        {
            Camera.update(deltaTime);
            PhysicsWorld.step(deltaTime);
            Game.seconds += deltaTime;
            if (Game.seconds >= 3600)
            {
                Game.seconds = 0;
            }
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
