/**
 * Practica 4
 * 
 * @author Francisco Enguix
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js" 
import { TWEEN } from "../lib/tween.module.min.js"
import { GUI } from "../lib/lil-gui.module.min.js"

// Variables estandar
let renderer, scene, camera;

// Otras globales
let robot;
let cameraControls, planta;
let gui, animation_panel;
let speed = 2;
const L = 100;

// Funciones de ventana
window.addEventListener('load', () => {
    init();
    loadGUI();
    loadScene();
    render();
});
window.addEventListener('resize', updateAspectRatio);
window.addEventListener('keydown', keydown, true); // envia el evento a keydown antes que a window



// ----------- FUNCIONES BASICAS -------------
function init() {
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0.5, 0.5, 0.5);
    document.querySelector('div').appendChild(renderer.domElement);

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();

    // Instanciar la camara
    instantiateCamera();
}

function instantiateCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(200, 300, 200);
    camera.lookAt(0, 10, 0);

    cameraControls = new OrbitControls(camera, renderer.domElement);

    setOtherCameras(aspectRatio);
}

function setOtherCameras(ar) {
    planta = new THREE.OrthographicCamera(-L, L, L, -L, 10, 10000);
    planta.position.set(0, 300, 0);
    planta.lookAt(0, 0, 0);
    planta.up = new THREE.Vector3(0, 1, -1);
}

function loadScene() {
    // Material sencillo
    const material = getNormalMaterial();

    // Robot 
    robot = getRobot(material);
    scene.add(robot);

    // Floor
    scene.add(getFloor(material));
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
    cameraControls.update();
    TWEEN.update(time);
    panelUpdate();
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

function loadGUI() {
    animation_panel = {
        giro_base: 0,
        giro_brazo: 0,
        giro_antebrazo_y: 0,
        giro_antebrazo_z: 0,
        giro_pinza: 0,
        separacion_pinza: 10,
        alambrico: false,
        animar: anima
    }

    gui = new GUI();
    gui.title("Control Robot");
    gui.add(animation_panel, "giro_base", -180, 180, 0.025).name("Giro Base");
    gui.add(animation_panel, "giro_brazo", -45, 45, 0.025).name("Giro Brazo");
    gui.add(animation_panel, "giro_antebrazo_y", -180, 180, 0.025).name("Giro Antebrazo Y");
    gui.add(animation_panel, "giro_antebrazo_z", -90, 90, 0.025).name("Giro Antebrazo Z");
    gui.add(animation_panel, "giro_pinza", -40, 220, 0.025).name("Giro Pinza");
    gui.add(animation_panel, "separacion_pinza", 0, 15, 0.025).name("Separacion Pinza");
    gui.add(animation_panel, "alambrico").name("Alambres");
    gui.add(animation_panel, "animar").name("Anima");
}

function panelUpdate() {
    robot.getObjectByName("base").rotation.y = rad(animation_panel.giro_base);
    robot.getObjectByName("brazo").rotation.z = rad(animation_panel.giro_brazo);
    robot.getObjectByName("antebrazo").rotation.y = rad(animation_panel.giro_antebrazo_y);
    robot.getObjectByName("antebrazo").rotation.z = rad(animation_panel.giro_antebrazo_z);
    robot.getObjectByName("pinza").rotation.y = rad(animation_panel.giro_pinza);
    robot.getObjectByName("pinzaI").position.y = animation_panel.separacion_pinza;
    robot.getObjectByName("pinzaD").position.y = -animation_panel.separacion_pinza;
    
    if (animation_panel.alambrico && !isWired(robot)) {
        changeMaterial(robot, getBasicMaterial()); 
    } else if (!animation_panel.alambrico && isWired(robot)) {
        changeMaterial(robot, getNormalMaterial()); 
    }
}

function isWired(robot) {
    return robot.getObjectByName("base").material.wireframe
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
function anima() {
    const initialClaps = 5;
    let turns = 0;
    let claps = initialClaps;

    const giroBaseFinal = new TWEEN.Tween(robot.getObjectByName("base").rotation)
    .to({ y: rad(-45) }, 1000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_base = deg(v.y) });

    const giroBrazoFinal = new TWEEN.Tween(robot.getObjectByName("brazo").rotation)
    .to({ z: rad(0) }, 1000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_brazo = deg(v.z) });

    const giroPinzaFinal = new TWEEN.Tween(robot.getObjectByName("pinza").rotation)
    .to({ y: rad(45) }, 1000)
    .onUpdate(v => { animation_panel.giro_pinza = deg(v.y) });

    const giroBrazo = new TWEEN.Tween(robot.getObjectByName("brazo").rotation)
    .to({ z: rad(25) }, 2500)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_brazo = deg(v.z) });

    const giroPinza = new TWEEN.Tween(robot.getObjectByName("pinza").rotation)
    .to({ y: rad(130) }, 1500)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_pinza = deg(v.y) })
    .onStart(() => {
        aplaudir.start();
    });

    const giroCisne = new TWEEN.Tween(robot.getObjectByName("base").rotation)
    .to({ y: rad(180) }, 3000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_base = deg(v.y) })
    .onStart(() => {
        giroBrazo.start();
    });

    const giroCisneInvertido = new TWEEN.Tween(robot.getObjectByName("base").rotation)
    .to({ y: rad(-180) }, 3000)
    .easing(TWEEN.Easing.Quadratic.In)
    .onUpdate(v => { animation_panel.giro_base = deg(v.y) })
    .onComplete(() => {
        giroBaseFinal.start();
    });

    const giroBase = new TWEEN.Tween(robot.getObjectByName("base").rotation)
    .to({ y: rad(-45) }, 500)
    .onUpdate(v => { animation_panel.giro_base = deg(v.y) });

    const giroAntebrazoZ = new TWEEN.Tween(robot.getObjectByName("antebrazo").rotation)
    .to({ z: rad(-65) }, 1000)
    .onUpdate(v => { animation_panel.giro_antebrazo_z = deg(v.z) })
    .onStart(() => { giroPinzaZ.start() });

    const giroPinzaZ = new TWEEN.Tween(robot.getObjectByName("pinza").rotation)
    .to({ y: rad(90) }, 1000)
    .onUpdate(v => { animation_panel.giro_pinza = deg(v.y) });

    const aplaudir = new TWEEN.Tween(robot.getObjectByName("pinzaI").position)
    .to({ y: 2 }, 400)
    .onUpdate(v => { animation_panel.separacion_pinza = v.y })
    .easing(TWEEN.Easing.Back.In)
    .onComplete(() => {claps -= 1; desaplaudir.start()});

    const desaplaudir = new TWEEN.Tween(robot.getObjectByName("pinzaI").position)
    .to({ y: 10 }, 600)
    .onUpdate(v => { animation_panel.separacion_pinza = v.y })
    .easing(TWEEN.Easing.Back.Out)
    .onComplete(() => {
        if (claps > 0)
            aplaudir.start();
        else { 
            if (turns++ == 0)
                giroCisne.start();
            else {
                giroPinzaFinal.start();
                giroPinzaFinal.chain(giroBrazoFinal);
            }
            claps = initialClaps; 
        }
    });
    
    giroBase.chain(giroAntebrazoZ);
    giroAntebrazoZ.chain(aplaudir);
    giroCisne.chain(giroCisneInvertido);
    giroBrazo.chain(giroPinza);
    giroBase.start();
}
// -------------------------------------------



// ------------ TECLAS -----------------------
function keydown(e) {
    let key = e.key;
    let captured = true;

    switch(key) {
        case "ArrowLeft":
            robot.position.z += speed;
            break;
        case "ArrowRight":
            robot.position.z -= speed;
            break;
        case "ArrowUp":
            robot.position.x -= speed;
            break;
        case "ArrowDown":
            robot.position.x += speed;
            break;
        default:
            captured = false;
    }

    if (captured) {
        e.preventDefault();
        planta.position.x = robot.position.x;
        planta.position.z = robot.position.z;
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




// ------------------ ROBOT ------------------
function getRobot(material) {
    const rob = new THREE.Object3D();
    const base = getBase(material);
    base.name = "base";

    // Robot hierarchy
    rob.add(base);
    return rob;
}

function getBase(material) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 64), material);
    base.position.set(0, 0, 0);
    const brazo = getBrazo(material);
    brazo.name = "brazo";
    base.add(brazo);
    return base;
}

function getBrazo(material) {
    const brazo = new THREE.Object3D();
    brazo.position.set(0, 15 / 2, 0);

    const eje = getEje(material);
    const esparrago = getEsparrago(material);
    const rotula = getRotula(material);
    const antebrazo = getAntebrazo(material);

    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    brazo.add(antebrazo);

    return brazo;
}

function getEje(material) {
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 64), material);
    eje.rotation.x = (-Math.PI / 2);
    eje.position.set(0, 0, 0);
    return eje;
}

function getEsparrago(material) {
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 12, 64, 64), material);
    esparrago.rotateY(Math.PI / 2);
    esparrago.position.set(0, 120 / 2, 0);
    return esparrago;
}

function getRotula(material) {
    const rotula = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), material);
    rotula.position.set(0, 120, 0);
    return rotula;
}

function getAntebrazo(material) {
    const antebrazo = new THREE.Object3D();
    antebrazo.name = "antebrazo";
    antebrazo.position.set(0, 120, 0);

    const disco = getDisco(material);
    const nervios = getNervios(material);

    const mano = getMano(material);
    mano.name = "mano";

    antebrazo.add(disco);
    nervios.forEach((nervio) => { antebrazo.add(nervio); });
    antebrazo.add(mano);

    return antebrazo;
}

function getDisco(material) {
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 64), material);
    disco.position.set(0, 0, 0);
    return disco;
}

function getNervios(material) {
    const sep = 6;
    const nervios = [];
    const positions = [[sep, sep], [sep, -sep], [-sep, sep], [-sep, -sep]];
    positions.forEach((pos) => {
        const nervio = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material);
        nervio.position.set(pos[0], 80 / 2 + 6, pos[1]);
        nervios.push(nervio);
    });
    return nervios;
}

function getMano(material) {
    const mano = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 64), material);
    mano.position.set(0, 80 + 6, 0);
    mano.rotation.x = Math.PI / 2;
    

    const pinzaI = getPinza(material);
    pinzaI.name = "pinzaI";
    pinzaI.position.set(15, 10, 0);
    const pinzaD = getPinza(material);
    pinzaD.name = "pinzaD"
    pinzaD.rotateX(Math.PI);
    pinzaD.position.set(15, -10, 0);

    const pinza = new THREE.Object3D();
    
    pinza.add(pinzaI);
    pinza.add(pinzaD);
    pinza.name = "pinza";

    mano.add(pinza);
    return mano;
}

function getPinza(material) {
    const pinza = new THREE.Mesh(new THREE.BoxGeometry(19, 20, 4, 8), material);
    pinza.rotation.x = (Math.PI / 2);
    const pinzaTip = getPinzaTip(material);
    pinzaTip.position.set(19, 0, 0);
    pinza.add(pinzaTip);
    return pinza;
}

function getPinzaTip(material) {
    const pinzaTip = new THREE.Mesh(getPinzaTipGeometry(), material);
    return pinzaTip;
}

function getPinzaTipGeometry() {
    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    const newVertices = [

        // Back face
        { pos: [-9.5, -10, 2], norm: [-1, 0, 0], uv: [0, 0] }, // 0
        { pos: [-9.5, -10, -2], norm: [-1, 0, 0], uv: [0, 1] }, // 1
        { pos: [-9.5, 10, -2], norm: [-1, 0, 0], uv: [1, 0] }, // 2
        { pos: [-9.5, 10, 2], norm: [-1, 0, 0], uv: [1, 1] }, // 3

        // Top face
        { pos: [-9.5, -10, 2], norm: [0, -1, 0], uv: [0, 0] },   // 4
        { pos: [-9.5, -10, -2], norm: [0, -1, 0], uv: [0, 1] },   // 5
        { pos: [9.5, -10, 0], norm: [0, -1, 0], uv: [1, 0] },   // 6
        { pos: [9.5, -10, 2], norm: [0, -1, 0], uv: [1, 1] },   // 7

        // Bottom face
        { pos: [-9.5, 10, 2], norm: [0, 1, 0], uv: [0, 0] }, // 8
        { pos: [-9.5, 10, -2], norm: [0, 1, 0], uv: [0, 1] }, // 9
        { pos: [9.5,  10,  0], norm: [0, 1, 0], uv: [1, 0] }, // 10
        { pos: [9.5,  10,  2], norm: [0, 1, 0], uv: [1, 1] }, // 11

        // Front face
        { pos: [9.5, -10, 2], norm: [1, 0, 0], uv: [0, 0] },     // 12
        { pos: [9.5, -10, 0], norm: [1, 0, 0], uv: [0, 1] },     // 13
        { pos: [9.5,  10,  0], norm: [1, 0, 0], uv: [1, 0] },    // 14
        { pos: [9.5,  10,  2], norm: [1, 0, 0], uv: [1, 1] },    // 15

        // Right face
        { pos: [-9.5, -10, 2], norm: [0, 0, 1], uv: [0, 0] },    // 16
        { pos: [-9.5, 10, 2], norm: [0, 0, 1], uv: [0, 1] },   // 17
        { pos: [9.5, -10, 2], norm: [0, 0, 1], uv: [1, 0] },     // 18
        { pos: [9.5,  10,  2], norm: [0, 0, 1], uv: [1, 1] },    // 19

        // Left face
        { pos: [-9.5, -10, -2], norm: [0, 0, -1], uv: [0, 0] },   // 20
        { pos: [-9.5, 10, -2], norm: [0, 0, -1], uv: [0, 1] },  // 21
        { pos: [9.5, -10, 0], norm: [0, 0, -1], uv: [1, 0] },     // 22
        { pos: [9.5,  10,  0], norm: [0, 0, -1], uv: [1, 1] },    // 23
    ];
    const positions = [];
    const normals = [];
    const uvs = [];
    for (const vertex of newVertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
    }
    geometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
    );
    geometry.setAttribute(
        'normal', 
        new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
    );
    geometry.setAttribute(
        'uv', 
        new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
    );
    geometry.setIndex([
        2, 1, 0, 0, 3, 2,       // Back face
        4, 5, 6, 6, 7, 4,       // Top face
        10, 9, 8, 8, 11, 10,    // Bot face
        12, 13, 14, 14, 15, 12, // Front face
        16, 18, 17, 17, 18, 19, // Right face
        20, 21, 22, 21, 23, 22, // Left face
    ]);
    return geometry;
}
// -------------------------------------------