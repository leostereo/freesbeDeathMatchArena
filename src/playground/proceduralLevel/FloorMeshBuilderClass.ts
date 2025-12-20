import { BaseTileFilledBlock, BaseTileGroups, FloorMap, Tile_ids } from "@/shared/types/ProceduralLevel";
import { TileContainerClass } from "./TileContainerClass";
import { AbstractMesh, Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Tools, Vector3 } from "@babylonjs/core";

export class FloorMeshBuilderClass {

    groupIBaseTileMatrix:BaseTileFilledBlock[] = 
    [
        {col:1,row:0},
        {col:1,row:1},
        {col:1,row:2},
    ];

    groupLBaseTileMatrix:BaseTileFilledBlock[] = 
    [
        {col:1,row:0},
        {col:0,row:1},
        {col:1,row:1},
    ];

    groupTBaseTileMatrix:BaseTileFilledBlock[] = 
    [
        {col:1,row:0},
        {col:0,row:1},
        {col:1,row:1},
        {col:2,row:1},
    ];

    group4BaseTileMatrix:BaseTileFilledBlock[] = 
    [
        {col:1,row:0},
        {col:1,row:1},

    ];
    
    BLOCK_UNIT_SIZE = 10;
    BASE_TILE_UNITS = 3;
    FLOOR_THIN = 1;

    private baseBlock:Mesh;

    private baseGroupTileResolver : Record<BaseTileGroups, Mesh|null> = {
        "group-.": null,
        "group-I": null,
        "group-L": null,
        "group-T": null
    }


    redMaterial:StandardMaterial;
    blueMaterial:StandardMaterial;
    greenMaterial:StandardMaterial;
    yellowMaterial:StandardMaterial;
    
    constructor(private floorMapDiagram:FloorMap,private tileContainer:TileContainerClass,private scene:Scene) {

        this.init_materials();
        this.init_buildBaseTiles();
        this.buildFloorMesh();
    }
    
    init_materials(){
        this.redMaterial = new StandardMaterial("redMaterial", this.scene);
        this.redMaterial.diffuseColor = Color3.Red()
        this.blueMaterial = new StandardMaterial('blueMaterial',this.scene);
        this.blueMaterial.diffuseColor = Color3.Blue();
        this.greenMaterial = new StandardMaterial("greenMaterial", this.scene);
        this.greenMaterial.diffuseColor = Color3.Green()
        this.yellowMaterial = new StandardMaterial('yellowMaterial',this.scene);
        this.yellowMaterial.diffuseColor = Color3.Yellow();
    }

    init_buildBaseTiles(){

        this.baseBlock = MeshBuilder.CreateBox('baseBox',{width:this.BLOCK_UNIT_SIZE,depth:this.BLOCK_UNIT_SIZE,height:this.FLOOR_THIN},this.scene)
        // this.baseBlock.isVisible = false;
        // this.baseBlock.position._x = this.baseBlock.position._x +  this.BLOCK_UNIT_SIZE/2
        // this.baseBlock.position._z = this.baseBlock.position._z +  this.BLOCK_UNIT_SIZE/2
        //this.baseBlock.material = this.redMaterial;

        this.baseGroupTileResolver["group-I"] = this.buildBaseTileMesh(this.groupIBaseTileMatrix);
        this.baseGroupTileResolver["group-I"].material = this.blueMaterial; 
        this.baseGroupTileResolver["group-I"].name = 'groupIBase' 
        this.baseGroupTileResolver["group-I"].isVisible = false; 
        
        this.baseGroupTileResolver["group-L"] = this.buildBaseTileMesh(this.groupLBaseTileMatrix);
        this.baseGroupTileResolver["group-L"].material = this.greenMaterial;
        this.baseGroupTileResolver["group-L"].name = 'groupLBase' 
        this.baseGroupTileResolver["group-L"].isVisible = false; 
        
        this.baseGroupTileResolver["group-T"] = this.buildBaseTileMesh(this.groupTBaseTileMatrix);
        this.baseGroupTileResolver["group-T"].material= this.yellowMaterial;
        this.baseGroupTileResolver["group-T"].name = 'groupTBase' 
        this.baseGroupTileResolver["group-T"].isVisible = false; 
        
        this.baseGroupTileResolver["group-."] = this.buildBaseTileMesh(this.group4BaseTileMatrix);
        this.baseGroupTileResolver["group-."].material = this.redMaterial 
        this.baseGroupTileResolver["group-."].name = 'group.Base' 
        this.baseGroupTileResolver["group-."].isVisible = false; 
        
    }

