# threejs-webgpu-demo

**High-fidelity Three.js r182 WebGPU PBR demo with HDR environment lighting and GPU compute swarm.**

A showcase of Three.js r182's WebGPU rendering capabilities — physically-based materials, HDR image-based lighting, and a GPU compute shader-driven particle swarm, all running at real-time framerates in the browser.

---

## What This Is

This demo pushes Three.js r182's WebGPU renderer through its paces: PBR materials with full metallic-roughness workflows, HDR environment maps for realistic reflections and ambient lighting, and a compute shader-powered particle swarm that runs entirely on the GPU. It serves as both a visual showcase and a reference implementation for modern Three.js WebGPU development.

---

## Features

- **WebGPU rendering** — Uses Three.js r182's native WebGPU backend for next-gen GPU access
- **Physically-based rendering (PBR)** — Metallic-roughness material workflow with accurate lighting
- **HDR environment lighting** — Image-based lighting for photorealistic reflections and ambient occlusion
- **GPU compute swarm** — Thousands of particles simulated via WebGPU compute shaders (`GPUSwarm.js`)
- **Post-processing** — Bloom and tone mapping for cinematic output
- **Orbit controls** — Interactive camera with smooth damping

---

## Getting Started

### Prerequisites

- A browser with WebGPU support (Chrome 113+, Edge 113+, or Firefox Nightly with flag)
- A modern dedicated or integrated GPU

### Running

Simply serve the files with any static server, or open `index.html` directly:

```bash
git clone https://github.com/scalinity/threejs-webgpu-demo.git
cd threejs-webgpu-demo
# Serve with any static server, e.g.:
npx serve .
# or just open index.html in a WebGPU-capable browser
```

---

## Project Structure

```
threejs-webgpu-demo/
├── index.html             # Entry point with UI and canvas
└── src/
    ├── main.js            # App initialization and render loop
    ├── app/               # Application setup and configuration
    ├── core/              # Renderer, scene, camera, environment (Environment.js)
    └── effects/           # Visual effects
        └── GPUSwarm.js    # WebGPU compute shader particle swarm
```

---

## Tech Stack

| Component | Technology |
|---|---|
| Rendering | Three.js r182 (WebGPU backend) |
| Materials | PBR metallic-roughness |
| Lighting | HDR image-based lighting |
| Compute | WebGPU compute shaders |
| Post-processing | Bloom, tone mapping |
| Language | JavaScript |

---

## License

Proprietary. All rights reserved.

---

*threejs-webgpu-demo: WebGPU rendering at its finest — PBR, HDR, and a swarm of light.*
