import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Models

const dinoUrl = new URL("assets/Parasaurolophus.gltf", import.meta.url);

// Initialization

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(9, 10, 10);
orbit.update();

// Helpers

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// Objects

//Plane

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

//Dino

const assetLoader = new GLTFLoader();
assetLoader.load(
  dinoUrl.href,
  function (gltf) {
    const dino = gltf.scene;
    scene.add(dino);
    dino.position.set(0, 0, 0);
    dino.scale.set(0.01, 0.01, 0.01);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Light

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
directionalLight.position.x = 30;
directionalLight.position.y = 20;
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 12;

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(dLightHelper);

let step = 1;
let speed = 0.01;

let mixer;
let Player_anim_IDLE;
let Player_anim_RUN;

let loader = new GLTFLoader();
loader.load(dinoUrl.href, function (gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  Player_anim_IDLE = gltf.animations[0]; // first animation
  Player_anim_RUN = gltf.animations[1]; // second animation

  mixer.clipAction( Player_anim_IDLE).play();

  MainPlayer = gltf.scene;
    scene.add(MainPlayer);
});

function animate() {
  step += speed;

  renderer.render(scene, camera);
}

function animation()
{
  
  var delta = clock.getDelta();
  mixer.update( delta );
}

renderer.setAnimationLoop(animation);
