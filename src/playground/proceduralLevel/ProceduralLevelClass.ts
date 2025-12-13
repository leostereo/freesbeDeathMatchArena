import { FloorMap } from "@/shared/types/ProceduralLevel";
import { FloorMapClass } from "./FloorMapClass";
import { TileContainerClass } from "./TileContainerClass";

export class ProceduralLevelClass {

    private tileContainer: TileContainerClass;
    private floorMap: FloorMapClass;
    private floorVector: FloorMap[];

    constructor() {
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
        this.floorMap.buildFloorMap()
    }
}