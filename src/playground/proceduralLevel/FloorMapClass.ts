import { FloorMap, FloorMapData, MapSlot, SlotCoord, Tile, Tile_ids, Tile_Status, TilesUnicodeEnum } from "@/shared/types/ProceduralLevel";
import { TileContainerClass } from "./TileContainerClass";

export class FloorMapClass {

    private tileContainer: TileContainerClass;
    private begining_position: SlotCoord;
    private MAX_ROWS = 0;
    private MAX_COLS = 0;
    private floorMap: FloorMap = [];
    //private slotMap: Map<SlotCoord, MapSlot> = new Map();

    constructor(floorMapData: FloorMapData) {
        this.tileContainer = floorMapData.tileContainer;
        this.MAX_ROWS = floorMapData.max_rows;
        this.MAX_COLS = floorMapData.max_cols;
        this.begining_position = floorMapData.begining_position;
    }

    public buildFloorMap() {
        this.setInitialSlot();
        this.fillPendingSlots();
        this.renderFloorMap()

    }

    private setInitialSlot() {
        const initialPosition = this.begining_position;
        const possibleTiles = this.getPossibleTilesForSlot(initialPosition);
        const nextTileId = this.pickOneTile(possibleTiles);
        //console.log('init map ', this.floorMap)
        //console.log('init tile ', nextTileId)
        const nextTile = this.tileContainer.getTileById(nextTileId);
        this.setSlotTileAndNeighboursOptions(initialPosition, nextTile);
    }

    private getPossibleTilesForSlot(slotPosition: SlotCoord): Tile_ids[] {

        let possibleTiles: Tile_ids[];

        if (slotPosition.col_index === 0 && slotPosition.row_index === 0) {
            //on first corner;
            return this.tileContainer.getFirtstCornerTiles();
        }

        if (slotPosition.col_index === this.MAX_COLS && slotPosition.row_index === 0) {
            return this.tileContainer.getSecondCornerTiles()
        }

        return [this.tileContainer.getAnyTile()];

    }

    private pickOneTile(possibleTiles: Tile_ids[], pickMetod?: Tile_ids | undefined) {

        const randomIndex = Math.floor(Math.random() * possibleTiles.length);
        return possibleTiles[randomIndex];
    }

