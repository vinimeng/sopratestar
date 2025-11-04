import RAPIER from '@dimforge/rapier3d-compat';

export class PhysicsWorld
{
    static world: RAPIER.World | null = null;

    static async init(): Promise<void>
    {
        await RAPIER.init();

        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        PhysicsWorld.world = new RAPIER.World(gravity);

        // Criar chão físico
        PhysicsWorld.createGround();

        console.log('Physics world initialized');
    }

    static createGround(): void
    {
        if (!PhysicsWorld.world) return;

        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50.0, 0.1, 50.0);
        PhysicsWorld.world.createCollider(groundColliderDesc);
    }

    static createRigidBody(
        position: { x: number; y: number; z: number },
        isDynamic: boolean = true
    ): RAPIER.RigidBody | null
    {
        if (!PhysicsWorld.world) return null;

        const rigidBodyDesc = isDynamic
            ? RAPIER.RigidBodyDesc.dynamic()
            : RAPIER.RigidBodyDesc.fixed();

        rigidBodyDesc.setTranslation(position.x, position.y, position.z);

        return PhysicsWorld.world.createRigidBody(rigidBodyDesc);
    }

    static createBoxCollider(
        rigidBody: RAPIER.RigidBody,
        halfExtents: { x: number; y: number; z: number }
    ): RAPIER.Collider | null
    {
        if (!PhysicsWorld.world) return null;

        const colliderDesc = RAPIER.ColliderDesc.cuboid(
            halfExtents.x,
            halfExtents.y,
            halfExtents.z
        );

        return PhysicsWorld.world.createCollider(colliderDesc, rigidBody);
    }

    static step(deltaTime: number): void
    {
        if (!PhysicsWorld.world) return;

        PhysicsWorld.world.timestep = deltaTime;
        PhysicsWorld.world.step();
    }
}
