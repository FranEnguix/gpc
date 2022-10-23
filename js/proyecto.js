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
let loader, textureLoader, mixer, mothMixers;
let mothSpawnerPositions, mothSpawners, mothSpawnersActive, mothSpawnersInactive, mothsActive;
let bat, batModel, moths, city, pointer, ball;
let light;
let clock, delta, interval;
let flyControl;
let gui, animation_panel;
let spawnerLightIntensity = 0.1;
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

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();

    setupMothSpawners();

    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0.16, 0.16, 0.16);
    document.querySelector('div').appendChild(renderer.domElement);

    // Instanciar la camara
    instantiateCamera();
    initFlightControls(camera);
}

function setupMothSpawners() {
    mothsActive = 5;
    mothSpawnersActive = [];
    mothSpawnersInactive = [];
    mothSpawners = [];
    mothSpawnerPositions = [
        new THREE.Vector3(-14, 1, -20),     // Primera
        new THREE.Vector3(-21, 1, -28),     // Callejon 2
        new THREE.Vector3(-28, 1, -21),     // Baloncesto
        new THREE.Vector3(-36, 1, -14),     // Bar copas
        new THREE.Vector3(-50, 1, -14),     // Pawn store
        new THREE.Vector3(-72, 1, -20),     // Baloncesto extraradio
        new THREE.Vector3(-48, 1, -24),     // Callejon 3
        new THREE.Vector3(-37, 1, -28),     // Cartel chino
        new THREE.Vector3(-6, 1, -26),      // Callejon pez
        new THREE.Vector3(-24, 4.3, -22),   // Techo agua
        new THREE.Vector3(4, 1, -28),       // Detras pescaderia
        new THREE.Vector3(10, 4.3, -18),    // Techo helipuerto
        new THREE.Vector3(13, 1, -14),      // Final calle derecha
        new THREE.Vector3(-61, 6.5, -17),   // Azotea de la izq
    ];
    let i = 0;
    mothSpawnerPositions.forEach(v => {
        const spawner = new THREE.Object3D();
        spawner.name = "spawner" + i++;
        const light = new THREE.SpotLight(0x0f0f00, 0);
        light.castShadow = true;
        light.decay = 2;
        light.position.set(0, 1, 0);
        light.name = "light";
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 3;
        light.shadow.camera.fov = 30;
        spawner.position.set(v.x, v.y, v.z);
        mothSpawners.push(spawner);
        mothSpawnersInactive.push(spawner);
        scene.add(spawner);
        spawner.add(light);

        // if (i++ > 0)
        //     mothSpawnersInactive.push(spawner);
        // else
        //     mothSpawnersActive.push(spawner);
    });
    mothsActive = Math.min(mothsActive, mothSpawners.length);
    
    // for (let i = 1; i < mothsActive; i++) {
    //     const spawner = getInactiveSpawner();
    //     mothSpawnersActive.push(spawner);
    // }
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
    flyControl.movementSpeed = 4;
    flyControl.rollSpeed = 0.6;
    flyControl.dragToLook = true;
}

function loadScene() {
    loader = new GLTFLoader();
    textureLoader = new THREE.TextureLoader().setPath("textures/");

    // Pointer for raycast obstacles
    loadPointer();
    loadBat();
    loadCity();
    loadMoths();
    loadSceneMap();
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
    moths = [];
    mothMixers = [];
    // Polilla
    loader.load('models/moth/scene.gltf',
    function(gltf)
    {
        let moth = gltf.scene;
        moth.receiveShadow = true;
        moth.castShadow = true;
        moth.name = "moth";
        let mothMixer = new THREE.AnimationMixer(moth);
        let mothClip = mothMixer.clipAction(gltf.animations[1]);
        moth.scale.set(0.00012, 0.00012, 0.00012);
        mothClip.timeScale = 1;
        mothClip.play();
        mothMixers.push(mothMixer);
        moth.position.x = camera.position.x + 4;
        moth.position.y = camera.position.y + 2;
        moth.position.z = camera.position.z + 4;
        moth.position.set(0, -0.6, 0);

        // moth.position.x += Math.random() * 1.5;
        // moth.position.z += Math.random() * 1.5;
        // scene.add(moth);
        // mothSpawners[0].add(moth);

        const newSpawner = getInactiveSpawner("spawner0");
        newSpawner.add(moth);
        enableSpawner(newSpawner);
        moths.push(moth);

        // for (let i = 1; i < mothsActive; i++) {
        //     let newMoth = SkeletonUtils.clone(moth);
        //     newMoth.name = "moth";
        //     let mothMixer = new THREE.AnimationMixer(newMoth);
        //     let mothClip = mothMixer.clipAction(gltf.animations[1]);
        //     mothClip.timeScale = 1;
        //     mothClip.play();
        //     mothMixers.push(mothMixer);
        //     // newMoth.position.x += Math.random() * 5;
        //     // newMoth.position.z += Math.random() * 5;
        //     // scene.add(newMoth);
        //     mothSpawnersActive[i].add(newMoth);
        //     moths.push(newMoth);
        // }

        for (let i = 0; i < mothSpawnersInactive.length; i++) {
            let newMoth = SkeletonUtils.clone(moth);
            newMoth.name = "moth";
            let mothMixer = new THREE.AnimationMixer(newMoth);
            let mothClip = mothMixer.clipAction(gltf.animations[1]);
            mothClip.timeScale = 1;
            mothClip.play();
            newMoth.visible = false;
            mothMixers.push(mothMixer);
            // newMoth.position.x += Math.random() * 5;
            // newMoth.position.z += Math.random() * 5;
            // scene.add(newMoth);
            mothSpawnersInactive[i].add(newMoth);
            moths.push(newMoth);
        }

        for (let i = 1; i < mothsActive; i++) {
            const newSpawner = getInactiveSpawner();
            enableSpawner(newSpawner);
        }


        });        
}