    private setSlotTileAndNeighboursOptions(slotPosition: SlotCoord, tile: Tile): void {
        //console.log('setting  new slot ', tile, ' at postion ', slotPosition)

        const { index, status } = this.getMapFloorIndexAndStatusByPosition(slotPosition)
        if (index === -1) {
            this.floorMap.push({
                location: slotPosition,
                forbiddenNeighboursTiles: [],
                requestedConnections: [],
                status: 'filled',
                tile,
            })
        }
        if (status !== 'filled') {
            this.floorMap.splice(index, 1, {
                location: slotPosition,
                forbiddenNeighboursTiles: [],
                requestedConnections: [],
                status: 'filled',
                tile,
            });

        }

        //#region Filling previous slot data.
        const prev_location = { col_index: slotPosition.col_index - 1, row_index: slotPosition.row_index };
        const { index: prev_index, status: prev_status } = this.getMapFloorIndexAndStatusByPosition(prev_location)


        const prevSlot: MapSlot = {
            location: prev_location,
            requestedConnections: tile.connection_tiles.previous,
            forbiddenNeighboursTiles: tile.forbidden_tiles.previous,
            status: 'pending',
            tile: null,
        }

        if (prev_index === -1) {
            this.floorMap.push(prevSlot)
        }

        if (prev_index !== -1 && prev_status !== 'filled') {
            //console.log(`repacing ${prev_location.col_index}, ${prev_location.row_index}`)
            //console.log(this.floorMap[prev_index].forbiddenNeighboursTiles)
            //console.log(tile.forbidden_tiles.previous)
            prevSlot.forbiddenNeighboursTiles = [...new Set([...this.floorMap[prev_index].forbiddenNeighboursTiles,
            ...tile.forbidden_tiles.previous])]
            this.floorMap.splice(prev_index, 1, prevSlot);
        }
        //#endregion


        //#region Filling above slot data.
        const above_location = { col_index: slotPosition.col_index, row_index: slotPosition.row_index - 1 };
        const { index: above_index, status: above_status } = this.getMapFloorIndexAndStatusByPosition(above_location)

        const aboveSlot: MapSlot = {
            location: above_location,
            requestedConnections: tile.connection_tiles.above,
            forbiddenNeighboursTiles: tile.forbidden_tiles.above,
            status: 'pending',
            tile: null,
        }

        if (above_index === -1) {
            this.floorMap.push(aboveSlot)
        }

        if (above_index !== -1 && above_status !== 'filled') {
            //console.log(`repacing ${above_location.col_index}, ${above_location.row_index}`)
            //console.log(this.floorMap[above_index].forbiddenNeighboursTiles)
            //console.log(tile.forbidden_tiles.above)
            aboveSlot.forbiddenNeighboursTiles = [...new Set([...this.floorMap[above_index].forbiddenNeighboursTiles,
            ...tile.forbidden_tiles.above])]
            this.floorMap.splice(above_index, 1, aboveSlot);
        }
        //#endregion


        //#region Filling next slot data.
        const next_location = { col_index: slotPosition.col_index + 1, row_index: slotPosition.row_index };
        const { index: next_index, status: next_status } = this.getMapFloorIndexAndStatusByPosition(next_location)

        const nextSlot: MapSlot = {
            location: next_location,
            requestedConnections: tile.connection_tiles.next,
            forbiddenNeighboursTiles: tile.forbidden_tiles.next,
            status: 'pending',
            tile: null,
        }

        if (next_index === -1) {
            this.floorMap.push(nextSlot)
        }

        if (next_index !== -1 && next_status !== 'filled') {
            //console.log(`repacing ${next_location.col_index}, ${next_location.row_index}`)
            //console.log(this.floorMap[next_index].forbiddenNeighboursTiles)
            //console.log(tile.forbidden_tiles.next)
            nextSlot.forbiddenNeighboursTiles = [...new Set([...this.floorMap[next_index].forbiddenNeighboursTiles,
            ...tile.forbidden_tiles.next])]
            this.floorMap.splice(next_index, 1, nextSlot);
        }
        //#endregion

        //#region Filling under slot data.
        const under_location = { col_index: slotPosition.col_index, row_index: slotPosition.row_index + 1 };
        const { index: under_index, status: under_status } = this.getMapFloorIndexAndStatusByPosition(under_location)

        const underSlot: MapSlot = {
            location: under_location,
            requestedConnections: tile.connection_tiles.under,
            forbiddenNeighboursTiles: tile.forbidden_tiles.under,
            status: 'pending',
            tile: null,
        }

        if (under_index === -1) {
            this.floorMap.push(underSlot)
        }

        if (under_index !== -1 && under_status !== 'filled') {
            underSlot.forbiddenNeighboursTiles = [...new Set([...this.floorMap[under_index].forbiddenNeighboursTiles,
            ...tile.forbidden_tiles.under])]
            this.floorMap.splice(under_index, 1, underSlot);
        }

        //console.log(' resulting slotMap ', this.floorMap.length)
        //console.log(JSON.parse(JSON.stringify(this.floorMap)));

    }

