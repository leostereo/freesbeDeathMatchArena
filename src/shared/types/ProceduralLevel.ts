import { TileContainerClass } from "@/playground/proceduralLevel/TileContainerClass";

export type SlotCoord = {
    row_index: number;
    col_index: number;
}

export type Tile_ids =
    '1a' | '1b' | '1c' |
    '2a' | '2b' | '2c' | '2d' |
    '3a' | '3b' | '3c' | '3d' |
    '4a' | '4b' | '4c' | '4d' | '[]'

type Tile_Type = 'dualJoin' | 'tripleJoin' | 'cuadJoin' | 'terminal';

export type Tile_Status = 'empty' | 'pending' | 'filled' | 'reserved';

type NeighBour = {
    previous: Tile_ids[];
    next: Tile_ids[];
    above: Tile_ids[];
    under: Tile_ids[];
}

export type Tile = {
    id_code: Tile_ids;
    tile_type: Tile_Type;
    connection_tiles: NeighBour;
    forbidden_tiles: NeighBour;
}

export type MapSlot = {
    location: SlotCoord
    tile: Tile | null;
    status: Tile_Status;
    requestedConnections: Tile_ids[];
    forbiddenNeighboursTiles: Tile_ids[];
}

export type FloorMap = MapSlot[];

export type FloorMapData = {
    max_rows: number;
    max_cols: number;
    tileContainer: TileContainerClass;
    begining_position: SlotCoord;
}

export enum TilesUnicodeEnum {
    '1a'='\u007C', 
    '1b'='\u002D', 
    '1c'='\u4323', 
    '2a'='\u230F', 
    '2b'='\u230E', 
    '2c'='\u230C', 
    '2d'='\u230D', 
    '3a'='\u22A5',
    '3b'='\u22A2',
    '3c'='\u22A4',
    '3d'='\u22A3',
    '4a'='.',
    '4b'='.',
    '4c'='.',
    '4d'='.', 
    '[]'='[]', 
}