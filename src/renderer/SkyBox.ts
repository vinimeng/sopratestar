import * as THREE from "three";
import SkyShader from "./Shaders/SkyShader";
import LensflareElement from "./LensFlare/LensflareElement";
import Lensflare from "./LensFlare/LensFlare";

class Skybox extends THREE.Mesh
{
    SKYBOX_SCALE: number;
    distance: number;
    sunElevation: number;
    sunAzimuth: number;
    targetElevation: number;
    targetAzimuth: number;
    lerpSpeed: number;
    _initialPositionSet: boolean;
    _timeOfDay: string | null;

    _sunPosition: THREE.Vector3;
    _sunDirection: THREE.Vector3;
    _lensflareScreenPos: THREE.Vector3;
    _tempProjectedDir: THREE.Vector3;

    sun: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    lensflare: Lensflare;
    textureFlare0: THREE.Texture;
    textureFlare3: THREE.Texture;

    material: THREE.ShaderMaterial;

    onTimeOfDayChanged: ((newTimeOfDay: string, elapsedTime: number) => void) | null;

    constructor(assets: { textureFlare0: THREE.Texture; textureFlare3: THREE.Texture; })
    {
        const material = new THREE.ShaderMaterial({
            vertexShader: SkyShader.vertexShader,
            fragmentShader: SkyShader.fragmentShader,
            uniforms: {
                uSunAzimuth: { value: 216 },
                uSunElevation: { value: 24.68698059628387 },
                uSunColor: { value: new THREE.Color(0xffe5b0) },
                uSkyColorLow: { value: new THREE.Color(0x6fa2ef) },
                uSkyColorHigh: { value: new THREE.Color(0x2053ff) },
                uSunSize: { value: 1 }
            },
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });

        super(new THREE.BoxGeometry(1, 1, 1), material);

        this.material = material;

        this.SKYBOX_SCALE = 100000;
        this.distance = 0.5;
        this.sunElevation = 24.68698059628387;
        this.sunAzimuth = 216;
        this.targetElevation = this.sunElevation;
        this.targetAzimuth = this.sunAzimuth;
        this.lerpSpeed = 0.01;
        this._initialPositionSet = false;
        this._timeOfDay = null;

        this._sunPosition = new THREE.Vector3();
        this._sunDirection = new THREE.Vector3();
        this._lensflareScreenPos = new THREE.Vector3();
        this._tempProjectedDir = new THREE.Vector3();

        // DirectionalLight for shadows
        this.sun = new THREE.DirectionalLight(0xffe5b0, 1);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.set(2048, 2048);
        this.sun.shadow.intensity = 1;
        this.sun.shadow.radius = 2;
        this.sun.shadow.normalBias = 0.02;
        this.sun.shadow.bias = 0.000002;
        this.sun.shadow.autoUpdate = true;

        const frustumSize = 50;
        this.sun.shadow.camera.left = -frustumSize;
        this.sun.shadow.camera.right = frustumSize;
        this.sun.shadow.camera.top = frustumSize;
        this.sun.shadow.camera.bottom = -frustumSize;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 1000;
        this.sun.shadow.camera.zoom = 0.5;
        this.sun.shadow.camera.updateProjectionMatrix();

        // sun is NOT added to skybox - it will be added to scene separately

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.add(this.ambientLight);

        // Lensflare setup
        this.textureFlare0 = assets.textureFlare0;
        this.textureFlare3 = assets.textureFlare3;

        this.lensflare = new Lensflare();
        this.addLensflare();
        this.add(this.lensflare);

        this.onTimeOfDayChanged = null;

        this.updateSunPosition(true);

        this.scale.setScalar(this.SKYBOX_SCALE);
    }

    addLensflare()
    {
        const color = new THREE.Color(0xffe5b0);
        this.lensflare.addElement(new LensflareElement(this.textureFlare0, 300, 0, color));
        this.lensflare.addElement(new LensflareElement(this.textureFlare3, 60, 0.6, color));
        this.lensflare.addElement(new LensflareElement(this.textureFlare3, 70, 0.7, color));
        this.lensflare.addElement(new LensflareElement(this.textureFlare3, 120, 0.9, color));
        this.lensflare.addElement(new LensflareElement(this.textureFlare3, 70, 1, color));
    }

