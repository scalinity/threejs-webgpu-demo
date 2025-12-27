import * as THREE from 'three/webgpu';
import {
  Fn,
  uniform,
  instancedArray,
  instanceIndex,
  positionLocal,
  add,
  mul,
  sin,
  cos,
  float
} from 'three/tsl';

function hslToRgb(h, s, l) {
  // h,s,l in [0..1]
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r, g, b];
}

export class GPUSwarm {
  /**
   * @param {import('../core/Renderer.js').Renderer} rendererWrapper
   * @param {THREE.Scene} scene
   */
  constructor(rendererWrapper, scene) {
    this.r = rendererWrapper;
    this.scene = scene;

    this.count = 8192;

    this._time = uniform(0);

    this._seedBuffer = null;     // vec4: radius, height, speed, phase
    this._colorBuffer = null;    // vec3: rgb
    this._posBuffer = null;      // vec3: output positions

    this._computeNode = null;
    this.mesh = null;
  }

  async init() {
    // --- seeds (CPU once, GPU forever) ---
    const seed = new Float32Array(this.count * 4);
    const col = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const u = i / this.count;

      // radius biased outward (nice “halo”)
      const radius = 1.6 + Math.pow(Math.random(), 0.35) * 3.3;
      const height = 0.45 + (Math.random() - 0.5) * 2.2;
      const speed = 0.25 + Math.random() * 1.2;
      const phase = Math.random() * Math.PI * 2;

      seed[i * 4 + 0] = radius;
      seed[i * 4 + 1] = height;
      seed[i * 4 + 2] = speed;
      seed[i * 4 + 3] = phase;

      const [r, g, b] = hslToRgb((u + 0.62) % 1.0, 0.85, 0.58);
      col[i * 3 + 0] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
    }

    // Storage buffers (instanced arrays) intended for compute shaders.
    this._seedBuffer = instancedArray(seed, 'vec4');
    this._colorBuffer = instancedArray(col, 'vec3');

    // Output positions written each frame by compute
    this._posBuffer = instancedArray(this.count, 'vec3');

    // --- compute shader (TSL) ---
    // This is the canonical pattern shown in StorageBufferNode docs.
    this._computeNode = Fn(() => {
      const s = this._seedBuffer.element(instanceIndex);
      const p = this._posBuffer.element(instanceIndex);

      const t = add(mul(this._time, s.z), s.w);
      const r = s.x;

      // Orbit + vertical wobble (stable, readable motion)
      p.x = mul(cos(t), r);
      p.z = mul(sin(t), r);

      const wobble = mul(sin(mul(t, float(0.7))), float(0.55));
      p.y = add(s.y, wobble);
    })().compute(this.count);

    // --- instanced renderable (PBR) ---
    // Small optimized geo (looks good and scales well)
    const geo = new THREE.IcosahedronGeometry(0.035, 1);

    // Node-based PBR material so we can feed instanced attributes directly
    const mat = new THREE.MeshStandardNodeMaterial();
    mat.metalness = 1.0;
    mat.roughness = 0.16;

    // Per-instance color + GPU-computed translation
    mat.colorNode = this._colorBuffer.toAttribute();
    mat.positionNode = add(positionLocal, this._posBuffer.toAttribute());

    const mesh = new THREE.InstancedMesh(geo, mat, this.count);
    mesh.frustumCulled = false; // positions are GPU-driven; CPU bounds are meaningless
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    // Initialize instance matrices to identity (keeps things deterministic)
    const dummy = new THREE.Object3D();
    dummy.position.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = 0; i < this.count; i++) mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;

    this.mesh = mesh;
    this.scene.add(mesh);

    // First compute so buffers are populated before first render
    this.r.compute(this._computeNode);
  }

  update(timeSeconds) {
    this._time.value = timeSeconds;
    this.r.compute(this._computeNode);
  }
}
