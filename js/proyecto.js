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

// Variables estandar
let renderer, scene, camera;

// Otras globales
let loader, mixer, bat, moth, city;
let light;
let clock, delta, interval;
let cameraControls, planta;
let flyControl, moveVector;
let gui, animation_panel;
let speed = 2;
const L = 5000;

// Funciones de ventana
window.addEventListener('load', () => {
    init();
    // loadGUI();
    loadScene();
    // Lights
    addLights();
    render();
});
window.addEventListener('resize', updateAspectRatio);
window.addEventListener('keydown', keydown, true); // envia el evento a keydown antes que a window



// ----------- FUNCIONES BASICAS -------------
function init() {
    clock = new THREE.Clock();
    delta = 0;
    interval = 1 / 60;

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

    flyControl = new FlyControls(camera, renderer.domElement);
    flyControl.autoForward = false;
    flyControl.movementSpeed = 50;
    flyControl.rollSpeed = 0.05;
    flyControl.dragToLook = true;
}

function instantiateCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100000);
    camera.position.set(90, 518, 1670);
    camera.lookAt(90, 518, 1670);

    // cameraControls = new OrbitControls(camera, renderer.domElement);

    setOtherCameras(aspectRatio);
}

function setOtherCameras(ar) {
    planta = new THREE.OrthographicCamera(-L, L, L, -L, 10, 10000);
    planta.position.set(0, 3000, 0);
    planta.lookAt(0, 0, 0);
    planta.up = new THREE.Vector3(0, 1, -1);
}

function loadScene() {
    // Material sencillo
    const material = getNormalMaterial();

    // Robot 
    // robot = getRobot(material);
    // scene.add(robot);

    // Morcielago
    loader = new GLTFLoader();
    loader.load('models/bat/scene.gltf',
    function(gltf)
    {
        let batClip;
        bat = gltf.scene;
        bat.position.set(
            camera.position.x, 
            camera.position.y, 
            camera.position.z + 2
        );
        // bat.rotation.y = Math.PI / 2;
        mixer = new THREE.AnimationMixer(bat);
        gltf.animations.forEach( (clip) => {
            batClip = mixer.clipAction(clip);
        });
        batClip.timeScale = 2;
        batClip.play();
        scene.add(bat);
    });

    // Ciudad
    // loader = new GLTFLoader();
    loader.load('models/city/scene.gltf',
    function(gltf)
    {
        // let cityClip;
        city = gltf.scene;
        city.position.set(0, 0, 0);
        // city.rotation.y = Math.PI / 2;
        // mixer = new THREE.AnimationMixer(city);
        // gltf.animations.forEach( (clip) => {
        //     cityClip = mixer.clipAction(clip);
        // });
        // cityClip.timeScale = 2;
        // cityClip.play();
        scene.add(city);
    });

    // const pointLight = new THREE.PointLight(0xffffff, 1);
    // pointLight.position.set(0, 15, 0);
    // scene.add(pointLight);

    // Floor
    // scene.add(getFloor(material));
}

function addLights() {
    light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);
}

function render(time) {
    requestAnimationFrame(render);
    update(time);

    renderer.clear();

    // Camara esquina
    const size = Math.min(window.innerWidth / 4, window.innerHeight / 4);
    renderer.setViewport(0, window.innerHeight - size, size, size);
    renderer.render(scene, planta);

    // Camara principal
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function update(time) {
    delta += clock.getDelta();
    if (delta > interval) {
        // cameraControls.update();
        if (bat) {
            planta.position.set(bat.position.x, bat.position.y + 10, bat.position.z);
            // camera.lookAt(bat.position.x, bat.position.y + 2, bat.position.z);
            // camera.position.set(bat.position.x, bat.position.y + 2, bat.position.z + 6);
            mixer.update(1 / 250);

            
            
            delta = 0;  
        }
    }
    if (bat) {
        bat.position.set(
            camera.position.x, 
            camera.position.y, 
            camera.position.z - 2
        );
    }
    flyControl.update(0.5);
    TWEEN.update(time);
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
  planta.updateProjectionMatrix();
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
// -------------------------------------------


// ------------ ANIMACIONES ------------------

// -------------------------------------------



// ------------ TECLAS -----------------------
function keydown(e) {
    let key = e.key;
    let captured = true;

    switch(key) {
        case " ":
            console.log(camera.position);
            break;
        case "ArrowLeft":
            break;
        case "ArrowRight":
            break;
        case "ArrowUp":
            break;
        case "ArrowDown":
            break;
        default:
            console.log(key);
            captured = false;
    }

    if (captured) {
        // e.preventDefault();
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