const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var keys = [];

cameraMove = {x:0, z:0}

var light, camera, waterMesh, skybox

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
	light.intensity = 0.8;

	// Skybox
	skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
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
	shadowGenerator.setDarkness(0.05);

	// Ground
	var groundTexture = new BABYLON.Texture("textures/sand.jpg", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	// set shininess to a small value (between 0 and 1) to avoid the ground to look shiny
	groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	// Water
	waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 512, 512, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1000, 1000));
	water.backFaceCulling = false;
	water.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
	water.windForce = -8;
	water.waveHeight = 0.005;
	water.bumpHeight = 0.05;
	water.waveLength = 0.1;
	water.waveSpeed = 0.846;
	water.colorBlendFactor = 0.3;
	water.addToRenderList(skybox);
	waterMesh.material = water;

	var mapSubX = 500;
	var mapSubZ = 300;
	var terrainSub = 100;

	// map creation
	var mapSubX = 1000;             // point number on X axis
    var mapSubZ = 800;              // point number on Z axis
    var seed = 0.3;                 // seed
    var noiseScale = 0.01;         // noise frequency
    var elevationScale = 20;
    noise.seed(seed);
    var mapData = new Float32Array(mapSubX * mapSubZ * 3); // 3 float values per point : x, y and z

    var paths = [];                             // array for the ribbon model
    for (var l = 0; l < mapSubZ; l++) {
        var path = [];                          // only for the ribbon
        for (var w = 0; w < mapSubX; w++) {
            var x = (w - mapSubX * 0.5) * 2.0;
            var z = (l - mapSubZ * 0.5) * 2.0;
            var y = Math.abs(noise.simplex2(x * noiseScale, z * noiseScale));
            y *= (0.5 + y) * y * elevationScale;   // let's increase a bit the noise computed altitude
                   
            mapData[3 *(l * mapSubX + w)] = x;
            mapData[3 * (l * mapSubX + w) + 1] = y;
            mapData[3 * (l * mapSubX + w) + 2] = z;
            
            path.push(new BABYLON.Vector3(x, y, z));
        }
        paths.push(path);
    }
	var params = {
		mapData: mapData,
		mapSubX: mapSubX,
		mapSubZ: mapSubZ,
		terrainSub: terrainSub
	};
	terrain = new BABYLON.DynamicTerrain("terrain", params, scene);
	terrain.mesh.material = groundMaterial;
	terrain.subToleranceX = 8;
	terrain.subToleranceZ = 8;
	terrain.LODLimits = [4, 3, 2, 1, 1];
	terrain.mesh.receiveShadows = true;
	terrain.mesh.checkCollisions = true;
	terrain.mesh.material.freeze();
	terrain.mesh.position.y = -2;
	water.addToRenderList(terrain.mesh);

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
	skybox.position.x = camera.position.x;
	skybox.position.z = camera.position.z;
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