    update(currentTime: Date, elapsedTime: number, playerPosition: THREE.Vector3, camera: THREE.Camera)
    {
        if (!(currentTime instanceof Date))
        {
            console.error("Invalid time");
            return;
        }

        const SUNRISE = 6;
        const SUNSET = 21;
        const DARKNESS_START = 20.42;
        const DARKNESS_END = 6.58;
        const maxElevation = 42;

        const whiteColor = new THREE.Color(0xffffff);
        const orangeColor = new THREE.Color(0xff4500);
        const yellowColor = new THREE.Color(0xffd700);
        const redColor = new THREE.Color(0xff6347);
        const darkRedColor = new THREE.Color(0xd32f2f);
        const skyBlueColor = new THREE.Color(0x87ceeb);
        const darkSkyColor = new THREE.Color(0x0d1321);
        const nightSkyColor = new THREE.Color(0x1c2331);
        const moonColor = new THREE.Color(0xe6e8fa);

        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const timeInHours = hours + minutes / 60;

        const isInDarkTransition =
            (timeInHours >= DARKNESS_START && timeInHours <= SUNSET) ||
            (timeInHours >= SUNRISE && timeInHours <= DARKNESS_END);

        const isDaytime = timeInHours >= SUNRISE && timeInHours <= SUNSET;
        const wasNighttime = this._timeOfDay === "Nighttime";

        let normalizedTime;
        if (isDaytime)
        {
            normalizedTime = (timeInHours - SUNRISE) / (SUNSET - SUNRISE);
        } else
        {
            const nightHour = timeInHours >= SUNSET ? timeInHours : timeInHours + 24;
            normalizedTime = (nightHour - SUNSET) / (24 - SUNSET + SUNRISE);
        }

        let sunElevation = Math.cos(Math.PI * (normalizedTime - 0.5)) * maxElevation - 5;
        const sunAzimuth = 180 + 180 * normalizedTime;

        let _timeOfDay = "Nighttime";
        if (isDaytime)
        {
            if (normalizedTime <= 0.25) _timeOfDay = "Sunrise";
            else if (normalizedTime <= 0.75) _timeOfDay = "Midday";
            else _timeOfDay = "Sunset";
        }

        const isNowNighttime = _timeOfDay === "Nighttime";
        let isInstantTransition = wasNighttime !== isNowNighttime;
        if (!this._initialPositionSet)
        {
            this._initialPositionSet = true;
            isInstantTransition = true;
        }

        if (isDaytime)
        {
            const normalizedElevation = Math.min(sunElevation / maxElevation, 1);
            const t = Math.pow(1 - normalizedElevation, 3);

            this.material.uniforms.uSunColor.value.lerpColors(whiteColor, orangeColor, t);

            let horizonColor = skyBlueColor.clone();
            if (_timeOfDay === "Sunrise")
            {
                horizonColor = yellowColor.clone().lerp(redColor, normalizedTime / 0.25);
            } else if (_timeOfDay === "Sunset")
            {
                horizonColor = redColor.clone().lerp(darkRedColor, (normalizedTime - 0.75) / 0.25);
            }

            this.material.uniforms.uSkyColorLow.value.copy(horizonColor);
            this.material.uniforms.uSkyColorHigh.value.lerpColors(skyBlueColor, darkSkyColor, t);

            if (isInDarkTransition)
            {
                this.sun.intensity = 0.1;
            } else
            {
                this.sun.intensity = Math.min(40, Math.pow(normalizedElevation, 1.2) * 4);
            }

            this.lensflare.visible = true;
        } else
        {
            sunElevation *= 0.5;
            this.material.uniforms.uSunColor.value.copy(moonColor).multiplyScalar(1.8);
            this.material.uniforms.uSkyColorLow.value.copy(darkSkyColor);
            this.material.uniforms.uSkyColorHigh.value.copy(nightSkyColor);
            this.sun.intensity = 0.5;
            this.lensflare.visible = false;
        }

        this.targetElevation = sunElevation;
        this.targetAzimuth = sunAzimuth;
        this.updateSunPosition(isInstantTransition);

        if (_timeOfDay !== this._timeOfDay)
        {
            if (this.onTimeOfDayChanged)
            {
                this.onTimeOfDayChanged(_timeOfDay, elapsedTime);
            }
            this._timeOfDay = _timeOfDay;
        }

        // Shadow camera positioning
        if (playerPosition)
        {
            const shadowCenter = playerPosition.clone();
            const sunDir = this._sunDirection.clone();
            const shadowDistance = 300;

            // Set the LIGHT position (not shadow.camera.position)
            this.sun.position.set(
                shadowCenter.x + sunDir.x * shadowDistance,
                shadowCenter.y + sunDir.y * shadowDistance,
                shadowCenter.z + sunDir.z * shadowDistance
            );

            this.sun.target.position.copy(shadowCenter);
            this.sun.target.updateMatrixWorld();
        }

        // red-reddington mod - PROJECTED SUN SCREEN POSITION FOR LENSFLARE
        if (playerPosition && camera)
        {
            const dir = this._sunDirection;

            this._tempProjectedDir
                .copy(camera.position)
                .addScaledVector(dir, 1000)
                .project(camera);

            this._lensflareScreenPos.copy(this._tempProjectedDir);

            this.lensflare._screenPositionOverridden = true;
            this.lensflare._overriddenScreenPosition = this._lensflareScreenPos;
        }
    }

