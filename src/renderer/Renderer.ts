import * as THREE from 'three';
import { Camera } from '../entities/Camera';
import Skybox from './SkyBox';
import Clouds from './Clouds';
import Stars from './Stars';

export class Renderer
{
    static scene: THREE.Scene;
    static renderer: THREE.WebGLRenderer;
    static skybox: Skybox;
    static shadowCameraHelper: THREE.CameraHelper;
    static clouds: Clouds;
    static stars: Stars;

    static init(canvas: HTMLCanvasElement)
    {
        Renderer.scene = new THREE.Scene();
        Renderer.scene.background = new THREE.Color(0x87ceeb);

        Renderer.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            precision: "highp",
            powerPreference: 'high-performance'
        });
        Renderer.renderer.setSize(window.innerWidth, window.innerHeight);
        Renderer.renderer.sortObjects = true;
        Renderer.renderer.debug.checkShaderErrors = true;
        Renderer.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        Renderer.renderer.outputColorSpace = THREE.SRGBColorSpace;
        Renderer.renderer.shadowMap.enabled = true;
        Renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        Renderer.renderer.shadowMap.autoUpdate = true;

        Renderer.setupLights();
        Renderer.setupEnvironment();
        Renderer.skybox = new Skybox(Skybox.createLensflareTextures());
        Renderer.clouds = new Clouds();
        Renderer.stars = new Stars();
        Renderer.shadowCameraHelper = new THREE.CameraHelper(Renderer.skybox.sun.shadow.camera);
        Renderer.scene.add(Renderer.skybox);
        Renderer.scene.add(Renderer.skybox.sun);
        Renderer.scene.add(Renderer.skybox.sun.target);
        Renderer.scene.add(Renderer.clouds);
        Renderer.scene.add(Renderer.stars);

        Renderer.skybox.onTimeOfDayChanged = (newTimeOfDay, _elapsedTime) =>
        {
            if (newTimeOfDay === "Nighttime")
            {
                Renderer.clouds.setCloudColor(new THREE.Color(0.1, 0.1, 0.2));
                Renderer.stars.setVisible(true);
            } else if (newTimeOfDay === "Sunrise")
            {
                Renderer.clouds.setCloudColor(new THREE.Color(0.8, 0.4, 0.4));
                Renderer.stars.setVisible(false);
            } else if (newTimeOfDay === "Sunset")
            {
                Renderer.clouds.setCloudColor(new THREE.Color(0.8, 0.3, 0.3));
                Renderer.stars.setVisible(false);
            } else
            {
                Renderer.clouds.setCloudColor(new THREE.Color(1.0, 1.0, 1.0));
                Renderer.stars.setVisible(false);
            }
        }

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
        Renderer.renderer.render(Renderer.scene, Camera.camera);
    }
}
