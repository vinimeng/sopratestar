import { GameLoop } from './GameLoop';
import { Renderer } from '../renderer/Renderer';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Vehicle } from '../entities/Vehicle';
import { Track } from '../entities/Track';
import { InputController } from '../controllers/InputController';
import * as THREE from 'three';

export class Game
{
    private renderer: Renderer;
    private physics: PhysicsWorld;
    private gameLoop: GameLoop;
    private vehicle: Vehicle | null = null;
    private track: Track | null = null;
    private inputController: InputController;

    constructor(canvas: HTMLCanvasElement)
    {
        this.renderer = new Renderer(canvas);
        this.physics = new PhysicsWorld();
        this.inputController = new InputController();
        this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
    }

    async start(): Promise<void>
    {
        await this.physics.initialize();

        const world = this.physics.getWorld();
        if (world)
        {
            // Criar pista
            this.track = new Track(this.renderer.getScene(), world);

            // Criar veículo na posição inicial da pista
            const startPos = this.track.getStartPosition();
            this.vehicle = new Vehicle(
                this.renderer.getScene(),
                world,
                startPos
            );

            // Rotacionar veículo para alinhar com a pista
            const startRotation = this.track.getStartRotation();
            const rigidBody = this.vehicle.getRigidBody();

            // Definir rotação inicial do corpo físico
            const quat = new THREE.Quaternion();
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), startRotation);
            rigidBody.setRotation(
                { w: quat.w, x: quat.x, y: quat.y, z: quat.z },
                true
            );
        }

        console.log('Game initialized - Use WASD or Arrow keys to drive!');
        console.log('W/↑ - Accelerate | S/↓ - Brake/Reverse | A/← D/→ - Steer');
        this.gameLoop.start();
    }

    private update(deltaTime: number): void
    {
        this.physics.step(deltaTime);

        if (this.vehicle)
        {
            const input = this.inputController.getInput();
            this.vehicle.update(deltaTime, input);
            this.updateCamera();
        }
    }

    private updateCamera(): void
    {
        if (!this.vehicle) return;

        const camera = this.renderer.getCamera() as THREE.PerspectiveCamera;
        const vehiclePos = this.vehicle.getPosition();

        // Posição da câmera atrás e acima do veículo
        const cameraOffset = new THREE.Vector3(0, 5, -12);
        const vehicleRotation = this.vehicle.getChassis().quaternion;
        cameraOffset.applyQuaternion(vehicleRotation);

        const targetPos = vehiclePos.clone().add(cameraOffset);
        const lookAtTarget = vehiclePos.clone().add(new THREE.Vector3(0, 1, 0));

        // Suavizar movimento da câmera
        camera.position.lerp(targetPos, 0.1);

        // Olhar ligeiramente à frente do veículo
        const currentLookAt = new THREE.Vector3();
        camera.getWorldDirection(currentLookAt);
        currentLookAt.multiplyScalar(10).add(camera.position);
        currentLookAt.lerp(lookAtTarget, 0.1);

        camera.lookAt(lookAtTarget);
    }

    private render(): void
    {
        this.renderer.render();
    }

    stop(): void
    {
        this.gameLoop.stop();
    }
}
