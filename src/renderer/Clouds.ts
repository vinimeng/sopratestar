import * as THREE from "three";
import CloudsShader from "./Shaders/CloudShader";

class Clouds extends THREE.Mesh
{
    cloudAnimTime: number;
    baseCloudColor: THREE.Color;
    material: THREE.ShaderMaterial;

    constructor()
    {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: true,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide,
            uniforms: {
                uTime: { value: 0.0 },
                uCloudColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
                cameraPos: { value: new THREE.Vector3() }
            },
            vertexShader: CloudsShader.vertexShader,
            fragmentShader: CloudsShader.fragmentShader
        });

        super(new THREE.PlaneGeometry(2, 2), material);

        this.material = material;
        this.frustumCulled = false;
        this.renderOrder = -1;

        this.rotation.x = Math.PI / 2;
        const CLOUDS_Y = 600;
        this.position.set(0, CLOUDS_Y, 0);
        const CLOUDS_SCALE = 15000;
        this.scale.setScalar(CLOUDS_SCALE);

        this.cloudAnimTime = 0;
        this.baseCloudColor = new THREE.Color(1.0, 1.0, 1.0);
    }

    update(_delta: number, cameraPosition: THREE.Vector3)
    {
        this.cloudAnimTime += 0.02;
        this.material.uniforms.uTime.value = this.cloudAnimTime;
        this.material.uniforms.cameraPos.value.copy(cameraPosition);
    }

    setCloudColor(color: THREE.Color)
    {
        this.material.uniforms.uCloudColor.value.copy(color);
        this.baseCloudColor.copy(color);
    }

    setVisible(visible: boolean)
    {
        this.visible = visible;
    }
}

export default Clouds;
