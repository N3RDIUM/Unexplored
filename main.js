const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var url = "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
var s = document.createElement("script");
s.src = url;
document.head.appendChild(s);

var createScene = function() {
    var scene = new BABYLON.Scene(engine);

	var camera = new BABYLON.FreeCamera("sceneCamera", new BABYLON.Vector3(0, 1, -15), scene);
	camera.attachControl(canvas, true);

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	
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
			
	// Ground
	var groundTexture = new BABYLON.Texture("textures/sand.jpg", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	
	var ground = BABYLON.Mesh.CreateGround("ground", 512, 512, 32, scene, false);
	ground.position.y = -1;
	ground.material = groundMaterial;

    var cube = BABYLON.Mesh.CreateBox("cube", 10.0, scene);
    cube.position.y = 15;
		
	// Water
	var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
	water.backFaceCulling = true;
	water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
	water.windForce = -8;
	water.waveHeight = 0.8;
	water.bumpHeight = 0.8;
	water.waveLength = 3;
	water.colorBlendFactor = 0.1;
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
    water.addToRenderList(cube);
	waterMesh.material = water;

	return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});