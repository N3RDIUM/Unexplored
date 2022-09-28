var green, bark

class TreeChunk{
    constructor(position, scene){
        this.position = position;
        this.scene = scene;
        this.trees = []
        this.generated = false;
        this.threshold = 8;
    }

    generate(terrain){
        for (var x = this.position[0] - this.threshold; x < this.threshold + this.position[0]; x += 8) {
            for (var z = this.position[1] - this.threshold; z < this.threshold + this.position[1]; z += 8) {
                if(terrain.terrain.getHeightFromMap(x, z) > 7){
                    var tree = QuickTreeGenerator(8, 6, 1, bark, green, this.scene);
                    tree.position.x = x + noise.perlin2(x / 10, z / 10)*24;
                    tree.position.z = z + noise.perlin2(x / 10, z / 10)*24;
                    tree.position.y = terrain.terrain.getHeightFromMap(x, z);
                    this.trees.push(tree);

                    // add to shadow generator
                    terrain.shadowGenerator.addShadowCaster(tree);
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
        this.renderdist = 8;
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

        this.chunks = [];
        this.generate();
    }

    distance(a, b){
        // 1d distance
        return Math.abs(a - b);
    }

    generate(){
        for(var i = -this.renderdist; i < this.renderdist; i++){
            for(var j = -this.renderdist; j < this.renderdist; j++){
                var chunk = new TreeChunk([i*64, j*64], this.scene);
                chunk.generate(this.terrain);
                this.chunks.push(chunk);
            }
        }
    }

    update(camera_position){
        let positions = [];
        camera_position[0] = Math.floor(camera_position[0] / 64) * 64;
        camera_position[1] = Math.floor(camera_position[1] / 64) * 64;

        for(var i = camera_position[0] - (this.renderdist - 1)*64; i < camera_position[0] + (this.renderdist + 1)*64; i += 64){
            for(var j = camera_position[1] - (this.renderdist - 1)*64; j < camera_position[1] + (this.renderdist + 1)*64; j += 64){
                positions.push([i, j]);
            }
        }

        for(var i = 0; i < this.chunks.length; i++){
            var chunk = this.chunks[i];
            var found = false;
            for(var j = 0; j < positions.length; j++){
                if(chunk.position[0] == positions[j][0] && chunk.position[1] == positions[j][1]){
                    found = true;
                    break;
                }
            }
            if(!found){
                chunk.destroy();
                this.chunks.splice(i, 1);
                i--;
            }
        }

        for(var i = 0; i < positions.length; i++){
            var found = false;
            for(var j = 0; j < this.chunks.length; j++){
                if(this.chunks[j].position[0] == positions[i][0] && this.chunks[j].position[1] == positions[i][1]){
                    found = true;
                    break;
                }
            }
            if(!found){
                var chunk = new TreeChunk(positions[i], this.scene);
                chunk.generate(this.terrain);
                this.chunks.push(chunk);
            }
        }
    }
}

class Terrain {
  constructor(scene, shadowGenerator) {
    this.shadowGenerator = shadowGenerator;
    var mapSubX = 1024;             // point number on X axis
    var mapSubZ = 1024;             // point number on Z axis
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

    var terrainSub = 512;
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
    this.tree = new TreeMaker(this.scene, this);
  }

  update(camera_position){
    noise.seed(0.3);
    this.tree.update(camera_position);
  }
}
