import * as THREE from 'three';
import { Camera } from '../entities/Camera';
import { SkyBox } from './SkyBox';

export class Renderer
{
    static scene: THREE.Scene;
    static renderer: THREE.WebGLRenderer;

    static init(canvas: HTMLCanvasElement)
    {
        Renderer.scene = new THREE.Scene();
        SkyBox.init();

        Renderer.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        Renderer.renderer.setSize(window.innerWidth, window.innerHeight);
        Renderer.renderer.shadowMap.enabled = true;
        Renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        Renderer.setupLights();
        Renderer.setupEnvironment();

        window.addEventListener('resize', Renderer.onResize);
    }

    static setupLights(): void
    {
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        // Renderer.scene.add(ambientLight);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // directionalLight.position.set(50, 100, 50);
        // directionalLight.castShadow = true;

        // directionalLight.shadow.camera.left = -100;
        // directionalLight.shadow.camera.right = 100;
        // directionalLight.shadow.camera.top = 100;
        // directionalLight.shadow.camera.bottom = -100;
        // directionalLight.shadow.camera.near = 0.5;
        // directionalLight.shadow.camera.far = 500;
        // directionalLight.shadow.mapSize.width = 2048;
        // directionalLight.shadow.mapSize.height = 2048;

        // Renderer.scene.add(directionalLight);

        // Luz hemisférica para iluminação ambiente mais natural
        // const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.4);
        // Renderer.scene.add(hemiLight);
    }

    static setupEnvironment(): void
    {
        // Chão grande ao redor da pista
        // const groundGeometry = new THREE.PlaneGeometry(500, 500);
        // const groundMaterial = new THREE.MeshStandardMaterial({
        //     color: 0x228b22,
        //     roughness: 0.9
        // });
        // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        // ground.rotation.x = -Math.PI / 2;
        // ground.receiveShadow = true;
        // ground.position.y = -0.1;
        // Renderer.scene.add(ground);

        // Grid helper para referência
        const gridHelper = new THREE.GridHelper(500, 50, 0x888888, 0x444444);
        gridHelper.position.y = -0.09;
        Renderer.scene.add(gridHelper);
    }

    static onResize(): void
    {
        if (Camera.camera)
        {
            Camera.onResize();
        }

        Renderer.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    static render(): void
    {
        if (!Camera.camera) return;
        SkyBox.render();
        Renderer.renderer.render(Renderer.scene, Camera.camera);
    }
}
