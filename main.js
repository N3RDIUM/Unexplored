const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var keys = [];

cameraMove = {x:0, z:0}

var url = "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var s = document.createElement("script");
s.src = url;
document.head.appendChild(s);

var light, camera, waterMesh, ground

var createScene = function() {
    var scene = new BABYLON.Scene(engine);

	// Setup environment
	camera = new BABYLON.FreeCamera("sceneCamera", new BABYLON.Vector3(0, 1, -15), scene);
	camera.attachControl(canvas, true);

	// light
	var _light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 0, 0), scene);
	_light.intensity = 0.5;

	// light1
	light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-0, 80, -80), new BABYLON.Vector3(0, -1, 0), Math.PI / 5, 1, scene);
	light.intensity = 1;

	// Skybox
	var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/sky", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.disableLighting = true;
	skybox.material = skyboxMaterial;

	// Shadows
	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.useContactHardeningShadow = true;
	shadowGenerator.usePoissonSampling = true;
	shadowGenerator.transparencyShadow = true;
	shadowGenerator.transparencyShadowAlpha = 0.7;
	shadowGenerator.useKernelBlur = true;
	shadowGenerator.blurKernel = 32;
	shadowGenerator.useContactHardeningShadow = true;
	shadowGenerator.setDarkness(0.01);

	// Ground
	var groundTexture = new BABYLON.Texture("textures/sand.jpg", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	
	ground = BABYLON.Mesh.CreateGround("ground", 512, 512, 32, scene, false);
	ground.position.y = -1;
	ground.material = groundMaterial;

	// Water
	waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1000, 1000));
	water.backFaceCulling = true;
	water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
	water.windForce = -8;
	water.waveHeight = 0.8;
	water.bumpHeight = 0.8;
	water.waveLength = 3;
	water.colorBlendFactor = 0.4;
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
	waterMesh.material = water;
	
	var b = BABYLON.Mesh.CreateBox("box", 1, scene, false);
	b.scaling.y = 20;
	b.position.y = 10;
	b.position.x = -10;
	b.position.z = -10;

	shadowGenerator.addShadowCaster(b);
	ground.receiveShadows = true;
	waterMesh.receiveShadows = true;

	return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
	camera.inputs.attached.mouse.detachControl();
	light.position = camera.position.clone();
	light.position.y += 200;
	camera.rotation.x = 85 * Math.PI / 180;
	camera.rotation.y = 45 * Math.PI / 180;
	camera.rotation.z = 45 * Math.PI / 180;

	camera.position.y = 50

	if (keys[87]) {
		cameraMove.z += 0.15;
	}
	if (keys[83]) {
		cameraMove.z -= 0.15;
	}
	if (keys[65]) {
		cameraMove.x -= 0.15;
	}
	if (keys[68]) {
		cameraMove.x += 0.15;
	}

	camera.position.x += cameraMove.x;
	camera.position.z += cameraMove.z;

	cameraMove.x *= 0.9;
	cameraMove.z *= 0.9;

	waterMesh.position.x = camera.position.x;
	waterMesh.position.z = camera.position.z;

	ground.position.x = camera.position.x;
	ground.position.z = camera.position.z;
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

// camera key movemement
document.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});
document.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});