    updateSunPosition(instant = false)
    {
        if (instant)
        {
            this.sunElevation = this.targetElevation;
            this.sunAzimuth = this.targetAzimuth;
        } else
        {
            this.sunElevation += (this.targetElevation - this.sunElevation) * this.lerpSpeed;
            this.sunAzimuth += (this.targetAzimuth - this.sunAzimuth) * this.lerpSpeed;
        }

        const transformAzimuth = (oldAzimuth: number) =>
        {
            return ((270 - oldAzimuth) % 360) - 180;
        };

        const el = THREE.MathUtils.degToRad(this.sunElevation);
        const az = THREE.MathUtils.degToRad(transformAzimuth(this.sunAzimuth));

        this._sunPosition.set(
            this.distance * Math.cos(el) * Math.sin(az),
            this.distance * Math.sin(el),
            this.distance * Math.cos(el) * Math.cos(az)
        );

        // Lensflare follows visual sun position (in skybox local space)
        this.lensflare.position.copy(this._sunPosition);

        this._sunDirection.copy(this._sunPosition).normalize();

        this.material.uniforms.uSunAzimuth.value = transformAzimuth(this.sunAzimuth);
        this.material.uniforms.uSunElevation.value = this.sunElevation;
    }

    sunDirection()
    {
        return this._sunDirection;
    }

    timeOfDay()
    {
        return this._timeOfDay;
    }

    static createLensflareTextures()
    {
        const textureFlare0 = Skybox.createFlareTexture(0);
        const textureFlare3 = Skybox.createFlareTexture(3);
        return { textureFlare0, textureFlare3 };
    }

    static createFlareTexture(type: number)
    {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        if (!ctx)
        {
            return new THREE.Texture();
        }

        if (type === 0)
        {
            // Main sun flare - bright center with soft falloff
            const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.1, 'rgba(255, 250, 240, 0.9)');
            gradient.addColorStop(0.25, 'rgba(255, 229, 176, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 229, 176, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 229, 176, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
        } else
        {
            // Secondary flares - softer, more diffuse
            const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, 'rgba(255, 229, 176, 0.6)');
            gradient.addColorStop(0.3, 'rgba(255, 229, 176, 0.3)');
            gradient.addColorStop(0.6, 'rgba(255, 229, 176, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 229, 176, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }
}

export default Skybox;
