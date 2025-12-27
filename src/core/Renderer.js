import * as THREE from 'three/webgpu';

export class Renderer {
  /** @param {HTMLElement} mount */
  constructor(mount) {
    this.mount = mount;

    this.renderer = new THREE.WebGPURenderer({
      antialias: true,
      alpha: false,
      depth: true,
      stencil: false,
      outputBufferType: THREE.HalfFloatType
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    this.setPixelRatio();

    this.mount.appendChild(this.renderer.domElement);

    this.backendName = null;
  }

  get domElement() {
    return this.renderer.domElement;
  }

  async init() {
    await this.renderer.init();
    this.backendName = this.renderer.backend?.constructor?.name ?? null;
  }

  async compile(scene, camera) {
    await this.renderer.compileAsync(scene, camera);
  }

  setAnimationLoop(fn) {
    this.renderer.setAnimationLoop(fn);
  }

  setPixelRatio() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
  }

  setSize(w, h) {
    this.setPixelRatio();
    this.renderer.setSize(w, h, false);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  compute(nodeOrNodes) {
    this.renderer.compute(nodeOrNodes);
  }
}
