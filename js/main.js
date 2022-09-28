const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var keys = [];
var cameraSpeed = 0.6;
var camera_move = [0, 0];

var terrain, water, camera, light

var createScene = function () {
	const scene = new BABYLON.Scene(engine);

	light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 1;

	// wasd movement
	camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 256, 0), scene);
	camera.rotation.x = Math.PI / 2;
	
	terrain = new Terrain(scene);
	water = new Water(scene, terrain);
	terrain.water = water;

	return scene;
}

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();

	water.mesh.position.x = camera.position.x;
	water.mesh.position.z = camera.position.z;

	terrain.update([camera.position.x, camera.position.z]);

	// wasd movement
	if (keys[87]) {
		camera_move[1] += cameraSpeed;
	}
	if (keys[83]) {
		camera_move[1] -= cameraSpeed;
	}
	if (keys[65]) {
		camera_move[0] -= cameraSpeed;
	}
	if (keys[68]) {
		camera_move[0] += cameraSpeed;
	}

	camera.position.x += camera_move[0];
	camera.position.z += camera_move[1];

	camera_move[0] *= 0.9;
	camera_move[1] *= 0.9;
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

// Keyboard events
window.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
});
window.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});

// scroll events
window.addEventListener("wheel", function (e) {
	camera.position.y += e.deltaY / 20;

	if (camera.position.y < 69) {
		camera.position.y = 69;
	}

	if (camera.position.y > 256) {
		camera.position.y = 256;
	}
});