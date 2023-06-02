import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { FBXLoader } from "examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import "/backendDino.js";

// TO-DO si l'élément existe exécuter
const dinoRender = document.querySelector("#dino-render");

if (dinoRender) {
  // Models

  const dinoUrl = new URL("assets/source/trex1.glb", import.meta.url);
  const backgroundUrl = new URL("assets/images/park.jpg", import.meta.url);
  const pattyUrl = new URL("assets/source/BurgerPatty_Raw.obj", import.meta.url);
  const texturePattyUrl = new URL("assets/source/BurgerPatty_Raw.mtl", import.meta.url);
  const burgerUrl = new URL("assets/source/Burger.obj", import.meta.url);
  const textureBurgerUrl = new URL("assets/source/Burger.mtl", import.meta.url);
  const steakUrl = new URL("assets/source/Steak.obj", import.meta.url);
  const textureSteakUrl = new URL("assets/source/Steak.mtl", import.meta.url);
  const treeUrl = new URL("assets/source/CommonTree_1.obj", import.meta.url);
  const textureTreeUrl = new URL("assets/source/CommonTree_1.mtl", import.meta.url);
  const bush1Url = new URL("assets/source/Bush_1.obj", import.meta.url);
  const textureBush1Url = new URL("assets/source/Bush_1.mtl", import.meta.url);
  const bush2Url = new URL("assets/source/Bush_2.obj", import.meta.url);
  const textureBush2Url = new URL("assets/source/Bush_2.mtl", import.meta.url);

  // Initialization

  const renderer = new THREE.WebGLRenderer();

  renderer.shadowMap.enabled = true;

  renderer.setSize(window.innerWidth, window.innerHeight);



  dinoRender.appendChild(renderer.domElement);

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
  // const gridHelper = new THREE.GridHelper(30);
  // scene.add(gridHelper);

  //Load background texture
  const loader = new THREE.TextureLoader();
  loader.load(backgroundUrl, function (texture) {
    scene.background = texture;
  });

  // Objects

  //Plane
  const planeGeometry = new THREE.PlaneGeometry(30, 30);
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x084518,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;

  // Grass
  const vertexShader = `
  varying vec2 vUv;
  uniform float time;

	void main() {

    vUv = uv;

    // VERTEX POSITION

    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
    	mvPosition = instanceMatrix * mvPosition;
    #endif

    // DISPLACEMENT

    // here the displacement is made stronger on the blades tips.
    float dispPower = 1.0 - cos( uv.y * 3.1416 / 2.0 );

    float displacement = sin( mvPosition.z + time * 10.0 ) * ( 0.1 * dispPower );
    mvPosition.z += displacement;

    //

    vec4 modelViewPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * modelViewPosition;

	}
`;

  const fragmentShader = `
  varying vec2 vUv;

  void main() {
  	vec3 baseColor = vec3( 0.41, 1.0, 0.5 );
    float clarity = ( vUv.y * 0.5 ) + 0.5;
    gl_FragColor = vec4( baseColor * clarity, 1 );
  }
`;

  const uniforms = {
    time: {
      value: 0
    }
  }

  const leavesMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
  });

  /////////
  // MESH
  /////////

  const instanceNumber = 5000;
  const dummy = new THREE.Object3D();

  const geometry = new THREE.PlaneGeometry(0.1, 1, 1, 4);
  geometry.translate(20, 0.5, -5); // move grass blade geometry lowest point at 0.

  const instancedMesh = new THREE.InstancedMesh(geometry, leavesMaterial, instanceNumber);

  scene.add(instancedMesh);

  // Position and scale the grass blade instances randomly.

  for (let i = 0; i < instanceNumber; i++) {

    dummy.position.set(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );

    dummy.scale.setScalar(0.5 + Math.random() * 0.5);

    dummy.rotation.y = Math.random() * Math.PI;

    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);

  }


  //Dino

  const assetLoader = new GLTFLoader();
  let mixer;
  let model;
  const animationClips = [];
  assetLoader.load(
    dinoUrl.href,
    function (gltf) {
      model = gltf.scene;
      console.log(gltf.animations);
      scene.add(model);
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      model.castShadow = true;

      const m = new THREE.AnimationMixer(gltf.scene);
      mixer = m;

      for (let i = 0; i < gltf.animations.length; i++) {
        if (gltf.animations[i].name) {
          const clip = gltf.animations[i];

          animationClips.push(clip);
          // const action = mixer.clipAction(clip);
          // action.play();
        }
      }
      console.log(animationClips)
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
      if (localStorage.getItem('steakEnabled') == "false") {
        setInterval(playRandomAnimation, 10000);
      } else {
        animationSpecified();
      }

    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  function playRandomAnimation() {
    const randomIndex = Math.floor(Math.random() * animationClips.length);
    const clip = animationClips[randomIndex];
    const action = mixer.clipAction(clip);
    action.reset().play();
    console.log(action);
  }

  function animationSpecified() {
    const clip = animationClips[1];
    const action = mixer.clipAction(clip);
    action.reset().play();
    console.log(action);
  }


  // const anim = new GLTFLoader();
  // anim.load(dinoUrl.href, (anim) => {
  //   this.mixer = new THREE.AnimationMixer(gltf);
  //   const idle = this.mixer.clipAction(anim.animations[0]);
  //   idle.play();
  // });
  //


  // Steak


  const textureSteakLoader = new MTLLoader();
  let steak;

  if (localStorage.getItem('steakEnabled') == "true") {

    textureSteakLoader.load(
      textureSteakUrl.href,
      function (materials) {
        materials.preload();

        const steakLoader = new OBJLoader();
        steakLoader.setMaterials(materials);
        steakLoader.load(
          steakUrl.href,
          function (obj) {
            steak = obj;
            console.log(obj.animations);
            scene.add(steak);
            steak.position.set(2, 0, 7);
            steak.scale.set(1, 1, 1);
            console.log('hello');
          },
          undefined,
          function (error) {
            console.error(error);
          }
        );
      }
    )
  }


  //Burger
  const textureBurgerLoader = new MTLLoader();
  textureBurgerLoader.load(
    textureBurgerUrl.href,
    function (materials) {
      materials.preload();

      const burgerLoader = new OBJLoader();
      burgerLoader.setMaterials(materials);
      burgerLoader.load(
        burgerUrl.href,
        function (obj) {
          const burger = obj;
          console.log(obj.animations);
          scene.add(burger);
          burger.position.set(3, 5, -5);
          burger.scale.set(1, 1, 1);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  )

  //Tree
  const textureTreeLoader = new MTLLoader();
  textureTreeLoader.load(
    textureTreeUrl.href,
    function (materials) {
      materials.preload();

      const treeLoader = new OBJLoader();
      treeLoader.setMaterials(materials);
      treeLoader.load(
        treeUrl.href,
        function (obj) {
          const tree = obj;
          console.log(obj.animations);
          scene.add(tree);
          tree.position.set(3, 0, -5);
          tree.scale.set(5, 5, 5);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  )

  //Bushes

  const textureBush1Loader = new MTLLoader();
  textureBush1Loader.load(
    textureBush1Url.href,
    function (materials) {
      materials.preload();

      const bush1Loader = new OBJLoader();
      bush1Loader.setMaterials(materials);
      bush1Loader.load(
        bush1Url.href,
        function (obj) {
          const bush = obj;
          console.log(obj.animations);
          scene.add(bush);
          bush.position.set(-6, 0, 5);
          bush.scale.set(2, 2, 2);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  )

  const textureBush2Loader = new MTLLoader();
  textureBush2Loader.load(
    textureBush2Url.href,
    function (materials) {
      materials.preload();

      const bush2Loader = new OBJLoader();
      bush2Loader.setMaterials(materials);
      bush2Loader.load(
        bush2Url.href,
        function (obj) {
          const bush = obj;
          console.log(obj.animations);
          scene.add(bush);
          bush.position.set(-7, 0, -8);
          bush.scale.set(2, 2, 2);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  )
  // Light

  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(directionalLight);
  directionalLight.position.x = 30;
  directionalLight.position.y = 20;
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 12;

  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(dLightHelper);

  // const initialVelocity = new THREE.Vector3(0, 10, -10); // Initial velocity of the object
  // const gravity = new THREE.Vector3(0, -9.8, 0); // Gravity vector
  // let position = new THREE.Vector3(15, 15, 5); // Current position of the object
  // let velocity = initialVelocity.clone(); // Current velocity of the object
  // let time = 0; // Current time
  let step = 0;
  let speed = 0.03;
  const clock = new THREE.Clock();


  function animate() {
    if (mixer) {
      mixer.update(clock.getDelta());
    }

    if (localStorage.getItem('steakEnabled') == "true") {
      console.log(steakEnabled);
      console.log(steak);
      console.log(steak.position.x);
      step += speed;
      steak.position.y = 10 * Math.abs(Math.sin(step));
      steak.position.x = 15 * Math.abs(Math.sin(step));
    }
    // if (steak) {
    //   while (steak.position > (2,0,7)) {
    //     // Update position based on velocity and time
    //   position.add(velocity.clone().multiplyScalar(time));

    //   // Apply gravity to the velocity
    //   velocity.add(gravity.clone().multiplyScalar(time));

    //   // Update object position
    //   steak.position.copy(position);
    //   console.log(steak.position);
    //   // Increment time
    //   time += 0.0001;
    // }
    //   }

    // setInterval(playRandomAnimation, 100);



    leavesMaterial.uniforms.time.value = clock.getElapsedTime();
    leavesMaterial.uniformsNeedUpdate = true;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

}