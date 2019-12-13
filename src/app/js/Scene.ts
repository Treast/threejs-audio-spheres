import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Audio from './utils/Audio';

interface Sphere {
  mesh: THREE.Mesh;
  theta: number;
  phi: number;
  r: number;
}

class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private controls: OrbitControls;

  private spheres: Sphere[];
  private audio: Audio;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.bind();
  }

  bind() {
    window.addEventListener('resize', () => this.onResize);
    window.addEventListener('click', () => this.audio.play());
    window.addEventListener('touchstart', () => this.audio.play());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init() {
    this.camera.position.set(12, 12, 12);
    this.camera.lookAt(0, 0, 0);

    this.audio = new Audio();
    this.audio.load('assets/audios/jinjer.mp3');

    const minRadius = 2;
    const maxRadius = 15;

    const sphereMaterial = new THREE.MeshNormalMaterial();
    this.spheres = [];

    for (let i = 0; i < 400; i += 1) {
      const sphereGeometry = new THREE.SphereGeometry(0.2, 30, 30);
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const r = Math.random() * (maxRadius - minRadius) + minRadius;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * 2 * Math.PI;

      const spherePosition = this.getPositionSphere(r, theta, phi);
      sphere.position.set(spherePosition.x, spherePosition.y, spherePosition.z);

      this.spheres.push({
        theta,
        phi,
        r,
        mesh: sphere,
      });
      this.scene.add(sphere);
    }
  }

  getPositionSphere(r: number, theta: number, phi: number) {
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);
    return {
      x,
      y,
      z,
    };
  }

  render() {
    this.audio.refreshFrequencies();
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);

    if (this.audio.isPlaying) {
      this.spheres.forEach((sphere, index) => {
        const frequency = this.map(this.audio.getFrequency(index, this.spheres.length), 0, 1, 0, 5);

        if (index == 200) console.log(frequency);

        sphere.theta += 0.003 * frequency;
        sphere.phi -= 0.003 * frequency;

        const position = this.getPositionSphere(sphere.r, sphere.theta, sphere.phi);
        sphere.mesh.position.set(position.x, position.y, position.z);
      });
    }

    this.controls.update();
  }

  map(num: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
}

export default new Scene();
