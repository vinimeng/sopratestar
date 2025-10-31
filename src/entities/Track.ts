import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { TrackConfig } from '../types';

export class Track
{
    private trackMesh: THREE.Mesh;
    private barriers: THREE.Group;
    private checkpoints: THREE.Vector3[] = [];
    private config: TrackConfig;
    private curve: THREE.CatmullRomCurve3;

    private scene: THREE.Scene;
    private physicsWorld: RAPIER.World;

    constructor(
        scene: THREE.Scene,
        physicsWorld: RAPIER.World,
        config?: Partial<TrackConfig>
    )
    {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.config = {
            width: 8,
            segments: 100,
            barrierHeight: 2,
            checkpoints: 5,
            ...config
        };

        this.curve = this.createTrackCurve();
        this.barriers = new THREE.Group();

        this.trackMesh = this.createTrackMesh();
        this.createBarriers();
        this.createCheckpoints();
        this.createPhysics();

        this.scene.add(this.trackMesh);
        this.scene.add(this.barriers);
    }

    private createTrackCurve(): THREE.CatmullRomCurve3
    {
        // Definir pontos da pista (circuito oval com curvas)
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(30, 0, 0),
            new THREE.Vector3(50, 0, 10),
            new THREE.Vector3(60, 0, 30),
            new THREE.Vector3(60, 0, 50),
            new THREE.Vector3(50, 0, 70),
            new THREE.Vector3(30, 0, 80),
            new THREE.Vector3(0, 0, 80),
            new THREE.Vector3(-30, 0, 80),
            new THREE.Vector3(-50, 0, 70),
            new THREE.Vector3(-60, 0, 50),
            new THREE.Vector3(-60, 0, 30),
            new THREE.Vector3(-50, 0, 10),
            new THREE.Vector3(-30, 0, 0),
        ];

        return new THREE.CatmullRomCurve3(points, true); // true = fechado
    }

    private createTrackMesh(): THREE.Mesh
    {
        const points = this.curve.getPoints(this.config.segments);
        const shape = new THREE.Shape();

        // Criar forma da pista
        shape.moveTo(-this.config.width / 2, 0);
        shape.lineTo(this.config.width / 2, 0);

        const extrudeSettings = {
            steps: this.config.segments,
            bevelEnabled: false,
            extrudePath: this.curve
        };

        // Usar ExtrudeGeometry para criar pista ao longo da curva
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        for (let i = 0; i <= this.config.segments; i++)
        {
            const t = i / this.config.segments;
            const point = this.curve.getPoint(t);
            const tangent = this.curve.getTangent(t);

            // Calcular perpendicular
            const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            // Criar vértices da largura da pista
            const left = point.clone().add(perpendicular.multiplyScalar(this.config.width / 2));
            const right = point.clone().sub(perpendicular.multiplyScalar(this.config.width / 2));

            vertices.push(left.x, left.y, left.z);
            vertices.push(right.x, right.y, right.z);

            uvs.push(0, t);
            uvs.push(1, t);

            if (i < this.config.segments)
            {
                const idx = i * 2;
                indices.push(idx, idx + 1, idx + 2);
                indices.push(idx + 1, idx + 3, idx + 2);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        // Material da pista com textura de asfalto
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });

        // Adicionar linha central
        this.createCenterLine();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.y = 0.01; // Ligeiramente acima do chão

        return mesh;
    }

    private createCenterLine(): void
    {
        const points = this.curve.getPoints(this.config.segments * 2);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        line.position.y = 0.02;
        this.scene.add(line);
    }

    private createBarriers(): void
    {
        const barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.3
        });

        // Criar barreiras nas bordas
        for (let side of [-1, 1])
        {
            for (let i = 0; i < this.config.segments; i++)
            {
                const t1 = i / this.config.segments;
                const t2 = (i + 1) / this.config.segments;

                const point1 = this.curve.getPoint(t1);
                const point2 = this.curve.getPoint(t2);
                const tangent = this.curve.getTangent(t1);

                const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
                const offset = perpendicular.multiplyScalar((this.config.width / 2 + 0.5) * side);

                const barrierPos1 = point1.clone().add(offset);
                const barrierPos2 = point2.clone().add(offset);

                const length = barrierPos1.distanceTo(barrierPos2);
                const geometry = new THREE.BoxGeometry(0.5, this.config.barrierHeight, length);
                const barrier = new THREE.Mesh(geometry, barrierMaterial);

                // Posicionar e rotacionar barreira
                const midPoint = new THREE.Vector3().addVectors(barrierPos1, barrierPos2).multiplyScalar(0.5);
                barrier.position.copy(midPoint);
                barrier.position.y = this.config.barrierHeight / 2;

                const angle = Math.atan2(
                    barrierPos2.x - barrierPos1.x,
                    barrierPos2.z - barrierPos1.z
                );
                barrier.rotation.y = angle;

                barrier.castShadow = true;
                this.barriers.add(barrier);
            }
        }
    }

    private createCheckpoints(): void
    {
        const checkpointMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });

        for (let i = 0; i < this.config.checkpoints; i++)
        {
            const t = i / this.config.checkpoints;
            const point = this.curve.getPoint(t);

            this.checkpoints.push(point.clone());

            // Visualizar checkpoint
            const geometry = new THREE.PlaneGeometry(this.config.width, 3);
            const checkpoint = new THREE.Mesh(geometry, checkpointMaterial);
            checkpoint.position.copy(point);
            checkpoint.position.y = 1.5;
            checkpoint.rotation.y = Math.PI / 2;

            const tangent = this.curve.getTangent(t);
            const angle = Math.atan2(tangent.x, tangent.z);
            checkpoint.rotation.y = angle;

            this.scene.add(checkpoint);
        }
    }

    private createPhysics(): void
    {
        // Criar colliders para as barreiras
        this.barriers.children.forEach(barrier => {
            const mesh = barrier as THREE.Mesh;
            const geometry = mesh.geometry as THREE.BoxGeometry;

            const params = geometry.parameters;
            const colliderDesc = RAPIER.ColliderDesc.cuboid(
                params.width / 2,
                params.height / 2,
                params.depth / 2
            )
            .setTranslation(
                mesh.position.x,
                mesh.position.y,
                mesh.position.z
            )
            .setRotation({
                w: mesh.quaternion.w,
                x: mesh.quaternion.x,
                y: mesh.quaternion.y,
                z: mesh.quaternion.z
            })
            .setRestitution(0.5)
            .setFriction(0.3);

            this.physicsWorld.createCollider(colliderDesc);
        });
    }

    getStartPosition(): THREE.Vector3
    {
        const startPoint = this.curve.getPoint(0);
        return new THREE.Vector3(startPoint.x, 2, startPoint.z);
    }

    getStartRotation(): number
    {
        const tangent = this.curve.getTangent(0);
        return Math.atan2(tangent.x, tangent.z);
    }

    getCheckpoints(): THREE.Vector3[]
    {
        return this.checkpoints;
    }

    getCurve(): THREE.CatmullRomCurve3
    {
        return this.curve;
    }
}
