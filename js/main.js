const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var keys = [];

var terrain, water, camera, light

var createScene = function () {
	const scene = new BABYLON.Scene(engine);
	
	camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
	camera.setPosition(new BABYLON.Vector3(0, 0, -10));
	camera.attachControl(canvas, true);

	light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
	
	terrain = new Terrain(scene);
	water = new Water(scene, terrain);

	return scene;
}

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();

	water.mesh.position.x = camera.position.x;
	water.mesh.position.z = camera.position.z;
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});