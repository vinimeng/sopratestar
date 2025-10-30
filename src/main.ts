import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import './style.css';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    precision: 'mediump',
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Adicionar contador de FPS
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb
document.body.appendChild(stats.dom);

// Configurar controles da câmera com o mouse
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza o movimento
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2; // Impede de ir abaixo do chão

// Criar Skybox
const skyboxGeometry = new THREE.BoxGeometry(500, 500, 500);
const skyboxMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // direita
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // esquerda
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // topo
    new THREE.MeshBasicMaterial({ color: 0x4a90e2, side: THREE.BackSide }), // baixo
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide }), // frente
    new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide })  // trás
];
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
scene.add(skybox);

// Iluminação global melhorada
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Luz de preenchimento
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Criar chão
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotacionar para ficar horizontal
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Habilitar sombras no renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Carregar modelo GLB do Beatall
let model: THREE.Group | null = null;
const loader = new GLTFLoader();

loader.load(
    '/src/assets/models/beatall/beatall.glb',
    (gltf) =>
    {
        model = gltf.scene;

        // Habilitar sombras e verificar materiais no modelo
        model.traverse((child) =>
        {
            if (child instanceof THREE.Mesh)
            {
                // make sure normal is good
                child.geometry.computeVertexNormals();
                // support multiple materials to switch
                child.material = child.material.clone();
                child.material.side = THREE.FrontSide;
                child.material.metalness = 0.5;
                child.material.roughness = 1;
                child.material.flatShading = false;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(model);

        // Ajustar escala e posição se necessário
        model.scale.set(0.01, 0.01, 0.01);
        model.position.set(0, 0, 0);

        console.log('Modelo Beatall carregado com sucesso!');
    },
    (xhr) =>
    {
        console.log((xhr.loaded / xhr.total * 100) + '% carregado');
    },
    (error) =>
    {
        console.error('Erro ao carregar o modelo:', error);
    }
);

camera.position.z = 5;

// Função para ajustar o canvas quando a janela for redimensionada
function handleResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);

function animate()
{
    requestAnimationFrame(animate);

    // Atualizar contador de FPS
    stats.begin();

    // Atualizar controles da câmera
    controls.update();

    renderer.render(scene, camera);

    stats.end();
}
animate();
