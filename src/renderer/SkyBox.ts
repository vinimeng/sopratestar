import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Stars } from './Stars';

export class SkyBox
{
    static Sky: Sky;
    static Sun: THREE.Vector3;
    static Stars: Stars;

    static init(): void
    {
        this.Sky = new Sky();
        this.Sky.scale.setScalar(450000);
        this.Sun = new THREE.Vector3();
        this.Stars = new Stars();
    }

    static update(datetime: Date, renderer: THREE.WebGLRenderer, deltaTime: number): void
    {
        const skyUniforms = this.Sky.material.uniforms;

        // --- Configuração básica (valores padrão de dia limpo) ---
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 3;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.7;

        // Horário atual em horas decimais
        const hours = datetime.getHours() + datetime.getMinutes() / 60 + datetime.getSeconds() / 3600;

        // Nascer e pôr do sol fixos
        const sunrise = 5 + 47 / 60;   // 5.7833...
        const sunset = 18 + 53 / 60;  // 18.8833...

        const isDay = hours >= sunrise && hours <= sunset;

        let dayFactor = 0; // 0 = noite, 1 = dia
        let nightFactor = 0;

        if (isDay)
        {
            // Progresso do dia entre nascer e pôr do sol (0–1)
            dayFactor = (hours - sunrise) / (sunset - sunrise);
            nightFactor = 0;
        }
        else
        {
            dayFactor = 0;
            nightFactor = 1 - (hours >= sunset ? (hours - sunset) : (hours + 24 - sunset)) / ((sunrise + 24) - sunset);
        }

        // Suavizar inicio/fim do dia (amanhecer/entardecer)
        const smoothStep = (t: number) =>
        {
            t = THREE.MathUtils.clamp(t, 0, 1);
            return t * t * (3 - 2 * t);
        };

        // Fator de altura do sol: 0 no nascer/pôr, 1 no meio‑dia
        const noonFactor = isDay ? 1 - Math.abs(dayFactor - 0.5) * 2 : 1 - Math.abs(nightFactor - 0.5) * 2;
        const sunHeight = smoothStep(noonFactor);

        // Inclinação: 0 = no horizonte, ~PI/2 = acima, <0 = abaixo
        // Vamos usar um arco da manhã até a tarde apenas no intervalo de dia.
        const maxElevation = THREE.MathUtils.degToRad(75); // altura máxima no meio‑dia
        const inclination = THREE.MathUtils.lerp(
            -0.2,                       // um pouco abaixo do horizonte
            maxElevation,               // bem alto no céu
            sunHeight
        );

        // Azimute: vamos fazer o sol percorrer de leste (90°) para oeste (270°)
        // durante o intervalo de dia.
        const azimuthStartDeg = 90;   // leste
        const azimuthEndDeg = 270;  // oeste

        let azimuthDeg: number;
        if (isDay)
        {
            azimuthDeg = THREE.MathUtils.lerp(azimuthStartDeg, azimuthEndDeg, dayFactor);
        }
        else
        {
            azimuthDeg = THREE.MathUtils.lerp(-azimuthStartDeg, -azimuthEndDeg, nightFactor);
        }

        const phi = THREE.MathUtils.degToRad(90 - THREE.MathUtils.radToDeg(inclination));
        const theta = THREE.MathUtils.degToRad(azimuthDeg);
        this.Sun.setFromSphericalCoords(1, phi, theta);
        skyUniforms['sunPosition'].value.copy(this.Sun);

        // Ajustar parâmetros atmosféricos conforme dia/noite
        if (isDay)
        {
            skyUniforms['turbidity'].value = THREE.MathUtils.lerp(12, 2, noonFactor);
            skyUniforms['rayleigh'].value = THREE.MathUtils.lerp(4, 2, noonFactor);
            skyUniforms['mieCoefficient'].value = THREE.MathUtils.lerp(0.01, 0.003, noonFactor);
            skyUniforms['mieDirectionalG'].value = THREE.MathUtils.lerp(0.85, 0.7, noonFactor);

            renderer.toneMappingExposure = THREE.MathUtils.lerp(0.3, 0.6, noonFactor);
        }
        else
        {
            // Noite: céu escuro, pouca dispersão
            skyUniforms['turbidity'].value = 0.9;
            skyUniforms['rayleigh'].value = 0.001;
            skyUniforms['mieCoefficient'].value = 0.0005;
            skyUniforms['mieDirectionalG'].value = 0.5;

            renderer.toneMappingExposure = 0.2;
        }

        const fadeDuration = 0.5; // horas para fade
        let stars = 0;

        if (hours < sunrise)
        {
            stars = THREE.MathUtils.smoothstep(sunrise - hours, 0, fadeDuration);
        }
        else if (hours > sunset)
        {
            stars = THREE.MathUtils.smoothstep(hours - sunset, 0, fadeDuration);
        }
        else
        {
            stars = 0;
        }

        this.Stars.update(deltaTime);
        this.Stars.setIntensity(stars);
    }
}
