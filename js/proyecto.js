/**
 * Proyecto final
 * 
 * @author Francisco Enguix
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js"; 
import { TWEEN } from "../lib/tween.module.min.js";
import { GUI } from "../lib/lil-gui.module.min.js";
import { FlyControls } from "../lib/FlyControls.js";
import * as SkeletonUtils from "../lib/SkeletonUtils.js";

// Variables estandar
let renderer, scene, camera;

// Otras globales
let loader, mixer, mothMixers;
let mothSpawners, mothSpawnersActive, mothSpawnersInactive, mothsActive;
let bat, batModel, moths, city, pointer, ball;
let light;
let clock, delta, interval;
let flyControl;
let gui, animation_panel;
let speed = 2;
const L = 5000;

let debugMode = false;

// Funciones de ventana
window.addEventListener('load', () => {
    init();
    // loadGUI();
    loadScene();
    // Lights
    addLights();
    render();
    // Debug
    updateDebugOptions(debugMode);
});
window.addEventListener('resize', updateAspectRatio);
window.addEventListener('keydown', keydown, true); // envia el evento a keydown antes que a window



// ----------- FUNCIONES BASICAS -------------
function init() {
    clock = new THREE.Clock();
    delta = 0;
    interval = 1 / 60;
    setupMothSpawners();

    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0.16, 0.16, 0.16);
    document.querySelector('div').appendChild(renderer.domElement);

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();

    // Instanciar la camara
    instantiateCamera();
    initFlightControls(camera);
}

function setupMothSpawners() {
    mothsActive = 5;
    mothSpawnersActive = [];
    mothSpawnersInactive = [];
    mothSpawners = [
        new THREE.Vector3(-14, 1, -20),     // Primera
    ];
    mothsActive = Math.min(mothsActive, mothSpawners.length);
}

function instantiateCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(28, aspectRatio, 0.01, 1000);
    // camera.position.set(90, 518, 1670);
    // camera.lookAt(90, 518, 1670);
    camera.position.set(-14, 1, -7);
    camera.lookAt(-14, 1, -8);
    scene.add(camera);
}

function initFlightControls(camera) {
    flyControl = new FlyControls(camera, renderer.domElement);
    flyControl.autoForward = false;
    flyControl.movementSpeed = 5;
    flyControl.rollSpeed = 0.7;
    flyControl.dragToLook = true;
}

function loadScene() {
    loader = new GLTFLoader();

    // Pointer for raycast obstacles
    loadPointer();
    loadBat();
    loadCity();
    loadMoths();
}

function loadPointer() {
    // Material sencillo
    const material = getNormalMaterial();

    pointer = new THREE.Object3D();
    ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), material);
    ball.scale.set(0.1, 0.1, 0.1);
    pointer.position.set(0,0,0);

    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = -3;
    pointer.add(ball);
    camera.add(pointer);
}

function loadBat() {
    loader.load('models/bat/scene.gltf',
    function(gltf)
    {
        let batClip;
        bat = new THREE.Object3D();
        bat.name = "bat";
        bat.position.set(
            0,0,0
        );

        batModel = gltf.scene;
        batModel.rotation.y = Math.PI / 2;
        mixer = new THREE.AnimationMixer(batModel);
        gltf.animations.forEach( (clip) => {
            batClip = mixer.clipAction(clip);
        });
        batModel.position.x = 0;
        batModel.position.y = -0.0048;
        batModel.position.z = -0.018;
        batModel.scale.set(0.01, 0.01, 0.01);

        batClip.timeScale = 0.5;
        batClip.play();
        bat.add(batModel);
        
        camera.add(bat);
    });
}

function loadCity() {
    // Ciudad
    loader.load('models/city/scene.gltf',
    function(gltf)
    {
        city = gltf.scene;
        city.receiveShadow = true;
        city.scale.set(0.002, 0.002, 0.002);
        city.position.set(0, 0, 0);
        scene.add(city);
    });
}

function loadMoths() {
    loadMoth();
}

function loadMoth() {
    moths = [];
    mothMixers = [];
    // Polilla
    loader.load('models/moth/scene.gltf',
    function(gltf)
    {
        let moth = gltf.scene;
        moth.receiveShadow = true;
        moth.name = "moth";
        let mothClip = null;
        let mothMixer = new THREE.AnimationMixer(moth);
        mothClip = mothMixer.clipAction(gltf.animations[1]);
        moth.scale.set(0.00012, 0.00012, 0.00012);
        mothClip.timeScale = 1;
        mothClip.play();
        mothMixers.push(mothMixer);
        moth.position.x = camera.position.x + 4;
        moth.position.y = camera.position.y + 2;
        moth.position.z = camera.position.z + 4;
        moth.position.set(0, 1, 0);

        moth.position.x += Math.random() * 1.5;
        moth.position.z += Math.random() * 1.5;
        scene.add(moth);
        console.log(moth);
        moths.push(moth);

        
        for (let i = 1; i < mothsActive + 3; i++) {
            let newMoth = SkeletonUtils.clone(moth);
            let mothClip = null;
            let mothMixer = new THREE.AnimationMixer(newMoth);
            mothClip = mothMixer.clipAction(gltf.animations[1]);
            mothClip.timeScale = 1;
            mothClip.play();
            mothMixers.push(mothMixer);
            newMoth.position.x += Math.random() * 5;
            newMoth.position.z += Math.random() * 5;
            console.log(newMoth)
            scene.add(newMoth);
            moths.push(newMoth);
        }
    });
}

function addLights() {
    light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);
}

function render() {
    requestAnimationFrame(render);
    update();

    renderer.clear();

    // Camara esquina
    // const size = Math.min(window.innerWidth / 4, window.innerHeight / 4);
    // renderer.setViewport(0, window.innerHeight - size, size, size);
    // renderer.render(scene, planta);

    // Camara principal
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function update() {
    delta = clock.getDelta();
	if (bat) {
		// mixer.update(1 / 250);
		mixer.update(delta);
        mothMixers.forEach(mixer => {
            mixer.update(delta);
        });
		flyControl.update(delta);

        collisionDetect();
        detectEatMoth();
    }
    
    TWEEN.update(delta);
    // panelUpdate();
}

function updateAspectRatio() {
  // Nueva relacion de aspecto de camara
  const aspectRatio = window.innerWidth / window.innerHeight;

  // Cambiar dimensiones del canvas
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Actualizar perspectiva
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
}

function changeMaterial(obj, material) {
    let stack = [obj];
    while (stack.length > 0) {
        let part = stack.pop();
        if (part.material)
            part.material = material;
        if (part.children && part.children.length > 0)
            part.children.forEach(p => {
                stack.push(p);
            });
    }
}

function detectEatMoth() {
    const threshold = 5;
    moths.forEach(m => {
        const distance = camera.position.distanceTo(m.position);
        if (distance < threshold) {
            m.visible = false;
        }
    });
}

function collisionDetect() {
    let ballWorld = new THREE.Vector3();
    ball.getWorldPosition(ballWorld);
    let direction = new THREE.Vector3();
    direction.subVectors(ballWorld, camera.position).normalize();
    const raycaster = new THREE.Raycaster(camera.position, direction, 1, 2);
    const intersects = raycaster.intersectObjects(scene.children);
    for ( let i = 0; i < intersects.length; i ++ ) {
        let name = intersects[i].object.name;
        if (name != "moth" && name != "bat") {
            console.log("interse");
            intersects[i].object.material.color.set( 0xff0000 );
        }
    }
}

function updateDebugOptions(debugMode) {
    if (ball)
        ball.visible = debugMode;
}

function initGame() {

}
// -------------------------------------------


// ------------ ANIMACIONES ------------------

// -------------------------------------------



// ------------ TECLAS -----------------------
function keydown(e) {
    let key = e.key;
    let captured = true;

    switch(key) {
        case " ":
            ball.visible = !ball.visible;
            console.log("camera", camera.position);
            break;
        case "F3":
            debugMode = !debugMode;
            updateDebugOptions();
            break;
        default:
            // console.log(key);
            captured = false;
    }

    if (captured) {
        e.preventDefault();
    }
}
// -------------------------------------------






// ------------ FUNCIONES UTILIDAD -----------
function rad(deg) {
    return deg * (Math.PI / 180);
}

function deg(rad) {
    return rad * (180 / Math.PI); 
}
// -------------------------------------------




// -------------- MATERIALES -----------------
function getBasicMaterial() {
    return new THREE.MeshBasicMaterial(
        { color: 'yellow', wireframe: true }
    );
}

function getNormalMaterial() {
    return new THREE.MeshNormalMaterial(
        { wireframe: false, flatShading: true }
    );
}
// -------------------------------------------





// ------------------ SUELO ------------------
function getFloor(material) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), material);
    floor.rotation.x = -Math.PI/2;
    return floor;
}
// -------------------------------------------