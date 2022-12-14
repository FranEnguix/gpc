/**
 * Practica 3
 * 
 * @author Francisco Enguix
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js" 

// Variables estandar
let renderer, scene, camera;

// Otras globales
let robot;
let cameraControls, planta;
const L = 100;

// Funciones de ventana
window.addEventListener('load', () => {
    init();
    loadScene();
    render();
});
window.addEventListener('resize', updateAspectRatio);




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
    camera.position.set(0, 200, 400);
    camera.position.set(200, 300, 200);
    camera.lookAt(0, 1, 0);

    cameraControls = new OrbitControls(camera, renderer.domElement);

    setOtherCameras(aspectRatio);
}

function setOtherCameras(ar) {
    planta = new THREE.OrthographicCamera(-L, L, L, -L, 10, 10000);
    planta.position.set(0, 400, 0);
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
    cameraControls.update();
}

function updateAspectRatio() {
  // Nueva relacion de aspecto de camara
  const aspectRatio = window.innerWidth / window.innerHeight;

  // Cambiar dimensiones del canvas`
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Actualizar perspectiva
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
  planta.updateProjectionMatrix();
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

    // Robot hierarchy
    rob.add(base);
    return rob;
}

function getBase(material) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 64), material);
    base.position.set(0, 0, 0);
    const brazo = getBrazo(material);
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
    eje.rotateZ(Math.PI / 2);
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
    antebrazo.position.set(0, 120, 0);

    const disco = getDisco(material);
    const nervios = getNervios(material);

    const mano = getMano(material);

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
    mano.rotateZ(Math.PI / 2);

    const pinzaI = getPinza(material);
    pinzaI.position.set(0, 10, 15);
    const pinzaD = getPinza(material);
    pinzaD.rotateY(Math.PI);
    pinzaD.position.set(0, -10, 15);

    mano.add(pinzaI);
    mano.add(pinzaD);
    return mano;
}

function getPinza(material) {
    const pinza = new THREE.Mesh(new THREE.BoxGeometry(20, 19, 4, 8), material);
    pinza.rotateX(Math.PI / 2);
    const pinzaTip = getPinzaTip(material);
    pinzaTip.position.set(0, 19, 0);
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
        { pos: [ 10, -9.5, -2], norm: [0, -1, 0], uv: [0, 0] }, // 0
        { pos: [ 10, -9.5,  2], norm: [0, -1, 0], uv: [0, 1] }, // 1
        { pos: [-10, -9.5, -2], norm: [0, -1, 0], uv: [1, 0] }, // 2
        { pos: [-10, -9.5,  2], norm: [0, -1, 0], uv: [1, 1] }, // 3

        // Top face
        { pos: [10, -9.5, -2], norm: [1, 0, 0], uv: [0, 0] },   // 4
        { pos: [10, -9.5,  2], norm: [1, 0, 0], uv: [0, 1] },   // 5
        { pos: [10,  9.5,  0], norm: [1, 0, 0], uv: [1, 0] },   // 6
        { pos: [10,  9.5,  2], norm: [1, 0, 0], uv: [1, 1] },   // 7

        // Bottom face
        { pos: [-10, -9.5, -2], norm: [-1, 0, 0], uv: [0, 0] }, // 8
        { pos: [-10, -9.5,  2], norm: [-1, 0, 0], uv: [0, 1] }, // 9
        { pos: [-10,  9.5,  0], norm: [-1, 0, 0], uv: [1, 0] }, // 10
        { pos: [-10,  9.5,  2], norm: [-1, 0, 0], uv: [1, 1] }, // 11

        // Front face
        { pos: [10, 9.5, 0], norm: [0, 1, 0], uv: [0, 0] },     // 12
        { pos: [10, 9.5, 2], norm: [0, 1, 0], uv: [0, 1] },     // 13
        { pos: [-10, 9.5, 0], norm: [0, 1, 0], uv: [1, 0] },    // 14
        { pos: [-10, 9.5, 2], norm: [0, 1, 0], uv: [1, 1] },    // 15

        // Right face
        { pos: [10, -9.5, 2], norm: [0, 0, 1], uv: [0, 0] },    // 16
        { pos: [-10, -9.5, 2], norm: [0, 0, 1], uv: [0, 1] },   // 17
        { pos: [10, 9.5, 2], norm: [0, 0, 1], uv: [1, 0] },     // 18
        { pos: [-10, 9.5, 2], norm: [0, 0, 1], uv: [1, 1] },    // 19

        // Left face
        { pos: [10, -9.5, -2], norm: [0, 0, -1], uv: [0, 0] },   // 20
        { pos: [-10, -9.5, -2], norm: [0, 0, -1], uv: [0, 1] },  // 21
        { pos: [10, 9.5, 0], norm: [0, 0, -1], uv: [1, 0] },     // 22
        { pos: [-10, 9.5, 0], norm: [0, 0, -1], uv: [1, 1] },    // 23
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
        0, 1, 2, 1, 3, 2,       // Back face
        4, 7, 5, 4, 6, 7,       // Top face
        9, 11, 8, 11, 10, 8,    // Bot face
        14, 13, 12, 14, 15, 13, // Front face
        16, 18, 17, 17, 18, 19, // Right face
        21, 22, 20, 21, 23, 22, // Left face
    ]);
    return geometry;
}
// -------------------------------------------