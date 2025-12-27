import * as THREE from 'three/webgpu';
import { Renderer } from '../core/Renderer.js';
import { CameraRig } from '../core/CameraRig.js';
import { createScene } from '../core/SceneFactory.js';
import { applyHDREnvironment } from '../core/Environment.js';
import { GPUSwarm } from '../effects/GPUSwarm.js';

export class App {
  /** @param {HTMLElement} mount */
  constructor(mount) {
    this.mount = mount;

    this.clock = new THREE.Clock();
    this.renderer = null;
    this.cameraRig = null;

    this.scene = null;
    this.hero = null;

    this.swarm = null;

    this._onResize = () => this._resize();
  }

  async init() {
    // Renderer
    this.renderer = new Renderer(this.mount);
    await this.renderer.init(); // Renderer.init() prepares the backend for render/compute.

    // Camera + controls
    this.cameraRig = new CameraRig(this.renderer.domElement);

    // Scene content
    const { scene, hero } = createScene();
    this.scene = scene;
    this.hero = hero;

    // HDR environment (image-based lighting)
    await applyHDREnvironment(this.renderer, this.scene);

    // Compute-driven instanced swarm (GPU simulation)
    this.swarm = new GPUSwarm(this.renderer, this.scene);
    await this.swarm.init();

    // Warmup compile to avoid shader stutter once interaction begins.
    await this.renderer.compile(this.scene, this.cameraRig.camera);

    // HUD
    document.getElementById('backend').textContent =
      this.renderer.backendName ?? 'Unknown';
    document.getElementById('instances').textContent =
      `${this.swarm.count.toLocaleString()} (GPU-simulated)`;

    // Resize
    window.addEventListener('resize', this._onResize, { passive: true });
    this._resize();
  }

  start() {
    this.renderer.setAnimationLoop((t) => this._frame(t));
  }

  _frame() {
    const dt = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Camera controls
    this.cameraRig.update(dt);

    // Animate hero
    this.hero.rotation.y = elapsed * 0.35;
    this.hero.children[0].rotation.x = elapsed * 0.25;

    // Subtle environment rotation for “studio turntable” feel
    this.scene.backgroundRotation.y = elapsed * 0.02;
    this.scene.environmentRotation.y = elapsed * 0.02;

    // GPU compute + render
    this.swarm.update(elapsed);
    this.renderer.render(this.scene, this.cameraRig.camera);
  }

  _resize() {
    const w = this.mount.clientWidth;
    const h = this.mount.clientHeight;

    this.renderer.setSize(w, h);
    this.cameraRig.setSize(w, h);
  }
}
