QuickTreeGenerator = function(sizeBranch, sizeTrunk, radius, trunkMaterial, leafMaterial, scene) {

    var tree = new BABYLON.Mesh("tree", scene);
    tree.isVisible = false;
    
    var leaves = new BABYLON.Mesh("leaves", scene);
    
    //var vertexData = BABYLON.VertexData.CreateSphere(2,sizeBranch); //this line for BABYLONJS2.2 or earlier
    var vertexData = BABYLON.VertexData.CreateSphere({segments:2, diameter:sizeBranch}); //this line for BABYLONJS2.3 or later
    
    vertexData.applyToMesh(leaves, false);

    var positions = leaves.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    var indices = leaves.getIndices();
    var numberOfPoints = positions.length/3;

    var map = [];

    // The higher point in the sphere
    var v3 = BABYLON.Vector3;
    var max = [];

    for (var i=0; i<numberOfPoints; i++) {
        var p = new v3(positions[i*3], positions[i*3+1], positions[i*3+2]);

        if (p.y >= sizeBranch/2) {
            max.push(p);
        }

        var found = false;
        for (var index=0; index<map.length&&!found; index++) {
            var array = map[index];
            var p0 = array[0];
            if (p0.equals (p) || (p0.subtract(p)).lengthSquared() < 0.01){
                array.push(i*3);
                found = true;
            }
        }
        if (!found) {
            var array = [];
            array.push(p, i*3);
            map.push(array);
        }

    }
    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    map.forEach(function(array) {
        var index, min = -sizeBranch/10, max = sizeBranch/10;
        var rx = randomNumber(min,max);
        var ry = randomNumber(min,max);
        var rz = randomNumber(min,max);

        for (index = 1; index<array.length; index++) {
            var i = array[index];
            positions[i] += rx;
            positions[i+1] += ry;
            positions[i+2] += rz;
        }
    });

    leaves.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    leaves.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    leaves.convertToFlatShadedMesh();
    
    leaves.material = leafMaterial;
    leaves.position.y = sizeTrunk+sizeBranch/2-2;
    

    var trunk = BABYLON.Mesh.CreateCylinder("trunk", sizeTrunk, radius-2<1?1:radius-2, radius, 10, 2, scene );
    
    trunk.position.y = (sizeBranch/2+2)-sizeTrunk/2;

    trunk.material = trunkMaterial;
    trunk.convertToFlatShadedMesh();
    
    leaves.parent = tree;
    trunk.parent = tree;
    return tree;

};

var green, bark

class TreeChunk{
    constructor(position, scene, water, shadowcaster){
        this.position = position;
        this.scene = scene;
        this.trees = []
        this.generated = false;
        this.water = water;
        this.shadowcaster = shadowcaster;
    }

    generate(terrain){
        for (var x = 0; x < 100 + this.position[0]; x += 10) {
            for (var z = 0; z < 100 + this.position[1]; z += 10) {
                if(terrain.getHeightFromMap(x, z) > 3 && terrain.getHeightFromMap(x, z) < 7 && Math.round(Math.random(-500, 500)) == 0) {
                    var tree = QuickTreeGenerator(4, 6, 1, bark, green, scene);
                    let rand = [Math.random(-15, 15), Math.random(-15, 15)];
                    tree.position.x = x + rand[0];
                    tree.position.z = z + rand[1];
                    tree.position.y = terrain.getHeightFromMap(x + rand[0], z + rand[1]);
                    this.trees.push(tree);
                    this.water.addToRenderList(tree);
                    this.shadowcaster.addShadowCaster(tree);
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

    refresh(terrain){
        this.destroy()
        setTimeout(()=>{this.generate(terrain)}, 5)
    }
}

class TreeMaker{
    constructor(scene, terrain, water, shadowcaster){
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

        this.chunk1 = new TreeChunk([0, 0], scene, water, shadowcaster);
        this.chunk2 = new TreeChunk([0, 100], scene, water, shadowcaster);
        this.passive = this.chunk2
        this.active = this.chunk1
    }

    distance(a, b){
        // 1d distance
        return Math.abs(a - b);
    }

    switchPassive(){
        if (this.passive == this.chunk1) {
            this.passive = this.chunk2;
        } else {
            this.passive = this.chunk1;
        }
    }

    switchActive(){
        if (this.active == this.chunk1) {
            this.active = this.chunk2;
        } else {
            this.active = this.chunk1;
        }
    }

    update(campos){
        // if the chunk is further than render distance from the camera, destroy it
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.distance(this.chunks[i].position[0], campos[0]) > this.renderdist * 100 || this.distance(this.chunks[i].position[1], campos[1]) > this.renderdist * 100) {
                this.chunks[i].destroy();
                this.chunks.splice(i, 1);
           }
        }

        if (Math.round(campos[0] / 100) > this.pos[0]) {
            this.passive.position[0] = this.active.position[0] + 100;
            this.passive.position[1] = this.active.position[1];
            this.passive.refresh(this.terrain)
            this.active.refresh(this.terrain)
            this.switchPassive();
            this.switchActive();
            this.pos[0] += 1;
        }
        if (Math.round(campos[0] / 100) < this.pos[0]) {
            this.passive.position[0] = this.active.position[0] - 100;
            this.passive.position[1] = this.active.position[1];
            this.passive.refresh(this.terrain)
            this.active.refresh(this.terrain)
            this.switchPassive();
            this.switchActive();
            this.pos[0] -= 1;
        }
        if (Math.round(campos[1] / 100) > this.pos[1]) {
            this.passive.position[0] = this.active.position[0];
            this.passive.position[1] = this.active.position[1] + 100;
            this.passive.refresh(this.terrain)
            this.active.refresh(this.terrain)
            this.switchPassive();
            this.switchActive();
            this.pos[1] += 1;
        }
        if (Math.round(campos[1] / 100) < this.pos[1]) {
            this.passive.position[0] = this.active.position[0];
            this.passive.position[1] = this.active.position[1] - 100;
            this.passive.refresh(this.terrain)
            this.active.refresh(this.terrain)
            this.switchPassive();
            this.switchActive();
            this.pos[1] -= 1;
        }
    }
}
