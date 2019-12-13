import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import Audio from './utils/Audio';
import * as SimplexNoise from 'simplex-noise';

interface Sphere {
  mesh: THREE.Mesh;
  theta: number;
  phi: number;
  r: number;
  x: number;
  y: number;
}

class Scene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private controls: OrbitControls;

  private composer: EffectComposer;

  private spheres: Sphere[];
  private audio: Audio;

  private simplex: SimplexNoise;
  private noise: number = 0;

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
    this.camera.position.set(14, 14, 14);
    this.camera.lookAt(0, 0, 0);

    this.audio = new Audio();
    this.audio.load('assets/audios/jinjer.mp3');
    this.audio.setVolume(0.001);

    this.simplex = new SimplexNoise();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const afterImage = new AfterimagePass();
    // @ts-ignore
    afterImage.uniforms['damp'].value = 0.5;
    this.composer.addPass(afterImage);

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
        x: spherePosition.x,
        y: spherePosition.y,
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
    this.composer.render();

    this.spheres.forEach((sphere, index) => {
      const nX = this.simplex.noise2D(sphere.x, sphere.y + this.noise);
      const nY = this.simplex.noise2D(sphere.x + this.noise, sphere.y);

      sphere.theta += 0.003 * nX;
      sphere.phi -= 0.003 * nY;

      if (this.audio.isPlaying) {
        const f = Math.max(0, this.audio.getFrequency(index, this.spheres.length));
        const frequency = this.map(f, 0, 1, 0, 2);

        sphere.theta += 0.01 * frequency;
        sphere.phi -= 0.01 * frequency;
      }

      const position = this.getPositionSphere(sphere.r, sphere.theta, sphere.phi);
      sphere.mesh.position.set(position.x, position.y, position.z);
    });

    this.controls.update();
    this.noise += 0.0001;
  }

  map(num: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
}

export default new Scene();