function loadSceneMap() {
    const hdriBox = new THREE.Mesh(new THREE.BoxGeometry(100, 25, 45),
        ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"].map((v, index, list) => {
            let tex = textureLoader.load("night/" + v);
            tex.repeat.set(16, 8);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return new THREE.MeshLambertMaterial({
                map: tex,
                side: THREE.BackSide
            });
        })
    )
    hdriBox.name = "limitBox";
    hdriBox.position.set(-30, 0, -25);
    // sceneMap = new THREE.CubeTextureLoader().setPath("textures/factory/").load(
    //     ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]
    // )
    scene.add(hdriBox);
}

function addLights() {
    light = new THREE.AmbientLight(0xAAAAAA, 0.8); // soft white light
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
    const threshold = 4;
    moths.forEach(m => {
        if (m.visible) {
            let mothPosition = new THREE.Vector3();
            m.getWorldPosition(mothPosition);
            const distance = camera.position.distanceTo(mothPosition);
            if (distance < threshold) {
                respawnMoth(m);
                // TODO: suma puntos
                console.log("NOM");
            }
        }
    });
}

function respawnMoth(mothEaten) {
    const newSpawner = getInactiveSpawner();
    const mothSpawner = mothEaten.parent;
    disableSpawner(mothSpawner);
    enableSpawner(newSpawner);
}

function collisionDetect() {
    let ballWorld = new THREE.Vector3();
    ball.getWorldPosition(ballWorld);
    let direction = new THREE.Vector3();
    direction.subVectors(ballWorld, camera.position).normalize();
    const raycaster = new THREE.Raycaster(camera.position, direction, 0.4, 0.8);
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
        case "3":
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getInactiveSpawner(spawnerName="") {
    if (spawnerName === "") {
        const max = mothSpawnersInactive.length;
        const randomIndex = getRandomInt(0, max);
        // return mothSpawnersInactive.splice(randomIndex, 1)[0];
        return mothSpawnersInactive[randomIndex];
    } else {
        const index = searchSpawner(spawnerName, mothSpawnersInactive)[0];
        return mothSpawnersInactive[index];
    } 
}

function disableSpawner(spawner) {
    const light = spawner.getObjectByName("light");
    const moth = spawner.getObjectByName("moth");
    light.intensity = 0;
    moth.visible = false;
    // const index = mothSpawnersActive.indexOf(spawner);
    const index = searchSpawner(spawner.name, mothSpawnersActive)[0];
    mothSpawnersActive.splice(index, 1);
    mothSpawnersInactive.push(spawner);
}

function enableSpawner(spawner) {
    if (spawner.name == "spawner0")
        console.log(spawner);
    const light = spawner.getObjectByName("light");
    const moth = spawner.getObjectByName("moth");
    light.intensity = spawnerLightIntensity;
    moth.visible = true;
    // const index = mothSpawnersInactive.indexOf(spawner);
    const index = searchSpawner(spawner.name, mothSpawnersInactive)[0];
    mothSpawnersInactive.splice(index, 1);
    mothSpawnersActive.push(spawner);
}

function searchSpawner(spawnerName, spawnerList) {
    let i;
    for (i = 0; i < spawnerList.length; i++) {
        const s = spawnerList[i];
        if (s.name === spawnerName)
            return [i, s];
    }
    return false;
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