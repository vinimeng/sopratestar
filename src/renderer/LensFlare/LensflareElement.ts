import * as THREE from "three";

class LensflareElement
{
    texture: THREE.Texture;
    size: number;
    distance: number;
    color: THREE.Color;

    constructor(texture: THREE.Texture, size = 1, distance = 0, color = new THREE.Color(0xffffff))
    {
        this.texture = texture;
        this.size = size;
        this.distance = distance;
        this.color = color;
    }
}

export default LensflareElement;
