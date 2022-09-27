class Water {
    constructor(scene, terrain, light) {
        this.scene = scene;

        this.mesh = BABYLON.Mesh.CreateGround("waterMesh", 1000, 1000, 32, scene, false);
        this.mesh.position.y = 0;

        this.water = new BABYLON.WaterMaterial("waterMaterial", scene, new BABYLON.Vector2(512, 512));
        this.water.backFaceCulling = false;
        this.water.bumpTexture = new BABYLON.Texture("assets/textures/waterbump.png", scene);
        this.water.windForce = 10;
        this.water.waveHeight = 0.01;
        this.water.bumpHeight = 0.1;
        this.water.waveLength = 0.1;
        this.water.waveSpeed = 0.1;
        this.water.colorBlendFactor = 0.3;
        this.water.addToRenderList(terrain.terrain.mesh);

        this.mesh.material = this.water;
    }
}