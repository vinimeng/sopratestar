import * as THREE from "three";
import LensflareElement from "./LensflareElement";
import LensflareElementShader from "../Shaders/LensflareElementShader";

class Lensflare extends THREE.Mesh
{
    isLensflare: boolean;
    type: string;
    _screenPositionOverridden?: boolean;
    _overriddenScreenPosition?: THREE.Vector3;
    geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>;
    positionScreen: THREE.Vector3;
    positionView: THREE.Vector3;
    tempMap: THREE.FramebufferTexture;
    occlusionMap: THREE.FramebufferTexture;
    currentType: THREE.TextureDataType;
    material1a: THREE.RawShaderMaterial;
    material1b: THREE.RawShaderMaterial;
    mesh1: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.RawShaderMaterial>;
    shader: typeof LensflareElementShader;
    elements: LensflareElement[];
    material2: THREE.RawShaderMaterial;
    mesh2: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.RawShaderMaterial>;
    scale2: THREE.Vector2;
    screenPositionPixels: THREE.Vector2;
    validArea: THREE.Box2;
    viewport: THREE.Vector4;

    constructor()
    {
        const geometry = (function ()
        {
            const geometry = new THREE.BufferGeometry();
            const float32Array = new Float32Array([
                -1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1,
            ]);
            const interleavedBuffer = new THREE.InterleavedBuffer(float32Array, 5);
            geometry.setIndex([0, 1, 2, 0, 2, 3]);
            geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
            geometry.setAttribute("uv", new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
            return geometry;
        })();

        super(geometry, new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, fog: false }));

        this.geometry = geometry;
        this.isLensflare = true;
        this.type = "Lensflare";
        this.frustumCulled = false;
        this.renderOrder = Infinity;
        this.positionScreen = new THREE.Vector3();
        this.positionView = new THREE.Vector3();
        this.tempMap = new THREE.FramebufferTexture(16, 16);
        this.occlusionMap = new THREE.FramebufferTexture(16, 16);
        this.currentType = THREE.UnsignedByteType;

        this.material1a = new THREE.RawShaderMaterial({
            uniforms: {
                scale: { value: null },
                screenPosition: { value: null },
            },
            vertexShader: `
                precision highp float;
                uniform vec3 screenPosition;
                uniform vec2 scale;
                attribute vec3 position;
                void main() {
                    gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );
                }`,
            fragmentShader: `
                precision highp float;
                void main() {
                    gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );
                }`,
            depthTest: true,
            depthWrite: false,
            transparent: false,
            fog: false,
        });

        this.material1b = new THREE.RawShaderMaterial({
            uniforms: {
                map: { value: this.tempMap },
                scale: { value: null },
                screenPosition: { value: null },
            },
            vertexShader: `
                precision highp float;
                uniform vec3 screenPosition;
                uniform vec2 scale;
                attribute vec3 position;
                attribute vec2 uv;
                varying vec2 vUV;
                void main() {
                    vUV = uv;
                    gl_Position = vec4( position.xy * scale + screenPosition.xy, screenPosition.z, 1.0 );
                }`,
                fragmentShader: `
                precision highp float;
                uniform sampler2D map;
                varying vec2 vUV;
                void main() {
                    gl_FragColor = texture2D( map, vUV );
                }`,
            depthTest: false,
            depthWrite: false,
            transparent: false,
            fog: false,
        });

        this.mesh1 = new THREE.Mesh(this.geometry, this.material1a);
        this.elements = [];
        this.shader = LensflareElementShader;

        this.material2 = new THREE.RawShaderMaterial({
            name: this.shader.name,
            uniforms: {
                map: { value: null },
                occlusionMap: { value: this.occlusionMap },
                color: { value: new THREE.Color(0xffffff) },
                scale: { value: new THREE.Vector2() },
                screenPosition: { value: new THREE.Vector3() },
            },
            vertexShader: this.shader.vertexShader,
            fragmentShader: this.shader.fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            fog: false,
        });

        this.mesh2 = new THREE.Mesh(this.geometry, this.material2);