    buildBaseTileMesh(groupBaseTile:BaseTileFilledBlock[]):Mesh{
        
        const meshBlocksArray : Mesh[] = []
        for (const filledBlock of groupBaseTile){
            const name = `col-${filledBlock.col}row-${filledBlock.row}`
            const newBlockMesh = this.baseBlock.clone(name);
            newBlockMesh.position._z = filledBlock.col * this.BLOCK_UNIT_SIZE;
            newBlockMesh.position._x = filledBlock.row * this.BLOCK_UNIT_SIZE;
            meshBlocksArray.push(newBlockMesh);
        }

        const resultingBaseTile = Mesh.MergeMeshes(meshBlocksArray) as Mesh;
        return resultingBaseTile;
    }

    buildFloorMesh(){

        const floorMapMeshArray:Mesh[] = [];
        const pivotPoint = new Vector3(10, 0, 10);
        const axis = new Vector3(0, 1, 0); // Eje Y

        for(const slot of this.floorMapDiagram){
            const newTileMeshGroup = slot.tile?.tileRenderRules.baseTileGroup;
    
            if(slot.location.col_index<20 && slot.location.row_index<20){
                
                            if(newTileMeshGroup){
                    
                                const newTileName = `${slot.location.col_index}-${slot.location.row_index}-${slot.tile?.id_code}`
                                const newBaseTile = this.baseGroupTileResolver[newTileMeshGroup]?.clone(newTileName) as Mesh;
                
                                if(newBaseTile){
                
                                    const rotationRads = slot.tile?.tileRenderRules.rotation;
                                    // console.log(newBaseTile);
                                    // console.log(rotationRads);
                                    // console.log(axis);
                                    
                                    newBaseTile.setPivotPoint(pivotPoint)
                                    newBaseTile.rotation._y = rotationRads!;
                                    newBaseTile.isVisible = true;
                                    
                                    newBaseTile.position._z = slot.location.col_index * this.BASE_TILE_UNITS * this.BLOCK_UNIT_SIZE;
                                    newBaseTile.position._x = slot.location.row_index * this.BASE_TILE_UNITS * this.BLOCK_UNIT_SIZE;
                        
                                    floorMapMeshArray.push(newBaseTile)
                                }
                            }

            }
        }
        


        // for (let index = 0; index < 10; index++) {
        //     const newTileMeshGroup = this.floorMapDiagram[index].tile?.tileRenderRules.baseTileGroup;
    
        //     if(newTileMeshGroup){
    
        //         const newTileName = `${this.floorMapDiagram[index].location.col_index}-${this.floorMapDiagram[index].location.row_index}-${this.floorMapDiagram[index].tile?.id_code}`
        //         const newBaseTile = this.baseGroupTileResolver[newTileMeshGroup]?.clone(newTileName) as Mesh;

        //         if(newBaseTile){

        //             const rotationRads = this.floorMapDiagram[index].tile?.tileRenderRules.rotation;
        //             // console.log(newBaseTile);
        //             // console.log(rotationRads);
        //             // console.log(pivotPoint);
        //             // console.log(axis);
    
        //             newBaseTile.rotateAround(pivotPoint, axis, Tools.ToRadians(rotationRads!));
        //             newBaseTile.isVisible = true;
                    
        //             newBaseTile.position._z = this.floorMapDiagram[index].location.col_index * this.BASE_TILE_UNITS * this.BLOCK_UNIT_SIZE;
        //             newBaseTile.position._x = this.floorMapDiagram[index].location.row_index * this.BASE_TILE_UNITS * this.BLOCK_UNIT_SIZE;
        
        //             floorMapMeshArray.push(newBaseTile)
        //         }
        //     }
        // }
    }
} 

//       A        B         C         D
//     [ ][x][ ] [ ][ ][ ] [ ][x][ ] [x][x][x]
// 1   [ ][x][ ] [x][x][x] [x][x][x] [x][x][x]
//     [ ][x][ ] [ ][ ][ ] [ ][x][ ] [x][x][x]
//       A        B         C         D
//     [ ][x][ ] [ ][x][ ] [ ][ ][ ] [ ][ ][ ]
// 2   [x][x][ ] [ ][x][x] [ ][x][x] [x][x][ ]
//     [ ][ ][ ] [ ][ ][ ] [ ][x][ ] [ ][x][ ]
//       A        B         C         D
//     [ ][x][ ] [ ][x][ ] [ ][ ][ ] [ ][x][ ]
// 3   [x][x][x] [ ][x][x] [x][x][x] [x][x][ ]
//     [ ][ ][ ] [ ][x][ ] [ ][x][ ] [ ][x][ ]
//       A        B         C         D
//     [ ][x][ ] [ ][ ][ ] [ ][ ][ ] [ ][ ][ ]
// 4   [ ][x][ ] [ ][x][x] [ ][x][ ] [x][x][ ]
//     [ ][ ][ ] [ ][ ][ ] [ ][x][ ] [ ][ ][ ]