import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const dinoUrl = new URL("assets/Parasaurolophus.gltf", import.meta.url);
const dinoUrlFBX = new URL("assets/Parasaurolophus.fbx", import.meta.url);
const monkeyUrl = new URL("assets/monkey.glb", import.meta.url);
const dinoUrlOBJ = new URL("assets/Velociraptor.obj", import.meta.url);
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

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-1, 1, 7);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry();
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = 2;
sphere.castShadow = true;
scene.add(sphere);

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

const gui = new dat.GUI();

const options = {
  sphereColor: "#ffea00",
  wireframe: false,
};

gui.addColor(options, "sphereColor").onChange(function (e) {
  sphere.material.color.set(e);
});

gui.add(options, "wireframe").onChange(function (e) {
  sphere.material.wireframe = e;
});

let step = 0;
let speed = 0.01;

let mixer;
let Player_anim_IDLE;
let Player_anim_RUN;

const assetFBX = new FBXLoader();
// assetFBX.load(
//   dinoUrlFBX.href,
//   function (fbx) {
//     console.log(fbx.animations);
//     mixer = new THREE.AnimationMixer(fbx.scene);
//     Player_anim_IDLE = fbx.animations[0]; // first animation
//     Player_anim_RUN = fbx.animations[1]; // second animation

//     mixer.clipAction(Player_anim_IDLE).play();

//     MainPlayer = fbx.scene;
//     scene.add(MainPlayer);
//   },
//   undefined,
//   function (error) {
//     console.error(error);
//   }
// );

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

function animate() {
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  step += speed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
