let island_example = {
    size: 0,
    position: [0, 0],
}
ids = []

function random_id() {
    let id = Math.floor(Math.random() * 100000)
    if (ids.includes(id)) {
        return random_id()
    } else {
        return id
    }
}

class FishCunk{
    constructor(position, scene, shadowmaker){
        this.position = position;
        this.scene = scene;
        this.water = scene.getMaterialByName('water');
        this.shadowmaker = shadowmaker;
        this.id = random_id();
    }

    generate(){
        BABYLON.SceneLoader.ImportMesh('', "https://models.babylonjs.com/", "fish.glb", this.scene, results => {
            var root = results[0];
            root.name = this.id
            root.id = this.id

            root.position = new BABYLON.Vector3(this.position[0], 4, this.position[1]);
            root.scaling = new BABYLON.Vector3(0.3, 0.2, 0.3);
            for(let i = 0; i < root.getChildMeshes().length; i++){
                this.water.addToRenderList(root.getChildMeshes()[i]);
                this.shadowmaker.addShadowCaster(root.getChildMeshes()[i]);
            }
        });
    }
}

class IslandHandler{
    constructor(terrain, camera, scene, shadowmaker){
        this.terrain = terrain;
        this.camera = camera;
        this.scene = scene;
        this.campos = [this.camera.position.x, this.camera.position.y, this.camera.position.z];
        this.shadowmaker = shadowmaker;

        this.islands = [];
        this.matrix = {};
        console.log(this.islands);

        this.fishchunk = new FishCunk([0, 0], scene, shadowmaker);
        this.fishchunk.generate();
    }

    // recursive function to check the island's size
    checkIsland(island, x, y){
        if (this.terrain.getHeightFromMap(x, y) >= 3) {
            island.size++;
            if (x > 0) {
                this.checkIsland(island, x - 1, y);
            }
            if (x < this.terrain.length - 1) {
                this.checkIsland(island, x + 1, y);
            }
            if (y > 0) {
                this.checkIsland(island, x, y - 1);
            }
            if (y < this.terrain.length - 1) {
                this.checkIsland(island, x, y + 1);
            }
            // update the matrix
            this.matrix[`${x}:${y}`] = 1;
        }
    }

    update(){
        // this.campos = [Math.round(this.camera.position.x), Math.round(this.camera.position.y), Math.round(this.camera.position.z)];
        // for (var x = -10+this.campos[0]; x < 10+this.campos[0]; x+=5) {
        //     for (var y = -10+this.campos[2]; y < 10+this.campos[2]; y+=5) {
        //             if(this.matrix[`${x}:${y}`] != 1){
        //                 let island = Object.assign({}, island_example);
        //                 if(this.matrix[`${x}:${y}`] != 1){
        //                     island.position = [x, y];
        //                     this.checkIsland(island, x, y);
        //                     if(island.size > 1){
        //                         this.islands.push(island);
        //                     }
        //                 }
        //             }
        //     }
        // }

        for(var i in this.islands){
            
        }

        for (var x = -100+this.campos[0]; x < 100+this.campos[0]; x+=50) {
            for (var y = -100+this.campos[2]; y < 100+this.campos[2]; y+=50) {
            }
        }
    }
}