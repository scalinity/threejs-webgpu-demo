import * as THREE from 'three/webgpu';

export function createScene() {
  const scene = new THREE.Scene();

  // Modern “studio” defaults (these exist on Scene in current three builds)
  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.Fog(0x05060a, 10, 44);

  // --- Lighting (PBR-friendly) ---
  const hemi = new THREE.HemisphereLight(0xbfd3ff, 0x1a1f2b, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 3.3);
  key.position.set(6.5, 10.0, 4.0);
  key.castShadow = true;

  // Shadow quality tuning
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 40;
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.02;

  scene.add(key);

  // --- Ground (receives soft VSM shadows) ---
  const groundMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0e16,
    roughness: 0.55,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.18,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0x5b7cff)
  });

  const ground = new THREE.Mesh(new THREE.CircleGeometry(18, 128), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Hero composition ---
  const hero = new THREE.Group();
  hero.position.set(0, 0.0, 0);

  // Pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.05, 0.5, 96, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0x101420,
      roughness: 0.35,
      metalness: 0.9,
      clearcoat: 0.15,
      iridescence: 0.65,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 420]
    })
  );
  pedestal.position.y = 0.25;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  hero.add(pedestal);

  // Glass core
  const glass = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.18, 240, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.06,
      metalness: 0.0,
      transmission: 1.0,
      thickness: 1.1,
      ior: 1.45,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      attenuationColor: new THREE.Color(0x9ad7ff),
      attenuationDistance: 1.4,
      clearcoat: 0.25,
      clearcoatRoughness: 0.05
    })
  );
  glass.position.y = 1.25;
  glass.castShadow = true;
  hero.add(glass);

  // Rim ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.05, 16, 220),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.14,
      clearcoat: 0.2,
      iridescence: 1.0,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [180, 720]
    })
  );
  ring.position.y = 1.25;
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  hero.add(ring);

  scene.add(hero);

  return { scene, hero };
}
