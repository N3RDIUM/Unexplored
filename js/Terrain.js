class Terrain {
  constructor(scene) {
    var mapSubX = 1000;             // point number on X axis
    var mapSubZ = 1000;              // point number on Z axis
    var seed = 0.3;                 // seed
    var noiseScale = 0.003;         // noise frequency
    var elevationScale = 32;
    noise.seed(seed);
    var mapData = new Float32Array(mapSubX * mapSubZ * 3); // 3 float values per point : x, y and z

    //var paths = [];                             // array for the ribbon model
    for (var l = 0; l < mapSubZ; l++) {
        //var path = [];                          // only for the ribbon
        for (var w = 0; w < mapSubX; w++) {
            var x = (w - mapSubX * 0.5) * 2.0;
            var z = (l - mapSubZ * 0.5) * 2.0;
            var y = noise.simplex2(x * noiseScale, z * noiseScale);
            y *= (0.5 + y) * y * elevationScale;   // let's increase a bit the noise computed altitude
                   
            mapData[3 *(l * mapSubX + w)] = x;
            mapData[3 * (l * mapSubX + w) + 1] = y;
            mapData[3 * (l * mapSubX + w) + 2] = z;
            
            //path.push(new BABYLON.Vector3(x, y, z));
        }
        //paths.push(path);
    }

    this.scene = scene;

    var terrainSub = 500;
    var params = {
      mapData: mapData, // data map declaration : what data to use ?
      mapSubX: mapSubX, // how are these data stored by rows and columns
      mapSubZ: mapSubZ,
      terrainSub: terrainSub, // how many terrain subdivisions wanted
    };
    this.terrain = new BABYLON.DynamicTerrain("t", params, scene);
    
    this.material = new BABYLON.StandardMaterial("mat", scene);
    this.material.diffuseTexture = new BABYLON.Texture("assets/textures/sand.jpg", scene);
    this.material.diffuseTexture.uScale = 6.9;
    this.material.diffuseTexture.vScale = 6.9;
    this.material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    this.terrain.mesh.material = this.material;
  }
}
