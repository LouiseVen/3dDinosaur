import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// Models

const dinoUrl = new URL("assets/source/trex1.glb", import.meta.url);

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
let mixer;
assetLoader.load(
  dinoUrl.href,
  function (gltf) {
    const model = gltf.scene;
    console.log(gltf.animations);
    scene.add(model);
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);

    const m = new THREE.AnimationMixer(gltf.scene);
    mixer = m;

    for (let i = 0; i < gltf.animations.length; ++i) {
      if (gltf.animations[i].name.includes('run')) {
        const clip = gltf.animations[i];
        const action = mixer.clipAction(clip);
        action.play();
      }
    }
    // Play animation randomly every 1-10s.
// setInterval(() => {
//   action
//     .reset()
//     .play();
// }, Math.random() * 9000 + 1000);
    // const mixer = new THREE.AnimationMixer(model);
    // const animationAction = mixer.clipAction((model).animations[0]);
    // animationActions.push(animationAction);
    // activeAction = animationActions[0];
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// const anim = new GLTFLoader();
// anim.load(dinoUrl.href, (anim) => {
//   this.mixer = new THREE.AnimationMixer(gltf);
//   const idle = this.mixer.clipAction(anim.animations[0]);
//   idle.play();
// });
// 

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

const clock = new THREE.Clock();
function animate() {
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
