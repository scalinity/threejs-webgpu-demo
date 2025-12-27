import * as THREE from 'three/webgpu';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export async function applyHDREnvironment(rendererWrapper, scene) {
  const url =
    'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr';

  const hdr = await new RGBELoader().loadAsync(url);
  hdr.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = hdr;
  scene.background = hdr;

  // Modern “studio” look
  scene.environmentIntensity = 1.15;
  scene.backgroundIntensity = 0.85;
  scene.backgroundBlurriness = 0.22;
}
