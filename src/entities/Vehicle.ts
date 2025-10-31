import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import type { VehicleConfig, WheelData } from '../types';

export class Vehicle
{
    private chassis: THREE.Group;
    private rigidBody: RAPIER.RigidBody;
    private wheels: WheelData[] = [];
    private config: VehicleConfig;

    private currentSpeed = 0;
    private currentSteering = 0;

    private scene: THREE.Scene;
    private physicsWorld: RAPIER.World;

    constructor(
        scene: THREE.Scene,
        physicsWorld: RAPIER.World,
        position: THREE.Vector3,
        config?: Partial<VehicleConfig>
    )
    {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.config = {
            mass: 1200,
            chassisSize: { width: 1.8, height: 0.6, length: 4.0 },
            wheelRadius: 0.4,
            wheelWidth: 0.3,
            wheelBase: 2.5,
            trackWidth: 1.6,
            maxSpeed: 50,
            acceleration: 3000, // Aumentado
            braking: 5000, // Aumentado
            steering: 0.8,
            ...config
        };

        this.chassis = this.createChassis();
        this.chassis.position.copy(position);
        this.scene.add(this.chassis);

        this.rigidBody = this.createPhysicsBody(position);
        this.createWheels();
    }

    private createChassis(): THREE.Group
    {
        const group = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(
            this.config.chassisSize.width,
            this.config.chassisSize.height,
            this.config.chassisSize.length
        );
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x0066ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const cabinGeometry = new THREE.BoxGeometry(
            this.config.chassisSize.width * 0.8,
            this.config.chassisSize.height * 0.8,
            this.config.chassisSize.length * 0.4
        );
        const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
        cabin.position.set(0, this.config.chassisSize.height * 0.7, -0.3);
        cabin.castShadow = true;
        group.add(cabin);

        return group;
    }

    private createPhysicsBody(position: THREE.Vector3): RAPIER.RigidBody
    {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z)
            .setCanSleep(false); // Não deixar o corpo "dormir"

        const rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);

        // Collider do chassi
        const colliderDesc = RAPIER.ColliderDesc.cuboid(
            this.config.chassisSize.width / 2,
            this.config.chassisSize.height / 2,
            this.config.chassisSize.length / 2
        )
        .setMass(this.config.mass)
        .setRestitution(0.1)
        .setFriction(0.8); // Aumentar fricção

        this.physicsWorld.createCollider(colliderDesc, rigidBody);

        // Adicionar damping para estabilidade
        rigidBody.setLinearDamping(0.5);
        rigidBody.setAngularDamping(1.0);

        return rigidBody;
    }

    private createWheels(): void
    {
        const wheelGeometry = new THREE.CylinderGeometry(
            this.config.wheelRadius,
            this.config.wheelRadius,
            this.config.wheelWidth,
            16
        );
        wheelGeometry.rotateZ(Math.PI / 2);

        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.4
        });

        const wheelPositions = [
            { x: -this.config.trackWidth / 2, y: 0, z: this.config.wheelBase / 2, isFront: true },
            { x: this.config.trackWidth / 2, y: 0, z: this.config.wheelBase / 2, isFront: true },
            { x: -this.config.trackWidth / 2, y: 0, z: -this.config.wheelBase / 2, isFront: false },
            { x: this.config.trackWidth / 2, y: 0, z: -this.config.wheelBase / 2, isFront: false }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.castShadow = true;
            this.chassis.add(wheel);

            this.wheels.push({
                mesh: wheel,
                position: new THREE.Vector3(pos.x, pos.y, pos.z),
                isFront: pos.isFront
            });

            wheel.position.set(pos.x, pos.y, pos.z);
        });
    }

    update(deltaTime: number, input: { throttle: number; brake: number; steering: number }): void
    {
        // Limitar deltaTime para evitar grandes saltos
        deltaTime = Math.min(deltaTime, 0.1);

        // Atualizar steering
        const targetSteering = input.steering * this.config.steering;
        this.currentSteering = THREE.MathUtils.lerp(
            this.currentSteering,
            targetSteering,
            deltaTime * 8
        );

        // Rotacionar rodas dianteiras
        this.wheels.forEach(wheel => {
            if (wheel.isFront) {
                wheel.mesh.rotation.y = this.currentSteering;
            }
        });

        // Obter direção do veículo
        const rotation = this.rigidBody.rotation();
        const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

        // Direção para frente
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(quaternion);

        // Direção lateral (para steering)
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(quaternion);

        // Calcular velocidade atual
        const velocity = this.rigidBody.linvel();
        const velocityVec = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
        this.currentSpeed = velocityVec.length();

        // Velocidade na direção forward
        const forwardSpeed = velocityVec.dot(forward);

        // ACELERAÇÃO
        if (input.throttle > 0)
        {
            const force = forward.clone().multiplyScalar(
                this.config.acceleration * input.throttle
            );

            this.rigidBody.addForce(
                { x: force.x, y: force.y, z: force.z },
                true
            );
        }

        // FREIO / RÉ
        if (input.brake > 0)
        {
            if (forwardSpeed > 0.5) {
                // Freando
                const brakeForce = forward.clone().multiplyScalar(
                    -this.config.braking * input.brake
                );
                this.rigidBody.addForce(
                    { x: brakeForce.x, y: brakeForce.y, z: brakeForce.z },
                    true
                );
            } else {
                // Ré
                const reverseForce = forward.clone().multiplyScalar(
                    -this.config.acceleration * 0.5 * input.brake
                );
                this.rigidBody.addForce(
                    { x: reverseForce.x, y: reverseForce.y, z: reverseForce.z },
                    true
                );
            }
        }

        // STEERING (apenas se estiver se movendo)
        if (Math.abs(input.steering) > 0.01 && Math.abs(forwardSpeed) > 1)
        {
            // Torque proporcional à velocidade
            const steeringTorque = input.steering * Math.abs(forwardSpeed) * 100;

            this.rigidBody.addTorque(
                { x: 0, y: steeringTorque, z: 0 },
                true
            );

            // Adicionar força lateral para drift/grip
            const lateralVelocity = velocityVec.dot(right);
            const gripForce = right.clone().multiplyScalar(-lateralVelocity * 50);

            this.rigidBody.addForce(
                { x: gripForce.x, y: gripForce.y, z: gripForce.z },
                true
            );
        }

        // Limitar velocidade máxima
        if (this.currentSpeed > this.config.maxSpeed)
        {
            const limitedVel = velocityVec.normalize().multiplyScalar(this.config.maxSpeed);
            this.rigidBody.setLinvel(
                { x: limitedVel.x, y: velocity.y, z: limitedVel.z },
                true
            );
        }

        // Animar rodas girando
        const wheelRotationSpeed = forwardSpeed * 2;
        this.wheels.forEach(wheel => {
            wheel.mesh.rotation.x += wheelRotationSpeed * deltaTime;
        });

        // Sincronizar posição do chassi com física
        const translation = this.rigidBody.translation();

        this.chassis.position.set(translation.x, translation.y, translation.z);
        this.chassis.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }

    getPosition(): THREE.Vector3
    {
        return this.chassis.position.clone();
    }

    getSpeed(): number
    {
        return this.currentSpeed;
    }

    getChassis(): THREE.Group
    {
        return this.chassis;
    }

    getRigidBody(): RAPIER.RigidBody
    {
        return this.rigidBody;
    }
}
