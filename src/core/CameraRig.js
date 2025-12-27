import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraRig {
  /** @param {HTMLCanvasElement} domElement */
  constructor(domElement) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.08, 120);
    this.camera.position.set(4.4, 2.6, 6.8);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.target.set(0, 1.0, 0);

    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 16.0;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.update();
  }

  setSize(w, h) {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
