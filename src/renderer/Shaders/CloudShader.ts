const CloudsShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;

            vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = pos.xyww;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uCloudColor;
        uniform vec3 cameraPos;

        varying vec2 vUv;
        varying vec3 vWorldPosition;

        vec3 permute(vec3 x) {
            return mod(((x*34.0)+1.0)*x, 289.0);
        }

        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 cloudUV = vUv * 6.0 + vec2(
                cameraPos.x / 1000.0 + uTime / 100.0,
                cameraPos.z / 1000.0
            );

            float n = snoise(cloudUV * 3.0 + uTime / 50.0) * 0.6
                    + snoise(cloudUV * 6.0 + uTime / 40.0) * 0.3
                    + snoise(cloudUV * 12.0 + uTime / 30.0) * 0.1;

            float cloudDensity = smoothstep(0.1, 0.9, 0.5 * n + 0.5);
            float horizonFade = smoothstep(0.0, 0.3, 1.0 - abs(vUv.y - 0.5) * 2.0);
            float edgeFade = (1.0 - pow(abs(vUv.x - 0.5) * 2.0, 2.0)) *
                            (1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0));

            float finalOpacity = cloudDensity * horizonFade * edgeFade * 0.2;
            vec3 finalColor = uCloudColor;

            gl_FragColor = vec4(finalColor, finalOpacity);

            if (finalOpacity < 0.01) discard;
        }
    `,
};

export default CloudsShader;
