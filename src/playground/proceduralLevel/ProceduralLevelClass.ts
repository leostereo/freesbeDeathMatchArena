import { FloorMap } from "@/shared/types/ProceduralLevel";
import { FloorMapClass } from "./FloorMapClass";
import { TileContainerClass } from "./TileContainerClass";
import { FloorMeshBuilderClass } from "./FloorMeshBuilderClass";
import { Scene } from "@babylonjs/core";

export class ProceduralLevelClass {

    private tileContainer: TileContainerClass;
    private floorMap: FloorMapClass;
    private floorVector: FloorMap[];

    constructor(private scene:Scene) {
        
        this.tileContainer = new TileContainerClass();
        this.floorMap = new FloorMapClass({
            begining_position: { col_index: 0, row_index: 0 },
            max_cols: 10,
            max_rows: 10,
            tileContainer: this.tileContainer,
        });

        this.init_Level()
    }

    init_Level() {
        const floorMapDiagram: FloorMap = this.floorMap.buildFloorMapDiagram();
        const floorMeshBuilderClass = new FloorMeshBuilderClass(floorMapDiagram,this.tileContainer,this.scene)
    }
}