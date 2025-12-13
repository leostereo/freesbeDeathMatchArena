import { Tile, Tile_ids } from "@/shared/types/ProceduralLevel";
import { getTilesDefinition } from "./TilesDefinition";

export class TileContainerClass {

    private tilesVector: Tile[];

    constructor() {
        this.initVector();
    }

    initVector() {
        this.tilesVector = getTilesDefinition();
    }

    getFirtstCornerTiles():Tile_ids[]{
        return ['2c','4b','4c'];
    }

    getFirtstColTiles():Tile_ids[]{
        return ['1a','2b','2c','3b','4a','4c'];
    }

    getUpperRowTiles():Tile_ids[]{
        return ['1b','2c','2d','3c','4b','4c','4d'];
    }

    getSecondCornerTiles():Tile_ids[]{
        return ['2d','4c','4d']
    }

    getSecondColTiles():Tile_ids[]{
        return ['1a','2a','2d','3d','4a','4c'];
    }

    getThirdCornerTiles():Tile_ids[]{
        return ['2b','4a','4b']
    }
    
    getBottomRowTiles():Tile_ids[]{
        return ['1b','2a','2b','3a','4a','4b','4d'];
    }

    getFourthCornerTiles():Tile_ids[]{
        return ['2a','4a','4d']
    }

    getAnyTile():Tile_ids{
        const randomIndex = Math.floor(Math.random() * this.tilesVector.length);
        return this.tilesVector[randomIndex].id_code;
    }

    getTileById(tile_id:Tile_ids){
        return this.tilesVector.find((tile)=>tile.id_code === tile_id) as Tile;
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

