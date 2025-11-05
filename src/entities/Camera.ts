import * as THREE from 'three';
import { CONFIG, CONTROLS } from '../utils/Constants';
import type { CameraType } from '../types';

export class Camera
{
    static camera: THREE.PerspectiveCamera;
    static target?: THREE.Object3D;
    static smoothness?: number;
    static offset?: THREE.Vector3;
    static speed?: number;
    static velocity?: THREE.Vector3;
    static pitch?: number;
    static yaw?: number;
    static keys?: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        up: boolean;
        down: boolean;
    };
    static currentCameraMode: CameraType;

    static init(): void
    {
        Camera.currentCameraMode = CONFIG.CAMERA_TYPE;
        Camera.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight);
        if (CONFIG.CAMERA_TYPE === 'FreeCamera')
        {
            Camera.initFreeCamera();
        }
        else if (CONFIG.CAMERA_TYPE === 'FirstPerson')
        {
            Camera.initFirstPersonCamera();
        }
        else if (CONFIG.CAMERA_TYPE === 'ThirdPerson')
        {
            Camera.initThirdPersonCamera();
        }
    }

    private static initControls(): void
    {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private static removeControls(): void
    {
        document.removeEventListener('keydown', (event) => this.onKeyDown(event));
        document.removeEventListener('keyup', (event) => this.onKeyUp(event));
        document.removeEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    private static onKeyDown(event: KeyboardEvent): void
    {
        if (!this.keys || CONFIG.CAMERA_TYPE !== 'FreeCamera') return;

        switch (event.code)
        {
            case CONTROLS.FORWARD: this.keys.forward = true; break;
            case CONTROLS.BACKWARD: this.keys.backward = true; break;
            case CONTROLS.LEFT: this.keys.left = true; break;
            case CONTROLS.RIGHT: this.keys.right = true; break;
            case CONTROLS.HANDBRAKE: this.keys.up = true; break;
            case CONTROLS.BOOST: this.keys.down = true; break;
        }
    }

    private static onKeyUp(event: KeyboardEvent): void
    {
        if (!this.keys || CONFIG.CAMERA_TYPE !== 'FreeCamera') return;

        switch (event.code)
        {
            case CONTROLS.FORWARD: this.keys.forward = false; break;
            case CONTROLS.BACKWARD: this.keys.backward = false; break;
            case CONTROLS.LEFT: this.keys.left = false; break;
            case CONTROLS.RIGHT: this.keys.right = false; break;
            case CONTROLS.HANDBRAKE: this.keys.up = false; break;
            case CONTROLS.BOOST: this.keys.down = false; break;
        }
    }

    private static initFreeCamera(): void
    {
        Camera.yaw = 0;
        Camera.pitch = 0;
        Camera.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };
        Camera.velocity = new THREE.Vector3();
        Camera.speed = 10;
        this.initControls();
    }

    private static destroyFreeCamera(): void
    {
        this.removeControls();
        Camera.yaw = undefined;
        Camera.pitch = undefined;
        Camera.keys = undefined;
        Camera.velocity = undefined;
        Camera.speed = undefined;
    }

    private static initFirstPersonCamera(): void
    {
        Camera.offset = new THREE.Vector3(0, 1.8, 0); // Altura dos olhos
        Camera.smoothness = 5; // Valor de suavidade
    }

    private static destroyFirstPersonCamera(): void
    {
        Camera.offset = undefined;
        Camera.smoothness = undefined;
    }

    private static initThirdPersonCamera(): void
    {
        Camera.offset = new THREE.Vector3(0, 3, -6); // Posição atrás e acima do alvo
        Camera.smoothness = 5; // Valor de suavidade
    }

    private static destroyThirdPersonCamera(): void
    {
        Camera.offset = undefined;
        Camera.smoothness = undefined;
    }

    static onMouseMove(event: MouseEvent): void
    {
        if (CONFIG.CAMERA_TYPE !== 'FreeCamera' || Camera.yaw === undefined || Camera.pitch === undefined) return;

        Camera.yaw -= event.movementX * CONFIG.MOUSE_SENSITIVITY;
        Camera.pitch -= event.movementY * CONFIG.MOUSE_SENSITIVITY;
        Camera.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Camera.pitch));
    }

    static update(deltaTime: number): void
    {
        if (Camera.currentCameraMode !== CONFIG.CAMERA_TYPE)
        {
            if (Camera.currentCameraMode === 'FreeCamera')
            {
                Camera.destroyFreeCamera();
            }
            else if (Camera.currentCameraMode === 'FirstPerson')
            {
                Camera.destroyFirstPersonCamera();
            }
            else if (Camera.currentCameraMode === 'ThirdPerson')
            {
                Camera.destroyThirdPersonCamera();
            }

            if (CONFIG.CAMERA_TYPE === 'FreeCamera')
            {
                Camera.initFreeCamera();
            }
            else if (CONFIG.CAMERA_TYPE === 'FirstPerson')
            {
                Camera.initFirstPersonCamera();
            }
            else if (CONFIG.CAMERA_TYPE === 'ThirdPerson')
            {
                Camera.initThirdPersonCamera();
            }

            Camera.currentCameraMode = CONFIG.CAMERA_TYPE;
        }

        if (Camera.currentCameraMode === 'FreeCamera' && Camera.keys !== undefined && Camera.yaw !== undefined && Camera.pitch !== undefined && Camera.velocity !== undefined && Camera.speed !== undefined)
        {
            Camera.camera.rotation.set(Camera.pitch, Camera.yaw, 0);

            // Calcular movimento
            Camera.velocity.set(0, 0, 0);

            if (Camera.keys.forward) Camera.velocity.z -= 1;
            if (Camera.keys.backward) Camera.velocity.z += 1;
            if (Camera.keys.left) Camera.velocity.x -= 1;
            if (Camera.keys.right) Camera.velocity.x += 1;
            if (Camera.keys.up) Camera.velocity.y += 1;
            if (Camera.keys.down) Camera.velocity.y -= 1;

            // Normalizar e aplicar velocidade
            if (Camera.velocity.length() > 0)
            {
                Camera.velocity.normalize();
                Camera.velocity.multiplyScalar(Camera.speed * deltaTime);

                // Aplicar rotação da câmera ao movimento
                Camera.velocity.applyQuaternion(Camera.camera.quaternion);
                Camera.camera.position.add(Camera.velocity);
            }
        }
        else if (Camera.currentCameraMode === 'FirstPerson' && Camera.target !== undefined && Camera.offset !== undefined)
        {
            const cameraPosition = new THREE.Vector3();
            cameraPosition.copy(Camera.target.position);
            cameraPosition.add(Camera.offset);

            Camera.camera.position.copy(cameraPosition);

            // Rotação baseada na rotação do target
            Camera.camera.rotation.copy(Camera.target.rotation);
        }
        else if (Camera.currentCameraMode === 'ThirdPerson' && Camera.target !== undefined && Camera.offset !== undefined && Camera.smoothness !== undefined)
        {
            const desiredPosition = new THREE.Vector3();
            desiredPosition.copy(Camera.target.position);
            desiredPosition.add(Camera.offset);

            // Interpolação suave
            Camera.camera.position.lerp(desiredPosition, deltaTime * Camera.smoothness);
            Camera.camera.lookAt(Camera.target.position);
        }
    }

    static setTarget(target: THREE.Object3D): void
    {
        Camera.target = target;
    }

    static setPosition(x: number, y: number, z: number): void
    {
        Camera.camera.position.set(x, y, z);
    }

    setOffset(x: number, y: number, z: number): void
    {
        if (!Camera.offset) return;
        Camera.offset.set(x, y, z);
    }

    static lookAt(x: number, y: number, z: number): void
    {
        Camera.camera.lookAt(x, y, z);
    }

    static onResize(): void
    {
        Camera.camera.aspect = window.innerWidth / window.innerHeight;
        Camera.camera.updateProjectionMatrix();
    }
}
