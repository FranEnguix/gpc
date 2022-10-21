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
let loader, mixer, bat, batModel, moth, city, pointer, ball;
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
    flyControl.movementSpeed = 2500;
    flyControl.rollSpeed = 0.8;
    flyControl.dragToLook = true;
}

function instantiateCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100000);
    camera.position.set(90, 518, 1670);
    camera.lookAt(90, 518, 1670);
    scene.add(camera);

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

    // Pointer
    pointer = new THREE.Object3D();
    ball = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), material);
    pointer.position.set(0,0,0);
    
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = -155;
    pointer.add(ball);
    camera.add(pointer);
    // pointer.position.x = 0;
    // pointer.position.y = 0;
    // pointer.position.z = -155;

    // pointer.position.x = 0;
    // pointer.position.y = 0;
    // pointer.position.z = 0;

    // Morcielago
    loader = new GLTFLoader();
    loader.load('models/bat/scene.gltf',
    function(gltf)
    {
        let batClip;
		bat = new THREE.Object3D();
        // pointer.position.z = -1;
		// bat.position.set(
        //     camera.position.x, 
        //     camera.position.y, 
        //     camera.position.z,
        // );
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
		batModel.position.y = -0.4;
		batModel.position.z = -0.4;

        batClip.timeScale = 0.5;
        batClip.play();
		bat.add(batModel);
		
        camera.add(bat);
        // scene.add(bat);
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

function render() {
    requestAnimationFrame(render);
    update();

    renderer.clear();

    // Camara esquina
    const size = Math.min(window.innerWidth / 4, window.innerHeight / 4);
    renderer.setViewport(0, window.innerHeight - size, size, size);
    renderer.render(scene, planta);

    // Camara principal
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function update() {
    delta = clock.getDelta();
	if (bat) {
		planta.position.set(bat.position.x, bat.position.y + 10, bat.position.z);
		// camera.lookAt(bat.position.x, bat.position.y + 2, bat.position.z);
		// camera.position.set(bat.position.x, bat.position.y + 2, bat.position.z + 6);
		// mixer.update(1 / 250);
		mixer.update(delta);
		flyControl.update(delta);


        let ballWorld = new THREE.Vector3();
        ball.getWorldPosition(ballWorld);
        let direction = new THREE.Vector3();
        direction.subVectors(ballWorld, camera.position).normalize();
        // console.log(direction);
        // const frontOfBat = new THREE.Vector3(bat.position.x, bat.position.y, bat.position.z);
        // const batWorld = bat.position.getWorldPosition(new THREE.Vector3());
        // const ballWorld = ball.position.getWorldPosition(new THREE.Vector3());
        const raycaster = new THREE.Raycaster(camera.position, direction, 1, 100);
        const intersects = raycaster.intersectObjects(scene.children);
        for ( let i = 0; i < intersects.length; i ++ ) {
            console.log("interse");
            const distance = camera.position.distanceTo(intersects[i].object.position);
            if (distance < 10000)
                intersects[i].object.material.color.set( 0xff0000 );
        }


        // bat.position.set(
        //     camera.position.x, 
        //     camera.position.y, 
        //     camera.position.z
        // );
		// camera.lookAt
        // worldPos.setFromMatrixPosition( bat.matrixWorld );
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
            console.log("camera", camera.position);
            break;
        case "ArrowLeft":
			camera.position.x += 5;
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