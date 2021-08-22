import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
  pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

  if (pointIsWorld) {
    obj.parent.localToWorld(obj.position); // compensate for world coordinate
  }

  obj.position.sub(point); // remove the offset
  obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
  obj.position.add(point); // re-add the offset

  if (pointIsWorld) {
    obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
  }

  obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

const loader = new GLTFLoader();

loader.load('/assets/models/my_computer/scene.gltf', function (gltf) {

  scene.add(gltf.scene);
  console.log(dumpObject(gltf.scene).join('\n'));

}, undefined, function (error) {

  console.error(error);

});


// Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight1 = new THREE.PointLight(0x00ffff);
const pointLight2 = new THREE.PointLight(0xff00ff);
const pointLight3 = new THREE.PointLight(0xffff00);

pointLight1.position.set(20, 5, -10);
pointLight2.position.set(-20, 5, -10);
pointLight3.position.set(0, 10, 20);


const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight1, pointLight2, pointLight3, ambientLight);

// Helpers

const lightHelper1 = new THREE.PointLightHelper(pointLight1)
const lightHelper2 = new THREE.PointLightHelper(pointLight2)
const lightHelper3 = new THREE.PointLightHelper(pointLight3)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper1, lightHelper2, lightHelper3, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('/assets/space.jpeg');
scene.background = spaceTexture;

// Avatar

/* const jeffTexture = new THREE.TextureLoader().load('/assets/jeff.png');

const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));

scene.add(jeff); */

// Moon

const moonTexture = new THREE.TextureLoader().load('/assets/moon.jpeg');
const normalTexture = new THREE.TextureLoader().load('/assets/normal.jpeg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

/* jeff.position.z = -5;
jeff.position.x = 2; */

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

/*   jeff.rotation.y += 0.01;
  jeff.rotation.z += 0.01; */

/*   camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002; */
}

document.body.onscroll = moveCamera;
moveCamera();


const centerpoint = new THREE.Vector3(0,0,0);
const rotationaxis = new THREE.Vector3(1,1,0).normalize();
const rotrate = 0.01;

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  rotateAboutPoint(pointLight1, centerpoint, rotationaxis, rotrate, false);
  rotateAboutPoint(pointLight2, centerpoint, rotationaxis, rotrate, false);
  rotateAboutPoint(pointLight3, centerpoint, rotationaxis, rotrate, false);

  moon.rotation.x += 0.005;

  controls.update();

  renderer.render(scene, camera);
}

animate();

window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

};