    private setSlotTileAndNeighboursOptionsBak(slotPosition: SlotCoord, tile: Tile): void {
        //console.log(' new slot ', tile, ' at postion ', slotPosition)

        const { index, status } = this.getMapFloorIndexAndStatusByPosition(slotPosition)
        if (index === -1) {
            this.floorMap.push({
                location: slotPosition,
                forbiddenNeighboursTiles: [],
                requestedConnections: [],
                status: 'filled',
                tile,
            })
        }
        if (status !== 'filled') {
            this.floorMap.splice(index, 1, {
                location: slotPosition,
                forbiddenNeighboursTiles: [],
                requestedConnections: [],
                status: 'filled',
                tile,
            });

        }


        if (tile.connection_tiles.previous.length > 0) {
            const location = { col_index: slotPosition.col_index - 1, row_index: slotPosition.row_index };
            const { index: prev_index, status } = this.getMapFloorIndexAndStatusByPosition(location)

            const newSlot: MapSlot = {
                location,
                requestedConnections: tile.connection_tiles.previous,
                forbiddenNeighboursTiles: tile.forbidden_tiles.previous,
                status: 'pending',
                tile: null,
            }

            if (prev_index === -1) {
                this.floorMap.push(newSlot)
            }

            if (prev_index !== -1 && status !== 'filled') {
                //console.log(`repacing ${location.col_index}, ${location.row_index}`)

                //console.log(this.floorMap[prev_index].forbiddenNeighboursTiles)
                //console.log(tile.forbidden_tiles.previous)
                newSlot.forbiddenNeighboursTiles = [...this.floorMap[prev_index].forbiddenNeighboursTiles,
                ...tile.forbidden_tiles.previous]
                this.floorMap.splice(prev_index, 1, newSlot);
            }
        }

        if (tile.connection_tiles.above.length > 0) {
            const location = { col_index: slotPosition.col_index, row_index: slotPosition.row_index - 1 };
            const { index: above_index, status } = this.getMapFloorIndexAndStatusByPosition(location)

            const newSlot: MapSlot = {
                location,
                requestedConnections: tile.connection_tiles.above,
                forbiddenNeighboursTiles: tile.forbidden_tiles.above,
                status: 'pending',
                tile: null,
            }

            if (above_index === -1) {
                this.floorMap.push(newSlot)
            }

            if (above_index !== -1 && status !== 'filled') {
                //console.log(`repacing ${location.col_index}, ${location.row_index}`)

                //console.log(this.floorMap[above_index].forbiddenNeighboursTiles)
                //console.log(tile.forbidden_tiles.above)
                newSlot.forbiddenNeighboursTiles = [...this.floorMap[above_index].forbiddenNeighboursTiles,
                ...tile.forbidden_tiles.above]
                this.floorMap.splice(above_index, 1, newSlot);
            }
        }

        if (tile.connection_tiles.next.length > 0) {
            const location = { col_index: slotPosition.col_index + 1, row_index: slotPosition.row_index };
            const { index: next_index, status } = this.getMapFloorIndexAndStatusByPosition(location)

            const newSlot: MapSlot = {
                location,
                requestedConnections: tile.connection_tiles.next,
                forbiddenNeighboursTiles: tile.forbidden_tiles.next,
                status: 'pending',
                tile: null,
            }

            if (next_index === -1) {
                this.floorMap.push(newSlot)
            }

            if (next_index !== -1 && status !== 'filled') {
                //console.log(`repacing ${location.col_index}, ${location.row_index}`)
                //console.log(this.floorMap[next_index].forbiddenNeighboursTiles)
                //console.log(tile.forbidden_tiles.next)
                newSlot.forbiddenNeighboursTiles = [...this.floorMap[next_index].forbiddenNeighboursTiles,
                ...tile.forbidden_tiles.next]
                this.floorMap.splice(next_index, 1, newSlot);
            }
        }

        if (tile.connection_tiles.under.length > 0) {
            const location = { col_index: slotPosition.col_index, row_index: slotPosition.row_index + 1 };
            const { index: under_index, status } = this.getMapFloorIndexAndStatusByPosition(location)

            const newSlot: MapSlot = {
                location,
                requestedConnections: tile.connection_tiles.under,
                forbiddenNeighboursTiles: tile.forbidden_tiles.under,
                status: 'pending',
                tile: null,
            }

            if (under_index === -1) {
                this.floorMap.push(newSlot)
            }

            if (under_index !== -1 && status !== 'filled') {
                //console.log(`repacing ${location.col_index}, ${location.row_index}`)
                //console.log(this.floorMap[under_index].forbiddenNeighboursTiles)
                //console.log(tile.forbidden_tiles.under)
                newSlot.forbiddenNeighboursTiles = [...this.floorMap[under_index].forbiddenNeighboursTiles,
                ...tile.forbidden_tiles.under]
                this.floorMap.splice(under_index, 1, newSlot);
            }
        }

        //console.log(' resulting slotMap ', this.floorMap.length)
        //console.log(JSON.parse(JSON.stringify(this.floorMap)));



    }

    private getMapFloorIndexAndStatusByPosition(slotPosition: SlotCoord): { index: number, status: Tile_Status, tile_id: Tile_ids | null } {

        const index = this.floorMap.findIndex((slot) =>
            slot.location.col_index === slotPosition.col_index &&
            slot.location.row_index === slotPosition.row_index
        )

        if (index !== -1) {
            return { index, status: this.floorMap[index].status, tile_id: this.floorMap[index].tile?.id_code! };
        }

        return { index, status: 'empty', tile_id: null };
    }