        this.scale2 = new THREE.Vector2();
        this.screenPositionPixels = new THREE.Vector2();
        this.validArea = new THREE.Box2();
        this.viewport = new THREE.Vector4();
    }

    addElement(element: LensflareElement)
    {
        this.elements.push(element);
    }

    onBeforeRender(renderer: THREE.WebGLRenderer, _scene: THREE.Scene, camera: THREE.Camera)
    {
        renderer.getCurrentViewport(this.viewport);

        const renderTarget = renderer.getRenderTarget();
        const type = renderTarget !== null ? renderTarget.texture.type : THREE.UnsignedByteType;

        if (this.currentType !== type)
        {
            this.tempMap.dispose();
            this.occlusionMap.dispose();
            this.tempMap.type = this.occlusionMap.type = type;
            this.currentType = type;
        }

        const invAspect = this.viewport.w / this.viewport.z;
        const halfViewportWidth = this.viewport.z / 2.0;
        const halfViewportHeight = this.viewport.w / 2.0;

        let size = 16 / this.viewport.w;
        this.scale2.set(size * invAspect, size);

        this.validArea.min.set(this.viewport.x - 100, this.viewport.y - 100);
        this.validArea.max.set(this.viewport.x + (this.viewport.z + 100), this.viewport.y + (this.viewport.w + 100));

        // red-reddington mod - override view position for occlusion test
        if (this._screenPositionOverridden === true && this._overriddenScreenPosition)
        {
            this.positionScreen.copy(this._overriddenScreenPosition);
            const invProj = camera.projectionMatrix.clone().invert();
            this.positionView.copy(this.positionScreen).applyMatrix4(invProj);
        } else
        {
            this.positionView.setFromMatrixPosition(this.matrixWorld);
            this.positionView.applyMatrix4(camera.matrixWorldInverse);
        }

        if (this.positionView.z > 0) return; // lensflare is behind the camera

        // red-reddington mod - allow Skybox to override screen-space sun position
        if (this._screenPositionOverridden === true && this._overriddenScreenPosition)
        {
            this.positionScreen.set(
                this._overriddenScreenPosition.x,
                this._overriddenScreenPosition.y,
                this._overriddenScreenPosition.z
            );
        } else
        {
            this.positionScreen.copy(this.positionView).applyMatrix4(camera.projectionMatrix);
        }

        this.screenPositionPixels.x = this.viewport.x + this.positionScreen.x * halfViewportWidth + halfViewportWidth - 8;
        this.screenPositionPixels.y = this.viewport.y + this.positionScreen.y * halfViewportHeight + halfViewportHeight - 8;
        if (this.validArea.containsPoint(this.screenPositionPixels))
        {
            renderer.copyFramebufferToTexture(this.tempMap, this.screenPositionPixels);

            let uniforms = this.material1a.uniforms;
            uniforms["scale"].value = this.scale;
            uniforms["screenPosition"].value = this.positionScreen;

            (renderer as any).renderBufferDirect(camera, null, this.geometry, this.material1a, this.mesh1, null);
            renderer.copyFramebufferToTexture(this.occlusionMap, this.screenPositionPixels);

            uniforms = this.material1b.uniforms;
            uniforms["scale"].value = this.scale;
            uniforms["screenPosition"].value = this.positionScreen;

            (renderer as any).renderBufferDirect(camera, null, this.geometry, this.material1b, this.mesh1, null);

            const vecX = -this.positionScreen.x * 2;
            const vecY = -this.positionScreen.y * 2;
            for (let i = 0, l = this.elements.length; i < l; i++)
            {
                const element = this.elements[i];
                const uniforms = this.material2.uniforms;

                uniforms["color"].value.copy(element.color);
                uniforms["map"].value = element.texture;
                uniforms["screenPosition"].value.x = this.positionScreen.x + vecX * element.distance;
                uniforms["screenPosition"].value.y = this.positionScreen.y + vecY * element.distance;

                size = element.size / this.viewport.w;
                const invAspect = this.viewport.w / this.viewport.z;

                uniforms["scale"].value.set(size * invAspect, size);
                this.material2.uniformsNeedUpdate = true;

                (renderer as any).renderBufferDirect(camera, null, this.geometry, this.material2, this.mesh2, null);
            }
        }
    }

    dispose()
    {
        this.material1a.dispose();
        this.material1b.dispose();
        this.material2.dispose();
        this.tempMap.dispose();
        this.occlusionMap.dispose();
        for (let i = 0, l = this.elements.length; i < l; i++)
        {
            this.elements[i].texture.dispose();
        }
    }
}

export default Lensflare;
