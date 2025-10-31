import RAPIER from '@dimforge/rapier3d-compat';

export class PhysicsWorld
{
    private world: RAPIER.World | null = null;

    async initialize(): Promise<void>
    {
        await RAPIER.init();

        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(gravity);

        // Criar chão físico
        this.createGround();

        console.log('Physics world initialized');
    }

    private createGround(): void
    {
        if (!this.world) return;

        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50.0, 0.1, 50.0);
        this.world.createCollider(groundColliderDesc);
    }

    createRigidBody(
        position: { x: number; y: number; z: number },
        isDynamic: boolean = true
    ): RAPIER.RigidBody | null
    {
        if (!this.world) return null;

        const rigidBodyDesc = isDynamic
            ? RAPIER.RigidBodyDesc.dynamic()
            : RAPIER.RigidBodyDesc.fixed();

        rigidBodyDesc.setTranslation(position.x, position.y, position.z);

        return this.world.createRigidBody(rigidBodyDesc);
    }

    createBoxCollider(
        rigidBody: RAPIER.RigidBody,
        halfExtents: { x: number; y: number; z: number }
    ): RAPIER.Collider | null
    {
        if (!this.world) return null;

        const colliderDesc = RAPIER.ColliderDesc.cuboid(
            halfExtents.x,
            halfExtents.y,
            halfExtents.z
        );

        return this.world.createCollider(colliderDesc, rigidBody);
    }

    step(deltaTime: number): void
    {
        if (!this.world) return;

        this.world.timestep = deltaTime;
        this.world.step();
    }

    getWorld(): RAPIER.World | null
    {
        return this.world;
    }
}
