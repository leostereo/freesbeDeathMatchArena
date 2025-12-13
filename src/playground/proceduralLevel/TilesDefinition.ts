import { Tile, Tile_ids } from "@/shared/types/ProceduralLevel"


const previous_connection__group:Tile_ids[] = ['1b','2b','2c','3a','3b','3c','4b'];
const above_connection_group:Tile_ids[] = ['1a','2c','2d','3b','3c','3d','4c'];
const next_connection_group:Tile_ids[] =  ['1b','2a','2d','3a','3c','3d','4d'];
const under_connection_group:Tile_ids[] = ['1a','2a','2b','3a','3b','3d','4a']

const previous_Eforbidden__group:Tile_ids[] = ['1b','2b','2c','3a','3b','3c','4b'];
const above_Fforbidden_group:Tile_ids[] = ['1a','2a','2b','3a','4a','4b','4d'];
const next_Fforbidden_group:Tile_ids[] = ['1a','2b','2c','3b','4a','4b','4c'];
const under_Fforbidden_group:Tile_ids[] = ['1b','2c','2d','3c','4b','4c','4d']

const previous_Fforbidden__group:Tile_ids[] = ['1a','2a','2d','3d','4a','4c','4d'];
const next_Eforbidden_group:Tile_ids[] = ['1b','2a','2d','3a','3c','3d','4d'];
const above_Eforbidden_group:Tile_ids[] = ['1a','2c','2d','3b','3c','3d','4c'];
const under_Eforbidden_group:Tile_ids[] = ['1a','2a','2b','3a','3b','3d','4a'];


export const getTilesDefinition = ():Tile[] => {
    const tilesDefinition: Tile[] = [
        {
            id_code: "1a",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: [],
                next: [],
                above: above_connection_group,
                under: under_connection_group
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Fforbidden_group,
                above: above_Fforbidden_group,
                under: under_Fforbidden_group,
            },
        },
        {
            id_code: "1b",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: next_connection_group,
                above: [],
                under: []
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Fforbidden_group,
                above: above_Eforbidden_group,
                under: under_Eforbidden_group,
            },
        },
        {
            id_code: "1c",
            tile_type: 'cuadJoin',
            connection_tiles: {
                previous: [],
                next: [],
                above: [],
                under: []
            },
            forbidden_tiles: {
                previous: [],
                next: [],
                above: [],
                under: []
            },
        },
        {
            id_code: "2a",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: [],
                above: above_connection_group,
                under: []
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Eforbidden_group,
                above: above_Fforbidden_group,
                under: under_Eforbidden_group,
            },
        },
        {
            id_code: "2b",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: [],
                next: next_connection_group,
                above: above_connection_group,
                under: []
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Fforbidden_group,
                above: above_Fforbidden_group,
                under: under_Eforbidden_group,
            },
        },
        {
            id_code: "2c",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: [],
                next: next_connection_group,
                above: [],
                under: under_connection_group
            },
            forbidden_tiles: {
                previous:  previous_Eforbidden__group,
                next: next_Fforbidden_group,
                above: above_Eforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "2d",
            tile_type: 'dualJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: [],
                above: [],
                under: under_connection_group,
            },
            forbidden_tiles: {
                previous:  previous_Fforbidden__group,
                next: next_Eforbidden_group,
                above: above_Eforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "3a",
            tile_type: 'tripleJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: next_connection_group,
                above: above_connection_group,
                under: []
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Fforbidden_group,
                above: above_Fforbidden_group,
                under: under_Eforbidden_group,
            },
        },
        {
            id_code: "3b",
            tile_type: 'tripleJoin',
            connection_tiles: {
                previous: [],
                next: next_connection_group, 
                above: above_connection_group,
                under: under_connection_group,
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Fforbidden_group,
                above: above_Fforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "3c",
            tile_type: 'tripleJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: next_connection_group,
                above: [],
                under: under_connection_group,
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Fforbidden_group,
                above: above_Eforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "3d",
            tile_type: 'tripleJoin',
            connection_tiles: {
                previous: previous_connection__group,
                next: [],
                above: above_connection_group,
                under: under_connection_group,
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Eforbidden_group,
                above: above_Fforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "4a",
            tile_type: 'terminal',
            connection_tiles: {
                previous: [],
                next: [],
                above: above_connection_group,
                under: []
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Eforbidden_group,
                above: above_Fforbidden_group,
                under: under_Eforbidden_group
            },
        },
        {
            id_code: "4b",
            tile_type: 'terminal',
            connection_tiles: {
                previous: [],
                next: next_connection_group,
                above: [],
                under: []
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Fforbidden_group,
                above: above_Eforbidden_group,
                under: under_Eforbidden_group
            },
        },
        {
            id_code: "4c",
            tile_type: 'terminal',
            connection_tiles: {
                previous: [],
                next: [],
                above: [],
                under: under_connection_group
            },
            forbidden_tiles: {
                previous: previous_Eforbidden__group,
                next: next_Eforbidden_group,
                above: above_Eforbidden_group,
                under: under_Fforbidden_group
            },
        },
        {
            id_code: "4d",
            tile_type: 'terminal',
            connection_tiles: {
                previous: previous_connection__group,
                next: [],
                above: [],
                under: []
            },
            forbidden_tiles: {
                previous: previous_Fforbidden__group,
                next: next_Eforbidden_group,
                above: above_Eforbidden_group,
                under: under_Eforbidden_group
            },
        }
    ]

    return tilesDefinition;
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






