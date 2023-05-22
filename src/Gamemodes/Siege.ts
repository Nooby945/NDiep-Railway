/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>
*/

import ArenaEntity from "../Native/Arena";
import MazeWall from "../Entity/Misc/MazeWall";
import { TeamEntity } from "../Entity/Misc/TeamEntity";
import GameServer from "../Game";
import ShapeManager from "../Entity/Shape/Manager";
import TeamBase from "../Entity/Misc/TeamBase";
import { Color } from "../Const/Enums";
import TankBody from "../Entity/Tank/TankBody";
import Client from "../Client";

export class SiegeShapeManager extends ShapeManager {
    protected get wantedShapes() {
        return 0;
    }
}

/**
 * Siege Gamemode Arena
 */
export default class SiegeArena extends ArenaEntity {
    //this.blueTeamBase = new TeamBase(game, new TeamEntity(this.game, Color.TeamBlue), );
    protected shapes: ShapeManager = new SiegeShapeManager(this);

    public playerTeamMap: Map<Client, TeamBase> = new Map();
    public blueTeamBase: TeamBase;
    
        public constructor(game: GameServer) {
            super(game);
            let mapHeight = 22300;
            let mapWidth = 22300;
            let baseSize = 3345 / 2;

            // create maze walls and boss gate
            new MazeWall(this.game, 8000, 0, mapHeight / 2 + 5000, 1000); // vertical right
            new TeamBase(this.game, new TeamEntity(this.game, Color.TeamRed), -8000, 0, mapHeight / 2 + 5000, 1000, true); // boss entry gate
            new MazeWall(this.game, 0, 8000, 1000, mapHeight / 2 + 5000); // horizontal down
            new MazeWall(this.game, 0, -8000, 1000, mapHeight / 2 + 5000); // horizontal up

            // create spawn base
            this.blueTeamBase = new TeamBase(this.game, new TeamEntity(this.game, Color.TeamBlue), 2000, 0, baseSize, baseSize * 3);
        }
        

        public spawnPlayer(tank: TankBody, client: Client) {
            // determines the base that the player spawns at
            let spawnedBaseNum = Math.floor(Math.random() * 3) + 1;
            let baseYPos: number;
            if (spawnedBaseNum == 1) {
                let baseYPos = 0;
                tank.positionData.values.y = baseYPos;
            } else {
                tank.positionData.values.y = 9999;
            }
            if (spawnedBaseNum == 2) {
                let baseYPos = 4000;
                tank.positionData.values.y = baseYPos;
            } else {
                tank.positionData.values.y = 9999;
            }
            if (spawnedBaseNum == 3) {
                let baseYPos = -4000;
                tank.positionData.values.y = baseYPos;
            } else {
                tank.positionData.values.y = 9999;
            }
            tank.positionData.values.x = 2000;
            

            // team assigning
            /*const base = this.playerTeamMap.get(client) || [this.blueTeamBase];
            tank.relationsData.values.team = base.relationsData.values.team;
            tank.styleData.values.color = base.styleData.values.color;
            this.playerTeamMap.set(client, base);*/

            // idk what this is lol
            if (client.camera) client.camera.relationsData.team = tank.relationsData.values.team;
        }

}