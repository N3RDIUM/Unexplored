var green, bark

class TreeChunk{
    constructor(position, scene){
        this.position = position;
        this.scene = scene;
        this.trees = []
        this.generated = false;
    }

    generate(terrain){
        for (var x = this.position[0] - 250; x < 250 + this.position[0]; x += 25) {
            for (var z = this.position[1] - 250; z < 250 + this.position[1]; z += 25) {
                if(terrain.getHeightFromMap(x, z) > 7 && noise.perlin2(x / 100, z / 100)*10 < -1){
                    var tree = QuickTreeGenerator(8, 6, 1, bark, green, scene);
                    tree.position.x = x + noise.perlin2(x / 2, z / 2)*10;
                    tree.position.z = z + noise.perlin2(x / 2, z / 2)*10;
                    tree.position.y = terrain.getHeightFromMap(x, z);
                    this.trees.push(tree);
                }
            }
        }
        this.generated = true;
    }

    destroy(){
        for (var i = 0; i < this.trees.length; i++) {
            this.trees[i].dispose();
        }
    }

    refresh(terrain, position){
        this.destroy()
        this.position = position
        this.generate(terrain)
    }
}

class TreeMaker{
    constructor(scene, terrain){
        this.scene = scene;
        this.chunks = [];
        this.renderdist = 1
        this.terrain = terrain;
        this.pos = [0, 0]

        //leaf material
        green = new BABYLON.StandardMaterial("green", scene);
        green.diffuseColor = new BABYLON.Color3(0,1,0);	

        // //trunk and branch material
        bark = new BABYLON.StandardMaterial("bark", scene);
        bark.emissiveTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", scene);
        bark.diffuseTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", scene);
        bark.diffuseTexture.uScale = 2.0;//Repeat 5 times on the Vertical Axes
        bark.diffuseTexture.vScale = 2.0;//Repeat 5 times on the Horizontal Axes

        this.chunk = new TreeChunk([0, 0], scene);
    }

    distance(a, b){
        // 1d distance
        return Math.abs(a - b);
    }

    update(camera_position){
        // if the chunk is further than render distance from the camera, destroy it
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.distance(this.chunks[i].position[0], camera_position[0]) > this.renderdist * 100 || this.distance(this.chunks[i].position[1], camera_position[1]) > this.renderdist * 100) {
                this.chunks[i].destroy();
                this.chunks.splice(i, 1);
           }
        }

        if (this.distance(this.pos[0], camera_position[0]) > 100 || this.distance(this.pos[1], camera_position[1]) > 100) {
            this.pos = camera_position;
            this.chunk.refresh(this.terrain, camera_position);
        }
    }
}

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
    this.terrain.mesh.position.y = -1;

    // tree generation
    this.tree = new TreeMaker(this.scene, this.terrain);
  }

  update(camera_position){
    noise.seed(0.3);
    this.tree.update(camera_position);
  }
}
