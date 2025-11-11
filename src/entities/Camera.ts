import * as THREE from 'three';
import { CONFIG, CONTROLS } from '../utils/Globals';
import type { CameraType } from '../types';
import { Input } from '../controllers/Input';

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
    static currentCameraMode: CameraType;

    static init(): void
    {
        Camera.currentCameraMode = CONFIG.CAMERA_TYPE;
        Camera.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight);
        if (CONFIG.CAMERA_TYPE === 'FreeCamera')
        {
            Camera.initFreeCamera();
        }
        else if (CONFIG.CAMERA_TYPE === 'ThirdPerson')
        {
            Camera.initThirdPersonCamera();
        }
    }

    private static initFreeCamera(): void
    {
        Camera.yaw = 0;
        Camera.pitch = 0;
        Camera.velocity = new THREE.Vector3();
        Camera.speed = 10;
        Camera.camera.position.set(0, 20, 75);
        Input.mouseMovementCallbacks.push(Camera.onMouseMove);
    }

    private static destroyFreeCamera(): void
    {
        Camera.yaw = undefined;
        Camera.pitch = undefined;
        Camera.velocity = undefined;
        Camera.speed = undefined;
        Input.mouseMovementCallbacks = Input.mouseMovementCallbacks.filter(cb => cb !== Camera.onMouseMove);
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

    static onMouseMove(deltaX: number, deltaY: number): void
    {
        if (CONFIG.CAMERA_TYPE !== 'FreeCamera' || Camera.yaw === undefined || Camera.pitch === undefined) return;

        Camera.yaw -= deltaX * CONFIG.MOUSE_SENSITIVITY;
        Camera.pitch -= deltaY * CONFIG.MOUSE_SENSITIVITY;
        Camera.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Camera.pitch));
    }

    static update(deltaTime: number): void
    {
        if (Input.isCommandPressed(CONTROLS.CHANGE_CAMERA))
        {
            Input.unsetCommand(CONTROLS.CHANGE_CAMERA);

            CONFIG.CAMERA_TYPE = CONFIG.CAMERA_TYPE === 'FreeCamera' ? 'ThirdPerson' : 'FreeCamera';

            if (Camera.currentCameraMode === 'FreeCamera')
            {
                Camera.destroyFreeCamera();
                Camera.initThirdPersonCamera();
            }
            else if (Camera.currentCameraMode === 'ThirdPerson')
            {
                Camera.destroyThirdPersonCamera();
                Camera.initFreeCamera();
            }

            Camera.currentCameraMode = CONFIG.CAMERA_TYPE;
        }

        if (Camera.camera.fov !== CONFIG.FOV)
        {
            Camera.camera.fov = CONFIG.FOV;
            Camera.camera.updateProjectionMatrix();
        }

        if (Camera.currentCameraMode === 'FreeCamera' && Camera.yaw !== undefined && Camera.pitch !== undefined && Camera.velocity !== undefined && Camera.speed !== undefined)
        {
            Camera.camera.rotation.set(Camera.pitch, Camera.yaw, 0);

            // Calcular movimento
            Camera.velocity.set(0, 0, 0);

            if (Input.isCommandPressed(CONTROLS.FORWARD)) Camera.velocity.z -= 1;
            if (Input.isCommandPressed(CONTROLS.BACKWARD)) Camera.velocity.z += 1;
            if (Input.isCommandPressed(CONTROLS.LEFT)) Camera.velocity.x -= 1;
            if (Input.isCommandPressed(CONTROLS.RIGHT)) Camera.velocity.x += 1;
            if (Input.isCommandPressed(CONTROLS.BOOST)) Camera.velocity.y += 1;
            if (Input.isCommandPressed(CONTROLS.HANDBRAKE)) Camera.velocity.y -= 1;

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

    static setOffset(x: number, y: number, z: number): void
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
