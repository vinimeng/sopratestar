const SkyShader = {
    vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vDirection;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vDirection = normalize(worldPosition.xyz);

            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = pos.xyww;
        }
    `,
    fragmentShader: `
        precision mediump float;
        varying vec3 vWorldPosition;
        varying vec3 vDirection;

        uniform float uSunAzimuth;
        uniform float uSunElevation;
        uniform vec3 uSunColor;
        uniform vec3 uSkyColorLow;
        uniform vec3 uSkyColorHigh;
        uniform float uSunSize;

        void main() {
            vec3 direction = normalize(vWorldPosition);

            vec3 skyColor = mix(uSkyColorLow, uSkyColorHigh, clamp(direction.y * 0.5 + 0.5, 0.0, 1.0));

            float azimuth = radians(uSunAzimuth);
            float elevation = radians(uSunElevation);
            vec3 sunDirection = normalize(vec3(
                cos(elevation) * sin(azimuth),
                sin(elevation),
                cos(elevation) * cos(azimuth)
            ));

            float sunIntensity = pow(max(dot(direction, sunDirection), 0.0), 1000.0 / uSunSize);
            vec3 sunColor = uSunColor * sunIntensity;

            gl_FragColor = vec4(skyColor + sunColor, 1.0);
        }
    `,
};

export default SkyShader;
