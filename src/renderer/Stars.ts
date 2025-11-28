import * as THREE from "three";
import StarsShader from "./Shaders/StarsShader";

class Stars extends THREE.Points
{
    material: THREE.ShaderMaterial;

    constructor(count = 5000)
    {
        const halfCount = Math.floor(count / 2);
        const geometry = new THREE.BufferGeometry();

        const topPositions = Stars.generateTopHemispherePositions(halfCount);
        const colors = Stars.generateColors(halfCount);
        const sizes = Stars.generateSizes(halfCount);
        const phases = Stars.generatePhases(halfCount);
        const freqs = Stars.generateFrequencies(halfCount);

        const positions = Stars.mirrorPositions(topPositions);
        const mirroredColors = Stars.mirrorAttribute(colors);
        const mirroredSizes = Stars.mirrorAttribute(sizes);
        const mirroredPhases = Stars.mirrorAttribute(phases);
        const mirroredFreqs = Stars.mirrorAttribute(freqs);

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(mirroredColors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(mirroredSizes, 1));
        geometry.setAttribute('phase', new THREE.BufferAttribute(mirroredPhases, 1));
        geometry.setAttribute('freq', new THREE.BufferAttribute(mirroredFreqs, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: StarsShader.vertexShader,
            fragmentShader: StarsShader.fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: THREE.AdditiveBlending
        });

        super(geometry, material);

        this.material = material;
        this.renderOrder = -1;
        this.frustumCulled = false;
        this.matrixAutoUpdate = false;
        const SKYBOX_SCALE = 100000;
        this.scale.setScalar(SKYBOX_SCALE);
        this.updateMatrix();
    }

    static generateTopHemispherePositions(count: number)
    {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++)
        {
            const u = Math.random();
            const v = Math.random() * 0.5 + 0.5;
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);
            positions.set([x, y, z], i * 3);
        }
        return positions;
    }

    static mirrorPositions(topPositions: Float32Array)
    {
        const count = topPositions.length / 3;
        const mirrored = new Float32Array(topPositions.length * 2);
        mirrored.set(topPositions, 0);

        for (let i = 0; i < count; i++)
        {
            const x = topPositions[i * 3 + 0];
            const y = topPositions[i * 3 + 1];
            const z = topPositions[i * 3 + 2];
            mirrored.set([x, -y, z], (i + count) * 3);
        }

        return mirrored;
    }

    static mirrorAttribute(attr: Float32Array)
    {
        const mirrored = new Float32Array(attr.length * 2);
        mirrored.set(attr, 0);
        mirrored.set(attr, attr.length);
        return mirrored;
    }

    static generateColors(count: number)
    {
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++)
        {
            const variation = Math.random();
            const color =
                variation < 0.15
                    ? [0.8, 0.85, 1.0]
                    : variation < 0.3
                        ? [1.0, 0.95, 0.8]
                        : [1.0, 1.0, 1.0];
            colors.set(color, i * 3);
        }
        return colors;
    }

    static generateSizes(count: number)
    {
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++)
        {
            const variation = Math.random();
            sizes[i] =
                variation < 0.01
                    ? 40 + Math.random() * 20
                    : variation < 0.05
                        ? 25 + Math.random() * 15
                        : variation < 0.2
                            ? 15 + Math.random() * 10
                            : 5 + Math.random() * 5;
        }
        return sizes;
    }

    static generatePhases(count: number)
    {
        const phases = new Float32Array(count);
        for (let i = 0; i < count; i++) phases[i] = Math.random() * Math.PI * 2;
        return phases;
    }

    static generateFrequencies(count: number)
    {
        const freqs = new Float32Array(count);
        for (let i = 0; i < count; i++) freqs[i] = 1.0 + Math.random() * 2.0;
        return freqs;
    }

    update(elapsedTime: number)
    {
        this.material.uniforms.time.value = elapsedTime;
    }

    setVisible(visible: boolean)
    {
        this.visible = visible;
    }
}

export default Stars;
