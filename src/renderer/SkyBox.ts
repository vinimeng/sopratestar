import * as THREE from 'three';
import { Renderer } from './Renderer';

export class SkyBox
{
    static sunLight: THREE.DirectionalLight;
    static dayColor: THREE.Color;
    static nightColor: THREE.Color;
    static fog: THREE.Fog;

    static init(): void
    {
        SkyBox.dayColor = new THREE.Color(0x87CEEB); // azul claro
        SkyBox.nightColor = new THREE.Color(0x0D1B2A); // azul escuro

        SkyBox.fog = new THREE.Fog(0x87CEEB, 200, 300);
        Renderer.scene.fog = SkyBox.fog;

        // Luz direcional representando o sol
        SkyBox.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        SkyBox.sunLight.position.set(100, 100, 0);
        Renderer.scene.add(SkyBox.sunLight);
    }

    static render(): void
    {
        const normalized = window.GLOBALS.TIME.HOURS / 24 + window.GLOBALS.TIME.MINUTES / 1440;

        const currentColor = SkyBox.dayColor.clone().lerp(SkyBox.nightColor, Math.abs(Math.cos(normalized * Math.PI * 2)));
        Renderer.scene.background = currentColor;
        SkyBox.fog.color = currentColor;

        // Atualizar luz solar
        const sunAngle = normalized * Math.PI * 2;
        SkyBox.sunLight.position.set(Math.cos(sunAngle) * 100, Math.sin(sunAngle) * 100, 0);
        SkyBox.sunLight.intensity = Math.max(0.2, Math.sin(sunAngle)); // mais fraco à noite
    }
}
