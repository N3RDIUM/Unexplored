const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var keys = [];
var cameraSpeed = 0.6;
var camera_move = [0, 0];

var terrain, water, camera, light

var createScene = function () {
	const scene = new BABYLON.Scene(engine);

	const light_ambient = new BABYLON.HemisphericLight("light_ambient", new BABYLON.Vector3(0, 1, 0), scene);
	light_ambient.intensity = 0.69;

	// wasd movement
	camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 256, 0), scene);
	camera.rotation.x = Math.PI / 2;

	// add shadow caster
	light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 128, 0), scene);
	light.intensity = 1000;
	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.useBlurExponentialShadowMap = true;
	shadowGenerator.blurKernel = 32;
	
	terrain = new Terrain(scene, shadowGenerator);
	water = new Water(scene, terrain);
	terrain.water = water;

	shadowGenerator.addShadowCaster(terrain.terrain.mesh);
	shadowGenerator.addShadowCaster(water.mesh);

	// receive shadows
	terrain.terrain.mesh.receiveShadows = true;
	water.mesh.receiveShadows = true;

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

	// get time in milliseconds
	var time = new Date().getTime();
	// set light position like sun
	light.position.x = Math.sin(time * 0.0001) * 256 + camera.position.x;
	light.position.z = Math.cos(time * 0.0001) * 256 + camera.position.z;
	// set light intensity like sun
	light.intensity = Math.sin(time * 0.0001) * 1000 + 1000;
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