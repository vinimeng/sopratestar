import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export class RigidBodyComponent
{
    private rigidBody: RAPIER.RigidBody;
    private mesh: THREE.Mesh;

    constructor(rigidBody: RAPIER.RigidBody, mesh: THREE.Mesh)
    {
        this.rigidBody = rigidBody;
        this.mesh = mesh;
    }

    update(): void
    {
        const position = this.rigidBody.translation();
        const rotation = this.rigidBody.rotation();

        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    }

    getRigidBody(): RAPIER.RigidBody
    {
        return this.rigidBody;
    }

    getMesh(): THREE.Mesh
    {
        return this.mesh;
    }

    applyImpulse(impulse: { x: number; y: number; z: number }): void
    {
        this.rigidBody.applyImpulse(impulse, true);
    }

    setLinearVelocity(velocity: { x: number; y: number; z: number }): void
    {
        this.rigidBody.setLinvel(velocity, true);
    }
}
