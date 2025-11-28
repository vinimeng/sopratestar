export const StarsShader = {
    vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float phase;
        attribute float freq;
        varying vec3 vColor;
        varying float vDepth;
        uniform float time;

        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vDepth = mvPosition.z;

            float twinkle = sin(time * freq + phase) * 0.2 + 0.8;
            gl_PointSize = size * twinkle;

            vec4 pos = projectionMatrix * mvPosition;
            pos.z = pos.w * 0.999999;
            gl_Position = pos;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vDepth;
        uniform float intensity;

        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center) * 2.0;

            float core = (1.0 - smoothstep(0.0, 0.2, dist)) * 0.8;
            float glow = (1.0 - smoothstep(0.2, 0.5, dist)) * 0.1;

            float brightness = core + glow;

            vec3 finalColor = mix(vec3(1.0), vColor, 0.8) * 0.6;

            float reflectionFactor = smoothstep(0.0, -1000.0, vDepth) * 0.5;

            gl_FragColor = vec4(finalColor * intensity, (brightness * reflectionFactor) * intensity);
        }
    `
};
