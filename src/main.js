import WebGPU from 'three/addons/capabilities/WebGPU.js';
import { App } from './app/App.js';

const mount = document.getElementById('app');

if (!WebGPU.isAvailable()) {
  // Three.js provides a ready-made DOM error message for unsupported WebGPU.
  document.body.appendChild(WebGPU.getErrorMessage());
} else {
  const app = new App(mount);
  await app.init();
  app.start();
}
