/**
 * Practica 2
 * 
 * @author Francisco Enguix
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import { OrbitControls } from "../lib/OrbitControls.module.js" 

// Variables estandar
let renderer, scene, camera, cameraControls;

// Otras globales
let robot;

window.addEventListener('load', () => {
    // Acciones
    init();
    loadScene();
    render();
});

function instantiateCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 200, 400);
    camera.lookAt(0, 0, 0);

    cameraControls = new OrbitControls(camera, renderer.domElement);
}

function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('div').appendChild(renderer.domElement);

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    // Instanciar la camara
    instantiateCamera();
}

function getBasicMaterial() {
    return new THREE.MeshBasicMaterial(
        { color: 'yellow', wireframe: false }
    );
}

function getNormalMaterial() {
    return new THREE.MeshNormalMaterial(
        { color: 'green', wireframe: false, flatShading: true }
    );
}

function getFloor(material) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), material);
    floor.rotation.x = -Math.PI/2;
    return floor;
}

function getBase(material) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 64), material);
    base.position.set(0, 0, 0);
    return base;
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

function getDisco(material) {
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 64), material);
    disco.position.set(0, 0, 0);
    return disco;
}

function getNervios(material) {
    const nervios = [];
    const positions = [[8, 4], [8, -4], [-8, 4], [-8, -4]];
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
    camera.position.set(pinzaI.position.x, pinzaI.position.y + 250, pinzaI.position.z + 80)
    return mano;
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

function getPinzaTipGeometry() {
    // const vertices = [
    //     // front
    //     { pos: [-10, -10,  10], norm: [ 0,  0,  1], uv: [0, 1], },
    //     { pos: [ 10, -10,  10], norm: [ 0,  0,  1], uv: [1, 1], },
    //     { pos: [-10,  10,  10], norm: [ 0,  0,  1], uv: [0, 0], },
        
    //     { pos: [-10,  10,  1], norm: [ 0,  0,  1], uv: [0, 0], },
    //     { pos: [ 10, -10,  1], norm: [ 0,  0,  1], uv: [1, 1], },
    //     { pos: [ 10,  10,  1], norm: [ 0,  0,  1], uv: [1, 0], },
    //     // right
    //     { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
    //     { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
    //     { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
        
    //     { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
    //     { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
    //     { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
    //     // back
    //     { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
    //     { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
    //     { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
        
    //     { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
    //     { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
    //     { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
    //     // left
    //     { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], },
    //     { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
    //     { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
        
    //     { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
    //     { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
    //     { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 0], },
    //     // top
    //     { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 1], },
    //     { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
    //     { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
        
    //     { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
    //     { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
    //     { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 0], },
    //     // bottom
    //     { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 1], },
    //     { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
    //     { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
        
    //     { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
    //     { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
    //     { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], },
    // ];

    // const positions = [];
    // const normals = [];
    // const uvs = [];
    // for (const vertex of vertices) {
    //     positions.push(...vertex.pos);
    //     normals.push(...vertex.norm);
    //     uvs.push(...vertex.uv);
    // }

    // const geometry = new THREE.BufferGeometry();
    // const positionNumComponents = 3;
    // const normalNumComponents = 3;
    // const uvNumComponents = 2;
    // geometry.setAttribute(
    //     'position', 
    //     new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
    // );
    // geometry.setAttribute(
    //     'normal',
    //     new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
    // );
    // geometry.setAttribute(
    //     'uv',
    //     new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
    // );
    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const vertices = [
        10, -9.5, -2,
        10, -9.5, 2,
        -10, -9.5, -2,
        -10, -9.5, 2,

        6, 9.5, 0,
        6, 9.5, 2,
        -6, 9.5, 0,
        -6, 9.5, 2,
        /*
        0, 0, 0,
        19, 8, 0,
        19, 8, 2,
        0, 0, 4,
        19, 12, 2,
        19, 12, 0,
        0, 20, 4,
        0, 20, 0
        */
    ];
    geometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(new Float32Array(vertices), positionNumComponents)
    );
    geometry.setIndex([
        0, 1, 2, 1, 3, 2,   // Back face
        0, 5, 1, 0, 4, 5,   // Up face
        3, 7, 2, 7, 6, 2,   // Down face
        6, 5, 4, 6, 7, 5,   // Front face
        1, 5, 3, 3, 5, 7,   // Right face
        2, 4, 0, 2, 6, 4    // Left face
    ]);
    return geometry;
}

function getPinza(material) {
    const pinza = new THREE.Mesh(new THREE.BoxGeometry(20, 19, 4, 8), material);
    // prePinza.position.set(0, 0, 15);
    pinza.rotateX(Math.PI / 2);
    const pinzaTip = getPinzaTip(material);
    pinzaTip.position.set(0, 19, 0);
    pinza.add(pinzaTip);
    return pinza;
}

function getPinzaTip(material) {
    const pinzaTip = new THREE.Mesh(getPinzaTipGeometry(), getNormalMaterial());
    return pinzaTip
}


function loadScene()
{
    // Material sencillo
    const material = getNormalMaterial();

    // Robot 
    robot = new THREE.Object3D();
    const base = getBase(material);
    const brazo = getBrazo(material);

    // Robot hierarchy
    robot.add(base);
    base.add(brazo);
    scene.add(robot);

    // Floor
    scene.add(getFloor(material));

    // // Esfera y cubo
    // const esfera = new THREE.Mesh( new THREE.SphereGeometry(1,20,20), material );
    // const cubo = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), material );
    // esfera.position.x = 1;
    // cubo.position.x = -1;

    // esferaCubo = new THREE.Object3D();
    // esferaCubo.add(esfera);
    // esferaCubo.add(cubo);
    // esferaCubo.position.y = 1.5;

    // scene.add(esferaCubo);

    // scene.add( new THREE.AxesHelper(3) );
    // cubo.add( new THREE.AxesHelper(1) );

    // Modelos importados
    // const loader = new THREE.ObjectLoader();
    // loader.load('models/soldado/soldado.json', 
    // function (objeto)
    // {
    //     cubo.add(objeto);
    //     objeto.position.y = 1;
    // });

    // const glloader = new GLTFLoader();
    // glloader.load('models/RobotExpressive.glb',
    // function(objeto)
    // {
    //     esfera.add(objeto.scene);
    //     objeto.scene.scale.set(0.5,0.5,0.5);
    //     objeto.scene.position.y = 1;
    //     objeto.scene.rotation.y = -Math.PI/2;
    //     console.log("ROBOT");
    //     console.log(objeto);
    // });
}

function update()
{
    cameraControls.update();
    // angulo += 0.01;
    // esferaCubo.rotation.y = angulo;
}

function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}