    private fillPendingSlots() {

        let pendingSlots = this.floorMap.filter((slot) => slot.status === 'pending' && slot.requestedConnections.length > 0);
        let loopControl = 0;
        const MAX_ITER = 120;
        do {
            loopControl++;
            const pendingSlot = this.fillPendingSlots_pickSlot(pendingSlots)

            if (!this.fillPendingSlots_checkIfisInsideMap(pendingSlot.location)) {
                //console.log(`${pendingSlot.location.col_index}, ${pendingSlot.location.row_index} is out of boundaries`);
                continue;
            }
            //get requeted connections
            const requestedConnections = pendingSlot.requestedConnections;
            //remove neighbours restrictions.
            const filteredConnections = this.fillPendingSlots_removeForbidenTilesFromNeighbour(requestedConnections, pendingSlot.forbiddenNeighboursTiles);
            //remove undesired tiles on boundaries.
            const allowedConnections = this.fillPendingSlots_removeUndesiredTilesFromBoundaries(filteredConnections, pendingSlot.location);
            //remove terminals
            const allowedConnectionsNoterminals = this.fillPendingSlots_removeTerminalsIfPossible(allowedConnections, pendingSlot.location)
            //pick one tile from remaining.
            const nextConnectedTileId = this.fillPendingSlots_pickTile(allowedConnectionsNoterminals);
            //set picked tile.
            const nextConnectedTile = this.tileContainer.getTileById(nextConnectedTileId);
            if (nextConnectedTile) {
                if (pendingSlots.length === 0) {
                    //console.log('no more pending slots')
                }
                if (loopControl === MAX_ITER) {
                    //console.log('control limits , pending slots ',pendingSlots.length)
                }
                this.setSlotTileAndNeighboursOptions(pendingSlot.location, nextConnectedTile)
                pendingSlots = this.floorMap.filter((slot) => slot.status === 'pending' && slot.requestedConnections.length > 0)

            } else {
                //console.log('no available connection for next pending slot')
                //console.log('req', requestedConnections)
                //console.log('fil', filteredConnections)
                //console.log('allow', allowedConnections)
                //console.log('nexid', nextConnectedTileId)
            }


        } while (pendingSlots.length > 0 && loopControl < MAX_ITER)

    }

    private fillPendingSlots_checkIfisInsideMap(slotCoord: SlotCoord): boolean {
        if (slotCoord.col_index < 0 || slotCoord.col_index > this.MAX_COLS ||
            slotCoord.row_index < 0 || slotCoord.row_index > this.MAX_COLS) {
            return false;
        }
        return true;
    }

    private fillPendingSlots_removeForbidenTilesFromNeighbour(requestedConnections: Tile_ids[], forbiddenNeighboursTiles: Tile_ids[]) {
        const notForbiddenTileArray = requestedConnections.filter(element => !forbiddenNeighboursTiles.includes(element));
        return notForbiddenTileArray;
    }

    private fillPendingSlots_removeUndesiredTilesFromBoundaries(requestedConnections: Tile_ids[], slotCoord: SlotCoord): Tile_ids[] {

        let desiredBoundariesTiles: Tile_ids[] = [];
        const allowedTiles: Tile_ids[] = [];


        //no boundaries issues.
        if (slotCoord.col_index > 0 && slotCoord.col_index < this.MAX_COLS - 1 &&
            slotCoord.row_index > 0 && slotCoord.row_index < this.MAX_ROWS - 1) {
            return requestedConnections;
        }

        //TODO - consider corners more specific

        if (slotCoord.col_index === 0) {
            desiredBoundariesTiles = this.tileContainer.getFirtstColTiles();
        }

        if (slotCoord.col_index === this.MAX_COLS - 1) {
            desiredBoundariesTiles = this.tileContainer.getSecondColTiles();
        }
        if (slotCoord.row_index === 0) {
            desiredBoundariesTiles = this.tileContainer.getUpperRowTiles();
        }

        if (slotCoord.row_index === this.MAX_ROWS - 1) {
            desiredBoundariesTiles = this.tileContainer.getBottomRowTiles();
        }

        requestedConnections.forEach((requestedConnection) => {
            if (desiredBoundariesTiles.includes(requestedConnection)) {
                allowedTiles.push(requestedConnection)
            }
        })

        return allowedTiles;
    }

    private fillPendingSlots_removeTerminalsIfPossible(allowedConnections: Tile_ids[], slotCoord: SlotCoord): Tile_ids[] {

        const allowedTilesNoterminals = allowedConnections.filter((tile) => {
            if (tile === '4a' || tile === '4b' || tile === '4c' || tile === '4d') {

            } else {
                return tile;
            }
        })

        if (allowedTilesNoterminals.length > 0) {
            return allowedTilesNoterminals;
        }
        return allowedConnections

    }

    private fillPendingSlots_pickTile(requestedConnections: Tile_ids[]): Tile_ids {
        const randomIndex = Math.floor(Math.random() * requestedConnections.length);
        return requestedConnections[randomIndex];
    }

    private fillPendingSlots_pickSlot(slotArray: MapSlot[]): MapSlot {
        const randomIndex = Math.floor(Math.random() * slotArray.length);
        return slotArray[randomIndex];
    }

    private renderFloorMap() {

        for (let row = 0; row < this.MAX_ROWS; row++) {
            let rowline = "";
            for (let col = 0; col < this.MAX_COLS; col++) {

                let { tile_id } = this.getMapFloorIndexAndStatusByPosition({ col_index: col, row_index: row });
                if (!tile_id) {
                    tile_id = '[]'
                }
                rowline += `${TilesUnicodeEnum[tile_id]}` + "\t"; // Agrega un tabulador para separar los elementos
            }
            console.log(rowline);
        }

    }
}